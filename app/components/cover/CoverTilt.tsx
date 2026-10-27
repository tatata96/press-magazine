"use client";

import {useEffect, useRef, type ReactNode} from "react";
import gsap from "gsap";
import styles from "./cover.module.scss";

const MAX_TILT_DEG = 8;
const MAX_SHADOW_SHIFT_PX = 14;
const PERSPECTIVE_PX = 900;

// Leans the cover toward the cursor like a magazine lying on a table, and shifts its
// shadow the opposite way. Only for a mouse or trackpad without a reduced-motion
// preference; otherwise the cover stays flat.
export default function CoverTilt({children}: {children: ReactNode}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const canTilt = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    ).matches;
    if (!canTilt) return;

    gsap.set(element, {transformPerspective: PERSPECTIVE_PX});
    const follow = {duration: 0.8, ease: "power3.out"};
    const rotateX = gsap.quickTo(element, "rotationX", follow);
    const rotateY = gsap.quickTo(element, "rotationY", follow);
    const shadowX = gsap.quickTo(element, "--shadow-x", follow);
    const shadowY = gsap.quickTo(element, "--shadow-y", follow);

    // x and y are the cursor's position across the viewport, from -1 to 1. A cursor
    // above the cover tips its top edge away, one on the right tips its right edge away.
    const lean = (x: number, y: number) => {
      rotateX(-y * MAX_TILT_DEG);
      rotateY(x * MAX_TILT_DEG);
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

    window.addEventListener("pointermove", onPointerMove, {passive: true});
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(element);
      gsap.set(element, {clearProps: "all"});
    };
  }, []);

  return (
    <div ref={ref} className={styles.tilt}>
      {children}
    </div>
  );
}
