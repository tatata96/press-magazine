import "server-only";

import {getLocale, getTranslations} from "next-intl/server";
import {
  BUSINESS_TERMS,
  SELLER,
  type BusinessTermField,
  type SellerField,
} from "./agreement-config";

// Every value the Distance Sales Agreement text fills in, already formatted for display.
export type AgreementData = {
  seller: Record<SellerField, string>;
  buyer: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    shippingAddress: string;
    billingAddress: string;
  };
  /** One entry per cart line. */
  products: {
    name: string;
    type: string;
    quantity: string;
    unitPrice: string;
    totalPrice: string;
  }[];
  order: {
    subtotal: string;
    discount: string;
    taxAmount: string;
    shippingCost: string;
    total: string;
    currency: string;
    paymentMethod: string;
    date: string;
  };
  agreementDate: string;
};

// The Pre-Contractual Information Form shows the same data plus the business terms.
export type PreInformationData = AgreementData & {
  terms: Record<BusinessTermField, string>;
};

// What an unfilled buyer or order value looks like on the standalone page.
const BLANK = "________";

// Seller details come from one place. A missing value shows a visible marker, never a guess.
export async function getSellerValues(): Promise<AgreementData["seller"]> {
  const t = await getTranslations("Agreement");
  const value = (field: SellerField) =>
    SELLER[field] ?? t("placeholderValue", {name: `seller.${field}`});

  return {
    legalName: value("legalName"),
    address: value("address"),
    taxNumber: value("taxNumber"),
    phone: value("phone"),
    email: value("email"),
    supportEmail: value("supportEmail"),
  };
}

// The general agreement for the standalone page: no buyer or order data, so no personal
// information is exposed. Those fields stay blank.
export async function getBlankAgreementData(): Promise<AgreementData> {
  return {
    seller: await getSellerValues(),
    buyer: {
      fullName: BLANK,
      email: BLANK,
      phone: BLANK,
      country: BLANK,
      shippingAddress: BLANK,
      billingAddress: BLANK,
    },
    products: [
      {
        name: BLANK,
        type: BLANK,
        quantity: BLANK,
        unitPrice: BLANK,
        totalPrice: BLANK,
      },
    ],
    order: {
      subtotal: BLANK,
      discount: BLANK,
      taxAmount: BLANK,
      shippingCost: BLANK,
      total: BLANK,
      currency: BLANK,
      paymentMethod: BLANK,
      date: BLANK,
    },
    agreementDate: BLANK,
  };
}

// Business terms come from one place. A missing value shows a visible marker, never a guess.
export async function getBusinessTermValues(): Promise<PreInformationData["terms"]> {
  const [t, locale] = await Promise.all([
    getTranslations("Agreement"),
    getLocale(),
  ]);
  const value = (field: BusinessTermField) =>
    BUSINESS_TERMS[field]?.[locale === "en" ? "en" : "tr"] ??
    t("placeholderValue", {name: `terms.${field}`});

  return {
    physicalDeliveryTime: value("physicalDeliveryTime"),
    returnCarrier: value("returnCarrier"),
    digitalAccess: value("digitalAccess"),
    digitalProtection: value("digitalProtection"),
  };
}

export async function getBlankPreInformationData(): Promise<PreInformationData> {
  return {...(await getBlankAgreementData()), terms: await getBusinessTermValues()};
}
