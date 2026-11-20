"use client";

import {useState, useTransition} from "react";
import type {FormEvent} from "react";
import {useLocale, useTranslations} from "next-intl";
import AddressFields from "@/app/components/address-fields/AddressFields";
import Button from "@/app/components/button/Button";
import {addAddress} from "../account/actions";
import {redirectForAuthError} from "../cart/auth-redirect";
import type {FormErrors} from "./buyer-details";
import styles from "./buyer-details.module.scss";

export type AddressView = {
  id: string;
  /** One readable line, already formatted for the locale. */
  label: string;
  isDefault: boolean;
};

type AddressChooserProps = {
  /** Also names the radio group, so shipping and billing do not share a selection. */
  kind: "shipping" | "billing";
  addresses: AddressView[];
  countries: {code: string; name: string}[];
  selectedId: string | null;
  onSelect: (addressId: string) => void;
  error?: string;
};

// Pick one of the customer's saved addresses, or add a new one, which is saved to their
// account and selected. Only an address id leaves this component: the server looks the
// address up itself.
export default function AddressChooser({
  kind,
  addresses,
  countries,
  selectedId,
  onSelect,
  error,
}: AddressChooserProps) {
  const t = useTranslations("BuyerDetails");
  const locale = useLocale();
  const [wantsToAdd, setWantsToAdd] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveError, setSaveError] = useState(false);
  const [isSaving, startSaving] = useTransition();
  // With nothing saved yet, the form is the only thing to show.
  const isAdding = wantsToAdd || addresses.length === 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setErrors({});
    setSaveError(false);

    startSaving(async () => {
      const result = await addAddress(formData);

      if (result.ok && result.addressId) {
        onSelect(result.addressId);
        setWantsToAdd(false);

        return;
      }

      if (!result.ok && result.error === "invalid" && result.errors) {
        setErrors(result.errors);
      } else if (result.ok || !redirectForAuthError(result.error, {locale})) {
        setSaveError(true);
      }
    });
  }

  return (
    <div className={styles.group}>
      {addresses.length > 0 ? (
        <div className={styles.choices}>
          {addresses.map((address) => (
            <label key={address.id} className={styles.choice}>
              <input
                type="radio"
                name={`${kind}-address`}
                value={address.id}
                checked={address.id === selectedId}
                onChange={() => onSelect(address.id)}
                className={styles.radio}
              />
              <span className={styles.choiceText}>
                {address.label}
                {address.isDefault ? <span className={styles.badge}>{t("defaultBadge")}</span> : null}
              </span>
            </label>
          ))}
        </div>
      ) : null}

      {isAdding ? (
        <form className={styles.addForm} onSubmit={handleSubmit} noValidate>
          <AddressFields countries={countries} errors={errors} />
          <div className={styles.actions}>
            <Button type="submit" loading={isSaving} loadingLabel={t("saving")}>
              {t("saveAddress")}
            </Button>
            {addresses.length > 0 ? (
              <button type="button" className={styles.textButton} onClick={() => setWantsToAdd(false)}>
                {t("cancel")}
              </button>
            ) : null}
          </div>
          {saveError ? (
            <p role="alert" className={styles.message}>{t("addressSaveError")}</p>
          ) : null}
        </form>
      ) : (
        <button type="button" className={styles.textButton} onClick={() => setWantsToAdd(true)}>
          {t("addAddress")}
        </button>
      )}

      {error ? <p role="alert" className={styles.message}>{error}</p> : null}
    </div>
  );
}
