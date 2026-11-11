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

// The agreement names two product categories (article 3.4). They are matched by Shopify
// handle, so the wording stays right whatever a product's shipping setting is.
export const PRODUCT_TYPE_BY_HANDLE: Record<string, "digital" | "printAndDigital"> = {
  [PLAN_PRODUCT_HANDLES.digital]: "digital",
  [PLAN_PRODUCT_HANDLES.print]: "printAndDigital",
};
