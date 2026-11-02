"use client";

import type { ButtonHTMLAttributes, ReactNode, RefObject } from "react";

/**
 * Small, calm building blocks shared by the /book wizard. Deliberately a separate set from the client-app `ui/`
 * components (sage pills) so the public site keeps its own quiet look: warm off-white, slate text, soft rounded cards.
 * Contrast: text is slate / gray-600 (never gold on white), touch targets are at least 44px, focus rings are always visible.
 */

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-momentizing-teal text-white hover:bg-momentizing-slate disabled:bg-momentizing-mint-deep disabled:text-momentizing-muted",
  secondary: "border border-momentizing-slate/30 bg-white text-momentizing-slate hover:bg-momentizing-slate/5 disabled:text-momentizing-muted",
  ghost: "text-momentizing-slate underline-offset-4 hover:underline disabled:text-momentizing-muted",
};

export function BookButton({
  variant = "primary",
  loading,
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${focusRing} ${className}`}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function BookCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-momentizing-slate/10 bg-white p-5 shadow-[0_8px_30px_rgba(47,62,70,0.06)] sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

/** Visible label + optional hint + error, wired to the control by id (placeholders are never the only label). */
export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-momentizing-slate">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-momentizing-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** Text input styled for the wizard: 16px font (so iOS Safari doesn't zoom on focus), tall, visible focus ring. */
export const inputClass =
  "w-full min-h-12 rounded-2xl border border-momentizing-slate/20 bg-white px-4 py-3 text-base text-momentizing-slate placeholder:text-momentizing-muted focus-visible:border-momentizing-teal focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-momentizing-teal";

export function InlineNotice({
  tone = "info",
  children,
  role,
}: {
  tone?: "info" | "warn" | "error" | "success";
  children: ReactNode;
  role?: "alert" | "status";
}) {
  const tones = {
    info: "border-momentizing-slate/15 bg-momentizing-mint text-momentizing-slate",
    warn: "border-amber-300 bg-amber-50 text-amber-900",
    error: "border-red-300 bg-red-50 text-red-900",
    success: "border-momentizing-teal/40 bg-momentizing-mint text-momentizing-slate",
  } as const;
  return (
    <div role={role} className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function StepHeading({ headingRef, title, sub }: { headingRef: RefObject<HTMLHeadingElement | null>; title: string; sub?: string }) {
  return (
    <header className="mb-6">
      <h1 ref={headingRef} tabIndex={-1} className="font-marketing-serif text-3xl leading-tight outline-none sm:text-4xl">
        {title}
      </h1>
      {sub && <p className="mt-2 text-base text-momentizing-muted">{sub}</p>}
    </header>
  );
}

/** Back / Continue. Fixed to the bottom on phones (thumb reach, above the notch), inline on larger screens. */
export function ActionBar({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  loading,
  hint,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  hint?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-momentizing-slate/10 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:z-auto md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
      <div className="mx-auto flex max-w-2xl flex-col gap-2">
        {hint && (
          <p className="text-center text-sm text-momentizing-muted" role="status">
            {hint}
          </p>
        )}
        <div className="flex gap-3">
          {onBack && (
            <BookButton variant="secondary" onClick={onBack} className="flex-shrink-0">
              Back
            </BookButton>
          )}
          <BookButton onClick={onNext} disabled={nextDisabled} loading={loading} className="flex-1">
            {nextLabel}
          </BookButton>
        </div>
      </div>
    </div>
  );
}

export function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-momentizing-mint/60 px-4 py-3">
      <div className="min-w-0">
        <dt className="text-xs font-semibold tracking-wide text-momentizing-muted uppercase">{label}</dt>
        <dd className="mt-0.5 break-words text-base font-semibold">{value}</dd>
      </div>
      <button type="button" onClick={onEdit} className="min-h-11 flex-shrink-0 px-2 text-sm font-semibold underline focus-visible:outline-2 focus-visible:outline-momentizing-teal">
        Change<span className="sr-only"> {label}</span>
      </button>
    </div>
  );
}
