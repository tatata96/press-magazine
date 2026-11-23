import {Suspense} from "react";
import {getLocale, getMessages, getTranslations} from "next-intl/server";
import {Link} from "../../../../i18n/navigation";
import LoadingScreen from "@/app/components/loading-screen/LoadingScreen";
import {getOrders} from "@/lib/customer-account/customer";
import {loadAsCustomer} from "@/lib/customer-account/guard";
import {formatMoney} from "@/lib/shopify/money";
import {encodeOrderId} from "../order-id";
import {getStatusLabel} from "../order-status";
import styles from "../account.module.scss";

async function OrdersContent() {
  const t = await getTranslations("Account");
  const locale = await getLocale();
  const orders = await loadAsCustomer({locale, returnTo: "/account/orders"}, getOrders);

  if (!orders) {
    return <p role="alert" className={styles.message}>{t("loadError")}</p>;
  }

  if (orders.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.message}>{t("ordersEmpty")}</p>
        <Link href="/subscribe" className={styles.link}>{t("ordersShop")}</Link>
      </div>
    );
  }

  const {financialStatus: financialLabels} = (await getMessages()).Account;
  const dateFormat = new Intl.DateTimeFormat(locale, {dateStyle: "long", timeZone: "Europe/Istanbul"});

  return (
    <section className={styles.section} aria-labelledby="orders-heading">
      <h2 id="orders-heading" className={`type-mono ${styles.sectionHeading}`}>
        {t("ordersHeading")}
      </h2>
      <ul className={styles.orders} aria-label={t("ordersLabel")}>
        {orders.map((order) => (
          <li key={order.id} className={styles.order}>
            <p className={styles.orderName}>{order.name}</p>
            <p className={styles.orderMeta}>{dateFormat.format(new Date(order.processedAt))}</p>
            <p className={styles.orderMeta}>{getStatusLabel(financialLabels, order.financialStatus)}</p>
            <p className={styles.orderMeta}>{formatMoney(order.total, locale)}</p>
            <Link href={`/account/orders/detail?id=${encodeOrderId(order.id)}`} className={styles.link}>
              {t("viewOrder")}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function OrdersPage() {
  const t = await getTranslations("Account");

  return (
    <Suspense fallback={<LoadingScreen label={t("loading")} />}>
      <OrdersContent />
    </Suspense>
  );
}
