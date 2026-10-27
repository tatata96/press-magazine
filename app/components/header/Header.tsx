import Image from "next/image";
import Link from "next/link";
import Navigation from "./Navigation";
import styles from "./header.module.scss";

// Placeholder targets: final routes and the language switch behavior are not decided yet.
const navigationItems = [
  {label: "About", href: "#about"},
  {label: "Newsletter", href: "#newsletter"},
];

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`${styles.languages} type-mono`}>
        {/* Static until localization is defined; EN is the current language. */}
        <span className={styles.current} aria-current="true">
          EN
        </span>
        <span>TR</span>
      </div>

      <Link href="/" className={styles.logo}>
        <Image
          src="/images/logo-text.svg"
          alt="Press"
          width={1223}
          height={513}
          priority
        />
      </Link>

      <Navigation items={navigationItems} />
    </header>
  );
}
