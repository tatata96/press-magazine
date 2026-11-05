import { getTranslations } from "next-intl/server";
import { team } from "./team-members";
import styles from "./team.module.scss";

// Masthead-style credits: the first person leads on a row of their own, the
// rest follow below. Placement is left to the parent through className.
export default async function Team({ className = "" }: { className?: string }) {
  const t = await getTranslations("AboutPage.who");

  return (
    <ul className={`${styles.team} ${className}`} aria-label={t("teamLabel")}>
      {team.map(({ name, roleKey }) => (
        <li key={roleKey} className={styles.member}>
          <span className={`type-mono ${styles.role}`}>
            {t(`roles.${roleKey}`)}
          </span>
          <strong className={styles.name}>{name}</strong>
        </li>
      ))}
    </ul>
  );
}
