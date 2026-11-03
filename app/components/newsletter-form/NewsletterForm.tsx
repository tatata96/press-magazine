"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  isValidBirthYear,
  MAX_COUNTRY_LENGTH,
} from "@/app/api/newsletter/validation";
import BirthYearField from "../birth-year-field/BirthYearField";
import Button from "../button/Button";
import TextField from "../text-field/TextField";
import styles from "./newsletter-form.module.scss";

type FieldErrors = { email?: string; birthYear?: string; country?: string };
type Status = "idle" | "pending" | "success" | "error";

// `children` is the intro shown above the form; it is dropped with the form on
// success so the whole panel becomes the confirmation.
export default function NewsletterForm({ children }: { children?: ReactNode }) {
  const t = useTranslations("NewsletterForm");
  const emailRef = useRef<HTMLInputElement>(null);
  const birthYearRef = useRef<HTMLInputElement>(null);
  // A ref, not state: it blocks a second submit fired before the pending render lands.
  const submitting = useRef(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const confirmationRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  // The form unmounts on success, so move focus to the confirmation or keyboard
  // and screen reader users are left on a vanished button.
  useEffect(() => {
    if (status === "success") {
      confirmationRef.current?.focus();
    }
  }, [status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) {
      return;
    }
    const form = event.currentTarget;
    const email = emailRef.current;
    const birthYear = birthYearRef.current;

    if (!email || !birthYear) {
      return;
    }

    const validationErrors: FieldErrors = {};

    if (email.validity.valueMissing || email.value.trim() === "") {
      validationErrors.email = t("emailRequired");
    } else if (email.validity.typeMismatch) {
      validationErrors.email = t("emailInvalid");
    }
    // A number input reports unparsable text as badInput with an empty value.
    const birthYearValue = birthYear.value.trim();

    if (
      birthYear.validity.badInput ||
      (birthYearValue !== "" && !isValidBirthYear(birthYearValue))
    ) {
      validationErrors.birthYear = t("birthYearInvalid");
    }

    setErrors(validationErrors);
    setStatus("idle");

    if (validationErrors.email) {
      return email.focus();
    }
    if (validationErrors.birthYear) {
      return birthYear.focus();
    }

    const data = new FormData(form);

    submitting.current = true;
    setStatus("pending");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          surname: data.get("surname"),
          email: data.get("email"),
          birthYear: data.get("birthYear"),
          country: data.get("country"),
          website: data.get("website"),
        }),
      });

      if (response.ok) {
        setStatus("success");
        return;
      }

      // The browser checks should already have caught these; map any the server still rejects.
      const body: { fields?: string[] } | null = await response
        .json()
        .catch(() => null);

      if (response.status === 400 && body?.fields) {
        const serverErrors: FieldErrors = {};

        if (body.fields.includes("email")) {
          serverErrors.email = t("emailInvalid");
        }
        if (body.fields.includes("birthYear")) {
          serverErrors.birthYear = t("birthYearInvalid");
        }
        if (body.fields.includes("country")) {
          serverErrors.country = t("countryInvalid");
        }
        setErrors(serverErrors);
      }
      setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  }

  if (status === "success") {
    return (
      <div
        ref={confirmationRef}
        className={styles.confirmation}
        role="status"
        tabIndex={-1}
      >
        <p className="type-title">{t("successTitle")}</p>
        <p className="type-body">{t("success")}</p>
      </div>
    );
  }

  return (
    <>
      {children}
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Provisional: name and surname are optional and not validated. */}
        <div className={styles.nameRow}>
          <TextField
            name="name"
            autoComplete="given-name"
            label={t("nameLabel")}
          />
          <TextField
            name="surname"
            autoComplete="family-name"
            label={t("surnameLabel")}
          />
        </div>
        <TextField
          ref={emailRef}
          name="email"
          type="email"
          autoComplete="email"
          required
          label={t("emailLabel")}
          error={errors.email}
        />
        {/* Provisional: country is optional free text. */}
        <div className={styles.detailsRow}>
          <TextField
            name="country"
            autoComplete="country-name"
            maxLength={MAX_COUNTRY_LENGTH}
            label={t("countryLabel")}
            error={errors.country}
          />
          <BirthYearField
            ref={birthYearRef}
            label={t("birthYearLabel")}
            error={errors.birthYear}
          />
        </div>
        {/* Honeypot: hidden from people and assistive tech; bots that fill it are ignored. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label>
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>
        <div className={styles.submitRow}>
          {/* Provisional notice wording until the final consent copy is confirmed. */}
          <p className={`${styles.notice} type-caption`}>
            {t("consentNotice")}
          </p>
          <Button
            type="submit"
            loading={status === "pending"}
            loadingLabel={t("submitting")}
          >
            {t("submit")}
          </Button>
        </div>
        <div role="status" className={styles.status}>
          {status === "error" && <p className="type-body">{t("error")}</p>}
        </div>
      </form>
    </>
  );
}
