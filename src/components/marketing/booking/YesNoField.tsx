"use client";

/** A yes/no question as a real radio group (keyboard + screen-reader friendly), styled as two big calm buttons. */
export function YesNoField({
  name,
  legend,
  hint,
  value,
  onChange,
  required,
  error,
}: {
  name: string;
  legend: string;
  hint?: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  required?: boolean;
  error?: string | null;
}) {
  const option = (label: string, v: boolean) => {
    const checked = value === v;
    return (
      <label
        className={`flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-momentizing-teal ${
          checked
            ? "border-momentizing-teal bg-momentizing-teal text-white"
            : "border-momentizing-slate/20 bg-white text-momentizing-slate hover:border-momentizing-slate/50"
        }`}
      >
        <input
          type="radio"
          name={name}
          checked={checked}
          onChange={() => onChange(v)}
          required={required}
          className="sr-only"
        />
        {label}
      </label>
    );
  };

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-1 text-sm font-semibold text-momentizing-slate">{legend}</legend>
      {hint && <p className="-mt-1 mb-1 text-sm text-momentizing-muted">{hint}</p>}
      <div className="flex gap-3">
        {option("Yes", true)}
        {option("No", false)}
      </div>
      {error && (
        <p id={`${name}-error`} role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}
