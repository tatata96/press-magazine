"use client";

import {useState} from "react";
import type {ReactNode} from "react";
import {useLocale, useTranslations} from "next-intl";
import LoadingScreen from "@/app/components/loading-screen/LoadingScreen";
import {useRouter} from "../../../i18n/navigation";
import {prepareCheckout} from "../buyer-details/actions";
import type {CheckoutSelection} from "../buyer-details/checkout-selection";
import {proceedToCheckout} from "../cart/actions";
import {redirectForAuthError} from "../cart/auth-redirect";
import type {PreparedCheckout} from "../cart/build-agreement-data";
import CheckoutConsent from "../cart/CheckoutConsent";

type CheckoutReviewProps = {
  /** Already validated against the account by the page; the server checks it again. */
  selection: CheckoutSelection;
  cartVersion: string;
  paymentMethods: ReactNode;
};

// Step 2: the buyer's details are final, so the agreements can be prepared as soon as the
// consent box is ticked or an agreement is opened.
export default function CheckoutReview({selection, cartVersion, paymentMethods}: CheckoutReviewProps) {
  const t = useTranslations("BuyerDetails");
  const locale = useLocale();
  const router = useRouter();
  const [isPreparing, setIsPreparing] = useState(false);

  async function prepare(): Promise<PreparedCheckout | null> {
    setIsPreparing(true);

    try {
      const result = await prepareCheckout(selection, locale);

      if (result.ok) {
        return result.checkout;
      }

      if (redirectForAuthError(result.error, {locale})) {
        return null;
      }

      // The details no longer fit the account (an address was removed, say): back to step 1.
      if (result.error === "invalid_details") {
        router.replace("/cart");

        return null;
      }

      // The consent component turns a thrown error into its "could not continue" message.
      throw new Error(result.error);
    } finally {
      setIsPreparing(false);
    }
  }

  return (
    <>
      {isPreparing ? <LoadingScreen label={t("preparingCart")} /> : null}
      <CheckoutConsent
        cartVersion={cartVersion}
        detailsKey={JSON.stringify(selection)}
        prepareCheckout={prepare}
        proceed={(acceptedFingerprint) => proceedToCheckout(acceptedFingerprint, selection, locale)}
        paymentMethods={paymentMethods}
      />
    </>
  );
}
