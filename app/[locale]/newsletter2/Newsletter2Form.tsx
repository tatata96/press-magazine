"use client";

import {useEffect, useRef, useState} from "react";
import type {FormEvent, ReactNode} from "react";
import {useTranslations} from "next-intl";
import Button from "../../components/button/Button";
import styles from "./newsletter2.module.scss";

type FieldErrors = {email?: string; age?: string};
type Status = "idle" | "pending" | "success" | "error";

// Provisional: age is optional, and when given must be a positive whole number.
// There is no upper bound until the allowed range is confirmed.
const POSITIVE_INTEGER = /^[1-9]\d*$/;

// A copy of NewsletterForm's submit flow with this page's underlined layout,
// kept separate while the two designs are compared; one of them will be dropped.
// `children` is the intro shown above the form; it is dropped with the form on
// success so the whole panel becomes the confirmation.
export default function Newsletter2Form({children}: {children?: ReactNode}) {
  const t = useTranslations("NewsletterForm");
  const emailRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);
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
    const age = ageRef.current;

    if (!email || !age) {
      return;
    }

    const validationErrors: FieldErrors = {};

    if (email.validity.valueMissing || email.value.trim() === "") {
      validationErrors.email = t("emailRequired");
    } else if (email.validity.typeMismatch) {
      validationErrors.email = t("emailInvalid");
    }
    // A number input reports unparsable text as badInput with an empty value.
    const ageValue = age.value.trim();

    if (
      age.validity.badInput ||
      (ageValue !== "" && !POSITIVE_INTEGER.test(ageValue))
    ) {
      validationErrors.age = t("ageInvalid");
    }

    setErrors(validationErrors);
    setStatus("idle");

    if (validationErrors.email) {
      return email.focus();
    }
    if (validationErrors.age) {
      return age.focus();
    }

    const data = new FormData(form);

    submitting.current = true;
    setStatus("pending");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          name: data.get("name"),
          surname: data.get("surname"),
          email: data.get("email"),
          age: data.get("age"),
          website: data.get("website"),
        }),
      });

      if (response.ok) {
        setStatus("success");
        return;
      }

      // The browser checks should already have caught these; map any the server still rejects.
      const body: {fields?: string[]} | null = await response
        .json()
        .catch(() => null);

      if (response.status === 400 && body?.fields) {
        const serverErrors: FieldErrors = {};

        if (body.fields.includes("email")) {
          serverErrors.email = t("emailInvalid");
        }
        if (body.fields.includes("age")) {
          serverErrors.age = t("ageInvalid");
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
        <div className={styles.row}>
          <div className={styles.field}>
            <input
              id="newsletter2-name"
              className={styles.input}
              name="name"
              autoComplete="given-name"
              placeholder=" "
            />
            <label className={styles.label} htmlFor="newsletter2-name">
              {t("nameLabel")}
            </label>
          </div>
          <div className={styles.field}>
            <input
              id="newsletter2-surname"
              className={styles.input}
              name="surname"
              autoComplete="family-name"
              placeholder=" "
            />
            <label className={styles.label} htmlFor="newsletter2-surname">
              {t("surnameLabel")}
            </label>
          </div>
        </div>
        <div className={styles.emailRow}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <input
                ref={emailRef}
                id="newsletter2-email"
                className={styles.input}
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder=" "
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={
                  errors.email ? "newsletter2-email-error" : undefined
                }
              />
              <label className={styles.label} htmlFor="newsletter2-email">
                {t("emailLabel")}
                {/* Decorative: the input's `required` attribute is what assistive tech announces. */}
                <span aria-hidden="true"> *</span>
              </label>
            </div>
            {errors.email && (
              <p
                id="newsletter2-email-error"
                className={`${styles.error} type-caption`}
              >
                {errors.email}
              </p>
            )}
          </div>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <input
                ref={ageRef}
                id="newsletter2-age"
                className={styles.input}
                type="number"
                name="age"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder=" "
                aria-invalid={errors.age ? true : undefined}
                aria-describedby={
                  errors.age ? "newsletter2-age-error" : undefined
                }
              />
              <label className={styles.label} htmlFor="newsletter2-age">
                {t("ageLabel")}
              </label>
            </div>
            {errors.age && (
              <p
                id="newsletter2-age-error"
                className={`${styles.error} type-caption`}
              >
                {errors.age}
              </p>
            )}
          </div>
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
        <Button
          type="submit"
          className={styles.button}
          loading={status === "pending"}
          loadingLabel={t("submitting")}
        >
          {t("submit")}
        </Button>
        {/* Provisional notice wording until the final consent copy is confirmed. */}
        <p className={`${styles.notice} type-caption`}>{t("consentNotice")}</p>
        <div role="status" className={styles.status}>
          {status === "error" && <p className="type-body">{t("error")}</p>}
        </div>
      </form>
    </>
  );
}
