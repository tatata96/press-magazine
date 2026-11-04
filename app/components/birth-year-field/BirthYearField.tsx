import TextField from "../text-field/TextField";

type BirthYearFieldProps = {
  label: string;
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
};

// Optional four-digit year. No min/max attributes: the valid range depends on the
// current date, which Next.js rejects in client render. The range is checked on
// submit (isValidBirthYear) and again on the server.
export default function BirthYearField({
  label,
  error,
  ref,
}: BirthYearFieldProps) {
  return (
    <TextField
      ref={ref}
      name="birthYear"
      type="number"
      inputMode="numeric"
      autoComplete="bday-year"
      step={1}
      label={label}
      error={error}
    />
  );
}
