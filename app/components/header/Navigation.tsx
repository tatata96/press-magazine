"use client";

import { useState } from "react";
import styles from "./header.module.scss";

type NavigationItem = {
  label: string;
  href: string;
};

type NavigationProps = {
  items: NavigationItem[];
  labels: {
    navigation: string;
    openMenu: string;
    closeMenu: string;
  };
};

// Inline links on desktop; a toggleable panel below the header on mobile.
export default function Navigation({ items, labels }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      aria-label={labels.navigation}
      className={styles.nav}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
    >
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls="main-menu"
        aria-label={isOpen ? labels.closeMenu : labels.openMenu}
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          {isOpen ? (
            <path d="M5 5L19 19M19 5L5 19" stroke="currentColor" strokeWidth="1.5" />
          ) : (
            <path d="M3 7H21M3 12H21M3 17H21" stroke="currentColor" strokeWidth="1.5" />
          )}
        </svg>
      </button>

      <ul
        id="main-menu"
        className={`${styles.list} ${isOpen ? styles.open : ""} type-mono`}
      >
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={styles.link}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
