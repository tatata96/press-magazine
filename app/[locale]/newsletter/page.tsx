import type {CSSProperties} from "react";
import type {Metadata} from "next";
import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {getPageMetadata} from "@/lib/seo";
import NewsletterForm from "./NewsletterForm";
import styles from "./newsletter.module.scss";

// Position and width are percentages of the stage. Images with a phone
// layout appear on smaller screens. Images enter horizontally only, from the
// nearest side (see getSlideInOffset).
const COLLAGE_IMAGES = [
  {
    src: "/images/newsletter/newsletter-1.jpg",
    left: -3,
    top: 2,
    width: 15,
    rotate: -9,
  },
  {
    src: "/images/newsletter/newsletter-3.jpg",
    left: 78,
    top: 2,
    width: 14,
    rotate: 8,
  },
  {
    src: "/images/newsletter/newsletter-4.jpg",
    left: -3,
    top: 31,
    width: 13,
    rotate: 7,
  },
  {
    src: "/images/newsletter/newsletter-5.jpg",
    left: 88,
    top: 38,
    width: 14,
    rotate: -7,
  },
  {
    src: "/images/newsletter/newsletter-6.jpg",
    left: 14,
    top: 74,
    width: 13,
    rotate: -6,
  },
  {
    src: "/images/newsletter/newsletter-7.jpg",
    left: 70,
    top: 72,
    width: 14,
    phone: {left: 58, top: 70, width: 34, rotate: 20},
    rotate: 6,
  },
  {
    src: "/images/newsletter/newsletter-9.jpg",
    left: 42,
    top: 82,
    width: 12,
    phone: {left: 31, top: 74, width: 25, rotate: 2},
    rotate: 4,
  },
  {
    src: "/images/newsletter/newsletter-10.jpg",
    left: -2,
    top: 60,
    width: 12,
    phone: {left: 1, top: 66, width: 26, rotate: -15},
    rotate: -5,
  },
  {
    src: "/images/newsletter/newsletter-11.jpg",
    left: 88,
    top: 18,
    width: 11,
    rotate: 9,
  },
  {
    src: "/images/newsletter/newsletter-12.jpg",
    left: 1,
    top: 85,
    width: 12,
    rotate: 8,
  },
  {
    src: "/images/newsletter/newsletter-13.jpg",
    left: 89,
    top: 78,
    width: 13,
    rotate: -9,
  },
] as const;

// Horizontal entrance offset, as a percentage of the image's own width: enough
// to start fully outside the stage on the side the image is closer to.
function getSlideInOffset(left: number, width: number): string {
  const offStage = 20;

  if (left + width / 2 < 50) {
    return `${-((left + width) / width) * 100 - offStage}%`;
  }
  return `${((100 - left) / width) * 100 + offStage}%`;
}

// Extra turn (degrees) an image spins through while sliding in; 0 slides it in
// without spinning. Cycled across the images so only some of them rotate.
const SPIN_IN = [-30, 0, 20, 0, -20, 35, 0, 25] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NewsletterPage");


  return getPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/newsletter",
  });
}

export default async function NewsletterPage() {
  const t = await getTranslations("NewsletterPage");

  return (
    <main className={styles.main}>
      <div className={styles.images} aria-hidden="true">
        {COLLAGE_IMAGES.map((image, index) => (
          <Image
            key={image.src}
            className={`${styles.image} ${"phone" in image ? "" : styles.desktopOnly}`}
            src={image.src}
            width={2599}
            height={3544}
            alt=""
            sizes={`(min-width: 900px) ${image.width}vw, ${"phone" in image ? image.phone.width : 0}vw`}
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
                "--from-x": getSlideInOffset(image.left, image.width),
                "--phone-from-x":
                  "phone" in image
                    ? getSlideInOffset(image.phone.left, image.phone.width)
                    : undefined,
                "--index": index,
                "--spin-in": `${SPIN_IN[index % SPIN_IN.length]}deg`,
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
