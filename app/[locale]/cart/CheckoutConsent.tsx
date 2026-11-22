"use client";

import {useEffect, useId, useRef, useState} from "react";
import type {ReactNode} from "react";
import {useLocale, useTranslations} from "next-intl";
import Button from "@/app/components/button/Button";
import type {LegalDocumentKey} from "@/app/components/legal-document/documents";
import LegalModal from "@/app/components/legal-modal/LegalModal";
import {useRouter} from "../../../i18n/navigation";
import type {CheckoutActionError, CheckoutActionResult} from "./actions";
import {redirectForAuthError} from "./auth-redirect";
import type {PreparedCheckout} from "./build-agreement-data";
import AgreementEn from "@/app/components/legal-document/distance-sales-agreement/AgreementEn";
import AgreementTr from "@/app/components/legal-document/distance-sales-agreement/AgreementTr";
import PreInformationEn from "@/app/components/legal-document/pre-information/PreInformationEn";
import PreInformationTr from "@/app/components/legal-document/pre-information/PreInformationTr";
import LoadingScreen from "@/app/components/loading-screen/LoadingScreen";
import styles from "./cart.module.scss";

type CheckoutConsentProps = {
  cartVersion: string;
  /** Changes whenever anything the buyer chose changes, which invalidates the agreements and consent. */
  detailsKey: string;
  prepareCheckout: () => Promise<PreparedCheckout | null>;
  proceed: (acceptedFingerprint: string) => Promise<CheckoutActionResult>;
  paymentMethods: ReactNode;
};

type CheckoutError = Exclude<CheckoutActionError, "login_required" | "session_expired">;

// Consent gate before leaving for Shopify's hosted checkout. The disabled button is only
// a convenience: proceedToCheckout re-checks consent and records it on the cart.
export default function CheckoutConsent({
  cartVersion,
  detailsKey,
  prepareCheckout,
  proceed,
  paymentMethods,
}: CheckoutConsentProps) {
  const t = useTranslations("CartPage");
  const legalT = useTranslations("LegalDocuments");
  const checkboxId = useId();
  const router = useRouter();
  const locale = useLocale();
  const busyRef = useRef(false);
  const [prepared, setPrepared] = useState<{
    checkout: PreparedCheckout;
    detailsKey: string;
  } | null>(null);
  const [acceptedFingerprint, setAcceptedFingerprint] = useState<string | null>(null);
  // The prepared agreements only count while nothing they were built from has changed.
  const current = prepared?.detailsKey === detailsKey &&
    prepared.checkout.cartVersion === cartVersion ? prepared : null;
  const hasConsent = current !== null && acceptedFingerprint === current.checkout.fingerprint;
  const [openDocument, setOpenDocument] = useState<LegalDocumentKey | null>(
    null,
  );
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<CheckoutError | null>(null);
  const checkoutError = error ?? (acceptedFingerprint && !hasConsent ? "agreement_changed" : null);

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

  // The agreements are built from the buyer's details, and consent is recorded against their
  // fingerprint. Ticking the box therefore prepares them in the background when needed, so the
  // box is usable at any time and the buyer never has to open a document first.
  async function handleConsent(checked: boolean) {
    if (busyRef.current) {
      return;
    }

    setError(null);

    if (!checked) {
      setAcceptedFingerprint(null);

      return;
    }

    if (current) {
      setAcceptedFingerprint(current.checkout.fingerprint);

      return;
    }

    busyRef.current = true;
    setPrepared(null);
    setAcceptedFingerprint(null);

    try {
      // Null when the details are incomplete or preparing failed; the form shows what is
      // missing and the box stays unticked.
      const checkout = await prepareCheckout();

      if (checkout) {
        setPrepared({checkout, detailsKey});
        setAcceptedFingerprint(checkout.fingerprint);
      }
    } catch {
      setError("failed");
    } finally {
      busyRef.current = false;
    }
  }

  async function openLegalDocument(key: LegalDocumentKey) {
    if (busyRef.current) {
      return;
    }

    if (current) {
      setOpenDocument(key);

      return;
    }

    busyRef.current = true;
    setPrepared(null);
    setOpenDocument(null);
    setAcceptedFingerprint(null);
    setError(acceptedFingerprint ? "agreement_changed" : null);

    try {
      const checkout = await prepareCheckout();

      if (checkout) {
        // Keyed by the details it was built for: if they changed meanwhile, it is not current.
        setPrepared({checkout, detailsKey});
        setOpenDocument(key);
      }
    } catch {
      setError("failed");
    } finally {
      busyRef.current = false;
    }
  }

  async function handleCheckout() {
    if (!hasConsent || !current || busyRef.current) {
      return;
    }

    busyRef.current = true;
    setError(null);
    setIsRedirecting(true);

    try {
      const result = await proceed(current.checkout.fingerprint);

      if (result.ok) {
        window.location.assign(result.checkoutUrl);

        return;
      }

      // Not signed in (any more): the auth routes bring the buyer back to this page.
      if (redirectForAuthError(result.error, {locale})) {
        return;
      }

      const failure = result.error as CheckoutError;

      setIsRedirecting(false);
      setError(failure);

      if (failure === "agreement_changed" || failure === "invalid_details") {
        setPrepared(null);
        setAcceptedFingerprint(null);
        router.refresh();
      }
    } catch {
      setIsRedirecting(false);
      setError("failed");
    } finally {
      busyRef.current = false;
    }
  }

  const documents: Record<LegalDocumentKey, ReactNode> | null = current ? {
    distanceSalesAgreement: locale === "en"
      ? <AgreementEn data={current.checkout.data} />
      : <AgreementTr data={current.checkout.data} />,
    preInformation: locale === "en"
      ? <PreInformationEn data={current.checkout.data} />
      : <PreInformationTr data={current.checkout.data} />,
  } : null;

  // Rich-text renderer for a document name inside the consent label.
  function renderDocumentLink(key: LegalDocumentKey, chunks: ReactNode) {
    return (
      <button
        type="button"
        className={styles.documentLink}
        onClick={() => openLegalDocument(key)}
      >
        {chunks}
      </button>
    );
  }

  return (
    <div className={styles.checkout}>
      {isRedirecting ? <LoadingScreen label={t("redirecting")} /> : null}
      <div className={styles.consent}>
        <input
          id={checkboxId}
          type="checkbox"
          className={styles.checkbox}
          checked={hasConsent}
          onChange={(event) => handleConsent(event.target.checked)}
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

      <div className={styles.checkoutActions}>
        {paymentMethods}
        <Button
          className={styles.checkoutButton}
          disabled={!hasConsent}
          loading={isRedirecting}
          loadingLabel={t("redirecting")}
          onClick={handleCheckout}
        >
          {t("checkout")}
        </Button>
      </div>

      {checkoutError ? (
        <p role="alert" className={styles.message}>
          {checkoutError === "consent_required"
            ? t("consentRequired")
            : checkoutError === "empty_cart"
              ? t("checkoutEmpty")
              : checkoutError === "agreement_changed"
                ? t("agreementChanged")
                : checkoutError === "invalid_details"
                  ? t("needsDetails")
                  : checkoutError === "unavailable"
                    ? t("checkoutUnavailable")
                    : t("checkoutError")}
        </p>
      ) : null}

      {documents ? (Object.keys(documents) as LegalDocumentKey[]).map((key) => (
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
      )) : null}
    </div>
  );
}
