"use client";

import { t } from "@/i18n";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { friendlyError, newIdempotencyKey } from "@/lib/guest-booking";
import {
  fetchCareerFormToken,
  PROFESSIONS,
  putResume,
  requestResumeUpload,
  resumeProblem,
  submitCareerApplication,
  type ProfessionValue,
} from "@/lib/careers";
import { looksLikePhone } from "@/components/marketing/booking/wizard-state";
import { BookButton, BookCard, Field, InlineNotice, inputClass } from "@/components/marketing/booking/ui";
import { TURNSTILE_ENABLED, TurnstileWidget } from "@/components/marketing/booking/TurnstileWidget";

type Errors = Partial<Record<"fullName" | "email" | "whatsapp" | "professionType" | "resume" | "consent" | "portfolioUrl", string>>;

const FORM_TOKEN_REFRESH_MS = 90 * 60 * 1000;

export function CareerForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [professionType, setProfessionType] = useState<ProfessionValue | "">("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [languages, setLanguages] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [turnstileToken, setTurnstileToken] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const token = useRef<{ value: string; minSeconds: number; at: number } | null>(null);
  const idempotencyKey = useRef(newIdempotencyKey());

  useEffect(() => {
    fetchCareerFormToken()
      .then((t) => (token.current = { value: t.formToken, minSeconds: t.minSeconds, at: Date.now() }))
      .catch(() => undefined); // retried on submit
  }, []);

  async function freshToken() {
    const t = token.current;
    if (!t || Date.now() - t.at > FORM_TOKEN_REFRESH_MS) {
      const next = await fetchCareerFormToken();
      token.current = { value: next.formToken, minSeconds: next.minSeconds, at: Date.now() };
    }
    const cur = token.current!;
    // The server rejects forms filled faster than a person could.
    const wait = cur.minSeconds * 1000 - (Date.now() - cur.at);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait + 250));
    return cur.value;
  }

  function validate(): Errors {
    const e: Errors = {};
    if (fullName.trim().length < 2) e.fullName = t("career.nameRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = t("career.emailInvalid");
    if (!looksLikePhone(whatsapp)) e.whatsapp = t("career.whatsappInvalid");
    if (!professionType) e.professionType = t("career.professionRequired");
    if (!file) e.resume = t("career.resumeRequired");
    else {
      const p = resumeProblem(file);
      if (p) e.resume = p;
    }
    if (portfolioUrl.trim() && !/^https?:\/\/\S+$/i.test(portfolioUrl.trim())) e.portfolioUrl = t("career.linkInvalid");
    if (!consent) e.consent = t("career.consentRequired");
    return e;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setFormError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (TURNSTILE_ENABLED && !turnstileToken) {
      setFormError(t("booking.securityWait"));
      return;
    }

    setSubmitting(true);
    try {
      const formToken = await freshToken();
      const upload = await requestResumeUpload(file!, formToken);
      await putResume(upload, file!);
      await submitCareerApplication(
        {
          fullName: fullName.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          professionType: professionType as ProfessionValue,
          licenceNumber: licenceNumber.trim() || undefined,
          yearsExperience: yearsExperience.trim() ? Number(yearsExperience) : undefined,
          languages: languages.trim() || undefined,
          bio: bio.trim() || undefined,
          portfolioUrl: portfolioUrl.trim() || undefined,
          resumeKey: upload.resumeKey,
          resumeFilename: file!.name,
          consentAccepted: true,
          turnstileToken,
          formToken,
          website: honeypot,
        },
        idempotencyKey.current,
      );
      setDone(true);
    } catch (e) {
      setFormError(friendlyError(e));
      token.current = null; // form tokens are cheap; fetch a new one on retry
      setResetSignal((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <BookCard>
        <div role="status">
          <h3 className="font-marketing-serif text-2xl font-semibold">Thank you, we have your application</h3>
          <p className="mt-2 leading-relaxed text-momentizing-muted">
            We sent a confirmation to {email.trim()}. Our team will review it and get back to you.
          </p>
        </div>
      </BookCard>
    );
  }

  return (
    <BookCard>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5" aria-label="Expert application">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="career-name" label="Full name" error={errors.fullName}>
            <input name="fullName" id="career-name" className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" maxLength={150} aria-invalid={!!errors.fullName} />
          </Field>
          <Field id="career-email" label="Email" error={errors.email}>
            <input name="email" id="career-email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={255} aria-invalid={!!errors.email} />
          </Field>
          <Field id="career-whatsapp" label="WhatsApp number" hint="We use this to reach you about your application." error={errors.whatsapp}>
            <input name="whatsapp" id="career-whatsapp" type="tel" className={inputClass} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} autoComplete="tel" maxLength={40} aria-invalid={!!errors.whatsapp} />
          </Field>
          <Field id="career-profession" label="Profession" error={errors.professionType}>
            <select name="professionType" id="career-profession" className={inputClass} value={professionType} onChange={(e) => setProfessionType(e.target.value as ProfessionValue)} aria-invalid={!!errors.professionType}>
              <option value="">Choose one</option>
              {PROFESSIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="career-licence" label="Licence number (optional)">
            <input name="licenceNumber" id="career-licence" className={inputClass} value={licenceNumber} onChange={(e) => setLicenceNumber(e.target.value)} maxLength={100} />
          </Field>
          <Field id="career-years" label="Years of experience (optional)">
            <input name="yearsExperience" id="career-years" type="number" inputMode="numeric" min={0} max={70} className={inputClass} value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
          </Field>
        </div>

        <Field id="career-languages" label="Languages you work in (optional)" hint="For example: Bahasa Indonesia, English">
          <input name="languages" id="career-languages" className={inputClass} value={languages} onChange={(e) => setLanguages(e.target.value)} maxLength={200} />
        </Field>

        <Field id="career-bio" label="About your practice (optional)" hint="Who you help and how you work. Up to 2000 characters.">
          <textarea name="bio" id="career-bio" rows={5} className={inputClass} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={2000} />
        </Field>

        <Field id="career-portfolio" label="Website or LinkedIn (optional)" error={errors.portfolioUrl}>
          <input name="portfolioUrl" id="career-portfolio" type="url" className={inputClass} value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} maxLength={500} aria-invalid={!!errors.portfolioUrl} />
        </Field>

        <Field id="career-resume" label="Resume" hint="PDF or Word (.docx), up to 5 MB." error={errors.resume}>
          <input
            name="resume" id="career-resume"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            aria-invalid={!!errors.resume}
            className="min-h-12 w-full rounded-2xl border border-momentizing-slate/20 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-momentizing-mint file:px-4 file:py-2 file:text-sm file:font-semibold file:text-momentizing-slate"
          />
        </Field>

        {/* Honeypot: hidden from people and assistive tech; bots tend to fill every input. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="career-website">Website</label>
          <input id="career-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed">
            <input name="consentAccepted" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-momentizing-teal" aria-invalid={!!errors.consent} />
            <span>I agree that Momentizing may store my details and resume to assess my application, and keep them for up to 12 months.</span>
          </label>
          {errors.consent && (
            <p role="alert" className="text-sm font-medium text-red-700">
              {errors.consent}
            </p>
          )}
        </div>

        <TurnstileWidget onToken={setTurnstileToken} onError={setFormError} resetSignal={resetSignal} />

        {formError && (
          <InlineNotice tone="error" role="alert">
            {formError}
          </InlineNotice>
        )}

        <BookButton type="submit" loading={submitting} className="self-start">
          Send application
        </BookButton>
      </form>
    </BookCard>
  );
}
