import type {CSSProperties} from "react";
import Image from "next/image";
import {getTranslations} from "next-intl/server";
import NewsletterForm from "../../components/newsletter-form/NewsletterForm";
import styles from "./newsletter.module.scss";

// Decorative images sliding across a single screen. Depth sets
// the layer: "back" images pass behind the form, "front" ones in front of it.
// `side` is the strip the image slides in: the left and right strips sit either
// side of the form, so images never cross it. `left` is the column and `width`
// the image width, both in percent of the strip.
// `duration` the seconds per crossing, `offset` where it starts in the loop
// (0–1, so they are spread out on load), and `reverse` the direction (up or down).
const SLIDERS = [
  {
    src: "/images/newsletter/newsletter-1.jpg",
    w: 1200,
    h: 960,
    depth: "back",
    side: "left",
    left: 0,
    width: 44,
    duration: 70,
    offset: 0.1,
    reverse: false,
  },
  {
    src: "/images/newsletter/newsletter-2.jpg",
    w: 1200,
    h: 1500,
    depth: "back",
    side: "left",
    left: 54,
    width: 40,
    duration: 80,
    offset: 0.55,
    reverse: true,
  },
  {
    src: "/images/newsletter/newsletter-3.jpg",
    w: 938,
    h: 1280,
    depth: "mid",
    side: "left",
    left: 54,
    width: 42,
    duration: 50,
    offset: 0.35,
    reverse: true,
  },
  {
    src: "/images/newsletter/newsletter-4.jpg",
    w: 915,
    h: 1299,
    depth: "mid",
    side: "right",
    left: 0,
    width: 44,
    duration: 55,
    offset: 0.8,
    reverse: false,
  },
  {
    src: "/images/newsletter/newsletter-5.jpg",
    w: 1536,
    h: 1024,
    depth: "front",
    side: "right",
    left: 50,
    width: 48,
    duration: 34,
    offset: 0.65,
    reverse: false,
  },
  {
    src: "/images/newsletter/newsletter-6.jpg",
    w: 1863,
    h: 2484,
    depth: "front",
    side: "right",
    left: 8,
    width: 46,
    duration: 38,
    offset: 0.2,
    reverse: true,
  },
  {
    src: "/images/newsletter/newsletter-7.jpg",
    w: 1065,
    h: 710,
    depth: "back",
    side: "left",
    left: 20,
    width: 36,
    duration: 62,
    offset: 0.45,
    reverse: true,
  },
] as const;

const LAYER = {back: 0, mid: 1, front: 3} as const;

export default async function NewsletterPage() {
  const t = await getTranslations("NewsletterPage");

  return (
    <main className={styles.main}>
      <div className={styles.images} aria-hidden="true">
        {SLIDERS.map((image) => (
          <Image
            key={image.src}
            className={`${styles.image} ${styles[image.side]} ${image.reverse ? styles.reverse : ""}`}
            src={image.src}
            width={image.w}
            height={image.h}
            alt=""
            sizes="(min-width: 900px) 21vw, 40vw"
            style={
              {
                "--left": image.left / 100,
                "--width": image.width / 100,
                "--duration": `${image.duration}s`,
                "--delay": `${-image.duration * image.offset}s`,
                "--start": `${image.offset * 70}`,
                zIndex: LAYER[image.depth],
              } as CSSProperties
            }
          />
        ))}
      </div>
      <section className={styles.content} aria-labelledby="newsletter-heading">
        <div className={styles.panel}>
          <NewsletterForm>
            <p className={styles.lead}>{t("lead")}</p>
          </NewsletterForm>
        </div>
      </section>
    </main>
  );
}
