import "server-only";

import type {Money} from "@/lib/shopify/money";
import {requestCustomerAccount} from "./client";

export type CustomerAddress = {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
  /** ISO 3166-1 alpha-2, e.g. "TR". */
  countryCode: string;
};

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  defaultAddressId: string | null;
  addresses: CustomerAddress[];
};

export type AddressInput = Omit<CustomerAddress, "id">;

export type MutationResult = {ok: true} | {ok: false; error: "invalid"};

type AddressNode = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  zip: string | null;
  territoryCode: string | null;
};

type UserError = {code?: string | null};

function toAddress(node: AddressNode): CustomerAddress {
  return {
    id: node.id,
    firstName: node.firstName ?? "",
    lastName: node.lastName ?? "",
    address1: node.address1 ?? "",
    address2: node.address2 ?? "",
    city: node.city ?? "",
    zip: node.zip ?? "",
    countryCode: node.territoryCode ?? "",
  };
}

export async function getCustomer(accessToken: string): Promise<Customer> {
  const data = await requestCustomerAccount<{
    customer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      emailAddress: {emailAddress: string | null} | null;
      phoneNumber: {phoneNumber: string | null} | null;
      defaultAddress: {id: string} | null;
      addresses: {nodes: AddressNode[]};
    };
  }>(
    accessToken,
    `
      query Customer {
        customer {
          id
          firstName
          lastName
          emailAddress { emailAddress }
          phoneNumber { phoneNumber }
          defaultAddress { id }
          addresses(first: 50) {
            nodes {
              id
              firstName
              lastName
              address1
              address2
              city
              zip
              territoryCode
            }
          }
        }
      }
    `,
  );
  const {customer} = data;

  return {
    id: customer.id,
    firstName: customer.firstName ?? "",
    lastName: customer.lastName ?? "",
    email: customer.emailAddress?.emailAddress ?? null,
    phone: customer.phoneNumber?.phoneNumber ?? null,
    defaultAddressId: customer.defaultAddress?.id ?? null,
    addresses: customer.addresses.nodes.map(toAddress),
  };
}

// Shopify rejects invalid input with userErrors. Only their codes are logged: the messages can
// echo what the buyer typed.
function toResult(operation: string, userErrors: UserError[]): MutationResult {
  if (userErrors.length === 0) {
    return {ok: true};
  }

  console.error(
    `${operation} rejected:`,
    userErrors.map((error) => error.code ?? "UNKNOWN").join(", "),
  );

  return {ok: false, error: "invalid"};
}

export async function updateCustomerName(
  accessToken: string,
  name: {firstName: string; lastName: string},
): Promise<MutationResult> {
  const data = await requestCustomerAccount<{
    customerUpdate: {userErrors: UserError[]};
  }>(
    accessToken,
    `
      mutation UpdateCustomer($input: CustomerUpdateInput!) {
        customerUpdate(input: $input) {
          customer { id }
          userErrors { field message code }
        }
      }
    `,
    {input: name},
  );

  return toResult("customerUpdate", data.customerUpdate.userErrors);
}

// An empty second line is left out so Shopify does not store a blank value.
function toAddressInput(address: AddressInput) {
  return {
    firstName: address.firstName,
    lastName: address.lastName,
    address1: address.address1,
    address2: address.address2 || undefined,
    city: address.city,
    zip: address.zip,
    territoryCode: address.countryCode,
  };
}

export async function createCustomerAddress(
  accessToken: string,
  address: AddressInput,
  options: {makeDefault: boolean},
): Promise<{ok: true; addressId: string} | {ok: false; error: "invalid"}> {
  const data = await requestCustomerAccount<{
    customerAddressCreate: {
      customerAddress: {id: string} | null;
      userErrors: UserError[];
    };
  }>(
    accessToken,
    `
      mutation CreateAddress($address: CustomerAddressInput!, $defaultAddress: Boolean) {
        customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
          customerAddress { id }
          userErrors { field message code }
        }
      }
    `,
    {address: toAddressInput(address), defaultAddress: options.makeDefault},
  );
  const {customerAddress, userErrors} = data.customerAddressCreate;
  const result = toResult("customerAddressCreate", userErrors);

  return result.ok && customerAddress
    ? {ok: true, addressId: customerAddress.id}
    : {ok: false, error: "invalid"};
}

export async function updateCustomerAddress(
  accessToken: string,
  addressId: string,
  address: AddressInput,
): Promise<MutationResult> {
  const data = await requestCustomerAccount<{
    customerAddressUpdate: {userErrors: UserError[]};
  }>(
    accessToken,
    `
      mutation UpdateAddress($addressId: ID!, $address: CustomerAddressInput!) {
        customerAddressUpdate(addressId: $addressId, address: $address) {
          customerAddress { id }
          userErrors { field message code }
        }
      }
    `,
    {addressId, address: toAddressInput(address)},
  );

  return toResult("customerAddressUpdate", data.customerAddressUpdate.userErrors);
}

export async function setDefaultCustomerAddress(
  accessToken: string,
  addressId: string,
  address: AddressInput,
): Promise<MutationResult> {
  // The API sets the default through the update mutation, so the current values are sent back.
  const data = await requestCustomerAccount<{
    customerAddressUpdate: {userErrors: UserError[]};
  }>(
    accessToken,
    `
      mutation SetDefaultAddress($addressId: ID!, $address: CustomerAddressInput!) {
        customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: true) {
          customerAddress { id }
          userErrors { field message code }
        }
      }
    `,
    {addressId, address: toAddressInput(address)},
  );

  return toResult("customerAddressUpdate", data.customerAddressUpdate.userErrors);
}

export async function deleteCustomerAddress(
  accessToken: string,
  addressId: string,
): Promise<MutationResult> {
  const data = await requestCustomerAccount<{
    customerAddressDelete: {userErrors: UserError[]};
  }>(
    accessToken,
    `
      mutation DeleteAddress($addressId: ID!) {
        customerAddressDelete(addressId: $addressId) {
          deletedAddressId
          userErrors { field message code }
        }
      }
    `,
    {addressId},
  );

  return toResult("customerAddressDelete", data.customerAddressDelete.userErrors);
}

export type OrderSummary = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  total: Money;
};

export type OrderAddress = {
  name: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
  countryCode: string;
};

export type OrderDetail = OrderSummary & {
  subtotal: Money | null;
  shipping: Money | null;
  lines: {title: string; quantity: number; total: Money}[];
  shippingAddress: OrderAddress | null;
  billingAddress: OrderAddress | null;
  statusPageUrl: string | null;
};

type OrderNode = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  totalPrice: Money;
};

type OrderAddressNode = {
  firstName: string | null;
  lastName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  zip: string | null;
  territoryCode: string | null;
};

function toOrderSummary(node: OrderNode): OrderSummary {
  return {
    id: node.id,
    name: node.name,
    processedAt: node.processedAt,
    financialStatus: node.financialStatus,
    fulfillmentStatus: node.fulfillmentStatus,
    total: node.totalPrice,
  };
}

function toOrderAddress(node: OrderAddressNode | null): OrderAddress | null {
  return node
    ? {
        name: [node.firstName, node.lastName].filter(Boolean).join(" "),
        address1: node.address1 ?? "",
        address2: node.address2 ?? "",
        city: node.city ?? "",
        zip: node.zip ?? "",
        countryCode: node.territoryCode ?? "",
      }
    : null;
}

// The latest twenty is plenty for a magazine's order history; there is no paging.
export async function getOrders(accessToken: string): Promise<OrderSummary[]> {
  const data = await requestCustomerAccount<{
    customer: {orders: {nodes: OrderNode[]}};
  }>(
    accessToken,
    `
      query Orders {
        customer {
          orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
            nodes {
              id
              name
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice { amount currencyCode }
            }
          }
        }
      }
    `,
  );

  return data.customer.orders.nodes.map(toOrderSummary);
}

// Returns null when the order does not exist or belongs to someone else: the API only ever
// serves the signed-in customer's own orders.
export async function getOrder(accessToken: string, orderId: string): Promise<OrderDetail | null> {
  const data = await requestCustomerAccount<{
    order:
      | (OrderNode & {
          statusPageUrl: string | null;
          subtotal: Money | null;
          totalShipping: Money | null;
          lineItems: {nodes: {title: string; quantity: number; totalPrice: Money | null}[]};
          shippingAddress: OrderAddressNode | null;
          billingAddress: OrderAddressNode | null;
        })
      | null;
  }>(
    accessToken,
    `
      query Order($id: ID!) {
        order(id: $id) {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          statusPageUrl
          totalPrice { amount currencyCode }
          subtotal { amount currencyCode }
          totalShipping { amount currencyCode }
          lineItems(first: 50) {
            nodes {
              title
              quantity
              totalPrice { amount currencyCode }
            }
          }
          shippingAddress {
            firstName lastName address1 address2 city zip territoryCode
          }
          billingAddress {
            firstName lastName address1 address2 city zip territoryCode
          }
        }
      }
    `,
    {id: orderId},
  );
  const {order} = data;

  if (!order) {
    return null;
  }

  return {
    ...toOrderSummary(order),
    subtotal: order.subtotal,
    shipping: order.totalShipping,
    lines: order.lineItems.nodes.flatMap((line) =>
      line.totalPrice
        ? [{title: line.title, quantity: line.quantity, total: line.totalPrice}]
        : [],
    ),
    shippingAddress: toOrderAddress(order.shippingAddress),
    billingAddress: toOrderAddress(order.billingAddress),
    statusPageUrl: order.statusPageUrl,
  };
}
