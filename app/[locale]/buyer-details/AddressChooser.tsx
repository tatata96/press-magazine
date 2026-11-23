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
  /** Id of the section heading that names this group of addresses. */
  labelledBy: string;
  selectedId: string | null;
  onSelect: (addressId: string) => void;
  error?: string;
  /** The new-address fields are showing; they are part of the checkout's single form. */
  isAdding: boolean;
  onCancel: () => void;
  errors: FormErrors;
};

// Section heading with the "add a new address" action on the same row.
export function AddressSectionHeader({
  id,
  heading,
  onAdd,
}: {
  id: string;
  heading: string;
  /** Omitted while the new-address fields are already showing. */
  onAdd?: () => void;
}) {
  const t = useTranslations("BuyerDetails");

  return (
    <div className={styles.sectionHeader}>
      <h2 id={id} className={`type-mono ${styles.legend}`}>
        {heading}
      </h2>
      {onAdd ? (
        <button type="button" className={styles.textButton} onClick={onAdd}>
          {t("addAddress")}
        </button>
      ) : null}
    </div>
  );
}

// Pick one of the customer's saved addresses, or fill in a new one. Saving the new address
// (to the customer's account) is done by the checkout form. Only an address id is ever sent
// on to the server: it looks the address up itself.
export default function AddressChooser({
  kind,
  addresses,
  countries,
  labelledBy,
  selectedId,
  onSelect,
  error,
  isAdding,
  onCancel,
  errors,
}: AddressChooserProps) {
  const t = useTranslations("BuyerDetails");

  return (
    <div className={styles.group}>
      {addresses.length > 0 ? (
        <div className={styles.choices} role="radiogroup" aria-labelledby={labelledBy}>
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

      {/* The "add" action lives in the section heading row, see AddressSectionHeader. */}
      {isAdding ? (
        <div className={styles.addForm}>
          <AddressFields countries={countries} errors={errors} namePrefix={`${kind}-`} />
          {addresses.length > 0 ? (
            <button type="button" className={styles.textButton} onClick={onCancel}>
              {t("cancel")}
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? <p role="alert" className={styles.message}>{error}</p> : null}
    </div>
  );
}
