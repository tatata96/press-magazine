import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import ShippingAndReturns from "@/app/components/legal-document/shipping-and-returns/ShippingAndReturns";
import styles from "@/app/components/legal-document/legal-document.module.scss";
import {getPageMetadata} from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ShippingReturnsPage");

  return getPageMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/shipping-and-returns",
  });
}

// Final text that must stay reachable without a cart or buyer details, so it is not behind
// the checkout placeholder gate in lib/legal/readiness.ts.
export default async function ShippingAndReturnsPage() {
  const t = await getTranslations("ShippingReturnsPage");

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>{t("title")}</h1>
      <ShippingAndReturns />
    </main>
  );
}
