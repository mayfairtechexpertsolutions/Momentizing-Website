"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

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
