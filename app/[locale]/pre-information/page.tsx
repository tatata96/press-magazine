import LegalDocumentPage, {
  getLegalDocumentMetadata,
} from "@/app/components/legal-document/LegalDocumentPage";

export function generateMetadata() {
  return getLegalDocumentMetadata("preInformation");
}

export default function PreInformationPage() {
  return <LegalDocumentPage documentKey="preInformation" />;
}
