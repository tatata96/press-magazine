import assert from "node:assert/strict";
import {before, describe, it} from "node:test";
import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  SignJWT,
  UnsecuredJWT,
} from "jose";
import {
  IdTokenError,
  readSubject,
  selectSigningAlgorithms,
  verifyIdToken,
} from "../lib/customer-account/id-token.ts";

const ISSUER = "https://shopify.com/authentication/123";
const AUDIENCE = "client-id-123";
const NONCE = "expected-nonce";
const SUBJECT = "gid://shopify/Customer/42";
const NOW = new Date("2026-11-22T12:00:00Z");
const NOW_SECONDS = Math.floor(NOW.getTime() / 1000);

let signingKey;
let otherKey;
let keys;
let expected;

// A token as Shopify would sign it, with each claim overridable (undefined removes it).
async function sign(claims = {}, {key = signingKey, alg = "RS256", kid = "key-1"} = {}) {
  const payload = {
    iss: ISSUER,
    aud: AUDIENCE,
    sub: SUBJECT,
    nonce: NONCE,
    iat: NOW_SECONDS - 10,
    exp: NOW_SECONDS + 600,
    ...claims,
  };

  for (const [name, value] of Object.entries(payload)) {
    if (value === undefined) {
      delete payload[name];
    }
  }

  return new SignJWT(payload).setProtectedHeader({alg, kid}).sign(key);
}

async function assertRejected(token, overrides = {}, pattern = /ID token/) {
  await assert.rejects(
    verifyIdToken(token, {...expected, ...overrides}),
    (error) => error instanceof IdTokenError && pattern.test(error.message),
  );
}

before(async () => {
  const pair = await generateKeyPair("RS256");
  const other = await generateKeyPair("RS256");

  signingKey = pair.privateKey;
  otherKey = other.privateKey;
  keys = createLocalJWKSet({
    keys: [{...(await exportJWK(pair.publicKey)), kid: "key-1", alg: "RS256", use: "sig"}],
  });
  expected = {
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ["RS256"],
    keys,
    nonce: NONCE,
    now: NOW,
  };
});

describe("sign-in ID token", () => {
  it("accepts a valid signed token", async () => {
    const claims = await verifyIdToken(await sign(), expected);

    assert.equal(claims.sub, SUBJECT);
    assert.equal(claims.nonce, NONCE);
  });

  it("rejects a token signed with a different key", async () => {
    // Same key id as the published key, but signed by someone else.
    await assertRejected(await sign({}, {key: otherKey}), {}, /SIGNATURE/i);
  });

  it("rejects a token whose payload was altered after signing", async () => {
    const [header, , signature] = (await sign()).split(".");
    const forgedPayload = Buffer.from(
      JSON.stringify({iss: ISSUER, aud: AUDIENCE, sub: "someone-else", nonce: NONCE, iat: NOW_SECONDS, exp: NOW_SECONDS + 600}),
    ).toString("base64url");

    await assertRejected(`${header}.${forgedPayload}.${signature}`);
  });

  it("rejects a token naming a key the provider does not publish", async () => {
    await assertRejected(await sign({}, {kid: "unknown-key"}));
  });

  it("rejects an incorrect issuer", async () => {
    await assertRejected(await sign({iss: "https://evil.example/authentication/123"}), {}, /iss/);
  });

  it("rejects an incorrect audience", async () => {
    await assertRejected(await sign({aud: "another-client"}), {}, /aud/);
  });

  it("rejects an expired token", async () => {
    await assertRejected(await sign({exp: NOW_SECONDS - 300, iat: NOW_SECONDS - 900}), {}, /EXPIRED|exp/i);
  });

  it("tolerates a few seconds of clock drift", async () => {
    await verifyIdToken(await sign({exp: NOW_SECONDS - 5, iat: NOW_SECONDS - 600}), expected);
  });

  it("rejects a token issued in the future", async () => {
    await assertRejected(await sign({iat: NOW_SECONDS + 600, exp: NOW_SECONDS + 1200}), {}, /iat/);
  });

  for (const claim of ["iss", "aud", "sub", "exp", "iat"]) {
    it(`rejects a token without ${claim}`, async () => {
      await assertRejected(await sign({[claim]: undefined}));
    });
  }

  it("rejects an incorrect nonce", async () => {
    await assertRejected(await sign({nonce: "someone-elses-nonce"}), {}, /nonce/);
  });

  it("rejects a missing nonce when one was sent", async () => {
    await assertRejected(await sign({nonce: undefined}), {}, /nonce/);
  });

  it("requires the client to be the authorized party when there are several audiences", async () => {
    await assertRejected(await sign({aud: [AUDIENCE, "another-client"]}), {}, /azp/);
    await verifyIdToken(await sign({aud: [AUDIENCE, "another-client"], azp: AUDIENCE}), expected);
  });
});

describe("signing algorithm", () => {
  it("rejects an unsigned token (alg none)", async () => {
    const unsigned = new UnsecuredJWT({iss: ISSUER, aud: AUDIENCE, sub: SUBJECT, nonce: NONCE})
      .setIssuedAt(NOW_SECONDS - 10)
      .setExpirationTime(NOW_SECONDS + 600)
      .encode();

    await assertRejected(unsigned);
  });

  it("rejects an HMAC token, the algorithm-confusion attack", async () => {
    const secret = new TextEncoder().encode("a-secret-the-attacker-chose-1234567890");
    const forged = await new SignJWT({iss: ISSUER, aud: AUDIENCE, sub: SUBJECT, nonce: NONCE})
      .setProtectedHeader({alg: "HS256", kid: "key-1"})
      .setIssuedAt(NOW_SECONDS - 10)
      .setExpirationTime(NOW_SECONDS + 600)
      .sign(secret);

    await assertRejected(forged);
  });

  it("rejects an algorithm the provider does not advertise", async () => {
    const ec = await generateKeyPair("ES256");
    const ecKeys = createLocalJWKSet({
      keys: [{...(await exportJWK(ec.publicKey)), kid: "key-1", alg: "ES256", use: "sig"}],
    });
    const token = await sign({}, {key: ec.privateKey, alg: "ES256"});

    // Valid signature, but only RS256 is accepted.
    await assertRejected(token, {keys: ecKeys}, /ALG/i);
    await verifyIdToken(token, {...expected, keys: ecKeys, algorithms: ["ES256"]});
  });

  it("accepts only asymmetric algorithms from the discovery document", () => {
    assert.deepEqual(selectSigningAlgorithms(["RS256"]), ["RS256"]);
    assert.deepEqual(selectSigningAlgorithms(["none", "HS256", "RS256", "ES256"]), ["RS256", "ES256"]);
  });

  it("defaults to RS256 when the document names no algorithm", () => {
    assert.deepEqual(selectSigningAlgorithms(undefined), ["RS256"]);
  });

  it("refuses a document that offers only unusable algorithms", () => {
    assert.throws(() => selectSigningAlgorithms(["none"]), IdTokenError);
    assert.throws(() => selectSigningAlgorithms(["HS256"]), IdTokenError);
    assert.throws(() => selectSigningAlgorithms([]), IdTokenError);
    assert.throws(() => selectSigningAlgorithms("RS256"), IdTokenError);
  });
});

describe("missing or malformed ID token", () => {
  for (const [label, value] of [
    ["undefined", undefined],
    ["null", null],
    ["an empty string", ""],
    ["a number", 42],
    ["an object", {}],
    ["one segment", "abc"],
    ["two segments", "abc.def"],
    ["four segments", "a.b.c.d"],
    ["undecodable segments", "not.a.jwt"],
    ["empty segments", ".."],
  ]) {
    it(`rejects ${label}`, async () => {
      await assertRejected(value);
    });
  }

  it("never puts the token in the error message", async () => {
    const token = await sign({nonce: "wrong"});

    await assert.rejects(verifyIdToken(token, expected), (error) => {
      assert.ok(!error.message.includes(token.split(".")[1]));
      assert.ok(!error.message.includes(token));

      return true;
    });
  });
});

describe("ID token after a refresh", () => {
  const refreshExpectations = () => {
    const refresh = {...expected, subject: SUBJECT};

    delete refresh.nonce;

    return refresh;
  };

  it("is verified without the login nonce", async () => {
    const claims = await verifyIdToken(await sign({nonce: undefined}), refreshExpectations());

    assert.equal(claims.sub, SUBJECT);
  });

  it("is bound to the subject of the original sign-in", async () => {
    await assertRejected(await sign({nonce: undefined, sub: "gid://shopify/Customer/99"}), refreshExpectations(), /sub/);
  });

  it("is still checked for signature, issuer, audience and expiry", async () => {
    await assertRejected(await sign({nonce: undefined}, {key: otherKey}), refreshExpectations());
    await assertRejected(await sign({nonce: undefined, iss: "https://evil.example"}), refreshExpectations(), /iss/);
    await assertRejected(await sign({nonce: undefined, aud: "another-client"}), refreshExpectations(), /aud/);
    await assertRejected(
      await sign({nonce: undefined, exp: NOW_SECONDS - 300, iat: NOW_SECONDS - 900}),
      refreshExpectations(),
    );
  });

  it("reads the subject from the stored token, or null when it has none", async () => {
    assert.equal(readSubject(await sign()), SUBJECT);
    assert.equal(readSubject(""), null);
    assert.equal(readSubject("garbage"), null);
    assert.equal(readSubject(await sign({sub: undefined})), null);
  });
});
