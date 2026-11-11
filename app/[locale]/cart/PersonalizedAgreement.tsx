import {getLocale, getTranslations} from "next-intl/server";
import DistanceSalesAgreement from "@/app/components/legal-document/distance-sales-agreement/DistanceSalesAgreement";
import {PRODUCT_TYPE_BY_HANDLE} from "@/lib/legal/agreement-config";
import {
  getSellerValues,
  type AgreementData,
} from "@/lib/legal/agreement-data";
import {LEGAL_DOCUMENTS_VERSION} from "@/lib/legal/consent";
import {formatMoney} from "@/lib/shopify/money";
import type {PostalAddress} from "../buyer-details/buyer-details";
import type {AgreementSnapshot} from "./checkout-state";

function formatAddress(address: PostalAddress, countryName: string): string {
  return [address.address1, address.address2, `${address.zip} ${address.city}`, countryName]
    .filter(Boolean)
    .join(", ");
}

// The same agreement text as the standalone page, filled in with this buyer and cart. Only
// values we actually have are shown: tax amount, payment method and discount amount are not
// known before Shopify's checkout, so they say so rather than showing a guess.
export default async function PersonalizedAgreement({
  snapshot,
}: {
  snapshot: AgreementSnapshot;
}) {
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

  const data: AgreementData = {
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
    legalDocumentsVersion: LEGAL_DOCUMENTS_VERSION,
    agreementDate: today,
  };

  return <DistanceSalesAgreement data={data} />;
}
