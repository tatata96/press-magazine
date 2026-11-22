"use client";

import {useTranslations} from "next-intl";
import AddressFields from "@/app/components/address-fields/AddressFields";
import type {FormErrors} from "./buyer-details";
import styles from "./buyer-details.module.scss";

export type AddressView = {
  id: string;
  /** One readable line, already formatted for the locale. */
  label: string;
  isDefault: boolean;
};

type AddressChooserProps = {
  /** Also names the radio group and prefixes the new-address input names, so shipping and billing do not collide. */
  kind: "shipping" | "billing";
  addresses: AddressView[];
  countries: {code: string; name: string}[];
  selectedId: string | null;
  onSelect: (addressId: string) => void;
  error?: string;
  /** The new-address fields are showing; they are part of the checkout's single form. */
  isAdding: boolean;
  onAdd: () => void;
  onCancel: () => void;
  errors: FormErrors;
};

// Pick one of the customer's saved addresses, or fill in a new one. Saving the new address
// (to the customer's account) is done by the checkout form. Only an address id is ever sent
// on to the server: it looks the address up itself.
export default function AddressChooser({
  kind,
  addresses,
  countries,
  selectedId,
  onSelect,
  error,
  isAdding,
  onAdd,
  onCancel,
  errors,
}: AddressChooserProps) {
  const t = useTranslations("BuyerDetails");

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
        <div className={styles.addForm}>
          <AddressFields countries={countries} errors={errors} namePrefix={`${kind}-`} />
          {addresses.length > 0 ? (
            <button type="button" className={styles.textButton} onClick={onCancel}>
              {t("cancel")}
            </button>
          ) : null}
        </div>
      ) : (
        <button type="button" className={styles.textButton} onClick={onAdd}>
          {t("addAddress")}
        </button>
      )}

      {error ? <p role="alert" className={styles.message}>{error}</p> : null}
    </div>
  );
}
