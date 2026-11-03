import {getTrimmedString} from "@/app/utils/string";

export type SignupField = "email" | "age" | "name";

export type SignupInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  age?: number;
};

export type ParsedSignup =
  | {kind: "valid"; input: SignupInput}
  | {kind: "bot"}
  | {kind: "invalid"; fields: SignupField[]};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 100;
const POSITIVE_INTEGER = /^[1-9]\d*$/;

// Also checked in the browser forms, which import it from here.
export const MAX_AGE = 110;

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

  const ageText = getTrimmedString(body.age);
  const age = Number(ageText);

  if (
    ageText &&
    (!POSITIVE_INTEGER.test(ageText) || !Number.isSafeInteger(age) || age > MAX_AGE)
  ) {
    fields.push("age");
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
      age: ageText ? age : undefined,
    },
  };
}
