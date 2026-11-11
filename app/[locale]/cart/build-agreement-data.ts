import "server-only";

import {getLocale, getTranslations} from "next-intl/server";
import {PRODUCT_TYPE_BY_HANDLE} from "@/lib/legal/agreement-config";
import {getSellerValues, type AgreementData} from "@/lib/legal/agreement-data";
import {formatMoney} from "@/lib/shopify/money";
import type {PostalAddress} from "../buyer-details/buyer-details";
import type {AgreementSnapshot} from "./checkout-state";

function formatAddress(address: PostalAddress, countryName: string): string {
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
): Promise<AgreementData> {
  const [t, locale, seller] = await Promise.all([
    getTranslations("Agreement"),
    getLocale(),
    getSellerValues(),
  ]);
  const {buyer} = snapshot;
  const countryName =
    new Intl.DisplayNames([locale], {type: "region"}).of(buyer.countryCode) ??
    buyer.countryCode;
  // "Same as delivery" resolves to the delivery address, so the agreement names a concrete one.
  const billingAddress = buyer.billingAddress ?? buyer.shippingAddress;
  const undecided = t("determinedAtCheckout");
  const {currencyCode} = snapshot.total;
  // The day the agreement is shown, in the shop's time zone. It is not part of the
  // fingerprint; the exact acceptance time is stored on the order.
  const today = new Intl.DateTimeFormat(locale, {
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
        ? formatAddress(buyer.shippingAddress, countryName)
        : t("digitalDelivery"),
      billingAddress: billingAddress ? formatAddress(billingAddress, countryName) : "",
    },
    products: snapshot.lines.map((line) => {
      const productType = PRODUCT_TYPE_BY_HANDLE[line.productHandle];

      return {
        name: line.title,
        type: productType
          ? t(productType === "digital" ? "productTypeDigital" : "productTypePrint")
          : undecided,
        quantity: String(line.quantity),
        unitPrice: formatMoney(line.unitPrice, locale),
        totalPrice: formatMoney(line.totalPrice, locale),
      };
    }),
    order: {
      subtotal: formatMoney(snapshot.subtotal, locale),
      // Shopify's cart exposes no discount, tax or payment-method data.
      discount: undecided,
      taxAmount: undecided,
      shippingCost: snapshot.delivery
        ? formatMoney(snapshot.delivery.cost, locale)
        : buyer.shippingAddress
          ? undecided
          : formatMoney({amount: "0", currencyCode}, locale),
      total: formatMoney(snapshot.total, locale),
      currency: currencyCode,
      paymentMethod: undecided,
      date: today,
    },
    agreementDate: today,
  };
}
