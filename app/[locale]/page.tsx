import Cover from "../components/cover/Cover";
import HomeIntro from "./HomeIntro";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <HomeIntro>
        <Cover />
      </HomeIntro>
    </main>
  );
}
