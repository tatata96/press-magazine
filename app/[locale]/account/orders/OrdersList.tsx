import {getTranslations} from "next-intl/server";
import {Link} from "../../../../i18n/navigation";
import styles from "../account.module.scss";

export type OrderRow = {
  id: string;
  name: string;
  date: string;
  status: string | null;
  total: string;
  href: string;
};

// Presentation only: rows arrive already formatted, so the real page and the dev mock share it.
export default async function OrdersList({orders}: {orders: OrderRow[]}) {
  const t = await getTranslations("Account");

  return (
    <section className={styles.section} aria-labelledby="orders-heading">
      <h2 id="orders-heading" className={`type-mono ${styles.sectionHeading}`}>
        {t("ordersHeading")}
      </h2>
      <ul className={styles.orders} aria-label={t("ordersLabel")}>
        {orders.map((order) => (
          <li key={order.id} className={styles.order}>
            <p className={styles.orderName}>{order.name}</p>
            <p className={styles.orderMeta}>{order.date}</p>
            <p className={styles.orderMeta}>{order.status}</p>
            <p className={`${styles.orderMeta} ${styles.orderTotal}`}>{order.total}</p>
            <Link href={order.href} className={`${styles.link} ${styles.orderLink}`}>
              {t("viewOrder")}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
