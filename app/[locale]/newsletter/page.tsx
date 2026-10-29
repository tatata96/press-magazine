import type {CSSProperties} from "react";
import Image from "next/image";
import {getTranslations} from "next-intl/server";
import NewsletterForm from "../../components/newsletter-form/NewsletterForm";
import styles from "./newsletter.module.scss";

// Decorative images sliding across a single screen. Depth sets
// the layer: "back" images pass behind the form, "front" ones in front of it.
// `left` is the column (percent of the stage width), `width` the desktop width in vw,
// `duration` the seconds per crossing, `offset` where it starts in the loop
// (0–1, so they are spread out on load), and `reverse` the direction (up or down).
const SLIDERS = [
  {
    src: "/images/newsletter/newsletter-1.jpg",
    w: 1200,
    h: 960,
    depth: "back",
    left: 3,
    width: 10,
    duration: 70,
    offset: 0.1,
    reverse: false,
  },
  {
    src: "/images/newsletter/newsletter-2.jpg",
    w: 1200,
    h: 1500,
    depth: "back",
    left: 16,
    width: 11,
    duration: 80,
    offset: 0.55,
    reverse: true,
  },
  {
    src: "/images/newsletter/newsletter-3.jpg",
    w: 938,
    h: 1280,
    depth: "mid",
    left: 30,
    width: 13,
    duration: 50,
    offset: 0.35,
    reverse: true,
  },
  {
    src: "/images/newsletter/newsletter-4.jpg",
    w: 915,
    h: 1299,
    depth: "mid",
    left: 46,
    width: 13,
    duration: 55,
    offset: 0.8,
    reverse: false,
  },
  {
    src: "/images/newsletter/newsletter-5.jpg",
    w: 1536,
    h: 1024,
    depth: "front",
    left: 62,
    width: 16,
    duration: 34,
    offset: 0.65,
    reverse: false,
  },
  {
    src: "/images/newsletter/newsletter-6.jpg",
    w: 1863,
    h: 2484,
    depth: "front",
    left: 81,
    width: 17,
    duration: 38,
    offset: 0.2,
    reverse: true,
  },
  {
    src: "/images/newsletter/newsletter-7.jpg",
    w: 1065,
    h: 710,
    depth: "back",
    left: 70,
    width: 12,
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
            className={`${styles.image} ${image.reverse ? styles.reverse : ""}`}
            src={image.src}
            width={image.w}
            height={image.h}
            alt=""
            sizes="(min-width: 900px) 21vw, 40vw"
            style={
              {
                "--left": `${image.left}%`,
                "--width": image.width,
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
          <p className={styles.lead}>{t("lead")}</p>
          <NewsletterForm />
        </div>
      </section>
    </main>
  );
}
