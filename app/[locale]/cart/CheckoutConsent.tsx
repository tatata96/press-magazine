"use client";

import {useEffect, useId, useState} from "react";
import type {ReactNode} from "react";
import {useTranslations} from "next-intl";
import Button from "@/app/components/button/Button";
import type {LegalDocumentKey} from "@/app/components/legal-document/documents";
import LegalModal from "@/app/components/legal-modal/LegalModal";
import {proceedToCheckout} from "./actions";
import styles from "./cart.module.scss";

type CheckoutConsentProps = {
  /** Server-rendered document text, shared with the standalone legal pages. */
  documents: Record<LegalDocumentKey, ReactNode>;
};

type CheckoutError = "consent_required" | "empty_cart" | "failed";

// Consent gate before leaving for Shopify's hosted checkout. The disabled button is only
// a convenience: proceedToCheckout re-checks consent and records it on the cart.
export default function CheckoutConsent({documents}: CheckoutConsentProps) {
  const t = useTranslations("CartPage");
  const legalT = useTranslations("LegalDocuments");
  const checkboxId = useId();
  const [hasConsent, setHasConsent] = useState(false);
  const [openDocument, setOpenDocument] = useState<LegalDocumentKey | null>(
    null,
  );
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<CheckoutError | null>(null);

  // Coming back from checkout with the browser's back button restores this page from
  // the bfcache with the redirect still "in progress".
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        setIsRedirecting(false);
      }
    }

    window.addEventListener("pageshow", handlePageShow);

    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  async function handleCheckout() {
    setError(null);
    setIsRedirecting(true);

    const result = await proceedToCheckout(hasConsent);

    if (result.ok) {
      window.location.assign(result.checkoutUrl);

      return;
    }

    setIsRedirecting(false);
    setError(result.error);
  }

  // Rich-text renderer for a document name inside the consent label.
  function renderDocumentLink(key: LegalDocumentKey, chunks: ReactNode) {
    return (
      <button
        type="button"
        className={styles.documentLink}
        onClick={() => setOpenDocument(key)}
      >
        {chunks}
      </button>
    );
  }

  return (
    <div className={styles.checkout}>
      <div className={styles.consent}>
        <input
          id={checkboxId}
          type="checkbox"
          className={styles.checkbox}
          checked={hasConsent}
          onChange={(event) => setHasConsent(event.target.checked)}
        />
        <label htmlFor={checkboxId} className={styles.consentLabel}>
          {t.rich("consentLabel", {
            distanceSalesAgreement: (chunks) =>
              renderDocumentLink("distanceSalesAgreement", chunks),
            preInformation: (chunks) =>
              renderDocumentLink("preInformation", chunks),
          })}
        </label>
      </div>

      <Button
        className={styles.checkoutButton}
        disabled={!hasConsent}
        loading={isRedirecting}
        loadingLabel={t("redirecting")}
        onClick={handleCheckout}
      >
        {t("checkout")}
      </Button>

      {error ? (
        <p role="alert" className={styles.message}>
          {error === "consent_required"
            ? t("consentRequired")
            : error === "empty_cart"
              ? t("checkoutEmpty")
              : t("checkoutError")}
        </p>
      ) : null}

      {(Object.keys(documents) as LegalDocumentKey[]).map((key) => (
        <LegalModal
          key={key}
          isOpen={openDocument === key}
          title={legalT(`${key}.title`)}
          closeLabel={legalT("close")}
          onClose={() =>
            setOpenDocument((current) => (current === key ? null : current))
          }
        >
          {documents[key]}
        </LegalModal>
      ))}
    </div>
  );
}
