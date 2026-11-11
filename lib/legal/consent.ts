// Consent recorded on the Shopify cart (and carried onto the order as custom attributes)
// when the visitor leaves our cart page for Shopify's hosted checkout.

// PLACEHOLDER: the legal documents are dummy text for now. Replace this with the real
// document version (for example a date) when the final texts are published, so each
// order shows which version was accepted.
export const PLACEHOLDER_VERSION = "placeholder";
export const LEGAL_DOCUMENTS_VERSION: string = PLACEHOLDER_VERSION;

export const CONSENT_ATTRIBUTE_KEYS = {
  accepted: "consent_distance_sales_and_pre_information",
  documentsVersion: "consent_documents_version",
  acceptedAt: "consent_accepted_at",
  locale: "consent_locale",
  // Hash of the exact agreement the buyer saw (details, order, delivery, total). No personal
  // data is stored in it; it lets the merchant tell which version of the order was accepted.
  agreementFingerprint: "consent_agreement_fingerprint",
  // Shopify cart id without its secret key, to match the acceptance to the order.
  cartReference: "consent_cart_reference",
  // The total shown in the agreement. Checkout can still change the real total, so
  // comparing this with the order total shows whether it did.
  agreedTotal: "consent_agreed_total",
} as const;
