"use client";

import {useState, useTransition} from "react";
import type {Cart} from "@/lib/shopify/cart";
import {formatMoney} from "@/lib/shopify/money";
import {removeFromCart, updateCartLine, type CartActionResult} from "./actions";
import styles from "./cart.module.scss";

type CartLinesProps = {
  cart: Cart;
  locale: string;
  copy: {
    itemsLabel: string;
    quantity: string;
    decrease: string;
    increase: string;
    remove: string;
    updating: string;
    subtotal: string;
    updateError: string;
  };
};

// Client component for the interactive parts only. Quantities and totals shown are
// always the ones Shopify returned; nothing is calculated in the browser.
export default function CartLines({cart, locale, copy}: CartLinesProps) {
  const [isPending, startTransition] = useTransition();
  const [hasError, setHasError] = useState(false);

  function runAction(action: () => Promise<CartActionResult>) {
    setHasError(false);
    startTransition(async () => {
      const result = await action();

      setHasError(!result.ok);
    });
  }

  return (
    <div aria-busy={isPending}>
      <ul className={styles.lines} aria-label={copy.itemsLabel}>
        {cart.lines.map((line) => (
          <li key={line.id} className={styles.line}>
            <div className={styles.lineInfo}>
              <p className={styles.lineTitle}>{line.productTitle}</p>
              <p className={`type-mono ${styles.unitPrice}`}>
                {formatMoney(line.unitPrice, locale)}
              </p>
            </div>

            <div
              role="group"
              aria-label={`${copy.quantity}: ${line.productTitle}`}
              className={styles.quantity}
            >
              <button
                type="button"
                className={styles.stepper}
                aria-label={`${copy.decrease}: ${line.productTitle}`}
                disabled={isPending || line.quantity <= 1}
                onClick={() =>
                  runAction(() => updateCartLine(line.id, line.quantity - 1))
                }
              >
                −
              </button>
              <span className={`type-mono ${styles.quantityValue}`}>
                {line.quantity}
              </span>
              <button
                type="button"
                className={styles.stepper}
                aria-label={`${copy.increase}: ${line.productTitle}`}
                disabled={isPending}
                onClick={() =>
                  runAction(() => updateCartLine(line.id, line.quantity + 1))
                }
              >
                +
              </button>
            </div>

            <p className={styles.lineTotal}>
              {formatMoney(line.totalPrice, locale)}
            </p>

            <button
              type="button"
              className={`type-mono ${styles.remove}`}
              disabled={isPending}
              onClick={() => runAction(() => removeFromCart(line.id))}
            >
              {copy.remove}
              <span className={styles.visuallyHidden}>
                : {line.productTitle}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.summary}>
        <p className={`type-mono ${styles.subtotalLabel}`}>{copy.subtotal}</p>
        <p className={styles.subtotal}>{formatMoney(cart.subtotal, locale)}</p>
      </div>

      <p role="status" className={`type-mono ${styles.status}`}>
        {isPending ? copy.updating : ""}
      </p>
      {hasError ? (
        <p role="alert" className={styles.message}>
          {copy.updateError}
        </p>
      ) : null}
    </div>
  );
}
