import Image from "next/image";
import styles from "./cover.module.scss";

export default function Cover() {
  return (
    <figure className={styles.cover}>
      <Image
        src="/images/cover.jpg"
        alt="Magazine cover"
        width={1200}
        height={1500}
        sizes="(min-width: 768px) 480px, 80vw"
        priority
      />
    </figure>
  );
}
