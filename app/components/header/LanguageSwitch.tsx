"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "../../../i18n/navigation";
import { routing } from "../../../i18n/routing";
import styles from "./header.module.scss";

type LanguageSwitchProps = {
  label: string;
};

// Links to the current page in each language; the language lives in the URL.
export default function LanguageSwitch({ label }: LanguageSwitchProps) {
  const currentLocale = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={label} className={`${styles.languages} type-mono`}>
      {routing.locales.map((locale) =>
        locale === currentLocale ? (
          <span key={locale} className={styles.current} aria-current="true">
            {locale.toUpperCase()}
          </span>
        ) : (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            lang={locale}
            className={styles.languageLink}
          >
            {locale.toUpperCase()}
          </Link>
        ),
      )}
    </nav>
  );
}
