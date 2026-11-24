import {Suspense} from "react";
import {getLocale, getMessages, getTranslations} from "next-intl/server";
import {Link} from "../../../../../i18n/navigation";
import LoadingScreen from "@/app/components/loading-screen/LoadingScreen";
import {getOrder, type OrderAddress} from "@/lib/customer-account/customer";
import {loadAsCustomer} from "@/lib/customer-account/guard";
import {formatMoney} from "@/lib/shopify/money";
import {decodeOrderId} from "../../order-id";
import {getStatusLabel} from "../../order-status";
import styles from "../../account.module.scss";

// A query parameter, not a path segment: a static path keeps the shared header prerenderable.
type OrderPageProps = {searchParams: Promise<{id?: string | string[]}>};

async function OrderContent({searchParams}: OrderPageProps) {
  const t = await getTranslations("Account");
  const locale = await getLocale();
  const {id} = await searchParams;
  const encodedId = typeof id === "string" ? id : "";
  const orderId = decodeOrderId(encodedId);
  const order = orderId
    ? await loadAsCustomer(
        {locale, returnTo: `/account/orders/detail?id=${encodedId}`},
        (accessToken) => getOrder(accessToken, orderId),
      )
    : null;
  const backLink = (
    <Link href="/account/orders" className={`${styles.link} ${styles.backLink}`}>
      {t("backToOrders")}
    </Link>
  );

  // A malformed id, an unknown order and someone else's order all look the same on purpose.
  if (!order) {
    return (
      <div className={styles.empty}>
        <p className={styles.message}>{orderId ? t("loadError") : t("orderNotFound")}</p>
        {backLink}
      </div>
    );
  }

  const regionNames = new Intl.DisplayNames([locale], {type: "region"});
  const dateFormat = new Intl.DateTimeFormat(locale, {dateStyle: "long", timeZone: "Europe/Istanbul"});
  const labels = (await getMessages()).Account;
  const financial = getStatusLabel(labels.financialStatus, order.financialStatus);
  const fulfillment = getStatusLabel(labels.fulfillmentStatus, order.fulfillmentStatus);

  function renderAddress(heading: string, address: OrderAddress | null) {
    if (!address) {
      return null;
    }

    return (
      <div>
        <h3 className={`type-mono ${styles.sectionHeading}`}>{heading}</h3>
        <p className={styles.cardText}>
          {[
            address.name,
            address.address1,
            address.address2,
            `${address.zip} ${address.city}`.trim(),
            regionNames.of(address.countryCode) ?? address.countryCode,
          ]
            .filter(Boolean)
            .map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
        </p>
      </div>
    );
  }

  const hasShipping = Number(order.shipping?.amount) > 0;

  return (
    <section className={styles.section} aria-labelledby="order-heading">
      <div className={styles.orderToolbar}>
        {backLink}
        {order.statusPageUrl?.startsWith("https://") ? (
          <a href={order.statusPageUrl} className={`${styles.link} ${styles.externalLink}`} rel="noopener noreferrer">
            {t("statusPage")}
          </a>
        ) : null}
      </div>
      <h2 id="order-heading" className={styles.orderName}>{order.name}</h2>
      <dl className={styles.summary}>
        <div>
          <dt>{t("orderDate")}</dt>
          <dd>{dateFormat.format(new Date(order.processedAt))}</dd>
        </div>
        <div>
          <dt>{t("orderStatus")}</dt>
          <dd>{[financial, fulfillment].filter(Boolean).join(" · ")}</dd>
        </div>
      </dl>

      <h3 className={`type-mono ${styles.sectionHeading}`}>{t("orderItems")}</h3>
      <ul className={styles.lines}>
        {order.lines.map((line, index) => (
          <li key={`${line.title}-${index}`} className={styles.line}>
            <span>{line.title}</span>
            <span>{t("quantity")} {line.quantity}</span>
            <span>{formatMoney(line.total, locale)}</span>
          </li>
        ))}
      </ul>

      <dl className={styles.totals}>
        {/* Subtotal and shipping only add information when shipping is charged (e.g. printed issues). */}
        {order.subtotal && hasShipping ? (
          <>
            <dt>{t("subtotal")}</dt>
            <dd>{formatMoney(order.subtotal, locale)}</dd>
          </>
        ) : null}
        {order.shipping && hasShipping ? (
          <>
            <dt>{t("shipping")}</dt>
            <dd>{formatMoney(order.shipping, locale)}</dd>
          </>
        ) : null}
        <dt>{t("total")}</dt>
        <dd>{formatMoney(order.total, locale)}</dd>
      </dl>

      <div className={styles.addresses}>
        {renderAddress(t("shippingAddress"), order.shippingAddress)}
        {renderAddress(t("billingAddress"), order.billingAddress)}
      </div>
    </section>
  );
}

export default async function OrderPage({searchParams}: OrderPageProps) {
  const t = await getTranslations("Account");

  return (
    <Suspense fallback={<LoadingScreen label={t("loading")} />}>
      <OrderContent searchParams={searchParams} />
    </Suspense>
  );
}
