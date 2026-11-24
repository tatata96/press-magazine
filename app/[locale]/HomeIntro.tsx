"use client";

import {useState, type ReactNode} from "react";
import Image from "next/image";
import {homeIntro} from "./home-intro-state";
import styles from "./home-intro.module.scss";

// Markup and initial state for the home intro. The motion itself is part of the
// scroll timeline in HomeStage, which finds the wordmark and the cover through their
// data attributes. Scrolling stays native: nothing here locks or intercepts it.
// With a reduced-motion preference, without JavaScript, or when returning to the
// page within a visit, the page shows its final state.
export default function HomeIntro({children}: {children: ReactNode}) {
  // Fixed at the first render so React never overwrites the state HomeStage manages.
  const [initialState] = useState(() => (homeIntro.played ? "done" : "pending"));

  return (
    <div className={styles.intro} data-intro={initialState}>
      <noscript>
        <style>{`
          [data-intro-cover] { transform: none !important; }
          [data-intro-wordmark] { display: none !important; }
          body header { background: var(--background) !important; }
          body header a:has(> img) { opacity: 1 !important; }
        `}</style>
      </noscript>
      {/* Decorative: the header carries the accessible logo. */}
      <div
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
      <div className={styles.cover} data-intro-cover>
        {children}
      </div>
    </div>
  );
}
