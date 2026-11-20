"use client";

import {useState, useTransition} from "react";
import type {FormEvent} from "react";
import {useLocale, useTranslations} from "next-intl";
import AddressFields, {type AddressFieldValues} from "@/app/components/address-fields/AddressFields";
import Button from "@/app/components/button/Button";
import {redirectForAuthError} from "../cart/auth-redirect";
import type {FormErrors} from "../buyer-details/buyer-details";
import {
  addAddress,
  editAddress,
  makeDefaultAddress,
  removeAddress,
  type AccountActionResult,
} from "./actions";
import styles from "./account.module.scss";

export type BookAddress = {
  id: string;
  /** Readable lines, already formatted for the locale. */
  lines: string[];
  isDefault: boolean;
  values: AddressFieldValues;
};

type AddressBookProps = {
  addresses: BookAddress[];
  countries: {code: string; name: string}[];
};

// The customer's saved addresses. Every change goes through a Server Action that checks the
// session and the input again; the list itself is whatever Shopify returns after it.
export default function AddressBook({addresses, countries}: AddressBookProps) {
  const t = useTranslations("Account");
  const locale = useLocale();
  // An address id while editing it, "new" while adding, null otherwise.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [failure, setFailure] = useState<"address" | "action" | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(
    action: () => Promise<AccountActionResult>,
    onDone: () => void,
    failureKind: "address" | "action",
  ) {
    setErrors({});
    setFailure(null);

    startTransition(async () => {
      const result = await action();

      if (result.ok) {
        onDone();

        return;
      }

      if (result.error === "invalid" && result.errors) {
        setErrors(result.errors);
      } else if (!redirectForAuthError(result.error, {locale, returnTo: "/account/addresses"})) {
        setFailure(failureKind);
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const id = editingId;

    run(
      () => (id === "new" || id === null ? addAddress(formData) : editAddress(id, formData)),
      () => setEditingId(null),
      "address",
    );
  }

  function renderForm(id: string, values?: AddressFieldValues) {
    return (
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <AddressFields countries={countries} defaults={values} errors={errors} />
        <div className={styles.actions}>
          <Button type="submit" loading={isPending} loadingLabel={t("saving")}>
            {t("saveAddress")}
          </Button>
          <button type="button" className={styles.textButton} onClick={() => setEditingId(null)}>
            {t("cancel")}
          </button>
        </div>
        {failure === "address" && editingId === id ? (
          <p role="alert" className={styles.message}>{t("addressError")}</p>
        ) : null}
      </form>
    );
  }

  return (
    <div className={styles.section} aria-busy={isPending}>
      {addresses.length === 0 && editingId !== "new" ? (
        <p className={styles.message}>{t("addressesEmpty")}</p>
      ) : null}

      <ul className={styles.cards}>
        {addresses.map((address) => (
          <li key={address.id} className={styles.card}>
            {editingId === address.id ? (
              renderForm(address.id, address.values)
            ) : (
              <>
                <p className={styles.cardText}>
                  {address.lines.map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
                {address.isDefault ? <p className={styles.badge}>{t("defaultBadge")}</p> : null}
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.textButton}
                    disabled={isPending}
                    onClick={() => {
                      setErrors({});
                      setFailure(null);
                      setConfirmingId(null);
                      setEditingId(address.id);
                    }}
                  >
                    {t("edit")}
                  </button>
                  {address.isDefault ? null : (
                    <button
                      type="button"
                      className={styles.textButton}
                      disabled={isPending}
                      onClick={() => run(() => makeDefaultAddress(address.id), () => undefined, "action")}
                    >
                      {t("makeDefault")}
                    </button>
                  )}
                  {confirmingId === address.id ? (
                    <>
                      <button
                        type="button"
                        className={styles.textButton}
                        disabled={isPending}
                        onClick={() =>
                          run(() => removeAddress(address.id), () => setConfirmingId(null), "action")
                        }
                      >
                        {t("confirmDelete")}
                      </button>
                      <button
                        type="button"
                        className={styles.textButton}
                        onClick={() => setConfirmingId(null)}
                      >
                        {t("cancel")}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className={styles.textButton}
                      disabled={isPending}
                      onClick={() => setConfirmingId(address.id)}
                    >
                      {t("delete")}
                    </button>
                  )}
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {editingId === "new" ? (
        renderForm("new")
      ) : (
        <button
          type="button"
          className={styles.textButton}
          onClick={() => {
            setErrors({});
            setFailure(null);
            setEditingId("new");
          }}
        >
          {t("addAddress")}
        </button>
      )}

      {failure === "action" ? <p role="alert" className={styles.message}>{t("actionError")}</p> : null}
    </div>
  );
}
