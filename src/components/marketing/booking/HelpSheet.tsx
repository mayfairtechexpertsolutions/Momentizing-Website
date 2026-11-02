"use client";

import { t } from "@/i18n";
import { useEffect, useState, type FormEvent } from "react";
import { errorMessage } from "@/lib/api";
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
      setError(t("booking.securityWait"));
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
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
      setResetSignal((n) => n + 1); // a Turnstile token is single-use
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={done ? t("site.help2.doneTitle") : t("site.help2.title")} labelledBy="help-title">
      {done ? (
        <div className="flex flex-col gap-4" role="status">
          <InlineNotice tone="success">
            {t("site.help2.thanksA", { name: fullName.trim().split(" ")[0] })} <strong>{whatsapp}</strong> {t("site.help2.thanksB")}
          </InlineNotice>
          <p className="text-sm text-momentizing-muted">{t("site.help2.nothingElse")}</p>
          <BookButton onClick={onClose}>{t("site.common.close")}</BookButton>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate={false}>
          <p className="text-momentizing-muted">{t("site.help2.intro")}</p>
          <Field id="help-name" label={t("site.form.yourName")}>
            <input name="fullName" id="help-name" required autoComplete="name" autoCapitalize="words" autoCorrect="off" spellCheck={false} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </Field>
          <Field id="help-wa" label={t("site.form.waNumber")} hint={t("site.help2.waHint")}>
            <input
              name="whatsapp" id="help-wa"
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
          <Field id="help-times" label={t("site.help2.whenLabel")}>
            <input name="preferredTimes" id="help-times" value={times} onChange={(e) => setTimes(e.target.value)} placeholder={t("site.help2.whenPlaceholder")} maxLength={300} className={inputClass} />
          </Field>
          <Field id="help-note" label={t("site.help2.noteLabel")}>
            <textarea name="note" id="help-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} className={`${inputClass} resize-y`} />
          </Field>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-momentizing-muted">
            <input name="consentAccepted" type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 flex-shrink-0 accent-[var(--momentizing-teal)]" />
            <span>
              {t("site.help2.consent")}{" "}
              <a href={withBase("/legal/")} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                {t("site.form.termsPrivacy")}
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
            {submitting ? t("site.common.sending") : t("site.help2.submit")}
          </BookButton>
        </form>
      )}
    </Sheet>
  );
}
