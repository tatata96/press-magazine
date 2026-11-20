"use client";

import {useState} from "react";
import type {ReactNode} from "react";
import {useLocale, useTranslations} from "next-intl";
import LoadingScreen from "@/app/components/loading-screen/LoadingScreen";
import {proceedToCheckout} from "../cart/actions";
import {redirectForAuthError} from "../cart/auth-redirect";
import type {PreparedCheckout} from "../cart/build-agreement-data";
import CheckoutConsent from "../cart/CheckoutConsent";
import cartStyles from "../cart/cart.module.scss";
import {prepareCheckout} from "./actions";
import AddressChooser, {type AddressView} from "./AddressChooser";
import ContactSection from "./ContactSection";
import {isValidPhone, normalizePhone, type CheckoutSelection} from "./checkout-selection";
import styles from "./buyer-details.module.scss";

type CheckoutDetailsProps = {
  requiresShipping: boolean;
  countries: {code: string; name: string}[];
  /** From the signed-in Shopify account. */
  customer: {firstName: string; lastName: string; email: string};
  addresses: AddressView[];
  defaults: {phone: string; addressId: string | null};
  orderSummary: ReactNode;
  paymentMethods: ReactNode;
  cartVersion: string;
};

type Problems = {contact?: boolean; shipping?: boolean; billing?: boolean};

// The buyer's side of checkout for a signed-in customer: a summary of what the account holds,
// the delivery and billing address choices, and the agreement consent. Everything chosen here
// is sent to the server as ids and plain values and checked there again.
export default function CheckoutDetails({
  requiresShipping,
  countries,
  customer,
  addresses,
  defaults,
  orderSummary,
  paymentMethods,
  cartVersion,
}: CheckoutDetailsProps) {
  const t = useTranslations("BuyerDetails");
  const locale = useLocale();
  const [phone, setPhone] = useState(defaults.phone);
  const [shippingId, setShippingId] = useState(defaults.addressId);
  const [billingIsSameAsShipping, setBillingIsSameAsShipping] = useState(requiresShipping);
  const [billingId, setBillingId] = useState(defaults.addressId);
  const [problems, setProblems] = useState<Problems>({});
  const [failure, setFailure] = useState<"failed" | "empty_cart" | "unavailable" | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  const billsToDelivery = requiresShipping && billingIsSameAsShipping;
  // Anything the agreement is built from. When it changes, the prepared agreements and the
  // buyer's consent no longer apply, so they must be reviewed again.
  const detailsKey = JSON.stringify([
    customer.firstName,
    customer.lastName,
    normalizePhone(phone),
    requiresShipping ? shippingId : null,
    billsToDelivery ? null : billingId,
  ]);

  // The same checks the server repeats; running them here only saves a round trip.
  function readSelection(): CheckoutSelection | null {
    const nextProblems: Problems = {};

    if (!customer.firstName || !customer.lastName || !isValidPhone(phone)) {
      nextProblems.contact = true;
    }

    if (requiresShipping && !shippingId) {
      nextProblems.shipping = true;
    }

    if (!billsToDelivery && !billingId) {
      nextProblems.billing = true;
    }

    setProblems(nextProblems);

    if (Object.keys(nextProblems).length > 0) {
      return null;
    }

    return {
      phone: normalizePhone(phone),
      shippingAddressId: requiresShipping ? shippingId : null,
      billingAddressId: billsToDelivery ? null : billingId,
    };
  }

  async function prepare(): Promise<PreparedCheckout | null> {
    const selection = readSelection();

    setFailure(null);

    if (!selection) {
      return null;
    }

    setIsPreparing(true);

    try {
      const result = await prepareCheckout(selection, locale);

      if (result.ok) {
        return result.checkout;
      }

      if (redirectForAuthError(result.error, {locale})) {
        return null;
      }

      if (result.error === "invalid_details") {
        setProblems({contact: true});
      } else {
        setFailure(result.error === "empty_cart" || result.error === "unavailable" ? result.error : "failed");
      }
    } catch {
      setFailure("failed");
    } finally {
      setIsPreparing(false);
    }

    return null;
  }

  async function proceed(acceptedFingerprint: string) {
    const selection = readSelection();

    if (!selection) {
      return {ok: false, error: "invalid_details"} as const;
    }

    return proceedToCheckout(acceptedFingerprint, selection, locale);
  }

  return (
    <>
      {isPreparing ? <LoadingScreen label={t("preparingCart")} /> : null}
      <div className={cartStyles.layout} aria-busy={isPreparing} inert={isPreparing}>
        <section className={cartStyles.details} aria-labelledby="buyer-details-heading">
          <h2 id="buyer-details-heading" className={`type-mono ${cartStyles.sectionHeading}`}>
            {t("heading")}
          </h2>
          <div className={styles.form}>
            <ContactSection
              firstName={customer.firstName}
              lastName={customer.lastName}
              email={customer.email}
              phone={phone}
              needsAttention={problems.contact === true}
              onSaved={(nextPhone) => {
                setPhone(nextPhone);
                setProblems((current) => ({...current, contact: false}));
              }}
            />

            {requiresShipping ? (
              <fieldset className={styles.group}>
                <legend className={`type-mono ${styles.legend}`}>{t("shippingHeading")}</legend>
                <AddressChooser
                  kind="shipping"
                  addresses={addresses}
                  countries={countries}
                  selectedId={shippingId}
                  onSelect={setShippingId}
                  error={problems.shipping ? t("addressRequired") : undefined}
                />
              </fieldset>
            ) : (
              <p className={`type-mono ${styles.note}`}>{t("digitalNote")}</p>
            )}

            <fieldset className={styles.group}>
              <legend className={`type-mono ${styles.legend}`}>{t("billingHeading")}</legend>
              {requiresShipping ? (
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={billingIsSameAsShipping}
                    onChange={(event) => setBillingIsSameAsShipping(event.target.checked)}
                  />
                  <span>{t("billingSame")}</span>
                </label>
              ) : null}
              {billsToDelivery ? null : (
                <AddressChooser
                  kind="billing"
                  addresses={addresses}
                  countries={countries}
                  selectedId={billingId}
                  onSelect={setBillingId}
                  error={problems.billing ? t("addressRequired") : undefined}
                />
              )}
            </fieldset>

            {failure ? (
              <p role="alert" className={styles.message}>
                {failure === "unavailable"
                  ? t("checkoutUnavailable")
                  : failure === "empty_cart"
                    ? t("checkoutEmpty")
                    : t("saveError")}
              </p>
            ) : null}
          </div>
        </section>
        <aside className={cartStyles.order}>
          {orderSummary}
          <CheckoutConsent
            cartVersion={cartVersion}
            detailsKey={detailsKey}
            prepareCheckout={prepare}
            proceed={proceed}
            paymentMethods={paymentMethods}
          />
        </aside>
      </div>
    </>
  );
}
