"use client";

import {useEffect, useRef, type ReactNode} from "react";
import {useTranslations} from "next-intl";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {Link} from "../../i18n/navigation";
import {homeIntro} from "./home-intro-state";
import styles from "./home-stage.module.scss";

gsap.registerPlugin(ScrollTrigger);

// The copy lives under "HomeStage" in the messages files. It is a first draft, not
// final editorial content; the Turkish lines in particular are unreviewed.
const STAGE_ITEMS = [
  {key: "issue", position: "topLeft"},
  {key: "about", position: "middleRight"},
  {key: "newsletter", position: "bottomLeft", href: "/newsletter"},
] as const;

// Scroll distance per item, as a fraction of the viewport height.
const SCROLL_PER_ITEM = 0.7;

// Pins the home stage while scrolling reveals the text items around the
// cover, then releases it so the footer follows. Desktop without reduced motion only;
// elsewhere the items stay hidden and the page is just the cover.
export default function HomeStage({children}: {children: ReactNode}) {
  const t = useTranslations("HomeStage");
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const items = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-stage-item]"),
    );
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
    mm.add(
      "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
      () => {
        stage.classList.add(styles.active);

        // Coming back to the home page: rest on the finished state with every item
        // visible, instead of replaying the scroll reveal.
        if (homeIntro.played) return () => stage.classList.remove(styles.active);

        // autoAlpha also hides the items from keyboard focus until they are revealed.
        gsap.set(items, {autoAlpha: 0, y: 32});

        const timeline = gsap.timeline({
          defaults: {ease: "none"},
          scrollTrigger: {
            trigger: stage,
            // Pin below the sticky header instead of underneath it.
            start: () => `top ${header?.getBoundingClientRect().height ?? 0}px`,
            end: () =>
              `+=${items.length * window.innerHeight * SCROLL_PER_ITEM}`,
            pin: true,
            // GSAP skips the spacing by default when the parent is a flex container, as
            // the body is; without it the footer scrolls up while the stage is pinned.
            pinSpacing: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        items.forEach((item, index) => {
          timeline.to(item, {autoAlpha: 1, y: 0, duration: 1}, index);
        });

        return () => stage.classList.remove(styles.active);
      },
    );

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
              className={`${styles.item} ${styles[item.position]}`}
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
