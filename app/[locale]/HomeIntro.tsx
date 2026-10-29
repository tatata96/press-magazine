"use client";

import {useEffect, useRef, useState, type ReactNode} from "react";
import Image from "next/image";
import gsap from "gsap";
import {homeIntro} from "./home-intro-state";
import styles from "./home-intro.module.scss";

// Scroll is locked while the intro runs; wheel, touch and key input scrubs the
// intro's timeline instead, so the wordmark moves exactly as far as the user scrolls.
// Scrolling back up from the very top scrubs it in reverse.
const DOWN_KEYS = new Set([" ", "ArrowDown", "PageDown", "End", "Tab"]);
const UP_KEYS = new Set(["ArrowUp", "PageUp", "Home"]);
// How much scrolling carries the intro from start to finish.
const SCROLL_DISTANCE_PX = 900;
// Share of the intro one arrow-key press or one page-key press covers.
const KEY_STEP = 0.15;
const PAGE_KEY_STEP = 0.5;
// Eases the scrubbed progress so coarse wheel ticks do not make the motion jump.
const SMOOTHING_SECONDS = 0.4;

// Scroll is locked and the header and footer are hidden by CSS while the intro is
// not done, so the first paint is the intro itself. The CSS only applies without a
// reduced-motion preference; with it, or without JavaScript, the page shows its final state.
export default function HomeIntro({children}: {children: ReactNode}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  // Fixed at the first render so React never overwrites the state the effect manages.
  const [initialState] = useState(() => (homeIntro.played ? "done" : "pending"));

  useEffect(() => {
    const root = rootRef.current;
    const wordmark = wordmarkRef.current;
    const cover = coverRef.current;
    if (!root || !wordmark || !cover) return;

    // A reload mid-page restores the scroll position; the intro would only get in the way.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (homeIntro.played || reducedMotion || window.scrollY > 0) {
      root.dataset.intro = "done";
      return;
    }

    // The header lives in the layout and outlasts this page, so it is reset on cleanup.
    const header = document.querySelector("header");

    // The cover starts with its top edge four fifths of the way down the
    // wordmark, so it overlaps only the bottom fifth of it.
    // Measured because the header height varies. offsetTop is relative to the stage,
    // which sits below the header, so the stage's viewport position is added to
    // compare it with the wordmark's.
    const coverStartOffset = () => {
      const mark = wordmark.getBoundingClientRect();
      const stageTop = cover.offsetParent?.getBoundingClientRect().top ?? 0;
      return mark.top + mark.height * 0.8 - (stageTop + cover.offsetTop);
    };
    // GSAP re-reads function values when a tween first becomes active, by which time
    // the wordmark has moved. The offset is therefore measured only while the intro is
    // at rest, and the tween reads this cached value.
    let coverStart = coverStartOffset();

    // Built once and paused at its start, which matches the CSS pending state.
    // Its progress follows the scroll input; the easing comes from the smoothing
    // tween below, so the individual tweens are linear.
    const timeline = gsap.timeline({paused: true, defaults: {ease: "none"}});
    // force3D keeps the image on its own layer from the first frame; by default GSAP
    // switches from a 2D to a 3D transform when the tween starts, which can make the
    // image visibly snap as it is re-rasterised.
    //
    // The cover leaves almost together with the wordmark but travels less distance,
    // so the two drift at different speeds (parallax). The wordmark is the slower
    // tween so it stays close behind the cover instead of racing away from it.
    timeline
      .to(wordmark, {yPercent: -130, duration: 1.8, force3D: true}, 0)
      .fromTo(
        cover,
        {y: () => coverStart},
        {y: 0, duration: 1.4, force3D: true},
        0.1,
      );
    if (header) {
      timeline.fromTo(
        header,
        {yPercent: -100, opacity: 0},
        {yPercent: 0, opacity: 1, duration: 0.4, ease: "power2.out"},
        1.3,
      );
    }

    let done = false;
    let target = 0;

    const settle = () => {
      const progress = timeline.progress();
      if (progress >= 1) {
        done = true;
        homeIntro.played = true;
        root.dataset.intro = "done";
      } else if (progress <= 0 && target <= 0) {
        root.dataset.intro = "pending";
        // The viewport may have changed while the wordmark was out of sight.
        coverStart = coverStartOffset();
        timeline.invalidate();
      }
    };

    const scrubBy = (share: number) => {
      if (done) {
        // Only an upward scroll at the very top brings the intro back.
        if (share >= 0 || window.scrollY > 0) return;
        done = false;
        target = 1;
      }
      const next = Math.min(1, Math.max(0, target + share));
      // Input past either end must not restart the smoothing, or trackpad momentum
      // would keep the intro locked until it stops.
      if (next === target) return;
      target = next;
      root.dataset.intro = "playing";
      gsap.to(timeline, {
        progress: target,
        duration: SMOOTHING_SECONDS,
        ease: "power2.out",
        overwrite: true,
        onComplete: settle,
      });
    };

    let touchY = 0;
    const onWheel = (event: WheelEvent) => {
      scrubBy(event.deltaY / SCROLL_DISTANCE_PX);
    };
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0].clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0].clientY;
      scrubBy((touchY - y) / SCROLL_DISTANCE_PX);
      touchY = y;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const {key} = event;
      const down = DOWN_KEYS.has(key);
      if (!down && !UP_KEYS.has(key)) return;
      const step = key === "End" || key === "Home" || key === "Tab"
        ? 1
        : key === " " || key === "PageDown" || key === "PageUp"
          ? PAGE_KEY_STEP
          : KEY_STEP;
      scrubBy(down ? step : -step);
    };

    window.addEventListener("wheel", onWheel, {passive: true});
    window.addEventListener("touchstart", onTouchStart, {passive: true});
    window.addEventListener("touchmove", onTouchMove, {passive: true});
    window.addEventListener("keydown", onKeyDown);
    const onResize = () => {
      if (root.dataset.intro !== "pending") return;
      coverStart = coverStartOffset();
      timeline.invalidate();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      gsap.killTweensOf(timeline);
      timeline.kill();
      gsap.set([wordmark, cover, header], {clearProps: "all"});
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.intro} data-intro={initialState}>
      <noscript>
        <style>{`
          html { overflow: auto !important; }
          body header, body footer { visibility: visible !important; }
          [data-intro-cover] { transform: none !important; }
          [data-intro-wordmark] { display: none !important; }
        `}</style>
      </noscript>
      {/* Decorative: the header carries the accessible logo once the intro ends. */}
      <div
        ref={wordmarkRef}
        className={styles.wordmark}
        data-intro-wordmark
        aria-hidden="true"
      >
        <Image
          src="/images/logo-text.svg"
          alt=""
          width={1223}
          height={513}
          sizes="92vw"
          priority
        />
      </div>
      <div ref={coverRef} className={styles.cover} data-intro-cover>
        {children}
      </div>
    </div>
  );
}
