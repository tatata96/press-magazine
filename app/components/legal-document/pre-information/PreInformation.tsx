import {getLocale} from "next-intl/server";
import type {PreInformationData} from "@/lib/legal/agreement-data";
import PreInformationEn from "./PreInformationEn";
import PreInformationTr from "./PreInformationTr";

// One form text per language, shared by the standalone page and the cart modal.
export default async function PreInformation({
  data,
}: {
  data: PreInformationData;
}) {
  return (await getLocale()) === "en" ? (
    <PreInformationEn data={data} />
  ) : (
    <PreInformationTr data={data} />
  );
}
