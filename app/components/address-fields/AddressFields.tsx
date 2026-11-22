"use client";

import {useId} from "react";
import {useTranslations} from "next-intl";
import TextField from "@/app/components/text-field/TextField";
import styles from "./address-fields.module.scss";

export type AddressFieldValues = {
  address1: string;
  address2: string;
  city: string;
  zip: string;
  countryCode: string;
};

type AddressFieldsProps = {
  countries: {code: string; name: string}[];
  defaults?: Partial<AddressFieldValues>;
  /** Keys are field names; values are the codes the server's validation returns. */
  errors: Partial<Record<string, "required" | "invalid">>;
  /** Prefixed onto every input name, so two address forms can share one <form>. */
  namePrefix?: string;
};

// Uncontrolled inputs: the parent wraps them in a <form> and reads them with FormData, so the
// same fields serve checkout and the account's address book.
export default function AddressFields({countries, defaults, errors, namePrefix = ""}: AddressFieldsProps) {
  const t = useTranslations("BuyerDetails");
  const countryId = useId();

  function errorText(field: keyof AddressFieldValues): string | undefined {
    const code = errors[field];

    return code ? t(code === "required" ? "required" : "invalid") : undefined;
  }

  return (
    <div className={styles.fields}>
      <TextField
        name={`${namePrefix}address1`}
        label={t("address1")}
        autoComplete="address-line1"
        defaultValue={defaults?.address1 ?? ""}
        required
        error={errorText("address1")}
      />
      <TextField
        name={`${namePrefix}address2`}
        label={t("address2")}
        autoComplete="address-line2"
        defaultValue={defaults?.address2 ?? ""}
        error={errorText("address2")}
      />
      <div className={styles.row}>
        <TextField
          name={`${namePrefix}city`}
          label={t("city")}
          autoComplete="address-level2"
          defaultValue={defaults?.city ?? ""}
          required
          error={errorText("city")}
        />
        <TextField
          name={`${namePrefix}zip`}
          label={t("zip")}
          autoComplete="postal-code"
          defaultValue={defaults?.zip ?? ""}
          required
          error={errorText("zip")}
        />
      </div>
      <div className={styles.select}>
        <label htmlFor={countryId} className={`type-caption ${styles.selectLabel}`}>
          {t("country")}
        </label>
        <select
          id={countryId}
          name={`${namePrefix}countryCode`}
          className={styles.selectInput}
          defaultValue={defaults?.countryCode || countries[0]?.code}
          autoComplete="country"
          aria-invalid={errorText("countryCode") ? true : undefined}
          required
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
        {errorText("countryCode") ? (
          <p role="alert" className={`type-caption ${styles.selectError}`}>
            {errorText("countryCode")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
