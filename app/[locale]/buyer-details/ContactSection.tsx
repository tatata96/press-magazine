"use client";

import {useState, useTransition} from "react";
import type {FormEvent} from "react";
import {useLocale, useTranslations} from "next-intl";
import Button from "@/app/components/button/Button";
import TextField from "@/app/components/text-field/TextField";
import {updateName} from "../account/actions";
import {redirectForAuthError} from "../cart/auth-redirect";
import type {FormErrors} from "./buyer-details";
import {isValidPhone, normalizePhone} from "./checkout-selection";
import styles from "./buyer-details.module.scss";

type ContactSectionProps = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Set by the parent when checkout is blocked on something in this section. */
  needsAttention: boolean;
  onSaved: (phone: string) => void;
};

// Shows what the Shopify account already holds as a summary and asks only for what is missing.
// "Edit" opens the fields for the name (saved to the account) and the phone (kept for this
// order: the account has no phone field the API can update).
export default function ContactSection({
  firstName,
  lastName,
  email,
  phone,
  needsAttention,
  onSaved,
}: ContactSectionProps) {
  const t = useTranslations("BuyerDetails");
  const locale = useLocale();
  const [wantsEdit, setWantsEdit] = useState(!firstName || !lastName || !phone);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveError, setSaveError] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const isEditing = wantsEdit || needsAttention;

  function errorText(field: "firstName" | "lastName" | "phone"): string | undefined {
    const code = errors[field];

    if (!code) {
      return undefined;
    }

    if (field === "phone" && code === "invalid") {
      return t("phoneInvalid");
    }

    return t(code === "required" ? "required" : "invalid");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextPhone = normalizePhone(String(formData.get("phone") ?? ""));
    const nextFirstName = String(formData.get("firstName") ?? "").trim();
    const nextLastName = String(formData.get("lastName") ?? "").trim();
    const nextErrors: FormErrors = {};

    if (!nextFirstName) {
      nextErrors.firstName = "required";
    }

    if (!nextLastName) {
      nextErrors.lastName = "required";
    }

    if (!nextPhone) {
      nextErrors.phone = "required";
    } else if (!isValidPhone(nextPhone)) {
      nextErrors.phone = "invalid";
    }

    setErrors(nextErrors);
    setSaveError(false);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    startSaving(async () => {
      // Only a changed name is sent to Shopify; the phone stays on this order.
      if (nextFirstName !== firstName || nextLastName !== lastName) {
        const result = await updateName(formData);

        if (!result.ok) {
          if (result.error === "invalid" && result.errors) {
            setErrors(result.errors);
          } else if (!redirectForAuthError(result.error, {locale})) {
            setSaveError(true);
          }

          return;
        }
      }

      onSaved(nextPhone);
      setWantsEdit(false);
    });
  }

  if (!isEditing) {
    return (
      <section aria-labelledby="contact-heading">
        <h3 id="contact-heading" className={`type-mono ${styles.legend}`}>
          {t("contact")}
        </h3>
        <dl className={styles.summary}>
          <div>
            <dt>{t("name")}</dt>
            <dd>{`${firstName} ${lastName}`}</dd>
          </div>
          <div>
            <dt>{t("email")}</dt>
            <dd>{email}</dd>
          </div>
          <div>
            <dt>{t("phone")}</dt>
            <dd>{phone}</dd>
          </div>
        </dl>
        <button type="button" className={styles.textButton} onClick={() => setWantsEdit(true)}>
          {t("edit")}
        </button>
      </section>
    );
  }

  return (
    <section aria-labelledby="contact-heading">
      <h3 id="contact-heading" className={`type-mono ${styles.legend}`}>
        {t("contact")}
      </h3>
      <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
        <div className={styles.row}>
          <TextField
            name="firstName"
            label={t("firstName")}
            autoComplete="given-name"
            defaultValue={firstName}
            required
            error={errorText("firstName")}
          />
          <TextField
            name="lastName"
            label={t("lastName")}
            autoComplete="family-name"
            defaultValue={lastName}
            required
            error={errorText("lastName")}
          />
        </div>
        <TextField
          name="phone"
          type="tel"
          label={t("phone")}
          helperText={t("phoneHelper")}
          autoComplete="tel"
          defaultValue={phone}
          required
          error={errorText("phone")}
        />
        <p className={styles.helper}>{t("emailManaged", {email})}</p>
        <div className={styles.actions}>
          <Button type="submit" loading={isSaving} loadingLabel={t("saving")}>
            {t("save")}
          </Button>
          {firstName && lastName && phone && !needsAttention ? (
            <button type="button" className={styles.textButton} onClick={() => setWantsEdit(false)}>
              {t("cancel")}
            </button>
          ) : null}
        </div>
        {saveError ? (
          <p role="alert" className={styles.message}>{t("saveError")}</p>
        ) : null}
      </form>
    </section>
  );
}
