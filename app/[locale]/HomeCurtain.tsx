"use client";

import {useEffect, useRef, useState} from "react";
import {homeIntro} from "./home-intro-state";
import styles from "./home-curtain.module.scss";

// Decorative black curtain on a fresh visit: a window opens in it where the cover sits,
// then grows to reveal the page. Like HomeIntro, it is fixed at the first render and
// skipped when returning to the home page within a visit. Reduced motion hides it in CSS.
export default function HomeCurtain() {
  const [visible, setVisible] = useState(() => !homeIntro.curtainPlayed);
  const curtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const curtain = curtainRef.current;

    if (!curtain) {
      return;
    }

    // Wait a frame so the stage has applied the cover's starting offset.
    const frame = requestAnimationFrame(() => {
      const cover = document.querySelector("[data-intro-cover] img");

      if (!cover) {
        return;
      }

      const box = cover.getBoundingClientRect();

      curtain.style.setProperty("--cover-left", `${box.left}px`);
      curtain.style.setProperty("--cover-top", `${box.top}px`);
      curtain.style.setProperty("--cover-width", `${box.width}px`);
      curtain.style.setProperty("--cover-height", `${box.height}px`);
      curtain.setAttribute("data-ready", "");
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      ref={curtainRef}
      className={styles.curtain}
      aria-hidden="true"
      onAnimationEnd={() => {
        homeIntro.curtainPlayed = true;
        setVisible(false);
      }}
    >
      <div className={styles.hole} />
    </div>
  );
}
