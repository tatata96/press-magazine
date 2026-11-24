"use client";

import {useEffect, useId, useRef, useState} from "react";
import type {ReactNode} from "react";
import {useLocale, useTranslations} from "next-intl";
import Button from "@/app/components/button/Button";
import type {LegalDocumentKey} from "@/app/components/legal-document/documents";
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
  /** Changes whenever anything the buyer chose changes, which invalidates the agreements and consent. */
  detailsKey: string;
  prepareCheckout: (options?: {silent?: boolean}) => Promise<PreparedCheckout | null>;
  proceed: (acceptedFingerprint: string) => Promise<CheckoutActionResult>;
  paymentMethods: ReactNode;
};

type CheckoutError = Exclude<CheckoutActionError, "login_required" | "session_expired">;

// Consent gate before leaving for Shopify's hosted checkout. The disabled button is only
// a convenience: proceedToCheckout re-checks consent and records it on the cart.
export default function CheckoutConsent({
  detailsKey,
  prepareCheckout,
  proceed,
  paymentMethods,
}: CheckoutConsentProps) {
  const t = useTranslations("CartPage");
  const legalT = useTranslations("LegalDocuments");
  const checkboxId = useId();
  const documentTitleId = useId();
  const router = useRouter();
  const locale = useLocale();
  const busyRef = useRef(false);
  const [prepared, setPrepared] = useState<{
    checkout: PreparedCheckout;
    detailsKey: string;
  } | null>(null);
  const [acceptedFingerprint, setAcceptedFingerprint] = useState<string | null>(null);
  // The prepared agreements only count while the buyer's details are unchanged. The cart is
  // deliberately not compared: preparing writes the address onto it, which changes delivery
  // and total, so the page's earlier cart reading would never match. The server fingerprint
  // covers the cart and is re-checked in proceedToCheckout.
  const current = prepared?.detailsKey === detailsKey ? prepared : null;
  const hasConsent = current !== null && acceptedFingerprint === current.checkout.fingerprint;
  const [openDocument, setOpenDocument] = useState<LegalDocumentKey | null>(
    null,
  );
  const [isRedirecting, setIsRedirecting] = useState(false);
  // Ticked by the buyer while the agreements are still being prepared; shown as ticked at once.
  const [isConsenting, setIsConsenting] = useState(false);
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

  // Prepare the agreements in the background as soon as the details are known, so opening
  // a document or ticking the box is instant. If this fails or is still running, the
  // explicit action below prepares again and shows the loader and any error.
  useEffect(() => {
    let cancelled = false;

    prepareCheckout({silent: true})
      .then((checkout) => {
        if (checkout && !cancelled) {
          setPrepared((existing) =>
            existing?.detailsKey === detailsKey ? existing : {checkout, detailsKey},
          );
        }
      })
      .catch(() => {
        // Intentionally quiet: the buyer has not asked for anything yet.
      });

    return () => {
      cancelled = true;
    };
    // prepareCheckout is recreated every render; the details key is what invalidates it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailsKey]);

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
    setIsConsenting(true);
    setPrepared(null);
    setAcceptedFingerprint(null);

    try {
      // Silent: a checkbox click should not cover the page with a loader. Null when the
      // details are incomplete or preparing failed; the form shows what is missing and the
      // box goes back to unticked.
      const checkout = await prepareCheckout({silent: true});

      if (checkout) {
        setPrepared({checkout, detailsKey});
        setAcceptedFingerprint(checkout.fingerprint);
      }
    } catch {
      setError("failed");
    } finally {
      busyRef.current = false;
      setIsConsenting(false);
    }
  }

  async function openLegalDocument(key: LegalDocumentKey) {
    if (busyRef.current) {
      return;
    }

    if (current) {
      setOpenDocument((open) => (open === key ? null : key));

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
          checked={hasConsent || isConsenting}
          aria-busy={isConsenting}
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

      {documents && openDocument ? (
        <section
          className={styles.document}
          aria-labelledby={documentTitleId}
        >
          <h2 id={documentTitleId} className={styles.documentTitle}>
            {legalT(`${openDocument}.title`)}
          </h2>
          {/* Focusable so keyboard users can scroll the text. */}
          <div className={styles.documentBody} tabIndex={0}>
            {documents[openDocument]}
          </div>
        </section>
      ) : null}
    </div>
  );
}
