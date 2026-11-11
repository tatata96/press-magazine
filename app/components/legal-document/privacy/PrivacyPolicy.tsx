import {getLocale} from "next-intl/server";
import PrivacyPolicyEn from "./PrivacyPolicyEn";
import PrivacyPolicyTr from "./PrivacyPolicyTr";

// One policy text per language.
export default async function PrivacyPolicy() {
  return (await getLocale()) === "en" ? <PrivacyPolicyEn /> : <PrivacyPolicyTr />;
}
