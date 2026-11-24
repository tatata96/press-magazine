import "server-only";

import {getAllCitiesOfCountry, getCitiesOfState, getStatesOfCountry} from "@countrystatecity/countries";
import type {LocationOptions} from "./check-location";

const EMPTY_OPTIONS: LocationOptions = {states: [], cities: []};
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

function toCityNames(cities: {name: string}[]): string[] {
  return [...new Set(cities.map((city) => city.name))].sort((a, b) => a.localeCompare(b));
}

// The states of a country and the cities of the chosen state (or of the whole country when the
// dataset has no states for it). Codes from the browser are untrusted: anything unknown yields
// empty options, which the caller treats as "no data".
export async function getLocationOptions(
  countryCode: string,
  stateCode: string,
): Promise<LocationOptions> {
  if (!COUNTRY_CODE_PATTERN.test(countryCode)) {
    return EMPTY_OPTIONS;
  }

  const states = (await getStatesOfCountry(countryCode))
    .map((state) => ({code: state.iso2, name: state.name}))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (states.length === 0) {
    return {states, cities: toCityNames(await getAllCitiesOfCountry(countryCode))};
  }

  if (!states.some((state) => state.code === stateCode)) {
    return {states, cities: []};
  }

  return {states, cities: toCityNames(await getCitiesOfState(countryCode, stateCode))};
}
