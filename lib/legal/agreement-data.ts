import "server-only";

import {getTranslations} from "next-intl/server";
import {SELLER, type SellerField} from "./agreement-config";
import {LEGAL_DOCUMENTS_VERSION} from "./consent";

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
  legalDocumentsVersion: string;
  agreementDate: string;
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
    legalDocumentsVersion: LEGAL_DOCUMENTS_VERSION,
    agreementDate: BLANK,
  };
}
