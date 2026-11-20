"use client";

import {useState, useTransition} from "react";
import type {FormEvent} from "react";
import {useLocale, useTranslations} from "next-intl";
import Button from "@/app/components/button/Button";
import TextField from "@/app/components/text-field/TextField";
import {redirectForAuthError} from "../cart/auth-redirect";
import type {FormErrors} from "../buyer-details/buyer-details";
import {updateName} from "./actions";
import styles from "./account.module.scss";

type ProfileFormProps = {firstName: string; lastName: string};

export default function ProfileForm({firstName, lastName}: ProfileFormProps) {
  const t = useTranslations("Account");
  const locale = useLocale();
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [outcome, setOutcome] = useState<"saved" | "error" | null>(null);
  const [isSaving, startSaving] = useTransition();

  function errorText(field: "firstName" | "lastName"): string | undefined {
    const code = errors[field];

    return code ? t(code === "required" ? "required" : "invalid") : undefined;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setErrors({});
    setOutcome(null);

    startSaving(async () => {
      const result = await updateName(formData);

      if (result.ok) {
        setIsEditing(false);
        setOutcome("saved");

        return;
      }

      if (result.error === "invalid" && result.errors) {
        setErrors(result.errors);
      } else if (!redirectForAuthError(result.error, {locale, returnTo: "/account"})) {
        setOutcome("error");
      }
    });
  }

  if (!isEditing) {
    return (
      <>
        <button type="button" className={styles.textButton} onClick={() => setIsEditing(true)}>
          {t("editName")}
        </button>
        {outcome === "saved" ? <p role="status" className={styles.success}>{t("saved")}</p> : null}
      </>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
      <div className={styles.actions}>
        <Button type="submit" loading={isSaving} loadingLabel={t("saving")}>
          {t("saveName")}
        </Button>
        <button type="button" className={styles.textButton} onClick={() => setIsEditing(false)}>
          {t("cancel")}
        </button>
      </div>
      {outcome === "error" ? <p role="alert" className={styles.message}>{t("saveError")}</p> : null}
    </form>
  );
}
