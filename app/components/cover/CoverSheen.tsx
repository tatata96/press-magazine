"use client";

import {useEffect, useRef, type ReactNode} from "react";
import gsap from "gsap";
import styles from "./cover.module.scss";

const MAX_DRIFT_PX = 5;
const MAX_SHADOW_SHIFT_PX = 14;
const MAX_TILT_DEG = 2;
const PERSPECTIVE_PX = 1000;

// Moves a soft highlight across the cover, like light on coated paper, following the
// cursor. The cover drifts a few pixels and tilts in 3D away from the cursor and its shadow
// shifts further, which reads as depth. It rotates as a rigid object rather than skewing,
// so the edges stay straight and it reads as a magazine, not a loose sheet. Only for a mouse or trackpad without a
// reduced-motion preference; otherwise the cover stays static.
export default function CoverSheen({children}: {children: ReactNode}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const canFollow = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    ).matches;
    if (!canFollow) {
      return;
    }

    gsap.set(element, {transformPerspective: PERSPECTIVE_PX});
    const follow = {duration: 0.8, ease: "power3.out"};
    const driftX = gsap.quickTo(element, "x", follow);
    const driftY = gsap.quickTo(element, "y", follow);
    const tiltX = gsap.quickTo(element, "rotationX", follow);
    const tiltY = gsap.quickTo(element, "rotationY", follow);
    const sheenX = gsap.quickTo(element, "--sheen-x", follow);
    const sheenY = gsap.quickTo(element, "--sheen-y", follow);
    const shadowX = gsap.quickTo(element, "--shadow-x", follow);
    const shadowY = gsap.quickTo(element, "--shadow-y", follow);

    // x and y are the cursor's position across the viewport, from -1 to 1. The highlight
    // sits at the matching point of the cover (0-100%), the shadow leans away from it.
    const lean = (x: number, y: number) => {
      driftX(-x * MAX_DRIFT_PX);
      driftY(-y * MAX_DRIFT_PX);
      tiltX(-y * MAX_TILT_DEG);
      tiltY(x * MAX_TILT_DEG);
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
