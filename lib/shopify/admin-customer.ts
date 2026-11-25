import "server-only";

import {adminGraphQL, ShopifyError} from "./admin-client";

// Only ever called with the id of the signed-in customer, taken from their session.
const CUSTOMER_ID_PATTERN = /^gid:\/\/shopify\/Customer\/\d+$/;

type UserError = {field?: string[] | null};

// Same metafield the newsletter signup writes (the store's "custom" namespace, where its definition lives) (app/api/newsletter/subscribe.ts).
const BIRTH_YEAR_METAFIELD = {namespace: "custom", key: "birth_year"} as const;

// The Customer Account API cannot read or write these metafields, so the id of the signed-in
// customer (from their session) is used with the Admin credentials, as for the phone.
function toAdminCustomerId(customerId: string): string {
  // The Customer Account API may append "?model_name=Customer"; the Admin API wants the bare id.
  const adminCustomerId = customerId.split("?")[0];

  if (!CUSTOMER_ID_PATTERN.test(adminCustomerId)) {
    throw new ShopifyError("Unexpected customer id.");
  }

  return adminCustomerId;
}

export async function getCustomerBirthYear(customerId: string): Promise<string> {
  const {customer} = await adminGraphQL<{customer: {metafield: {value: string} | null} | null}>(
    `
      query CustomerBirthYear($id: ID!, $namespace: String!, $key: String!) {
        customer(id: $id) {
          metafield(namespace: $namespace, key: $key) { value }
        }
      }
    `,
    {id: toAdminCustomerId(customerId), ...BIRTH_YEAR_METAFIELD},
  );

  return customer?.metafield?.value ?? "";
}

export async function updateCustomerBirthYear(
  customerId: string,
  birthYear: number,
): Promise<{ok: true} | {ok: false; error: "invalid"}> {
  const {customerUpdate} = await adminGraphQL<{customerUpdate: {userErrors: UserError[]}}>(
    `
      mutation UpdateCustomerBirthYear($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer { id }
          userErrors { field }
        }
      }
    `,
    {
      input: {
        id: toAdminCustomerId(customerId),
        metafields: [
          {...BIRTH_YEAR_METAFIELD, type: "number_integer", value: String(birthYear)},
        ],
      },
    },
  );

  if (customerUpdate.userErrors.length === 0) {
    return {ok: true};
  }

  console.error(
    "customerUpdate (birth year) rejected at:",
    customerUpdate.userErrors.map((error) => error.field?.join(".") ?? "unknown").join(", "),
  );

  return {ok: false, error: "invalid"};
}

// The Customer Account API cannot change a customer's phone, so the checkout and the account
// page write it with the store's Admin credentials, for the signed-in customer only.
// Shopify requires a customer's phone to be unique; a rejected number comes back as "invalid".
export async function updateCustomerPhone(
  customerId: string,
  phone: string,
): Promise<{ok: true} | {ok: false; error: "invalid"}> {
  // The Customer Account API may append "?model_name=Customer"; the Admin API wants the bare id.
  const adminCustomerId = customerId.split("?")[0];

  if (!CUSTOMER_ID_PATTERN.test(adminCustomerId)) {
    throw new ShopifyError("Unexpected customer id.");
  }

  const {customerUpdate} = await adminGraphQL<{customerUpdate: {userErrors: UserError[]}}>(
    `
      mutation UpdateCustomerPhone($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer { id }
          userErrors { field }
        }
      }
    `,
    {input: {id: adminCustomerId, phone}},
  );

  if (customerUpdate.userErrors.length === 0) {
    return {ok: true};
  }

  // The failing fields only (this error type has no code): Shopify's messages can echo the
  // number that was submitted.
  console.error(
    "customerUpdate (phone) rejected at:",
    customerUpdate.userErrors.map((error) => error.field?.join(".") ?? "unknown").join(", "),
  );

  return {ok: false, error: "invalid"};
}
