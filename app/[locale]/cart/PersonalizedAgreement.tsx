import DistanceSalesAgreement from "@/app/components/legal-document/distance-sales-agreement/DistanceSalesAgreement";
import {buildAgreementData} from "./build-agreement-data";
import type {AgreementSnapshot} from "./checkout-state";

// The same agreement text as the standalone page, filled in with this buyer and cart.
export default async function PersonalizedAgreement({
  snapshot,
}: {
  snapshot: AgreementSnapshot;
}) {
  return <DistanceSalesAgreement data={await buildAgreementData(snapshot)} />;
}
