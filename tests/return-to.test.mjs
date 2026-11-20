import assert from "node:assert/strict";
import {describe, it} from "node:test";
import {getLoginPath, parseReturnTo} from "../lib/customer-account/links.ts";

describe("parseReturnTo", () => {
  it("allows the cart and account pages", () => {
    assert.equal(parseReturnTo("/cart"), "/cart");
    assert.equal(parseReturnTo("/account"), "/account");
    assert.equal(parseReturnTo("/account/orders/abc_-123"), "/account/orders/abc_-123");
    assert.equal(parseReturnTo("/cart?x=1"), "/cart?x=1");
  });

  it("falls back to the cart for anything that could leave the site or is not a signed-in page", () => {
    for (const bad of [
      "//evil.com",
      "https://evil.com",
      "/\\evil.com",
      "/cartx",
      "/subscribe",
      "/api/auth/logout",
      "cart",
      "",
      null,
      undefined,
      `/account/${"a".repeat(400)}`,
    ]) {
      assert.equal(parseReturnTo(bad), "/cart", String(bad));
    }
  });
});

describe("getLoginPath", () => {
  it("encodes the return path and locale", () => {
    assert.equal(getLoginPath({locale: "tr", returnTo: "/account"}), "/api/auth/login?locale=tr&returnTo=%2Faccount");
  });
});
