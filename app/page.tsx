import Cover from "./components/cover/Cover";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <Cover />
    </main>
  );
}
