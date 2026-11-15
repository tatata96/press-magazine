"use client";

import {useEffect, useId, useRef, useState} from "react";
import type {ReactNode} from "react";
import {useLocale, useTranslations} from "next-intl";
import Button from "@/app/components/button/Button";
import type {LegalDocumentKey} from "@/app/components/legal-document/documents";
import LegalModal from "@/app/components/legal-modal/LegalModal";
import {useRouter} from "../../../i18n/navigation";
import {proceedToCheckout} from "./actions";
import type {PreparedCheckout} from "./build-agreement-data";
import AgreementEn from "@/app/components/legal-document/distance-sales-agreement/AgreementEn";
import AgreementTr from "@/app/components/legal-document/distance-sales-agreement/AgreementTr";
import PreInformationEn from "@/app/components/legal-document/pre-information/PreInformationEn";
import PreInformationTr from "@/app/components/legal-document/pre-information/PreInformationTr";
import LoadingScreen from "@/app/components/loading-screen/LoadingScreen";
import styles from "./cart.module.scss";

type CheckoutConsentProps = {
  initialCheckout: PreparedCheckout | null;
  cartVersion: string;
  detailsRevision: number;
  getDetailsSignature: () => string;
  prepareCheckout: () => Promise<PreparedCheckout | null>;
  paymentMethods: ReactNode;
};

type CheckoutError =
  | "consent_required"
  | "empty_cart"
  | "needs_details"
  | "agreement_changed"
  | "unavailable"
  | "failed";

// Consent gate before leaving for Shopify's hosted checkout. The disabled button is only
// a convenience: proceedToCheckout re-checks consent and records it on the cart.
export default function CheckoutConsent({
  initialCheckout,
  cartVersion,
  detailsRevision,
  getDetailsSignature,
  prepareCheckout,
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
    revision: number;
  } | null>(initialCheckout ? {checkout: initialCheckout, revision: 0} : null);
  const [accepted, setAccepted] = useState<{
    cartVersion: string;
    detailsSignature: string;
    revision: number;
  } | null>(null);
  const currentCheckout = prepared?.revision === detailsRevision &&
    prepared.checkout.cartVersion === cartVersion ? prepared.checkout : null;
  const hasConsent = accepted?.revision === detailsRevision &&
    accepted.cartVersion === cartVersion;
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

  async function prepareCurrentCheckout() {
    const checkout = await prepareCheckout();

    if (checkout) {
      setPrepared({checkout, revision: detailsRevision});
    }

    return checkout;
  }

  function handleConsent(checked: boolean) {
    if (busyRef.current) {
      return;
    }

    setError(null);
    // Acceptance is a local interaction. Saving and refreshing the page here can
    // invalidate that very interaction before the checkbox becomes checked.
    setAccepted(checked ? {
      cartVersion,
      detailsSignature: getDetailsSignature(),
      revision: detailsRevision,
    } : null);
  }

  async function openLegalDocument(key: LegalDocumentKey) {
    if (busyRef.current) {
      return;
    }

    busyRef.current = true;

    try {
      if (await prepareCurrentCheckout()) {
        setOpenDocument(key);
      }
    } finally {
      busyRef.current = false;
    }
  }

  async function handleCheckout() {
    if (!hasConsent || !accepted || busyRef.current) {
      return;
    }

    // Autofill may change fields without firing a React change event.
    if (getDetailsSignature() !== accepted.detailsSignature) {
      setAccepted(null);
      setError("agreement_changed");

      return;
    }

    busyRef.current = true;
    setError(null);
    setIsRedirecting(true);

    try {
      // Recheck the form too: browser autofill can change values without a change event.
      const checkout = await prepareCurrentCheckout();

      if (!checkout) {
        setAccepted(null);
        setIsRedirecting(false);

        return;
      }

      if (
        checkout.cartVersion !== accepted.cartVersion ||
        getDetailsSignature() !== accepted.detailsSignature
      ) {
        setAccepted(null);
        setError("agreement_changed");
        setIsRedirecting(false);

        return;
      }

      const result = await proceedToCheckout(checkout.fingerprint);

      if (result.ok) {
        window.location.assign(result.checkoutUrl);

        return;
      }

      setIsRedirecting(false);
      setAccepted(null);
      setError(result.error);

      if (result.error === "agreement_changed" || result.error === "needs_details") {
        router.refresh();
      }
    } catch {
      setIsRedirecting(false);
      setError("failed");
    } finally {
      busyRef.current = false;
    }
  }

  const documents: Record<LegalDocumentKey, ReactNode> | null = currentCheckout ? {
    distanceSalesAgreement: locale === "en"
      ? <AgreementEn data={currentCheckout.data} />
      : <AgreementTr data={currentCheckout.data} />,
    preInformation: locale === "en"
      ? <PreInformationEn data={currentCheckout.data} />
      : <PreInformationTr data={currentCheckout.data} />,
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
          type="submit"
          className={styles.checkoutButton}
          disabled={!hasConsent}
          loading={isRedirecting}
          loadingLabel={t("redirecting")}
          onClick={handleCheckout}
        >
          {t("checkout")}
        </Button>
      </div>

      {error ? (
        <p role="alert" className={styles.message}>
          {error === "consent_required"
            ? t("consentRequired")
            : error === "empty_cart"
              ? t("checkoutEmpty")
              : error === "agreement_changed"
                ? t("agreementChanged")
                : error === "needs_details"
                  ? t("needsDetails")
                  : error === "unavailable"
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
