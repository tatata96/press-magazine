import "server-only";

import {adminGraphQL, ShopifyError} from "./admin-client";

// Only ever called with the id of the signed-in customer, taken from their session.
const CUSTOMER_ID_PATTERN = /^gid:\/\/shopify\/Customer\/\d+$/;

type UserError = {field?: string[] | null};

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
