import "server-only";

import {discoverEndpoints} from "./oauth";
import {CustomerAccountError, CustomerSessionExpiredError} from "./types";

type GraphQLResponse<Data> = {
  data?: Data;
  errors?: {message?: string; extensions?: {code?: string}}[];
};

// Server-only Customer Account API client. It acts as the signed-in customer, so every call
// needs that customer's access token; the token never leaves the server.
// https://shopify.dev/docs/api/customer
export async function requestCustomerAccount<Data>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<Data> {
  const {graphqlApi} = await discoverEndpoints();
  const response = await fetch(graphqlApi, {
    method: "POST",
    headers: {"Content-Type": "application/json", Authorization: accessToken},
    body: JSON.stringify({query, variables}),
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    throw new CustomerSessionExpiredError("Customer access token was rejected.");
  }

  if (!response.ok) {
    throw new CustomerAccountError(`Customer Account API request failed (HTTP ${response.status}).`);
  }

  const result = (await response.json()) as GraphQLResponse<Data>;

  if (result.errors?.length || !result.data) {
    // Codes only: messages can echo request values.
    const codes = result.errors?.map((error) => error.extensions?.code ?? "UNKNOWN").join(", ");

    throw new CustomerAccountError(`Customer Account API returned errors: ${codes || "no data"}.`);
  }

  return result.data;
}
