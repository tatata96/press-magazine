import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import {getPageMetadata} from "@/lib/seo";
import {legalDocuments, type LegalDocumentKey} from "./documents";
import LegalDocument from "./LegalDocument";
import styles from "./legal-document.module.scss";

export async function getLegalDocumentMetadata(
  documentKey: LegalDocumentKey,
): Promise<Metadata> {
  const t = await getTranslations("LegalDocuments");

  return getPageMetadata({
    title: t(`${documentKey}.title`),
    description: t(`${documentKey}.metaDescription`),
    path: legalDocuments[documentKey].path,
  });
}

export default async function LegalDocumentPage({
  documentKey,
}: {
  documentKey: LegalDocumentKey;
}) {
  const t = await getTranslations("LegalDocuments");

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>{t(`${documentKey}.title`)}</h1>
      <LegalDocument documentKey={documentKey} />
    </main>
  );
}
