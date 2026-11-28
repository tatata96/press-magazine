import {getLocale} from "next-intl/server";
import {OFFERED_PLAN_IDS} from "@/lib/shopify/plan-products";
import ShippingAndReturnsEn from "./ShippingAndReturnsEn";
import ShippingAndReturnsTr from "./ShippingAndReturnsTr";

// One text per language.
export default async function ShippingAndReturns() {
  const Content = (await getLocale()) === "en" ? ShippingAndReturnsEn : ShippingAndReturnsTr;

  return <Content includesDigitalContent={OFFERED_PLAN_IDS.includes("digital")} />;
}
