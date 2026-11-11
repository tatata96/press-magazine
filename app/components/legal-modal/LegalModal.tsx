"use client";

import {useEffect, useId, useRef} from "react";
import type {ReactNode} from "react";
import styles from "./legal-modal.module.scss";

type LegalModalProps = {
  isOpen: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
};

// Native <dialog>: showModal() provides the backdrop, focus trap, Escape to close and
// focus return to the opener. State is only mirrored onto the element here.
export default function LegalModal({
  isOpen,
  title,
  closeLabel,
  onClose,
  children,
}: LegalModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      // Fires for Escape and for dialog.close() alike.
      onClose={onClose}
      // The panel fills the dialog box, so a click on the dialog itself is a backdrop click.
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <p id={titleId} className={styles.title}>
            {title}
          </p>
          <button
            type="button"
            className={`type-mono ${styles.close}`}
            onClick={onClose}
          >
            {closeLabel}
          </button>
        </div>
        {/* Focusable so keyboard users can scroll the text. */}
        <div className={styles.body} tabIndex={0}>
          {children}
        </div>
      </div>
    </dialog>
  );
}
