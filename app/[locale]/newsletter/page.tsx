import type {CSSProperties} from "react";
import Image from "next/image";
import {getTranslations} from "next-intl/server";
import NewsletterForm from "./NewsletterForm";
import styles from "./newsletter.module.scss";

// Decorative images (a photo can appear more than once) collaged around the edges, tilted and overlapping, with
// the centre left clear for the form. `left` and `top` place the top-left
// corner (percent of the stage; negative values bleed off the edge), `width` is
// the desktop width (percent of the stage width), `phone` where and how it shows on phones (same units, `width` as a share of the stage width; images without it are hidden), `rotate` the tilt in degrees,
// and `fromX` / `fromY` the offset the image slides in from on load.
const COLLAGE_IMAGES = [
  {src: "/images/newsletter/newsletter-1.jpg", w: 1200, h: 960, left: -3, top: -4, width: 18, phone: {left: 5, top: 10, width: 24, rotate: 15}, rotate: -9, fromX: "-120%", fromY: "-120%"},
  {src: "/images/newsletter/newsletter-3.jpg", w: 938, h: 1280, left: 20, top: -10, width: 13, phone: {left: 31, top: 11, width: 23, rotate: -12}, rotate: 5, fromX: "0%", fromY: "-150%"},
  {src: "/images/newsletter/newsletter-4.jpg", w: 915, h: 1299, left: 78, top: -6, width: 14, phone: {left: 62, top: 6, width: 28, rotate: 10}, rotate: 8, fromX: "120%", fromY: "-120%"},
  {src: "/images/newsletter/newsletter-7.jpg", w: 1065, h: 710, left: -4, top: 40, width: 17, rotate: 7, fromX: "-150%", fromY: "0%"},
  {src: "/images/newsletter/newsletter-5.jpg", w: 1536, h: 1024, left: 86, top: 38, width: 18, rotate: -7, fromX: "150%", fromY: "0%"},
  {src: "/images/newsletter/newsletter-2.jpg", w: 1200, h: 1500, left: 14, top: 74, width: 13, rotate: -6, fromX: "-120%", fromY: "120%"},
  {src: "/images/newsletter/newsletter-6.jpg", w: 1863, h: 2484, left: 70, top: 72, width: 14, phone: {left: 58, top: 70, width: 34, rotate: 20}, rotate: 6, fromX: "120%", fromY: "120%"},
  {src: "/images/newsletter/newsletter-2.jpg", w: 1200, h: 1500, left: 60, top: -12, width: 12, rotate: -6, fromX: "0%", fromY: "-150%"},
  {src: "/images/newsletter/newsletter-4.jpg", w: 915, h: 1299, left: 42, top: 82, width: 12, phone: {left: 31, top: 74, width: 25, rotate: 2}, rotate: 4, fromX: "0%", fromY: "150%"},
  {src: "/images/newsletter/newsletter-6.jpg", w: 1863, h: 2484, left: -2, top: 60, width: 12, phone: {left: 1, top: 66, width: 26, rotate: -15}, rotate: -5, fromX: "-150%", fromY: "0%"},
  {src: "/images/newsletter/newsletter-1.jpg", w: 1200, h: 960, left: 88, top: 18, width: 11, rotate: 9, fromX: "150%", fromY: "0%"},
] as const;

// Extra turn (degrees) an image spins through while sliding in; 0 slides it in
// without spinning. Cycled across the images so only some of them rotate.
const SPIN_IN = [-30, 0, 20, 0, -20, 35, 0, 25] as const;

export default async function NewsletterPage() {
  const t = await getTranslations("NewsletterPage");

  return (
    <main className={styles.main}>
      <div className={styles.images} aria-hidden="true">
        {COLLAGE_IMAGES.map((image, index) => (
          <Image
            key={`${image.src}-${image.left}-${image.top}`}
            className={`${styles.image} ${"phone" in image ? "" : styles.desktopOnly}`}
            src={image.src}
            width={image.w}
            height={image.h}
            alt=""
            sizes="(min-width: 900px) 12vw, 35vw"
            style={
              {
                "--left": `${image.left}%`,
                "--top": `${image.top}%`,
                "--width": image.width,
                "--rotate": `${image.rotate}deg`,
                ...("phone" in image && {
                  "--phone-left": `${image.phone.left}%`,
                  "--phone-top": `${image.phone.top}%`,
                  "--phone-width": image.phone.width,
                  "--phone-rotate": `${image.phone.rotate}deg`,
                }),
                "--from-x": image.fromX,
                "--from-y": image.fromY,
                "--index": index,
                "--spin-in":`${SPIN_IN[index % SPIN_IN.length]}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <section className={styles.content}>
        <NewsletterForm>
          <p className={styles.lead}>{t("lead")}</p>
        </NewsletterForm>
      </section>
    </main>
  );
}
