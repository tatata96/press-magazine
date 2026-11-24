"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "../../i18n/navigation";
import { homeIntro } from "./home-intro-state";
import styles from "./home-stage.module.scss";

gsap.registerPlugin(ScrollTrigger);

// The copy lives under "HomeStage" in the messages files. It is a first draft, not
// final editorial content; the Turkish lines in particular are unreviewed.
const STAGE_ITEMS = [
  { key: "issue", position: "topLeft" },
  { key: "about", position: "middleRight" },
  { key: "newsletter", position: "bottomLeft", href: "/newsletter" },
] as const;

// Scroll distance per timeline step, as a fraction of the viewport height. The intro
// (wordmark leaves, cover rises) is the first step; each text item is one more.
const SCROLL_PER_STEP = 0.7;

// Pins the home stage while native scrolling plays the intro and then reveals the text
// items around the cover, then releases it so the footer follows. Without reduced motion only;
// otherwise the items stay hidden and the page is just the cover.
export default function HomeStage({ children }: { children: ReactNode }) {
  const t = useTranslations("HomeStage");
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const items = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-stage-item]"),
    );
    const wordmark = stage.querySelector<HTMLElement>("[data-intro-wordmark]");
    const cover = stage.querySelector<HTMLElement>("[data-intro-cover]");
    const header = document.querySelector("header");

    // The wordmark and the stage height depend on the real header height, which
    // varies with the viewport and the loaded fonts.
    let headerObserver: ResizeObserver | undefined;
    if (header) {
      const syncHeaderHeight = () => {
        document.documentElement.style.setProperty(
          "--header-height",
          `${header.getBoundingClientRect().height}px`,
        );
        ScrollTrigger.refresh();
      };
      headerObserver = new ResizeObserver(syncHeaderHeight);
      headerObserver.observe(header);
    }

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      stage.classList.add(styles.active);

      // Coming back to the home page: rest on the finished state with every item
      // visible, instead of replaying the scroll reveal.
      if (homeIntro.played) return () => stage.classList.remove(styles.active);

      // autoAlpha also hides the items from keyboard focus until they are revealed.
      gsap.set(items, { autoAlpha: 0 });

      // Set again whenever the intro (re)starts; see the cleanup below.
      header?.removeAttribute("data-intro-landed");

      // The cover starts with its top edge four fifths of the way down the wordmark.
      // Layout offsets (not bounding rects) so the value does not depend on where
      // the pieces currently are: the wordmark and the cover share the stage as
      // their offset parent, so the result is the same on load and after a rewind.
      const coverStartOffset = () => {
        if (!wordmark || !cover) {
          return 0;
        }

        return wordmark.offsetTop + wordmark.offsetHeight * 0.8 - cover.offsetTop;
      };

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          // Pin below the sticky header instead of underneath it.
          start: () => `top ${header?.getBoundingClientRect().height ?? 0}px`,
          end: () =>
            `+=${(items.length + 1) * window.innerHeight * SCROLL_PER_STEP}`,
          pin: true,
          // GSAP skips the spacing by default when the parent is a flex container, as
          // the body is; without it the footer scrolls up while the stage is pinned.
          pinSpacing: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        // Reaching the end counts as having seen the intro for the rest of the visit.
        onComplete: () => {
          homeIntro.played = true;
        },
      });
      // force3D keeps the moving pieces on their own layer so they do not snap when
      // GSAP would otherwise switch from a 2D to a 3D transform. The wordmark travels
      // farther but slower than the cover, which gives a slight parallax.
      if (wordmark && cover) {
        // The wordmark shrinks into the header logo's place, then hands over to the
        // real logo (see the intro styles). Both are measured at rest, as above.
        const logo = header?.querySelector<HTMLElement>("a:has(> img)");
        const markImage = wordmark.querySelector("img");
        const logoBox = () => logo?.getBoundingClientRect();
        timeline
          .to(
            wordmark,
            {
              y: () =>
                (logoBox()?.top ?? 0) - wordmark.getBoundingClientRect().top,
              scale: () =>
                markImage && logoBox()
                  ? (logoBox()?.width ?? 0) / markImage.offsetWidth
                  : 1,
              transformOrigin: "50% 0",
              duration: 1,
              force3D: true,
            },
            0,
          )
          .set(wordmark, { autoAlpha: 0 }, 1)
          .call(
            () => {
              header?.toggleAttribute("data-intro-landed", timeline.time() >= 1);
            },
            undefined,
            1,
          )
          .fromTo(
            cover,
            { y: coverStartOffset },
            { y: 0, duration: 0.8, force3D: true },
            0.1,
          );
      }
      items.forEach((item, index) => {
        timeline.to(item, { autoAlpha: 1, duration: 1 }, index + 1);
      });

      return () => {
        stage.classList.remove(styles.active);
        // Leaving the home page must give the header back to other pages. The intro
        // styles match on the intro element's presence, and a page the router keeps
        // hidden in the DOM would otherwise keep the header transparent and logo-less.
        header?.setAttribute("data-intro-landed", "");
      };
    });

    return () => {
      mm.revert();
      headerObserver?.disconnect();
      document.documentElement.style.removeProperty("--header-height");
    };
  }, []);

  return (
    // GSAP moves the pinned element into a wrapper. That is the inner div, not <main>:
    // React inserts and removes pages relative to <main>, and a moved <main> makes
    // navigating away fail with a NotFoundError.
    <main>
      <div ref={stageRef} className={styles.stage}>
        {children}
        <ul className={styles.items}>
          {STAGE_ITEMS.map((item) => (
            <li
              key={item.key}
              data-stage-item
              className={`${styles.item} ${styles[item.position]} type-mono`}
            >
              {"href" in item ? (
                <Link href={item.href} className={styles.link}>
                  {t(item.key)}
                </Link>
              ) : (
                t(item.key)
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
