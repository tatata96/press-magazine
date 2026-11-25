import {getTrimmedString} from "@/app/utils/string";
import {COUNTRY_CODES} from "./countries";

export type SignupField = "email" | "birthYear" | "name" | "country";

export type SignupInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  birthYear?: number;
  country?: string;
};

export type ParsedSignup =
  | {kind: "valid"; input: SignupInput}
  | {kind: "bot"}
  | {kind: "invalid"; fields: SignupField[]};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 100;
const FOUR_DIGIT_YEAR = /^\d{4}$/;

// Also checked in the browser forms, which import them from here.
// Provisional: the oldest accepted birth year is 110 years back; the limit is a product decision.
const MAX_YEARS_BACK = 110;

export function getBirthYearRange(now = new Date()) {
  const currentYear = now.getFullYear();

  return {min: currentYear - MAX_YEARS_BACK, max: currentYear};
}

// Birth year is optional; when given it must be a four-digit year within the range.
export function isValidBirthYear(text: string) {
  if (!FOUR_DIGIT_YEAR.test(text)) {
    return false;
  }
  const {min, max} = getBirthYearRange();
  const year = Number(text);

  return year >= min && year <= max;
}

export function parseSignup(payload: unknown): ParsedSignup {
  const body =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : {};

  if (getTrimmedString(body.website)) {
    return {kind: "bot"};
  }

  const fields: SignupField[] = [];

  const email = getTrimmedString(body.email).toLowerCase();

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL.test(email)) {
    fields.push("email");
  }

  const firstName = getTrimmedString(body.name);
  const lastName = getTrimmedString(body.surname);

  if (firstName.length > MAX_NAME_LENGTH || lastName.length > MAX_NAME_LENGTH) {
    fields.push("name");
  }

  const birthYearText = getTrimmedString(body.birthYear);

  if (birthYearText && !isValidBirthYear(birthYearText)) {
    fields.push("birthYear");
  }

  // Optional; when given it must be one of the ISO codes the form offers.
  const country = getTrimmedString(body.country).toUpperCase();

  if (country && !COUNTRY_CODES.has(country)) {
    fields.push("country");
  }

  if (fields.length > 0) {
    return {kind: "invalid", fields};
  }

  return {
    kind: "valid",
    input: {
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      birthYear: birthYearText ? Number(birthYearText) : undefined,
      country: country || undefined,
    },
  };
}
