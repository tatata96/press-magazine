import assert from "node:assert/strict";
import {describe, it} from "node:test";
import {
  loadPlanProducts,
  planIdFromTags,
  selectPlanProducts,
} from "../lib/shopify/plan-products.ts";

function product(id, tags, {availableForSale = true, image = true} = {}) {
  return {
    tags,
    featuredImage: image ? {url: `https://cdn.example/${id}.jpg`} : null,
    variants: {
      nodes: [
        {
          id: `gid://shopify/ProductVariant/${id}`,
          availableForSale,
          price: {amount: "20.0", currencyCode: "EUR"},
        },
      ],
    },
  };
}

function data(nodes, hasNextPage = false) {
  return {products: {nodes, pageInfo: {hasNextPage}}};
}

const DIGITAL = product("d1", ["current", "digital"]);
const PRINT = product("p1", ["current", "print"]);

describe("selectPlanProducts", () => {
  it("picks exactly one current Digital and one current Print product", () => {
    const result = selectPlanProducts(data([DIGITAL, PRINT]));

    assert.deepEqual(result, {
      status: "ok",
      products: {
        digital: {
          variantId: "gid://shopify/ProductVariant/d1",
          price: {amount: "20.0", currencyCode: "EUR"},
          availableForSale: true,
          imageUrl: "https://cdn.example/d1.jpg",
        },
        print: {
          variantId: "gid://shopify/ProductVariant/p1",
          price: {amount: "20.0", currencyCode: "EUR"},
          availableForSale: true,
          imageUrl: "https://cdn.example/p1.jpg",
        },
      },
    });
  });

  it("leaves a plan null when its current product is missing", () => {
    const result = selectPlanProducts(data([DIGITAL]));

    assert.equal(result.status, "ok");
    assert.ok(result.products.digital);
    assert.equal(result.products.print, null);
    assert.equal(selectPlanProducts(data([])).products.digital, null);
  });

  it("ignores products without the current tag, even if search returned them", () => {
    const old = product("d0", ["digital"]);
    const result = selectPlanProducts(data([old, DIGITAL, PRINT]));

    assert.equal(result.products.digital.variantId, "gid://shopify/ProductVariant/d1");
  });

  it("matches tags case-insensitively", () => {
    const result = selectPlanProducts(data([product("d1", ["Current", "Digital"])]));

    assert.ok(result.products.digital);
  });

  it("returns null for a plan with several matches instead of picking one", (t) => {
    t.mock.method(console, "error", () => {});
    const second = product("d2", ["current", "digital"]);
    const result = selectPlanProducts(data([DIGITAL, second, PRINT]));

    assert.equal(result.status, "ok");
    assert.equal(result.products.digital, null);
    assert.ok(result.products.print);
  });

  it("treats a product tagged both digital and print as ambiguous for both plans", (t) => {
    t.mock.method(console, "error", () => {});
    const both = product("x", ["current", "digital", "print"]);
    const result = selectPlanProducts(data([both, DIGITAL, PRINT]));

    assert.equal(result.products.digital, null);
    assert.equal(result.products.print, null);
  });

  it("keeps a sold-out current product but marks it unavailable", () => {
    const soldOut = product("d1", ["current", "digital"], {availableForSale: false});
    const result = selectPlanProducts(data([soldOut, PRINT]));

    assert.equal(result.products.digital.availableForSale, false);
  });

  it("returns null for a product without variants", () => {
    const noVariant = {...DIGITAL, variants: {nodes: []}};

    assert.equal(selectPlanProducts(data([noVariant])).products.digital, null);
  });

  it("returns a null image when the product has none", () => {
    const result = selectPlanProducts(data([product("d1", ["current", "digital"], {image: false})]));

    assert.equal(result.products.digital.imageUrl, null);
  });

  it("refuses to choose when results span more than one page", () => {
    assert.throws(() => selectPlanProducts(data([DIGITAL, PRINT], true)));
  });
});

describe("loadPlanProducts", () => {
  it("returns an error result when Shopify fails", async (t) => {
    const log = t.mock.method(console, "error", () => {});
    const result = await loadPlanProducts(() => Promise.reject(new Error("HTTP 500")));

    assert.deepEqual(result, {status: "error"});
    assert.equal(log.mock.callCount(), 1);
  });

  it("returns an error result when there are too many matches", async (t) => {
    t.mock.method(console, "error", () => {});
    const result = await loadPlanProducts(() => Promise.resolve(data([DIGITAL], true)));

    assert.deepEqual(result, {status: "error"});
  });

  it("returns the selection on success", async () => {
    const result = await loadPlanProducts(() => Promise.resolve(data([DIGITAL, PRINT])));

    assert.equal(result.status, "ok");
  });
});

describe("planIdFromTags", () => {
  it("classifies old and current issues by format tag", () => {
    assert.equal(planIdFromTags(["digital"]), "digital");
    assert.equal(planIdFromTags(["current", "print"]), "print");
  });

  it("returns null when the format is missing or contradictory", () => {
    assert.equal(planIdFromTags([]), null);
    assert.equal(planIdFromTags(["print", "digital"]), null);
  });
});
