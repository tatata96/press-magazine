import {getLocale} from "next-intl/server";
import {redirect} from "../../../i18n/navigation";

// Preserve existing links to the former details step.
export default async function BuyerDetailsPage() {
  redirect({href: "/cart", locale: await getLocale()});
}
