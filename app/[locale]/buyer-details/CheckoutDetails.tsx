"use client";

import {useId, useRef, useState, useTransition} from "react";
import type {FormEvent, ReactNode} from "react";
import {useLocale, useTranslations} from "next-intl";
import Button from "@/app/components/button/Button";
import {useRouter} from "../../../i18n/navigation";
import {addAddress, savePhone, updateName} from "../account/actions";
import {redirectForAuthError} from "../cart/auth-redirect";
import cartStyles from "../cart/cart.module.scss";
import AddressChooser, {type AddressView} from "./AddressChooser";
import type {FormErrors} from "./buyer-details";
import ContactSection from "./ContactSection";
import {isValidPhone, normalizePhone} from "./checkout-selection";
import styles from "./buyer-details.module.scss";

type CheckoutDetailsProps = {
  requiresShipping: boolean;
  countries: {code: string; name: string}[];
  /** From the signed-in Shopify account. */
  customer: {firstName: string; lastName: string; email: string; phone: string};
  addresses: AddressView[];
  defaults: {phone: string; addressId: string | null};
  orderSummary: ReactNode;
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

type ContactValues = {firstName: string; lastName: string; phone: string};

function validateContact(values: ContactValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.firstName) {
    errors.firstName = "required";
  }

  if (!values.lastName) {
    errors.lastName = "required";
  }

  if (!values.phone) {
    errors.phone = "required";
  } else if (!isValidPhone(values.phone)) {
    errors.phone = "invalid";
  }

  return errors;
}

function getRequired(formData: FormData, field: string): string {
  return String(formData.get(field) ?? "").trim();
}

// Step 1 of checkout for a signed-in customer: what the account holds, the delivery and billing
// address choices, and one Continue button that saves whatever is open and moves on to the
// review step. Only address ids travel in the URL; the review page and the server check them
// against the account again.
export default function CheckoutDetails({
  requiresShipping,
  countries,
  customer,
  addresses,
  defaults,
  orderSummary,
}: CheckoutDetailsProps) {
  const t = useTranslations("BuyerDetails");
  const locale = useLocale();
  const router = useRouter();
  const [phone, setPhone] = useState(defaults.phone);
  const [shippingId, setShippingId] = useState(defaults.addressId);
  const [billingIsSameAsShipping, setBillingIsSameAsShipping] = useState(requiresShipping);
  const [billingId, setBillingId] = useState(defaults.addressId);
  const [problems, setProblems] = useState<Problems>({});
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
  const formRef = useRef<HTMLFormElement>(null);
  const formId = useId();

  const billsToDelivery = requiresShipping && billingIsSameAsShipping;
  const isEditingContact = wantsContactEdit || problems.contact === true;
  // With nothing saved yet, the new-address fields are the only thing to show.
  const isAddingShipping = requiresShipping && (wantsNewAddress.shipping || addresses.length === 0);
  const isAddingBilling = !billsToDelivery && (wantsNewAddress.billing || addresses.length === 0);
  const hadCompleteContact = Boolean(customer.firstName && customer.lastName && phone);

  // Continue saves everything that is open, then goes to the review step. Each part closes as
  // soon as it is saved, so a retry after a failure only sends what is left.
  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextPhone = normalizePhone(getRequired(formData, "phone"));
    const nextFirstName = getRequired(formData, "firstName");
    const nextLastName = getRequired(formData, "lastName");
    const nextContactErrors: FormErrors = isEditingContact
      ? validateContact({firstName: nextFirstName, lastName: nextLastName, phone: nextPhone})
      : {};

    setContactErrors(nextContactErrors);
    setAddressErrors({shipping: {}, billing: {}});
    setSaveFailure(null);

    if (Object.keys(nextContactErrors).length > 0) {
      return;
    }

    startSaving(async () => {
      let finalShippingId = shippingId;
      let finalBillingId = billingId;

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

        // The phone is saved on the customer, so it is remembered for the next order.
        if (nextPhone !== normalizePhone(customer.phone)) {
          const result = await savePhone(nextPhone);

          if (!result.ok) {
            if (result.error === "invalid") {
              setContactErrors(result.errors ?? {phone: "invalid"});
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

      const finalPhone = isEditingContact ? nextPhone : normalizePhone(phone);
      const newAddresses: [AddressKind, boolean, (id: string) => void][] = [
        ["shipping", isAddingShipping, (id) => { finalShippingId = id; setShippingId(id); }],
        ["billing", isAddingBilling, (id) => { finalBillingId = id; setBillingId(id); }],
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

      // Everything open is saved. Check what the review step needs before leaving; the server
      // checks it again.
      const finalFirstName = isEditingContact ? nextFirstName : customer.firstName;
      const finalLastName = isEditingContact ? nextLastName : customer.lastName;
      const contactProblems = validateContact({
        firstName: finalFirstName,
        lastName: finalLastName,
        phone: finalPhone,
      });
      const nextProblems: Problems = {
        contact: Object.keys(contactProblems).length > 0 || undefined,
        shipping: requiresShipping && !finalShippingId ? true : undefined,
        billing: !billsToDelivery && !finalBillingId ? true : undefined,
      };

      setProblems(nextProblems);

      if (nextProblems.contact || nextProblems.shipping || nextProblems.billing) {
        setContactErrors(contactProblems);
        setTimeout(() => {
          formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        }, 0);

        return;
      }

      const query = new URLSearchParams();

      if (requiresShipping && finalShippingId) {
        query.set("shipping", finalShippingId);
      }

      if (!billsToDelivery && finalBillingId) {
        query.set("billing", finalBillingId);
      }

      router.push(`/checkout?${query.toString()}`);
    });
  }

  return (
    <>
      <div className={cartStyles.layout}>
        <div className={cartStyles.details}>
          <form id={formId} ref={formRef} className={styles.form} onSubmit={handleContinue} noValidate>
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

            {saveFailure ? (
              <p role="alert" className={styles.message}>
                {saveFailure === "address" ? t("addressSaveError") : t("saveError")}
              </p>
            ) : null}

          </form>
        </div>
        <aside className={cartStyles.order}>
          {orderSummary}
          {/* Sits under the order total but submits the details form on the left. */}
          <div className={styles.actions}>
            <Button type="submit" form={formId} loading={isSaving} loadingLabel={t("saving")}>
              {t("continue")}
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}
