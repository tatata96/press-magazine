import Image from "next/image";
import { getTranslations } from "next-intl/server";
import CoverSheen from "./CoverSheen";
import styles from "./cover.module.scss";

export default async function Cover() {
  const t = await getTranslations("Cover");

  return (
    <CoverSheen>
      <figure className={styles.cover}>
        <Image
          src="/images/newsletter/newsletter-11.jpg"
          alt={t("alt")}
          width={2599}
          height={3544}
          sizes="(min-width: 768px) 480px, 80vw"
          priority
        />
      </figure>
    </CoverSheen>
  );
}
