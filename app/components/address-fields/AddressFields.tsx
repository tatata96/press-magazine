"use client";

import {useEffect, useId, useState} from "react";
import {useTranslations} from "next-intl";
import TextField from "@/app/components/text-field/TextField";
import type {LocationOptions} from "@/lib/locations/check-location";
import {loadLocationOptions} from "./actions";
import styles from "./address-fields.module.scss";

export type AddressFieldValues = {
  address1: string;
  address2: string;
  city: string;
  zip: string;
  /** Province or state code; empty for countries without one. */
  stateCode: string;
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

type SelectFieldProps = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {value: string; label: string}[];
  placeholder: string;
  disabled?: boolean;
  error?: string;
};

// A native select keeps keyboard type-ahead and the platform's picker on phones.
function SelectField({name, label, value, onChange, options, placeholder, disabled, error}: SelectFieldProps) {
  const id = useId();

  return (
    <div className={styles.select}>
      <label htmlFor={id} className={`type-caption ${styles.selectLabel}`}>
        {label}
      </label>
      <select
        id={id}
        name={name}
        className={styles.selectInput}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        required
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p role="alert" className={`type-caption ${styles.selectError}`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

// Uncontrolled text inputs plus controlled selects: the parent wraps them in a <form> and reads
// them with FormData, so the same fields serve checkout and the account's address book. The
// state and city lists come from the server as the buyer picks; the server checks the saved
// address against the same data again.
export default function AddressFields({countries, defaults, errors, namePrefix = ""}: AddressFieldsProps) {
  const t = useTranslations("BuyerDetails");
  const [countryCode, setCountryCode] = useState(defaults?.countryCode || countries[0]?.code || "");
  const [stateCode, setStateCode] = useState(defaults?.stateCode ?? "");
  const [city, setCity] = useState(defaults?.city ?? "");
  const [initialKey] = useState(`${countryCode}|${stateCode}`);
  // The lists that belong to `key`; anything else is stale or still loading.
  const [loaded, setLoaded] = useState<{key: string; options: LocationOptions | null} | null>(null);
  const requestKey = `${countryCode}|${stateCode}`;
  const current = loaded?.key === requestKey ? loaded : null;
  const isLoading = current === null;
  const options = current?.options ?? null;

  useEffect(() => {
    let isCurrent = true;

    loadLocationOptions(countryCode, stateCode).then((result) => {
      if (isCurrent) {
        setLoaded({key: requestKey, options: result});
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [countryCode, stateCode, requestKey]);

  function errorText(field: keyof AddressFieldValues): string | undefined {
    const code = errors[field];

    return code ? t(code === "required" ? "required" : "invalid") : undefined;
  }

  const hasStates = (options?.states.length ?? 0) > 0;
  // Free text only once the data has loaded and has no cities to offer for this selection.
  const hasCityList = isLoading || (options?.cities.length ?? 0) > 0 || (hasStates && !stateCode);
  const placeholder = isLoading ? t("optionsLoading") : t("selectPlaceholder");

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
      <SelectField
        name={`${namePrefix}countryCode`}
        label={t("country")}
        value={countryCode}
        onChange={(value) => {
          setCountryCode(value);
          setStateCode("");
          setCity("");
        }}
        options={countries.map((country) => ({value: country.code, label: country.name}))}
        placeholder={t("selectPlaceholder")}
        error={errorText("countryCode")}
      />
      {hasStates || (isLoading && stateCode) ? (
        <SelectField
          name={`${namePrefix}stateCode`}
          label={t("state")}
          value={stateCode}
          onChange={(value) => {
            setStateCode(value);
            setCity("");
          }}
          options={(options?.states ?? []).map((state) => ({value: state.code, label: state.name}))}
          placeholder={placeholder}
          disabled={isLoading}
          error={errorText("stateCode")}
        />
      ) : null}
      <div className={styles.row}>
        {hasCityList ? (
          <SelectField
            name={`${namePrefix}city`}
            label={t("city")}
            value={options?.cities.includes(city) ? city : ""}
            onChange={setCity}
            options={(options?.cities ?? []).map((name) => ({value: name, label: name}))}
            placeholder={placeholder}
            disabled={isLoading || (hasStates && !stateCode)}
            error={errorText("city")}
          />
        ) : (
          <TextField
            key={requestKey}
            name={`${namePrefix}city`}
            label={t("city")}
            autoComplete="address-level2"
            defaultValue={requestKey === initialKey ? (defaults?.city ?? "") : ""}
            required
            error={errorText("city")}
          />
        )}
        <TextField
          name={`${namePrefix}zip`}
          label={t("zip")}
          autoComplete="postal-code"
          defaultValue={defaults?.zip ?? ""}
          required
          error={errorText("zip")}
        />
      </div>
      {current && !current.options ? (
        <p role="alert" className={`type-caption ${styles.selectError}`}>
          {t("optionsError")}
        </p>
      ) : null}
    </div>
  );
}
