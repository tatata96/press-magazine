import assert from "node:assert/strict";
import {describe, it} from "node:test";
import {
  isValidPhone,
  parseCheckoutSelection,
  resolveBuyerDetails,
} from "../app/[locale]/buyer-details/checkout-selection.ts";

const HOME = {
  id: "gid://shopify/CustomerAddress/1?model_name=CustomerAddress",
  firstName: "Ada",
  lastName: "Lovelace",
  address1: "1 Home Street",
  address2: "",
  city: "Istanbul",
  zip: "34000",
  countryCode: "TR",
};
const OFFICE = {...HOME, id: "gid://shopify/CustomerAddress/2?model_name=CustomerAddress", address1: "2 Office Road", countryCode: "DE"};
const PROFILE = {firstName: "Ada", lastName: "Lovelace", email: "ada@example.com"};
const BASE = {
  profile: PROFILE,
  addresses: [HOME, OFFICE],
  selection: {phone: "+905551112233", shippingAddressId: HOME.id, billingAddressId: null},
  requiresShipping: true,
  allowedCountryCodes: ["TR", "DE"],
};

describe("parseCheckoutSelection", () => {
  it("accepts a complete selection and normalizes the phone number", () => {
    const parsed = parseCheckoutSelection({
      phone: "+90 (555) 111-22 33",
      shippingAddressId: HOME.id,
      billingAddressId: null,
    });

    assert.deepEqual(parsed, {phone: "+905551112233", shippingAddressId: HOME.id, billingAddressId: null});
  });

  it("checks the number against the country's numbering rules", () => {
    assert.equal(isValidPhone("+905551112233"), true);
    assert.equal(isValidPhone("+49 30 901820"), true);
    // Right shape (+ and digits) but not a real number for the country.
    assert.equal(isValidPhone("+9012345"), false);
    assert.equal(isValidPhone("+90555111"), false);
  });

  it("rejects a phone number without a country code", () => {
    assert.equal(parseCheckoutSelection({phone: "05551112233", shippingAddressId: null, billingAddressId: null}), null);
    assert.equal(isValidPhone("05551112233"), false);
  });

  it("rejects address ids that are not Shopify customer address ids", () => {
    for (const bad of ["1", "gid://shopify/Order/1", "gid://shopify/CustomerAddress/ x", 5, {}]) {
      assert.equal(parseCheckoutSelection({phone: "+905551112233", shippingAddressId: bad, billingAddressId: null}), null);
    }
  });

  it("rejects missing fields and non-objects", () => {
    assert.equal(parseCheckoutSelection(null), null);
    assert.equal(parseCheckoutSelection("x"), null);
    assert.equal(parseCheckoutSelection({phone: "+905551112233", shippingAddressId: HOME.id}), null);
  });
});

describe("resolveBuyerDetails", () => {
  it("physical cart with billing same as delivery leaves billing null", () => {
    const result = resolveBuyerDetails(BASE);

    assert.equal(result.ok, true);
    assert.equal(result.details.shippingAddress.address1, "1 Home Street");
    assert.equal(result.details.billingAddress, null);
    assert.equal(result.details.countryCode, "TR");
    assert.equal(result.details.phone, "+905551112233");
  });

  it("physical cart can bill a different saved address", () => {
    const result = resolveBuyerDetails({...BASE, selection: {...BASE.selection, billingAddressId: OFFICE.id}});

    assert.equal(result.ok, true);
    assert.equal(result.details.billingAddress.address1, "2 Office Road");
    assert.equal(result.details.billingAddress.countryCode, "DE");
    // The buyer's country is the delivery country, not the billing country.
    assert.equal(result.details.countryCode, "TR");
  });

  it("digital cart needs no delivery address and takes the country from billing", () => {
    const result = resolveBuyerDetails({
      ...BASE,
      requiresShipping: false,
      selection: {phone: "+905551112233", shippingAddressId: null, billingAddressId: OFFICE.id},
    });

    assert.equal(result.ok, true);
    assert.equal(result.details.shippingAddress, null);
    assert.equal(result.details.billingAddress.address1, "2 Office Road");
    assert.equal(result.details.countryCode, "DE");
  });

  it("digital cart ignores a delivery address the browser sends anyway", () => {
    const result = resolveBuyerDetails({
      ...BASE,
      requiresShipping: false,
      selection: {phone: "+905551112233", shippingAddressId: HOME.id, billingAddressId: OFFICE.id},
    });

    assert.equal(result.ok, true);
    assert.equal(result.details.shippingAddress, null);
  });

  it("digital cart cannot use 'same as delivery' because there is no delivery address", () => {
    const result = resolveBuyerDetails({...BASE, requiresShipping: false});

    assert.deepEqual(result, {ok: false, reason: "needs_billing_address"});
  });

  it("physical cart without a chosen delivery address is rejected", () => {
    const result = resolveBuyerDetails({...BASE, selection: {...BASE.selection, shippingAddressId: null}});

    assert.deepEqual(result, {ok: false, reason: "needs_shipping_address"});
  });

  it("an address id that is not one of the customer's own is rejected", () => {
    const stranger = "gid://shopify/CustomerAddress/999?model_name=CustomerAddress";

    assert.deepEqual(
      resolveBuyerDetails({...BASE, selection: {...BASE.selection, shippingAddressId: stranger}}),
      {ok: false, reason: "needs_shipping_address"},
    );
    assert.deepEqual(
      resolveBuyerDetails({...BASE, selection: {...BASE.selection, billingAddressId: stranger}}),
      {ok: false, reason: "needs_billing_address"},
    );
  });

  it("asks only for what the account is missing", () => {
    assert.deepEqual(
      resolveBuyerDetails({...BASE, profile: {...PROFILE, lastName: "  "}}),
      {ok: false, reason: "needs_name"},
    );
    assert.deepEqual(
      resolveBuyerDetails({...BASE, profile: {...PROFILE, email: null}}),
      {ok: false, reason: "needs_email"},
    );
  });

  it("rejects a country the shop does not sell to", () => {
    assert.deepEqual(
      resolveBuyerDetails({...BASE, allowedCountryCodes: ["DE"]}),
      {ok: false, reason: "unsupported_country"},
    );
    assert.deepEqual(
      resolveBuyerDetails({...BASE, selection: {...BASE.selection, billingAddressId: OFFICE.id}, allowedCountryCodes: ["TR"]}),
      {ok: false, reason: "unsupported_country"},
    );
  });
});
