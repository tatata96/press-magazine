// The two legal documents shown in the checkout consent modals, the standalone pages and
// the footer. `key` is the message namespace under "LegalDocuments"; `path` is the route
// without the locale prefix.
export const legalDocuments = {
  distanceSalesAgreement: {path: "/distance-sales-agreement"},
  preInformation: {path: "/pre-information"},
} as const;

export type LegalDocumentKey = keyof typeof legalDocuments;
