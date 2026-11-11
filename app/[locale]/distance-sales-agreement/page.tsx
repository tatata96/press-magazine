import LegalDocumentPage, {
  getLegalDocumentMetadata,
} from "@/app/components/legal-document/LegalDocumentPage";

export function generateMetadata() {
  return getLegalDocumentMetadata("distanceSalesAgreement");
}

export default function DistanceSalesAgreementPage() {
  return <LegalDocumentPage documentKey="distanceSalesAgreement" />;
}
