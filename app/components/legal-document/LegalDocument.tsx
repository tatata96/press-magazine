import {getTranslations} from "next-intl/server";
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

// Section-based placeholder text for the Pre-Information Form, shared by the standalone page
// and the cart modal. The Distance Sales Agreement has its own components.
export default async function LegalDocument({
  documentKey,
}: {
  documentKey: "preInformation";
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
