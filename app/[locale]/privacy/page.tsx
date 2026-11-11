import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import PrivacyPolicy from "@/app/components/legal-document/privacy/PrivacyPolicy";
import styles from "@/app/components/legal-document/legal-document.module.scss";
import {getPageMetadata} from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PrivacyPage");

  return getPageMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/privacy",
  });
}

// Unlike the checkout documents, the policy is final text, so it is not behind the
// placeholder gate in lib/legal/readiness.ts.
export default async function PrivacyPage() {
  const t = await getTranslations("PrivacyPage");

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>{t("title")}</h1>
      <PrivacyPolicy />
    </main>
  );
}
