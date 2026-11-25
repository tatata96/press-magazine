import {useId} from "react";
import FieldError from "../field-error/FieldError";
import styles from "./select-field.module.scss";

type SelectFieldProps = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {value: string; label: string}[];
  /** Label of the empty first option. */
  placeholder: string;
  disabled?: boolean;
  /** Defaults to true; set false for an optional field whose empty option is valid. */
  required?: boolean;
  error?: string;
};

// A native select keeps keyboard type-ahead and the platform's picker on phones.
export default function SelectField({
  name,
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required = true,
  error,
}: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={styles.select}>
      <label htmlFor={id} className={`type-caption ${styles.selectLabel}`}>
        {label}
      </label>
      <select
        id={id}
        name={name}
        className={styles.selectInput}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
