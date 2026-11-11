import {getTranslations} from "next-intl/server";
import type {LegalDocumentKey} from "./documents";
import styles from "./legal-document.module.scss";

type LegalSection = {heading: string; body: string};

function toSections(value: unknown): LegalSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is LegalSection =>
      typeof item?.heading === "string" && typeof item?.body === "string",
  );
}

// Document text only, with no page heading, so the standalone pages and the checkout
// modals render exactly the same content.
export default async function LegalDocument({
  documentKey,
}: {
  documentKey: LegalDocumentKey;
}) {
  const t = await getTranslations("LegalDocuments");

  return (
    <div className={styles.document}>
      <p className={`type-mono ${styles.notice}`}>{t("placeholderNotice")}</p>
      {toSections(t.raw(`${documentKey}.sections`)).map((section) => (
        <section key={section.heading}>
          <h2 className={styles.sectionHeading}>{section.heading}</h2>
          <p className={styles.sectionBody}>{section.body}</p>
        </section>
      ))}
    </div>
  );
}
