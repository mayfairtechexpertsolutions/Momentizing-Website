"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { requestBookingHelp } from "@/lib/guest-booking";
import { BookButton, Field, InlineNotice, inputClass } from "./ui";
import { Sheet } from "./Sheet";
import { TurnstileWidget, TURNSTILE_ENABLED } from "./TurnstileWidget";
import { withBase } from "@/lib/base-path";

export interface HelpPrefill {
  fullName: string;
  whatsapp: string;
  specialistId?: number;
  preferredDate?: string;
  answers?: Record<string, string>;
}

/**
 * "I can't find my schedule, please help me find one." A short, low-effort form: the visitor confirms who they are and
 * roughly when suits them; staff follow up on WhatsApp. Pre-filled with everything the wizard already knows.
 */
export function HelpSheet({
  open,
  onClose,
  prefill,
  formToken,
}: {
  open: boolean;
  onClose: () => void;
  prefill: HelpPrefill;
  formToken: string;
}) {
  const [fullName, setFullName] = useState(prefill.fullName);
  const [whatsapp, setWhatsapp] = useState(prefill.whatsapp);
  const [times, setTimes] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Re-seed from the wizard each time the sheet is opened (the visitor may have typed more since last time).
  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect -- re-seed the form from the wizard each time the sheet opens */
      setFullName(prefill.fullName);
      setWhatsapp(prefill.whatsapp);
      setError(null);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open, prefill.fullName, prefill.whatsapp]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError("Please wait for the security check to finish, then try again.");
      return;
    }
    setSubmitting(true);
    try {
      await requestBookingHelp({
        fullName: fullName.trim(),
        whatsapp: whatsapp.trim(),
        specialistId: prefill.specialistId,
        preferredDate: prefill.preferredDate,
        preferredTimes: times.trim() || undefined,
        answers: prefill.answers,
        note: note.trim() || undefined,
        consentAccepted: consent,
        turnstileToken: turnstileToken || undefined,
        formToken,
        website: "",
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't send your request. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
      setResetSignal((n) => n + 1); // a Turnstile token is single-use
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={done ? "We've got your request" : "Let us help you find a time"} labelledBy="help-title">
      {done ? (
        <div className="flex flex-col gap-4" role="status">
          <InlineNotice tone="success">
            Thank you, {fullName.trim().split(" ")[0]}. One of our team will message you on WhatsApp at <strong>{whatsapp}</strong> to find a time that works for you.
          </InlineNotice>
          <p className="text-sm text-momentizing-muted">There&apos;s nothing else you need to do. If you&apos;d rather not wait, you can also message us directly on WhatsApp.</p>
          <BookButton onClick={onClose}>Close</BookButton>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate={false}>
          <p className="text-momentizing-muted">Tell us roughly what suits you and we&apos;ll come back to you on WhatsApp. It only takes a moment.</p>
          <Field id="help-name" label="Your name">
            <input id="help-name" required autoComplete="name" autoCapitalize="words" autoCorrect="off" spellCheck={false} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </Field>
          <Field id="help-wa" label="WhatsApp number" hint="We'll only use this to arrange your session.">
            <input
              id="help-wa"
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+62 812 3456 7890"
              className={inputClass}
              aria-describedby="help-wa-hint"
            />
          </Field>
          <Field id="help-times" label="When would suit you? (optional)">
            <input id="help-times" value={times} onChange={(e) => setTimes(e.target.value)} placeholder="e.g. weekday evenings, Saturday mornings" maxLength={300} className={inputClass} />
          </Field>
          <Field id="help-note" label="Anything else we should know? (optional)">
            <textarea id="help-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} className={`${inputClass} resize-y`} />
          </Field>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-momentizing-muted">
            <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 flex-shrink-0 accent-[var(--momentizing-teal)]" />
            <span>
              I agree to be contacted on WhatsApp about this request, and to the{" "}
              <a href={withBase("/legal/")} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                Terms &amp; Privacy
              </a>
              .
            </span>
          </label>
          <TurnstileWidget onToken={setTurnstileToken} onError={setError} resetSignal={resetSignal} />
          {error && (
            <InlineNotice tone="error" role="alert">
              {error}
            </InlineNotice>
          )}
          <BookButton type="submit" loading={submitting} disabled={!consent}>
            {submitting ? "Sending…" : "Ask the team to help me"}
          </BookButton>
        </form>
      )}
    </Sheet>
  );
}
