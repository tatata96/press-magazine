"use server";

import type {LocationOptions} from "@/lib/locations/check-location";
import {getLocationOptions} from "@/lib/locations/options";

// Feeds the state and city lists of the address form. It is a public endpoint that only returns
// reference data; the submitted address is checked again when it is saved.
export async function loadLocationOptions(
  countryCode: unknown,
  stateCode: unknown,
): Promise<LocationOptions | null> {
  if (typeof countryCode !== "string" || typeof stateCode !== "string") {
    return null;
  }

  try {
    return await getLocationOptions(countryCode, stateCode);
  } catch (error) {
    console.error(
      "Loading location options failed:",
      error instanceof Error ? error.message : "unknown error",
    );

    return null;
  }
}
