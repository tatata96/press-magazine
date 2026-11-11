import "server-only";

import {PLAN_PRODUCT_HANDLES} from "@/lib/shopify/products";

export type SellerField =
  | "legalName"
  | "address"
  | "taxNumber"
  | "phone"
  | "email"
  | "supportEmail";

// Seller details, as supplied by the business. A null value shows a visible placeholder in
// the agreement and keeps checkout closed in production (see readiness.ts); never guess one.
export const SELLER: Record<SellerField, string | null> = {
  legalName: "SEPTEMBER İLETİŞİM LİMİTED ŞİRKETİ",
  address: "Etiler Mahallesi, Bade Sokak, No: 1, Beşiktaş / İstanbul",
  taxNumber: "7610578558",
  phone: "+90 530 208 56 90",
  email: "hello@pressmagazine.com.tr",
  // Withdrawal and return requests go here (article 8.4); the same address as `email`.
  supportEmail: "hello@pressmagazine.com.tr",
};

export type LocalizedText = {tr: string; en: string};

export type BusinessTermField =
  | "physicalDeliveryTime"
  | "returnCarrier"
  | "digitalAccess"
  | "digitalProtection";

// PLACEHOLDER: business terms the Pre-Contractual Information Form must state but nobody has
// confirmed yet. null shows a visible placeholder and keeps checkout closed in production
// (see readiness.ts). Supply the exact text in both languages; do not guess any of them.
export const BUSINESS_TERMS: Record<BusinessTermField, LocalizedText | null> = {
  // Delivery time for printed magazines (regulation art. 5(1)(f)).
  physicalDeliveryTime: null,
  // Carrier for returns and who pays the return shipping (art. 5(1)(g); agreement 8.6).
  returnCarrier: null,
  // How and from when the buyer can access the PDF (art. 5(1)(f); agreement 7.2.2).
  digitalAccess: null,
  // Technical protection applied to the PDF, if any (art. 5(1)(i)).
  digitalProtection: null,
};

// The agreement names two product categories (article 3.4). They are matched by Shopify
// handle, so the wording stays right whatever a product's shipping setting is.
export const PRODUCT_TYPE_BY_HANDLE: Record<string, "digital" | "printAndDigital"> = {
  [PLAN_PRODUCT_HANDLES.digital]: "digital",
  [PLAN_PRODUCT_HANDLES.print]: "printAndDigital",
};
