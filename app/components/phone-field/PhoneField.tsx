"use client";

import {useId, useState} from "react";
import PhoneInput from "react-phone-number-input/min";
import flags from "react-phone-number-input/flags";
import labelsEn from "react-phone-number-input/locale/en.json";
import labelsTr from "react-phone-number-input/locale/tr.json";
import {isValidPhoneNumber} from "libphonenumber-js/min";
import {useLocale, useTranslations} from "next-intl";
import "react-phone-number-input/style.css";
import FieldError from "../field-error/FieldError";
import styles from "./phone-field.module.scss";

type PhoneFieldProps = {
  /** Name of the hidden input that carries the E.164 number (e.g. "+905551112233") in the form. */
  name: string;
  label: string;
  /** E.164, e.g. the customer's saved phone. Anything else is ignored and the buyer types it again. */
  defaultValue?: string;
  error?: string;
  required?: boolean;
};

// The buyer types a number in national or international form and picks the country with a flag
// selector. The form reads one hidden input holding the E.164 number, so what is submitted is
// the same shape the server validates and stores.
export default function PhoneField({name, label, defaultValue = "", error, required}: PhoneFieldProps) {
  const t = useTranslations("BuyerDetails");
  const locale = useLocale();
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [value, setValue] = useState<string | undefined>(
    defaultValue && isValidPhoneNumber(defaultValue) ? defaultValue : undefined,
  );

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={`type-caption ${styles.label}`}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <PhoneInput
        id={inputId}
        value={value}
        onChange={setValue}
        flags={flags}
        labels={locale === "tr" ? labelsTr : labelsEn}
        // Türkiye is the main market; the picker or a "+" prefix changes it.
        defaultCountry="TR"
        autoComplete="tel"
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        countrySelectProps={{"aria-label": t("phoneCountry")}}
        className={error ? `${styles.input} ${styles.invalid}` : styles.input}
      />
      <input type="hidden" name={name} value={value ?? ""} />
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
