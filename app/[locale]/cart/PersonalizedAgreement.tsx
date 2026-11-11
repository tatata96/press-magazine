import {getLocale, getTranslations} from "next-intl/server";
import LegalDocument from "@/app/components/legal-document/LegalDocument";
import styles from "@/app/components/legal-document/legal-document.module.scss";
import {formatMoney} from "@/lib/shopify/money";
import type {PostalAddress} from "../buyer-details/buyer-details";
import type {AgreementSnapshot} from "./checkout-state";

function AddressLines({address, countryName}: {address: PostalAddress; countryName: string}) {
  return (
    <>
      {[address.address1, address.address2, `${address.zip} ${address.city}`, countryName]
        .filter(Boolean)
        .map((line) => (
          <span key={line} className={styles.block}>
            {line}
          </span>
        ))}
    </>
  );
}

// The buyer's own details and order, followed by the shared legal text. The clauses are
// the same placeholder text as the standalone page; only the parts below are generated.
export default async function PersonalizedAgreement({
  snapshot,
}: {
  snapshot: AgreementSnapshot;
}) {
  const t = await getTranslations("Agreement");
  const locale = await getLocale();
  const {buyer} = snapshot;
  const countryName =
    new Intl.DisplayNames([locale], {type: "region"}).of(buyer.countryCode) ??
    buyer.countryCode;
  // "Same as delivery" resolves to the delivery address here, so the agreement always
  // names a concrete billing address.
  const billingAddress = buyer.billingAddress ?? buyer.shippingAddress;

  return (
    <div className={styles.document}>
      <section>
        <h2 className={styles.sectionHeading}>{t("sellerHeading")}</h2>
        <p className={styles.sectionBody}>{t("sellerPlaceholder")}</p>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>{t("buyerHeading")}</h2>
        <p className={styles.sectionBody}>
          <span className={styles.block}>
            {buyer.firstName} {buyer.lastName}
          </span>
          <span className={styles.block}>{buyer.email}</span>
          <span className={styles.block}>{buyer.phone}</span>
        </p>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>{t("deliveryHeading")}</h2>
        <p className={styles.sectionBody}>
          <strong>{t("deliveryAddress")}</strong>
          {buyer.shippingAddress ? (
            <AddressLines address={buyer.shippingAddress} countryName={countryName} />
          ) : (
            <span className={styles.block}>{t("digitalDelivery")}</span>
          )}
        </p>
        {billingAddress ? (
          <p className={styles.sectionBody}>
            <strong>{t("billingAddress")}</strong>
            <AddressLines address={billingAddress} countryName={countryName} />
          </p>
        ) : null}
      </section>

      <section>
        <h2 className={styles.sectionHeading}>{t("orderHeading")}</h2>
        <ul className={styles.orderList}>
          {snapshot.lines.map((line) => (
            <li key={line.title} className={styles.orderLine}>
              <span>
                {line.title} × {line.quantity}
              </span>
              <span>{formatMoney(line.totalPrice, locale)}</span>
            </li>
          ))}
          {snapshot.delivery ? (
            <li className={styles.orderLine}>
              <span>{t("delivery", {option: snapshot.delivery.title})}</span>
              <span>{formatMoney(snapshot.delivery.cost, locale)}</span>
            </li>
          ) : null}
          <li className={`${styles.orderLine} ${styles.orderTotal}`}>
            <span>{t("total")}</span>
            <span>{formatMoney(snapshot.total, locale)}</span>
          </li>
        </ul>
        <p className={styles.sectionBody}>{t("taxesPlaceholder")}</p>
        <p className={`type-mono ${styles.notice}`}>{t("estimateNote")}</p>
      </section>

      <LegalDocument documentKey="distanceSalesAgreement" />
    </div>
  );
}
