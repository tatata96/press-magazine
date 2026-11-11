import PreInformation from "@/app/components/legal-document/pre-information/PreInformation";
import {getBusinessTermValues} from "@/lib/legal/agreement-data";
import {buildAgreementData} from "./build-agreement-data";
import type {AgreementSnapshot} from "./checkout-state";

// The Pre-Contractual Information Form for this buyer and cart. It is built from the same
// snapshot as the Distance Sales Agreement, so both always describe the same order.
export default async function PersonalizedPreInformation({
  snapshot,
}: {
  snapshot: AgreementSnapshot;
}) {
  const [data, terms] = await Promise.all([
    buildAgreementData(snapshot),
    getBusinessTermValues(),
  ]);

  return <PreInformation data={{...data, terms}} />;
}
