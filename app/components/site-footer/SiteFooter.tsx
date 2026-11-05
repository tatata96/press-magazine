import { getTranslations } from "next-intl/server";
import Logo from "../logo/Logo";
import LogoMark from "../logo/LogoMark";
import styles from "./site-footer.module.scss";

const contactHref = "mailto:hello@pressmagazine.com.tr";
const instagramHref = "https://www.instagram.com/septembercompany/";
const septemberHref = "https://www.septembercompany.com/";

export default async function SiteFooter() {
  const t = await getTranslations("SiteFooter");

  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <div className={styles.column}>
          <p className={`${styles.upper} type-mono`}>
            {t.rich("byline", {
              link: (chunks) => (
                <a
                  href={septemberHref}
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>
        <ul className={`${styles.column} ${styles.links}`}>
          <li>
            <a href={contactHref} className={`${styles.link} type-mono`}>
              {t("contact")}
            </a>
          </li>
          <li>
            <a
              href={instagramHref}
              className={`${styles.link} type-mono`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("instagram")}
            </a>
          </li>
        </ul>
        <p className={`${styles.upper} ${styles.location} type-mono`}>
          {t("location")}
        </p>
      </div>
      <LogoMark className={styles.mark} />
      <p className={`${styles.year} type-mono`}>2026</p>
      {/* Decorative: fixed to the viewport bottom and clipped by the footer,
          so it is uncovered as the page scrolls to the end. */}
      <div className={styles.wordmark} aria-hidden="true">
        <Logo className={styles.wordmarkLogo} />
      </div>
    </footer>
  );
}
