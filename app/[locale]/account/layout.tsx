import type {Metadata} from "next";
import {Suspense, type ReactNode} from "react";
import {getTranslations} from "next-intl/server";
import AccountNav, {AccountNavLinks} from "./AccountNav";
import styles from "./account.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Account");

  return {
    title: t("metaTitle"),
    // Personal pages: not worth indexing.
    robots: {index: false, follow: false},
  };
}

// Static shell: the session is read inside each page's Suspense boundary, so this layout never
// blocks prerendering. Logging out is a POST so another site cannot trigger it with a link.
export default async function AccountLayout({children}: {children: ReactNode}) {
  const t = await getTranslations("Account");
  const nav = {
    label: t("navLabel"),
    items: [
      {href: "/account", label: t("navProfile")},
      {href: "/account/addresses", label: t("navAddresses")},
      {href: "/account/orders", label: t("navOrders")},
    ],
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>{t("heading")}</h1>
      <div className={styles.bar}>
        {/* The current page is only known on the client, so the shell shows the same links
            without a marker. */}
        <Suspense fallback={<AccountNavLinks {...nav} pathname={null} />}>
          <AccountNav {...nav} />
        </Suspense>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className={styles.textButton}>{t("logout")}</button>
        </form>
      </div>
      {children}
    </main>
  );
}
