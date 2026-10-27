import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "../../../i18n/navigation";
import LanguageSwitch from "./LanguageSwitch";
import Navigation from "./Navigation";
import styles from "./header.module.scss";

export default async function Header() {
  const t = await getTranslations("Header");

  // Placeholder targets: final routes are not decided yet.
  const navigationItems = [
    { label: t("about"), href: "#about" },
    { label: t("newsletter"), href: "#newsletter" },
  ];

  return (
    <header className={styles.header}>
      <LanguageSwitch label={t("languageLabel")} />

      <Link href="/" className={styles.logo}>
        <Image
          src="/images/logo-text.svg"
          alt={t("logoAlt")}
          width={1223}
          height={513}
          priority
        />
      </Link>

      <Navigation
        items={navigationItems}
        labels={{
          navigation: t("navigationLabel"),
          openMenu: t("openMenu"),
          closeMenu: t("closeMenu"),
        }}
      />
    </header>
  );
}
