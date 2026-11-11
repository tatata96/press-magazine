import {getLocale} from "next-intl/server";
import ShippingAndReturnsEn from "./ShippingAndReturnsEn";
import ShippingAndReturnsTr from "./ShippingAndReturnsTr";

// One text per language.
export default async function ShippingAndReturns() {
  return (await getLocale()) === "en" ? <ShippingAndReturnsEn /> : <ShippingAndReturnsTr />;
}
