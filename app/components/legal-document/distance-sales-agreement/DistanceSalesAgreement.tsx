import {getLocale} from "next-intl/server";
import type {AgreementData} from "@/lib/legal/agreement-data";
import AgreementEn from "./AgreementEn";
import AgreementTr from "./AgreementTr";

// One agreement text per language, shared by the standalone page and the cart modal.
export default async function DistanceSalesAgreement({
  data,
}: {
  data: AgreementData;
}) {
  return (await getLocale()) === "en" ? (
    <AgreementEn data={data} />
  ) : (
    <AgreementTr data={data} />
  );
}
