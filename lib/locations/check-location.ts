export type StateOption = {code: string; name: string};

export type LocationOptions = {
  /** Empty when the dataset has no states for the country. */
  states: StateOption[];
  /** Empty when the dataset has no cities for the selected state (or country, if it has no states). */
  cities: string[];
};

export type LocationErrors = Partial<Record<"stateCode" | "city", "required" | "invalid">>;

// Decides whether a submitted state and city belong to the loaded options. Where the dataset
// has nothing to offer, the field is free text, so nobody is blocked by missing data.
export function checkLocation(
  options: LocationOptions,
  selection: {stateCode: string; city: string},
): LocationErrors {
  if (options.states.length === 0) {
    return selection.stateCode ? {stateCode: "invalid"} : checkCity(options, selection.city);
  }

  if (!selection.stateCode) {
    return {stateCode: "required"};
  }

  if (!options.states.some((state) => state.code === selection.stateCode)) {
    return {stateCode: "invalid"};
  }

  return checkCity(options, selection.city);
}

function checkCity(options: LocationOptions, city: string): LocationErrors {
  if (!city) {
    return {city: "required"};
  }

  if (options.cities.length > 0 && !options.cities.includes(city)) {
    return {city: "invalid"};
  }

  return {};
}
