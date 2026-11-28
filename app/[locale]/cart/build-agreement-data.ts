import "server-only";

import type {Locale} from "next-intl";
import {getLocale, getTranslations} from "next-intl/server";
import {PRODUCT_TYPE_BY_PLAN} from "@/lib/legal/agreement-config";
import {
  getBusinessTermValues,
  getSellerValues,
  type AgreementData,
  type PreInformationData,
} from "@/lib/legal/agreement-data";
import {formatMoney} from "@/lib/shopify/money";
import type {PostalAddress} from "../buyer-details/buyer-details";
import type {AgreementSnapshot, CheckoutState} from "./checkout-state";

export type PreparedCheckout = {
  fingerprint: string;
  data: PreInformationData;
};

export async function buildPreparedCheckout(
  state: Extract<CheckoutState, {status: "ready"}>,
  locale: Locale,
): Promise<PreparedCheckout> {
  const [data, terms] = await Promise.all([
    buildAgreementData(state.snapshot, locale),
    getBusinessTermValues(locale),
  ]);

  return {
    fingerprint: state.fingerprint,
    data: {...data, terms},
  };
}

// Each address names its own country: a billing address can be abroad while delivery is not.
function formatAddress(address: PostalAddress, regionNames: Intl.DisplayNames): string {
  const countryName = regionNames.of(address.countryCode) ?? address.countryCode;

  return [address.address1, address.address2, `${address.zip} ${address.city}`, countryName]
    .filter(Boolean)
    .join(", ");
}

// Fills the legal documents' fields from the checkout snapshot, so the Distance Sales
// Agreement and the Pre-Contractual Information Form always show the same order. Only values
// we actually have are shown: tax amount, payment method and discount amount are not known
// before Shopify's checkout, so they say so rather than showing a guess.
export async function buildAgreementData(
  snapshot: AgreementSnapshot,
  locale?: Locale,
): Promise<AgreementData> {
  const resolvedLocale = locale ?? await getLocale();
  const [t, seller] = await Promise.all([
    getTranslations({locale: resolvedLocale, namespace: "Agreement"}),
    getSellerValues(resolvedLocale),
  ]);
  const {buyer} = snapshot;
  const regionNames = new Intl.DisplayNames([resolvedLocale], {type: "region"});
  const countryName = regionNames.of(buyer.countryCode) ?? buyer.countryCode;
  // "Same as delivery" resolves to the delivery address, so the agreement names a concrete one.
  const billingAddress = buyer.billingAddress ?? buyer.shippingAddress;
  const undecided = t("determinedAtCheckout");
  const {currencyCode} = snapshot.total;
  // The day the agreement is shown, in the shop's time zone. It is not part of the
  // fingerprint; the exact acceptance time is stored on the order.
  const today = new Intl.DateTimeFormat(resolvedLocale, {
    dateStyle: "long",
    timeZone: "Europe/Istanbul",
  }).format(new Date());

  return {
    seller,
    buyer: {
      fullName: `${buyer.firstName} ${buyer.lastName}`,
      email: buyer.email,
      phone: buyer.phone,
      country: countryName,
      shippingAddress: buyer.shippingAddress
        ? formatAddress(buyer.shippingAddress, regionNames)
        : t("digitalDelivery"),
      billingAddress: billingAddress ? formatAddress(billingAddress, regionNames) : "",
    },
    products: snapshot.lines.map((line) => {
      const productType = line.planId ? PRODUCT_TYPE_BY_PLAN[line.planId] : null;

      return {
        name: line.title,
        type: productType
          ? t(productType === "digital" ? "productTypeDigital" : "productTypePrint")
          : undecided,
        quantity: String(line.quantity),
        unitPrice: formatMoney(line.unitPrice, resolvedLocale),
        totalPrice: formatMoney(line.totalPrice, resolvedLocale),
      };
    }),
    order: {
      subtotal: formatMoney(snapshot.subtotal, resolvedLocale),
      // Shopify's cart exposes no discount, tax or payment-method data.
      discount: undecided,
      taxAmount: undecided,
      shippingCost: snapshot.delivery
        ? formatMoney(snapshot.delivery.cost, resolvedLocale)
        : buyer.shippingAddress
          ? undecided
          : formatMoney({amount: "0", currencyCode}, resolvedLocale),
      total: formatMoney(snapshot.total, resolvedLocale),
      currency: currencyCode,
      paymentMethod: undecided,
      date: today,
    },
    agreementDate: today,
    // Decided by what is in this order, not by what is on sale: a cart filled earlier can
    // still hold a digital publication.
    includesDigitalContent: snapshot.lines.some((line) => line.planId === "digital"),
  };
}
