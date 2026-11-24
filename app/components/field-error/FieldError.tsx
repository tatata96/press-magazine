import type {ReactNode} from "react";
import styles from "./field-error.module.scss";

type FieldErrorProps = {
  /** Referenced by the input's aria-describedby, which is how assistive tech reads the message. */
  id: string;
  children: ReactNode;
};

// The one error message under a form field (text, select, phone). It is overlaid below the
// field, so the parent must be `position: relative`.
export default function FieldError({id, children}: FieldErrorProps) {
  return (
    <p id={id} className={`type-caption ${styles.error}`}>
      {children}
    </p>
  );
}
