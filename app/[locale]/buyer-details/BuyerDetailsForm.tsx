"use client";

import {useState, useTransition} from "react";
import type {FormEvent} from "react";
import {useTranslations} from "next-intl";
import Button from "@/app/components/button/Button";
import TextField from "@/app/components/text-field/TextField";
import {useRouter} from "../../../i18n/navigation";
import {saveBuyerDetails} from "./actions";
import type {
  BuyerDetailsErrors,
  PostalAddress,
  FieldErrorCode,
} from "./buyer-details";
import styles from "./buyer-details.module.scss";

export type BuyerDetailsDefaults = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  shippingAddress: PostalAddress | null;
  billingAddress: PostalAddress | null;
  /** True when the buyer previously chose "same as delivery" (or has not chosen yet). */
  billingIsSameAsShipping: boolean;
};

type BuyerDetailsFormProps = {
  requiresShipping: boolean;
  countries: {code: string; name: string}[];
  defaults: BuyerDetailsDefaults;
};

const EMPTY_ADDRESS: PostalAddress = {
  address1: "",
  address2: "",
  city: "",
  zip: "",
};

export default function BuyerDetailsForm({
  requiresShipping,
  countries,
  defaults,
}: BuyerDetailsFormProps) {
  const t = useTranslations("BuyerDetails");
  const router = useRouter();
  const [isSaving, startSaving] = useTransition();
  const [errors, setErrors] = useState<BuyerDetailsErrors>({});
  const [saveError, setSaveError] = useState<"unavailable" | "failed" | null>(
    null,
  );
  const [billingIsSameAsShipping, setBillingIsSameAsShipping] = useState(
    requiresShipping && defaults.billingIsSameAsShipping,
  );

  function errorText(field: string): string | undefined {
    const code: FieldErrorCode | undefined = errors[field];

    if (!code) {
      return undefined;
    }

    // Field-specific wording where "invalid" needs more than the generic message.
    if (code === "invalid" && (field === "email" || field === "phone")) {
      return t(`${field}Invalid`);
    }

    return t(code === "required" ? "required" : "invalid");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setErrors({});
    setSaveError(null);
    // Not a <form action>: React would reset the fields after a failed submit.
    startSaving(async () => {
      const result = await saveBuyerDetails(formData);

      if (result.ok) {
        router.push("/cart");

        return;
      }

      if (result.error === "invalid") {
        setErrors(result.errors);
      } else {
        setSaveError(result.error === "unavailable" ? "unavailable" : "failed");
      }
    });
  }

  function renderAddressFields(
    prefix: "shipping" | "billing",
    values: PostalAddress,
  ) {
    return (
      <>
        <TextField
          name={`${prefix}.address1`}
          label={t("address1")}
          autoComplete={`${prefix} address-line1`}
          defaultValue={values.address1}
          required
          error={errorText(`${prefix}.address1`)}
        />
        <TextField
          name={`${prefix}.address2`}
          label={t("address2")}
          autoComplete={`${prefix} address-line2`}
          defaultValue={values.address2}
          error={errorText(`${prefix}.address2`)}
        />
        <div className={styles.row}>
          <TextField
            name={`${prefix}.city`}
            label={t("city")}
            autoComplete={`${prefix} address-level2`}
            defaultValue={values.city}
            required
            error={errorText(`${prefix}.city`)}
          />
          <TextField
            name={`${prefix}.zip`}
            label={t("zip")}
            autoComplete={`${prefix} postal-code`}
            defaultValue={values.zip}
            required
            error={errorText(`${prefix}.zip`)}
          />
        </div>
      </>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <fieldset className={styles.group}>
        <legend className={`type-mono ${styles.legend}`}>{t("contact")}</legend>
        <div className={styles.row}>
          <TextField
            name="firstName"
            label={t("firstName")}
            autoComplete="given-name"
            defaultValue={defaults.firstName}
            required
            error={errorText("firstName")}
          />
          <TextField
            name="lastName"
            label={t("lastName")}
            autoComplete="family-name"
            defaultValue={defaults.lastName}
            required
            error={errorText("lastName")}
          />
        </div>
        <TextField
          name="email"
          type="email"
          label={t("email")}
          autoComplete="email"
          defaultValue={defaults.email}
          required
          error={errorText("email")}
        />
        <TextField
          name="phone"
          type="tel"
          label={t("phone")}
          helperText={t("phoneHelper")}
          autoComplete="tel"
          defaultValue={defaults.phone}
          required
          error={errorText("phone")}
        />
        <div className={styles.select}>
          <label htmlFor="buyer-country" className={`type-caption ${styles.selectLabel}`}>
            {t("country")}
          </label>
          <select
            id="buyer-country"
            name="countryCode"
            className={styles.selectInput}
            defaultValue={defaults.countryCode || countries[0]?.code}
            autoComplete="country"
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
      </fieldset>

      {requiresShipping ? (
        <fieldset className={styles.group}>
          <legend className={`type-mono ${styles.legend}`}>
            {t("shippingHeading")}
          </legend>
          {renderAddressFields(
            "shipping",
            defaults.shippingAddress ?? EMPTY_ADDRESS,
          )}
        </fieldset>
      ) : (
        <p className={`type-mono ${styles.note}`}>{t("digitalNote")}</p>
      )}

      <fieldset className={styles.group}>
        <legend className={`type-mono ${styles.legend}`}>
          {t("billingHeading")}
        </legend>
        {requiresShipping ? (
          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              name="billingSameAsShipping"
              className={styles.checkbox}
              checked={billingIsSameAsShipping}
              onChange={(event) =>
                setBillingIsSameAsShipping(event.target.checked)
              }
            />
            <span>{t("billingSame")}</span>
          </label>
        ) : null}
        {billingIsSameAsShipping
          ? null
          : renderAddressFields(
              "billing",
              defaults.billingAddress ?? EMPTY_ADDRESS,
            )}
      </fieldset>

      <Button
        type="submit"
        className={styles.submit}
        loading={isSaving}
        loadingLabel={t("saving")}
      >
        {t("submit")}
      </Button>
      {saveError ? (
        <p role="alert" className={styles.message}>
          {saveError === "unavailable" ? t("checkoutUnavailable") : t("saveError")}
        </p>
      ) : null}
    </form>
  );
}
