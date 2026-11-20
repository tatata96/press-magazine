import {Suspense} from "react";
import type {Metadata} from "next";
import {getLocale, getTranslations} from "next-intl/server";
import {Link} from "../../../i18n/navigation";
import {getPageMetadata} from "@/lib/seo";
import {getCartWithCheckoutContext} from "@/lib/shopify/cart";
import {getSellingCountryCodes} from "@/lib/shopify/countries";
import {isLegalContentPublishable} from "@/lib/legal/readiness";
import LoadingScreen from "@/app/components/loading-screen/LoadingScreen";
import BuyerDetailsForm from "../buyer-details/BuyerDetailsForm";
import {readStoredBuyerDetails} from "../buyer-details/buyer-cookie";
import {readCartId} from "./cart-cookie";
import CartLines from "./CartLines";
import PaymentMethods from "./PaymentMethods";
import {fingerprintCart} from "./checkout-state";
import styles from "./cart.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CartPage");

  return getPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/cart",
  });
}

async function CartContent() {
  const t = await getTranslations("CartPage");
  const detailsT = await getTranslations("BuyerDetails");
  const locale = await getLocale();
  // Keep request-time cookie reads outside catch blocks for Cache Components.
  const [cartId, storedBuyer] = await Promise.all([
    readCartId(),
    readStoredBuyerDetails(),
  ]);
  const checkoutEnabled = isLegalContentPublishable();
  let current: Awaited<ReturnType<typeof getCartWithCheckoutContext>>;
  let countryCodes: string[] | null;

  try {
    [current, countryCodes] = await Promise.all([
      cartId ? getCartWithCheckoutContext(cartId) : null,
      checkoutEnabled ? getSellingCountryCodes() : Promise.resolve(null),
    ]);
  } catch (error) {
    console.error(
      "Could not load cart:",
      error instanceof Error ? error.message : "unknown error",
    );

    return <p role="alert" className={styles.message}>{t("loadError")}</p>;
  }

  if (!current || current.cart.lines.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.message}>{t("empty")}</p>
        <Link href="/subscribe" className={styles.link}>{t("browseShop")}</Link>
      </div>
    );
  }

  const {cart, context} = current;
  const orderSummary = (
    <>
      <h2 className={`type-mono ${styles.sectionHeading} ${styles.orderHeading}`}>
        {t("orderHeading")}
      </h2>
      <CartLines
        cart={cart}
        locale={locale}
        copy={{
          itemsLabel: t("itemsLabel"),
          quantity: t("quantity"),
          decrease: t("decrease"),
          increase: t("increase"),
          remove: t("remove"),
          updating: t("updating"),
          subtotal: t("subtotal"),
          updateError: t("updateError"),
        }}
      />
    </>
  );

  if (!checkoutEnabled) {
    return (
      <section className={styles.order}>
        {orderSummary}
        <p role="status" className={styles.message}>{t("checkoutUnavailable")}</p>
        <PaymentMethods />
      </section>
    );
  }

  if (!countryCodes || countryCodes.length === 0) {
    return <p role="alert" className={styles.message}>{detailsT("loadError")}</p>;
  }

  const regionNames = new Intl.DisplayNames([locale], {type: "region"});
  const shipping = context.shippingAddress;
  // Changes to quantities, shipping requirements or prices invalidate client consent.
  const cartVersion = fingerprintCart(cart, context);

  return (
    <BuyerDetailsForm
      requiresShipping={context.requiresShipping}
      countries={countryCodes.map((code) => ({code, name: regionNames.of(code) ?? code}))}
      defaults={{
        firstName: storedBuyer?.firstName ?? shipping?.firstName ?? "",
        lastName: storedBuyer?.lastName ?? shipping?.lastName ?? "",
        email: context.buyer.email ?? "",
        phone: context.buyer.phone ?? "",
        countryCode: context.buyer.countryCode ?? "",
        shippingAddress: shipping ? {
          address1: shipping.address1,
          address2: shipping.address2,
          city: shipping.city,
          zip: shipping.zip,
        } : null,
        billingAddress: storedBuyer?.billingAddress ?? null,
        billingIsSameAsShipping: storedBuyer ? storedBuyer.billingAddress === null : true,
      }}
      orderSummary={orderSummary}
      paymentMethods={<PaymentMethods />}
      cartVersion={cartVersion}
    />
  );
}

export default async function CartPage() {
  const t = await getTranslations("CartPage");

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>{t("heading")}</h1>
      <Suspense fallback={<LoadingScreen label={t("loading")} />}>
        <div className={styles.reveal}><CartContent /></div>
      </Suspense>
    </main>
  );
}
