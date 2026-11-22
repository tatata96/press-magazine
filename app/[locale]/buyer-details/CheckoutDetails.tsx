"use client";

import {useState, useTransition} from "react";
import type {FormEvent, ReactNode} from "react";
import {useLocale, useTranslations} from "next-intl";
import Button from "@/app/components/button/Button";
import LoadingScreen from "@/app/components/loading-screen/LoadingScreen";
import {addAddress, updateName} from "../account/actions";
import {proceedToCheckout} from "../cart/actions";
import {redirectForAuthError} from "../cart/auth-redirect";
import type {PreparedCheckout} from "../cart/build-agreement-data";
import CheckoutConsent from "../cart/CheckoutConsent";
import cartStyles from "../cart/cart.module.scss";
import {prepareCheckout} from "./actions";
import AddressChooser, {type AddressView} from "./AddressChooser";
import type {FormErrors} from "./buyer-details";
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
type AddressKind = "shipping" | "billing";

// The new-address inputs are prefixed with their kind so both can live in one form; the
// server action expects the plain field names.
function pickAddressFields(formData: FormData, kind: AddressKind): FormData {
  const prefix = `${kind}-`;
  const picked = new FormData();

  for (const [key, value] of formData.entries()) {
    if (key.startsWith(prefix)) {
      picked.append(key.slice(prefix.length), value);
    }
  }

  return picked;
}

function getRequired(formData: FormData, field: string): string {
  return String(formData.get(field) ?? "").trim();
}

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
  const [wantsContactEdit, setWantsContactEdit] = useState(
    !customer.firstName || !customer.lastName || !defaults.phone,
  );
  const [wantsNewAddress, setWantsNewAddress] = useState<Record<AddressKind, boolean>>({
    shipping: false,
    billing: false,
  });
  const [contactErrors, setContactErrors] = useState<FormErrors>({});
  const [addressErrors, setAddressErrors] = useState<Record<AddressKind, FormErrors>>({
    shipping: {},
    billing: {},
  });
  const [saveFailure, setSaveFailure] = useState<"details" | "address" | null>(null);
  const [isSaving, startSaving] = useTransition();

  const billsToDelivery = requiresShipping && billingIsSameAsShipping;
  const isEditingContact = wantsContactEdit || problems.contact === true;
  // With nothing saved yet, the new-address fields are the only thing to show.
  const isAddingShipping = requiresShipping && (wantsNewAddress.shipping || addresses.length === 0);
  const isAddingBilling = !billsToDelivery && (wantsNewAddress.billing || addresses.length === 0);
  const hasOpenFields = isEditingContact || isAddingShipping || isAddingBilling;
  const hadCompleteContact = Boolean(customer.firstName && customer.lastName && phone);

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

  // One Save for everything that is open. Each part closes as soon as it is saved, so a retry
  // after a failure only sends what is left.
  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextPhone = normalizePhone(getRequired(formData, "phone"));
    const nextFirstName = getRequired(formData, "firstName");
    const nextLastName = getRequired(formData, "lastName");
    const nextContactErrors: FormErrors = {};

    if (isEditingContact) {
      if (!nextFirstName) {
        nextContactErrors.firstName = "required";
      }

      if (!nextLastName) {
        nextContactErrors.lastName = "required";
      }

      if (!nextPhone) {
        nextContactErrors.phone = "required";
      } else if (!isValidPhone(nextPhone)) {
        nextContactErrors.phone = "invalid";
      }
    }

    setContactErrors(nextContactErrors);
    setAddressErrors({shipping: {}, billing: {}});
    setSaveFailure(null);

    if (Object.keys(nextContactErrors).length > 0) {
      return;
    }

    startSaving(async () => {
      if (isEditingContact) {
        // Only a changed name is sent to Shopify; the phone stays on this order.
        if (nextFirstName !== customer.firstName || nextLastName !== customer.lastName) {
          const nameData = new FormData();

          nameData.set("firstName", nextFirstName);
          nameData.set("lastName", nextLastName);

          const result = await updateName(nameData);

          if (!result.ok) {
            if (result.error === "invalid" && result.errors) {
              setContactErrors(result.errors);
            } else if (!redirectForAuthError(result.error, {locale})) {
              setSaveFailure("details");
            }

            return;
          }
        }

        setPhone(nextPhone);
        setProblems((current) => ({...current, contact: false}));
        setWantsContactEdit(false);
      }

      const newAddresses: [AddressKind, boolean, (id: string) => void][] = [
        ["shipping", isAddingShipping, setShippingId],
        ["billing", isAddingBilling, setBillingId],
      ];

      for (const [kind, isOpen, select] of newAddresses) {
        if (!isOpen) {
          continue;
        }

        const result = await addAddress(pickAddressFields(formData, kind));

        if (result.ok && result.addressId) {
          select(result.addressId);
          setWantsNewAddress((current) => ({...current, [kind]: false}));

          continue;
        }

        if (!result.ok && result.error === "invalid" && result.errors) {
          setAddressErrors((current) => ({...current, [kind]: result.errors ?? {}}));
        } else if (result.ok || !redirectForAuthError(result.error, {locale})) {
          setSaveFailure("address");
        }

        return;
      }
    });
  }

  return (
    <>
      {isPreparing ? <LoadingScreen label={t("preparingCart")} /> : null}
      <div className={cartStyles.layout} aria-busy={isPreparing} inert={isPreparing}>
        <div className={cartStyles.details}>
          <form className={styles.form} onSubmit={handleSave} noValidate>
            <ContactSection
              firstName={customer.firstName}
              lastName={customer.lastName}
              email={customer.email}
              phone={phone}
              isEditing={isEditingContact}
              canCancel={hadCompleteContact && problems.contact !== true}
              errors={contactErrors}
              onEdit={() => setWantsContactEdit(true)}
              onCancel={() => setWantsContactEdit(false)}
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
                  isAdding={isAddingShipping}
                  onAdd={() => setWantsNewAddress((current) => ({...current, shipping: true}))}
                  onCancel={() => setWantsNewAddress((current) => ({...current, shipping: false}))}
                  errors={addressErrors.shipping}
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
                  isAdding={isAddingBilling}
                  onAdd={() => setWantsNewAddress((current) => ({...current, billing: true}))}
                  onCancel={() => setWantsNewAddress((current) => ({...current, billing: false}))}
                  errors={addressErrors.billing}
                />
              )}
            </fieldset>

            {hasOpenFields ? (
              <div className={styles.actions}>
                <Button type="submit" loading={isSaving} loadingLabel={t("saving")}>
                  {t("save")}
                </Button>
              </div>
            ) : null}

            {saveFailure ? (
              <p role="alert" className={styles.message}>
                {saveFailure === "address" ? t("addressSaveError") : t("saveError")}
              </p>
            ) : null}

            {failure ? (
              <p role="alert" className={styles.message}>
                {failure === "unavailable"
                  ? t("checkoutUnavailable")
                  : failure === "empty_cart"
                    ? t("checkoutEmpty")
                    : t("saveError")}
              </p>
            ) : null}
          </form>
        </div>
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
