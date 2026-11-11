import Image from "next/image";
import {getLocale, getTranslations} from "next-intl/server";
import styles from "./cart.module.scss";

// The iyzico badge is language-specific; Turkish uses "iyzico ile Öde", everything else
// uses "Pay with iyzico".
const iyzicoBadges = {
  tr: {src: "/images/iyzico_ile_ode_colored_horizontal.png", width: 1050, height: 155},
  default: {src: "/images/pay_with_iyzico_colored.png", width: 1050, height: 360},
};

export default async function PaymentMethods() {
  const t = await getTranslations("CartPage");
  const locale = await getLocale();
  const iyzico = locale === "tr" ? iyzicoBadges.tr : iyzicoBadges.default;

  return (
    <ul className={styles.paymentMethods} aria-label={t("paymentMethods")}>
      <li className={styles.iyzicoItem}>
        <Image
          src={iyzico.src}
          width={iyzico.width}
          height={iyzico.height}
          alt="iyzico"
          className={styles.iyzicoBadge}
        />
      </li>
      <li className={styles.cardRow}>
        <Image src="/images/visa.png" width={300} height={300} alt="Visa" className={styles.cardBadge} />
        <Image src="/images/mastercard-symbol.png" width={107} height={76} alt="Mastercard" className={styles.cardBadge} />
      </li>
    </ul>
  );
}
