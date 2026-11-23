"use client";

import {useState, useTransition} from "react";
import type {FormEvent} from "react";
import {useLocale, useTranslations} from "next-intl";
import Button from "@/app/components/button/Button";
import TextField from "@/app/components/text-field/TextField";
import {redirectForAuthError} from "../cart/auth-redirect";
import type {FormErrors} from "../buyer-details/buyer-details";
import {isValidPhone, normalizePhone} from "../buyer-details/checkout-selection";
import {savePhone, updateName} from "./actions";
import styles from "./account.module.scss";

type ProfileFormProps = {firstName: string; lastName: string; phone: string; email: string};

// The details are always editable in place: no separate "edit" step. Email is the sign-in
// identity and is shown read-only.
export default function ProfileForm({firstName, lastName, phone, email}: ProfileFormProps) {
  const t = useTranslations("Account");
  const detailsT = useTranslations("BuyerDetails");
  const locale = useLocale();
  const [errors, setErrors] = useState<FormErrors>({});
  const [outcome, setOutcome] = useState<"saved" | "error" | null>(null);
  const [isSaving, startSaving] = useTransition();

  function errorText(field: "firstName" | "lastName" | "phone"): string | undefined {
    const code = errors[field];

    if (field === "phone" && code) {
      return detailsT("phoneInvalid");
    }

    return code ? t(code === "required" ? "required" : "invalid") : undefined;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    // An empty phone leaves the stored one as it is: the field cannot clear it.
    const nextPhone = normalizePhone(String(formData.get("phone") ?? ""));
    const savesPhone = nextPhone !== "" && nextPhone !== normalizePhone(phone);

    setErrors({});
    setOutcome(null);

    if (savesPhone && !isValidPhone(nextPhone)) {
      setErrors({phone: "invalid"});

      return;
    }

    startSaving(async () => {
      const steps: (() => ReturnType<typeof updateName>)[] = [
        () => updateName(formData),
        ...(savesPhone ? [() => savePhone(nextPhone)] : []),
      ];

      for (const step of steps) {
        const result = await step();

        if (result.ok) {
          continue;
        }

        if (result.error === "invalid" && result.errors) {
          setErrors(result.errors);
        } else if (!redirectForAuthError(result.error, {locale, returnTo: "/account"})) {
          setOutcome("error");
        }

        return;
      }

      setOutcome("saved");
    });
  }

  return (
    // Keyed by the saved values so the fields show what Shopify now holds after a save.
    <form
      key={`${firstName}|${lastName}|${phone}`}
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
    >
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
        label={t("email")}
        type="email"
        defaultValue={email}
        helperText={t("emailNote")}
        autoComplete="email"
        disabled
      />
      <TextField
        name="phone"
        type="tel"
        label={t("phone")}
        helperText={detailsT("phoneHelper")}
        autoComplete="tel"
        defaultValue={phone}
        error={errorText("phone")}
      />
      <div className={styles.formActions}>
        <Button type="submit" loading={isSaving} loadingLabel={t("saving")}>
          {t("save")}
        </Button>
      </div>
      {outcome === "saved" ? <p role="status" className={styles.success}>{t("saved")}</p> : null}
      {outcome === "error" ? <p role="alert" className={styles.message}>{t("saveError")}</p> : null}
    </form>
  );
}
