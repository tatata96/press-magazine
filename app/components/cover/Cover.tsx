import Image from "next/image";
import { getTranslations } from "next-intl/server";
import styles from "./cover.module.scss";

export default async function Cover() {
  const t = await getTranslations("Cover");

  return (
    <figure className={styles.cover}>
      <Image
        src="/images/cover.jpg"
        alt={t("alt")}
        width={1200}
        height={1500}
        sizes="(min-width: 768px) 480px, 80vw"
        priority
      />
    </figure>
  );
}
