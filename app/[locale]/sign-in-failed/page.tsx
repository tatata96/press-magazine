import type {Metadata} from "next";
import {getLocale, getTranslations} from "next-intl/server";
import {Link} from "../../../i18n/navigation";
import {getLoginPath} from "@/lib/customer-account/links";
import {getPageMetadata} from "@/lib/seo";
import styles from "./sign-in-failed.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SignInFailed");

  return {
    ...(await getPageMetadata({title: t("metaTitle"), description: t("body"), path: "/sign-in-failed"})),
    robots: {index: false, follow: false},
  };
}

// Where the auth routes send the buyer when sign-in could not be completed. The cart is not
// touched by sign-in, so it is still there.
export default async function SignInFailedPage() {
  const t = await getTranslations("SignInFailed");
  const locale = await getLocale();

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>{t("heading")}</h1>
      <p className={styles.message}>{t("body")}</p>
      <div className={styles.actions}>
        {/* A plain link: the auth routes are not locale-prefixed pages. */}
        <a href={getLoginPath({locale})} className={styles.link}>{t("retry")}</a>
        <Link href="/subscribe" className={styles.link}>{t("shop")}</Link>
      </div>
    </main>
  );
}
