"use client";

/** Slim, calm progress indicator: "Step 2 of 5 · About you" plus a bar. Announced politely for screen readers. */
export function Stepper({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold text-momentizing-muted" aria-live="polite">
        Step {step} of {total} <span aria-hidden="true">·</span> <span className="text-momentizing-slate">{label}</span>
      </p>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-momentizing-slate/10"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-label={`Booking progress, step ${step} of ${total}`}
      >
        <div className="h-full rounded-full bg-momentizing-teal transition-all duration-500 motion-reduce:transition-none" style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  );
}
