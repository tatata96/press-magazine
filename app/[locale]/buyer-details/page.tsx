import {Suspense} from "react";
import type {Metadata} from "next";
import {getLocale, getTranslations} from "next-intl/server";
import {Link} from "../../../i18n/navigation";
import {getCartWithCheckoutContext} from "@/lib/shopify/cart";
import {getSellingCountryCodes} from "@/lib/shopify/countries";
import {isLegalContentPublishable} from "@/lib/legal/readiness";
import {getPageMetadata} from "@/lib/seo";
import {readCartId} from "../cart/cart-cookie";
import BuyerDetailsForm from "./BuyerDetailsForm";
import {readStoredBuyerDetails} from "./buyer-cookie";
import styles from "./buyer-details.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("BuyerDetails");

  return getPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/buyer-details",
  });
}

// Depends on the visitor's cart and cookies, so it streams in behind Suspense.
async function BuyerDetailsContent() {
  const t = await getTranslations("BuyerDetails");
  const locale = await getLocale();

  if (!isLegalContentPublishable()) {
    return (
      <p role="status" className={styles.message}>
        {t("checkoutUnavailable")}
      </p>
    );
  }

  const cartId = await readCartId();
  let current: Awaited<ReturnType<typeof getCartWithCheckoutContext>> = null;
  let countryCodes: string[] | null = null;
  let hasLoadFailed = false;

  try {
    [current, countryCodes] = await Promise.all([
      cartId ? getCartWithCheckoutContext(cartId) : null,
      getSellingCountryCodes(),
    ]);
  } catch (error) {
    hasLoadFailed = true;
    console.error(
      "Could not load buyer details page:",
      error instanceof Error ? error.message : "unknown error",
    );
  }

  if (hasLoadFailed || !countryCodes || countryCodes.length === 0) {
    return (
      <p role="alert" className={styles.message}>
        {t("loadError")}
      </p>
    );
  }

  if (!current || current.cart.lines.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.message}>{t("emptyCart")}</p>
        <Link href="/subscribe" className={styles.link}>
          {t("browseShop")}
        </Link>
      </div>
    );
  }

  const {context} = current;
  const stored = await readStoredBuyerDetails();
  const regionNames = new Intl.DisplayNames([locale], {type: "region"});
  const shipping = context.shippingAddress;

  return (
    <BuyerDetailsForm
      requiresShipping={context.requiresShipping}
      countries={countryCodes.map((code) => ({
        code,
        name: regionNames.of(code) ?? code,
      }))}
      defaults={{
        firstName: stored?.firstName ?? shipping?.firstName ?? "",
        lastName: stored?.lastName ?? shipping?.lastName ?? "",
        email: context.buyer.email ?? "",
        phone: context.buyer.phone ?? "",
        countryCode: context.buyer.countryCode ?? "",
        shippingAddress: shipping
          ? {
              address1: shipping.address1,
              address2: shipping.address2,
              city: shipping.city,
              zip: shipping.zip,
            }
          : null,
        billingAddress: stored?.billingAddress ?? null,
        // Unchosen counts as "same": the shorter path for physical orders.
        billingIsSameAsShipping: stored ? stored.billingAddress === null : true,
      }}
    />
  );
}

export default async function BuyerDetailsPage() {
  const t = await getTranslations("BuyerDetails");

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>{t("heading")}</h1>
      <Suspense
        fallback={
          <p role="status" className={styles.message}>
            {t("loading")}
          </p>
        }
      >
        <BuyerDetailsContent />
      </Suspense>
    </main>
  );
}
