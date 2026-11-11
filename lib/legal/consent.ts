// Consent recorded on the Shopify cart (and carried onto the order as custom attributes)
// when the visitor leaves our cart page for Shopify's hosted checkout.

// PLACEHOLDER: the legal documents are dummy text for now. Replace this with the real
// document version (for example a date) when the final texts are published, so each
// order shows which version was accepted.
export const LEGAL_DOCUMENTS_VERSION = "placeholder";

export const CONSENT_ATTRIBUTE_KEYS = {
  accepted: "consent_distance_sales_and_pre_information",
  documentsVersion: "consent_documents_version",
  acceptedAt: "consent_accepted_at",
  locale: "consent_locale",
} as const;
