import "server-only";

import type {PlanId} from "@/lib/shopify/plan-products";

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
  // Return inquiries go here (article 8); the same address as `email`.
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
  physicalDeliveryTime: {
    tr: "Fiziksel dergi, sipariş tarihinden itibaren en geç 30 gün içerisinde teslim edilir.",
    en: "The physical magazine will be delivered within 30 days of the order date.",
  },
  // Carrier for returns and who pays the return shipping (art. 5(1)(g)). The documents no
  // longer show it, but readiness.ts still requires it.
  returnCarrier: null,
  // How and from when the buyer can access the PDF (art. 5(1)(f); agreement 7.2.2).
  digitalAccess: {
    tr: "Dijital dergiye erişim, ödemenin tamamlanmasının hemen ardından müşterinin e-posta adresine otomatik olarak gönderilen indirme bağlantısı üzerinden sağlanır.",
    en: "The digital magazine is accessible through a download link automatically sent to the customer's email address immediately after successful payment.",
  },
  // Technical protection applied to the PDF, if any (art. 5(1)(i)).
  digitalProtection: {
    tr: "Dijital dergi dosyalarında DRM, parola koruması veya başka bir teknik kopyalama koruması uygulanmamaktadır.",
    en: "Digital magazine files are not protected by DRM, passwords, or other technical copy protection.",
  },
};

// The agreement names two product categories (article 3.4). They are matched by the product's
// `digital`/`print` Shopify tag (not its handle, which changes with every issue), so the
// wording stays right whatever a product's shipping setting is.
export const PRODUCT_TYPE_BY_PLAN: Record<PlanId, "digital" | "print"> = {
  digital: "digital",
  print: "print",
};
