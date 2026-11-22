"use client";

import {useTranslations} from "next-intl";
import TextField from "@/app/components/text-field/TextField";
import type {FormErrors} from "./buyer-details";
import styles from "./buyer-details.module.scss";

type ContactSectionProps = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isEditing: boolean;
  /** Cancelling only makes sense once there is a complete set of details to go back to. */
  canCancel: boolean;
  errors: FormErrors;
  onEdit: () => void;
  onCancel: () => void;
};

// Shows what the Shopify account already holds as a summary and asks only for what is missing.
// "Edit" opens the fields for the name (saved to the account) and the phone (kept for this
// order: the account has no phone field the API can update). The fields belong to the
// checkout's single form; saving is handled there.
export default function ContactSection({
  firstName,
  lastName,
  email,
  phone,
  isEditing,
  canCancel,
  errors,
  onEdit,
  onCancel,
}: ContactSectionProps) {
  const t = useTranslations("BuyerDetails");

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

  if (!isEditing) {
    return (
      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading" className={`type-mono ${styles.legend}`}>
          {t("contact")}
        </h2>
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
        <button type="button" className={styles.textButton} onClick={onEdit}>
          {t("edit")}
        </button>
      </section>
    );
  }

  return (
    <section aria-labelledby="contact-heading">
      <h2 id="contact-heading" className={`type-mono ${styles.legend}`}>
        {t("contact")}
      </h2>
      <div className={styles.contactForm}>
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
        {canCancel ? (
          <button type="button" className={styles.textButton} onClick={onCancel}>
            {t("cancel")}
          </button>
        ) : null}
      </div>
    </section>
  );
}
