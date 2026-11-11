import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {
  getBlankAgreementData,
  getBlankPreInformationData,
} from "@/lib/legal/agreement-data";
import {isLegalContentPublishable} from "@/lib/legal/readiness";
import {getPageMetadata} from "@/lib/seo";
import {legalDocuments, type LegalDocumentKey} from "./documents";
import DistanceSalesAgreement from "./distance-sales-agreement/DistanceSalesAgreement";
import PreInformation from "./pre-information/PreInformation";
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
  // Placeholder text must not be reachable in production; see lib/legal/readiness.ts.
  if (!isLegalContentPublishable()) {
    notFound();
  }

  const t = await getTranslations("LegalDocuments");

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>{t(`${documentKey}.title`)}</h1>
      {documentKey === "distanceSalesAgreement" ? (
        <DistanceSalesAgreement data={await getBlankAgreementData()} />
      ) : (
        <PreInformation data={await getBlankPreInformationData()} />
      )}
    </main>
  );
}
