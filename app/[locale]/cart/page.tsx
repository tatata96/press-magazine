import {Suspense} from "react";
import type {Metadata} from "next";
import {getLocale, getTranslations} from "next-intl/server";
import {Link} from "../../../i18n/navigation";
import {getCart, type Cart} from "@/lib/shopify/cart";
import {getPageMetadata} from "@/lib/seo";
import {readCartId} from "./cart-cookie";
import LegalDocument from "@/app/components/legal-document/LegalDocument";
import CartLines from "./CartLines";
import CheckoutConsent from "./CheckoutConsent";
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
  const cartId = await readCartId();
  let cart: Cart | null = null;

  if (cartId) {
    try {
      cart = await getCart(cartId);
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
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.message}>{t("empty")}</p>
        <Link href="/subscribe" className={styles.link}>
          {t("browseShop")}
        </Link>
      </div>
    );
  }

  return (
    <>
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
      <CheckoutConsent
        documents={{
          distanceSalesAgreement: (
            <LegalDocument documentKey="distanceSalesAgreement" />
          ),
          preInformation: <LegalDocument documentKey="preInformation" />,
        }}
      />
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
