import assert from "node:assert/strict";
import {describe, it} from "node:test";
import {checkLocation} from "../lib/locations/check-location.ts";

const WITH_STATES = {
  states: [
    {code: "34", name: "İstanbul"},
    {code: "06", name: "Ankara"},
  ],
  cities: ["Kadıköy", "Adalar"],
};
const NO_STATES = {states: [], cities: ["Monaco"]};
const NO_DATA = {states: [], cities: []};

describe("checkLocation", () => {
  it("accepts a listed state and city", () => {
    assert.deepEqual(checkLocation(WITH_STATES, {stateCode: "34", city: "Kadıköy"}), {});
  });

  it("requires a state when the country has states", () => {
    assert.deepEqual(checkLocation(WITH_STATES, {stateCode: "", city: "Kadıköy"}), {stateCode: "required"});
  });

  it("rejects an unknown state and does not judge the city", () => {
    assert.deepEqual(checkLocation(WITH_STATES, {stateCode: "99", city: "Nowhere"}), {stateCode: "invalid"});
  });

  it("rejects a misspelled city", () => {
    assert.deepEqual(checkLocation(WITH_STATES, {stateCode: "34", city: "Kadikoy"}), {city: "invalid"});
  });

  it("requires a city", () => {
    assert.deepEqual(checkLocation(WITH_STATES, {stateCode: "34", city: ""}), {city: "required"});
  });

  it("rejects a state for a country without states", () => {
    assert.deepEqual(checkLocation(NO_STATES, {stateCode: "34", city: "Monaco"}), {stateCode: "invalid"});
  });

  it("checks the city against the country's list when there are no states", () => {
    assert.deepEqual(checkLocation(NO_STATES, {stateCode: "", city: "Monaco"}), {});
    assert.deepEqual(checkLocation(NO_STATES, {stateCode: "", city: "Monako"}), {city: "invalid"});
  });

  it("accepts any non-empty city when the dataset has no cities", () => {
    assert.deepEqual(checkLocation(NO_DATA, {stateCode: "", city: "Small Town"}), {});
    assert.deepEqual(checkLocation(NO_DATA, {stateCode: "", city: ""}), {city: "required"});
  });
});
