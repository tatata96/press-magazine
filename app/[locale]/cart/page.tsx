import {Suspense} from "react";
import type {Metadata} from "next";
import {getLocale, getTranslations} from "next-intl/server";
import {Link, redirect} from "../../../i18n/navigation";
import {getPageMetadata} from "@/lib/seo";
import {isLegalContentPublishable} from "@/lib/legal/readiness";
import CartLines from "./CartLines";
import CheckoutConsent from "./CheckoutConsent";
import PaymentMethods from "./PaymentMethods";
import PersonalizedAgreement from "./PersonalizedAgreement";
import PersonalizedPreInformation from "./PersonalizedPreInformation";
import {
  loadCheckoutState,
  readCheckoutCookies,
  type CheckoutState,
} from "./checkout-state";
import styles from "./cart.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CartPage");

  return getPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/cart",
  });
}

// The cart depends on the visitor's cookie, so it streams in behind Suspense while the
// heading is prerendered.
async function CartContent() {
  const t = await getTranslations("CartPage");
  const locale = await getLocale();
  const cookies = await readCheckoutCookies();
  let state: CheckoutState;

  try {
    state = await loadCheckoutState(cookies);
  } catch (error) {
    console.error(
      "Could not load cart:",
      error instanceof Error ? error.message : "unknown error",
    );

    return (
      <p role="alert" className={styles.message}>
        {t("loadError")}
      </p>
    );
  }

  if (state.status === "empty") {
    return (
      <div className={styles.empty}>
        <p className={styles.message}>{t("empty")}</p>
        <Link href="/subscribe" className={styles.link}>
          {t("browseShop")}
        </Link>
      </div>
    );
  }

  // The agreement needs the buyer's details; arriving here without them (or after the cart
  // changed what is required) sends the visitor back to enter them.
  if (state.status === "needs_details") {
    redirect({href: "/buyer-details", locale});

    return null;
  }

  return (
    <>
      <CartLines
        cart={state.cart}
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
      <Link href="/buyer-details" className={`${styles.link} ${styles.editDetails}`}>
        {t("editDetails")}
      </Link>
      {isLegalContentPublishable() ? (
        <CheckoutConsent
          agreementFingerprint={state.fingerprint}
          documents={{
            distanceSalesAgreement: (
              <PersonalizedAgreement snapshot={state.snapshot} />
            ),
            preInformation: (
              <PersonalizedPreInformation snapshot={state.snapshot} />
            ),
          }}
          paymentMethods={<PaymentMethods />}
        />
      ) : (
        <>
          <p role="status" className={styles.message}>
            {t("checkoutUnavailable")}
          </p>
          <PaymentMethods />
        </>
      )}
    </>
  );
}

export default async function CartPage() {
  const t = await getTranslations("CartPage");

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
        <CartContent />
      </Suspense>
    </main>
  );
}
