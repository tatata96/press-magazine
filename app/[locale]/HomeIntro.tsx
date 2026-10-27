"use client";

import {useEffect, useRef, useState, type ReactNode} from "react";
import Image from "next/image";
import gsap from "gsap";
import {homeIntro} from "./home-intro-state";
import styles from "./home-intro.module.scss";

// The first scroll gesture down starts the intro; it then plays on its own timer.
// Scrolling up from the very top rewinds it, and the next scroll down plays it again.
const FORWARD_KEYS = new Set([" ", "ArrowDown", "PageDown", "End", "Tab"]);
const BACKWARD_KEYS = new Set(["ArrowUp", "PageUp", "Home"]);
const SWIPE_THRESHOLD_PX = 10;

type Direction = "forward" | "backward";

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
    let stopListening = () => {};

    // The cover starts with its top edge four fifths of the way down the
    // wordmark, so it overlaps only the bottom fifth of it.
    // Measured because the header height varies.
    const coverStartOffset = () => {
      const mark = wordmark.getBoundingClientRect();
      return mark.top + mark.height * 0.8 - cover.offsetTop;
    };
    const onResize = () => {
      if (root.dataset.intro === "pending") timeline.invalidate();
    };

    // Built once and paused at its start, which matches the CSS pending state.
    // Played forward for the intro, reversed to rewind it.
    const timeline = gsap.timeline({
      paused: true,
      defaults: {ease: "power3.inOut"},
      onComplete: () => {
        homeIntro.played = true;
        root.dataset.intro = "done";
        listenFor("backward");
      },
      onReverseComplete: () => {
        root.dataset.intro = "pending";
        // The viewport may have changed while the wordmark was out of sight.
        timeline.invalidate();
        listenFor("forward");
      },
    });
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
        {y: coverStartOffset},
        {y: 0, duration: 1.4, force3D: true},
        0.1,
      );
    if (header) {
      timeline.fromTo(
        header,
        {yPercent: -100, opacity: 0},
        {yPercent: 0, opacity: 1, duration: 0.8, ease: "power2.out"},
        0.7,
      );
    }

    function listenFor(direction: Direction) {
      const forward = direction === "forward";
      let touchStartY = 0;

      const trigger = () => {
        stopListening();
        root!.dataset.intro = forward ? "playing" : "rewinding";
        if (forward) timeline.play();
        else timeline.reverse();
      };
      // Rewinding only makes sense once the page is back at the very top.
      const canTrigger = () => forward || window.scrollY <= 0;

      const onWheel = (event: WheelEvent) => {
        if ((forward ? event.deltaY > 0 : event.deltaY < 0) && canTrigger()) {
          trigger();
        }
      };
      const onTouchStart = (event: TouchEvent) => {
        touchStartY = event.touches[0].clientY;
      };
      const onTouchMove = (event: TouchEvent) => {
        const swipe = forward
          ? touchStartY - event.touches[0].clientY
          : event.touches[0].clientY - touchStartY;
        if (swipe > SWIPE_THRESHOLD_PX && canTrigger()) trigger();
      };
      const onKeyDown = (event: KeyboardEvent) => {
        const keys = forward ? FORWARD_KEYS : BACKWARD_KEYS;
        if (keys.has(event.key) && canTrigger()) trigger();
      };

      window.addEventListener("wheel", onWheel, {passive: true});
      window.addEventListener("touchstart", onTouchStart, {passive: true});
      window.addEventListener("touchmove", onTouchMove, {passive: true});
      window.addEventListener("keydown", onKeyDown);
      stopListening = () => {
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("keydown", onKeyDown);
      };
    }

    listenFor("forward");
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      stopListening();
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
