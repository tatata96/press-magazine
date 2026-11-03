import {adminGraphQL, ShopifyError} from "../../../lib/shopify/admin-client";
import type {SignupInput} from "./validation";

type UserError = {field: string[] | null; code?: string | null};

type CustomerLookup = {
  customerByIdentifier: {
    id: string;
    defaultEmailAddress: {marketingState: string} | null;
  } | null;
};

const FIND_CUSTOMER = `
  query FindCustomerByEmail($identifier: CustomerIdentifierInput!) {
    customerByIdentifier(identifier: $identifier) {
      id
      defaultEmailAddress {
        marketingState
      }
    }
  }
`;

const CREATE_CUSTOMER = `
  mutation CreateNewsletterCustomer($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
      }
    }
  }
`;

// Changes only the email marketing consent; name, tags and other fields stay as they are.
const UPDATE_CONSENT = `
  mutation UpdateNewsletterConsent($input: CustomerEmailMarketingConsentUpdateInput!) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
        code
      }
    }
  }
`;

function createSingleOptInConsent() {
  return {
    marketingState: "SUBSCRIBED",
    marketingOptInLevel: "SINGLE_OPT_IN",
    consentUpdatedAt: new Date().toISOString(),
  };
}

// Optional answers are stored as customer metafields; empty ones are left out.
function createSignupMetafields(input: SignupInput) {
  const metafields = [];

  if (input.age !== undefined) {
    metafields.push({
      namespace: "press",
      key: "age",
      type: "number_integer",
      value: String(input.age),
    });
  }
  if (input.country !== undefined) {
    metafields.push({
      namespace: "press",
      key: "country",
      type: "single_line_text_field",
      value: input.country,
    });
  }

  return metafields.length > 0 ? metafields : undefined;
}

// Messages are left out on purpose: Shopify may echo the submitted email in them. Only the
// failing field (and the error code, where the mutation has one) is reported.
function assertNoUserErrors(operation: string, userErrors: UserError[]) {
  if (userErrors.length === 0) {
    return;
  }
  const detail = userErrors.map(
    (e) => `${e.code ?? "no-code"}@${e.field?.join(".") ?? "-"}`,
  );

  throw new ShopifyError(`${operation} rejected: ${detail.join(", ")}.`);
}

// Submitting the form is the consent (the notice sits beside the button). The outcome is
// deliberately not returned so responses cannot reveal whether a customer already exists.
export async function subscribeToNewsletter(input: SignupInput): Promise<void> {
  const {customerByIdentifier: existingCustomer} =
    await adminGraphQL<CustomerLookup>(FIND_CUSTOMER, {
      identifier: {emailAddress: input.email},
    });

  if (!existingCustomer) {
    const {customerCreate} = await adminGraphQL<{
      customerCreate: {userErrors: UserError[]};
    }>(CREATE_CUSTOMER, {
      input: {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        emailMarketingConsent: createSingleOptInConsent(),
        metafields: createSignupMetafields(input),
      },
    });

    assertNoUserErrors("customerCreate", customerCreate.userErrors);
    return;
  }

  const state = existingCustomer.defaultEmailAddress?.marketingState;

  if (state === "SUBSCRIBED") {
    return;
  }

  // Existing customer, not subscribed yet: the consent ticked on this form lets us subscribe
  // them. Any other state (for example invalid or redacted) cannot be subscribed.
  if (
    state !== "NOT_SUBSCRIBED" &&
    state !== "UNSUBSCRIBED" &&
    state !== "PENDING"
  ) {
    throw new ShopifyError(
      `Customer cannot be subscribed from state ${state ?? "unknown"}.`,
    );
  }

  const {customerEmailMarketingConsentUpdate} = await adminGraphQL<{
    customerEmailMarketingConsentUpdate: {userErrors: UserError[]};
  }>(UPDATE_CONSENT, {
    input: {
      customerId: existingCustomer.id,
      emailMarketingConsent: createSingleOptInConsent(),
    },
  });

  assertNoUserErrors(
    "customerEmailMarketingConsentUpdate",
    customerEmailMarketingConsentUpdate.userErrors,
  );
}
