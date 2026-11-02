/** Shown wherever the built-in team profiles replace the live directory, so visitors know booking works by WhatsApp. */
export function FallbackNotice({ className = "" }: { className?: string }) {
  return (
    <p
      role="status"
      className={`mx-auto max-w-2xl rounded-2xl border border-momentizing-slate/15 bg-momentizing-mint px-4 py-3 text-sm leading-relaxed text-momentizing-slate ${className}`}
    >
      <i aria-hidden="true" className="fas fa-info-circle mr-2 text-momentizing-teal" />
      Showing our team&apos;s profiles — live availability is temporarily unavailable. You can still request a session and we&apos;ll confirm it with you on WhatsApp.
    </p>
  );
}
