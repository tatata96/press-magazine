"use client";

import {useEffect, useRef, type ReactNode} from "react";
import gsap from "gsap";
import styles from "./cover.module.scss";

const MAX_DRIFT_PX = 5;
const MAX_SHADOW_SHIFT_PX = 14;

// Keeps the cover flat and moves a soft highlight across it, like light on coated paper,
// following the cursor. The cover drifts a few pixels away from the cursor and its shadow
// shifts further, which reads as depth. Only for a mouse or trackpad without a
// reduced-motion preference; otherwise the cover stays static.
export default function CoverSheen({children}: {children: ReactNode}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const canFollow = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    ).matches;
    if (!canFollow) return;

    const follow = {duration: 0.8, ease: "power3.out"};
    const driftX = gsap.quickTo(element, "x", follow);
    const driftY = gsap.quickTo(element, "y", follow);
    const sheenX = gsap.quickTo(element, "--sheen-x", follow);
    const sheenY = gsap.quickTo(element, "--sheen-y", follow);
    const shadowX = gsap.quickTo(element, "--shadow-x", follow);
    const shadowY = gsap.quickTo(element, "--shadow-y", follow);

    // x and y are the cursor's position across the viewport, from -1 to 1. The highlight
    // sits at the matching point of the cover (0-100%), the shadow leans away from it.
    const lean = (x: number, y: number) => {
      driftX(-x * MAX_DRIFT_PX);
      driftY(-y * MAX_DRIFT_PX);
      sheenX(50 + x * 50);
      sheenY(50 + y * 50);
      shadowX(-x * MAX_SHADOW_SHIFT_PX);
      shadowY(-y * MAX_SHADOW_SHIFT_PX);
    };
    const onPointerMove = (event: PointerEvent) => {
      lean(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      );
    };
    const onLeave = () => lean(0, 0);

    element.dataset.sheen = "on";
    window.addEventListener("pointermove", onPointerMove, {passive: true});
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(element);
      gsap.set(element, {clearProps: "all"});
      delete element.dataset.sheen;
    };
  }, []);

  return (
    <div ref={ref} className={styles.sheen}>
      {children}
    </div>
  );
}
