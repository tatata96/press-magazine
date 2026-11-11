import { getTranslations } from "next-intl/server";
import { Link } from "../../../i18n/navigation";
import Logo from "../logo/Logo";
import LogoMark from "../logo/LogoMark";
import Team from "../team/Team";
import styles from "./site-footer.module.scss";

const inquiryEmail = "hello@septembercompany.com";
const septemberHref = "https://www.septembercompany.com/";

function toStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

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
          <p className="type-mono">
            <Link
              href="/privacy"
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("privacy")}
            </Link>
          </p>
        </div>
        <p className={`${styles.column} ${styles.inquiries} type-mono`}>
          {t("inquiries")}{" "}
          <a href={`mailto:${inquiryEmail}`} className={styles.link}>
            {inquiryEmail}
          </a>
        </p>
        <p className={`${styles.upper} ${styles.location} type-mono`}>
          {t("location")}
        </p>
      </div>
      <Team className={styles.team} />
      <LogoMark className={styles.mark} />
      <address className={`${styles.address} ${styles.upper} type-mono`}>
        {toStrings(t.raw("address")).map((line) => (
          <span key={line}>{line}</span>
        ))}
      </address>
      {/* Decorative: fixed to the viewport bottom and clipped by the footer,
          so it is uncovered as the page scrolls to the end. */}
      <div className={styles.wordmark} aria-hidden="true">
        <Logo className={styles.wordmarkLogo} />
      </div>
    </footer>
  );
}
