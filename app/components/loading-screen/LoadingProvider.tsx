"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type {ReactNode} from "react";
import styles from "./loading-screen.module.scss";

type LoadingOptions = {label: string; subtle?: boolean};
type RegisterLoading = (options: LoadingOptions) => () => void;

const LoadingContext = createContext<RegisterLoading | null>(null);

export function useLoadingScreen() {
  const register = useContext(LoadingContext);

  if (!register) {
    throw new Error("LoadingScreen requires LoadingProvider");
  }

  return register;
}

// Lives above the routes so saving and the cart's streamed fallback share one
// overlay, without restarting its animation or changing its label mid-flight.
export default function LoadingProvider({children}: {children: ReactNode}) {
  const tasks = useRef(new Set<symbol>());
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState({active: false, label: "", subtle: false});

  const register = useCallback<RegisterLoading>(({label, subtle = false}) => {
    const task = Symbol();

    tasks.current.add(task);

    if (releaseTimer.current) {
      clearTimeout(releaseTimer.current);
    }

    setLoading((current) =>
      current.active ? current : {active: true, label, subtle},
    );

    return () => {
      tasks.current.delete(task);

      if (tasks.current.size === 0) {
        // Bridge the brief gap when one route unmounts and the next registers.
        releaseTimer.current = setTimeout(() => {
          if (tasks.current.size === 0) {
            setLoading((current) => ({...current, active: false}));
          }
        }, 100);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (releaseTimer.current) {
        clearTimeout(releaseTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (loading.active) {
      if (!dialog.open) {
        dialog.showModal();
      }

      return;
    }

    // Keep the page inert until the exit fade has finished.
    const timer = setTimeout(
      () => dialog.close(),
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180,
    );

    return () => clearTimeout(timer);
  }, [loading.active]);

  return (
    <LoadingContext.Provider value={register}>
      {children}
      <dialog
        ref={dialogRef}
        aria-label={loading.label || undefined}
        aria-modal="true"
        className={styles.screen}
        data-visible={loading.active}
        data-subtle={loading.subtle}
        onCancel={(event) => event.preventDefault()}
      >
        <div className={styles.content} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          <p className={`type-mono ${styles.label}`}>{loading.label}</p>
        </div>
      </dialog>
    </LoadingContext.Provider>
  );
}
