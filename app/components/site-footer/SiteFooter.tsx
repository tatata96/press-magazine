import Logo from "../logo/Logo";
import LogoMark from "../logo/LogoMark";
import styles from "./site-footer.module.scss";

// TODO: placeholders until the real contact address and Instagram profile are
// confirmed.
const contactHref = "mailto:hello@example.com";
const instagramHref = "https://www.instagram.com/";

export default async function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <div className={styles.column}>
          <p className={`${styles.upper} type-footer`}>A magazine by September</p>
        </div>
        <ul className={`${styles.column} ${styles.links}`}>
          <li>
            <a href={contactHref} className={`${styles.link} type-footer`}>
              Contact
            </a>
          </li>
          <li>
            <a
              href={instagramHref}
              className={`${styles.link} type-footer`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </li>
        </ul>
        <p className={`${styles.upper} ${styles.location} type-footer`}>
          Istanbul / Worldwide
        </p>
      </div>
      <LogoMark className={styles.mark} />
      <p className={`${styles.year} type-footer`}>2026</p>
      {/* Decorative: fixed to the viewport bottom and clipped by the footer,
          so it is uncovered as the page scrolls to the end. */}
      <div className={styles.wordmark} aria-hidden="true">
        <Logo className={styles.wordmarkLogo} />
      </div>
    </footer>
  );
}
