"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { apiFetch, errorMessage, isBackendUnavailable } from "@/lib/api";
import { reportBackendUnavailable, useBackendStatus } from "@/lib/backend-status";
import { usePackages } from "@/lib/session-packages";
import { useWhatsAppLink } from "@/lib/whatsapp";
import { BookButton, Field, InlineNotice, inputClass } from "./booking/ui";
import { Sheet } from "./booking/Sheet";
import { t } from "@/i18n";

interface BookingModalProps {
  open: boolean;
  initialPackageId?: number;
  onClose: () => void;
}

function buildWhatsAppMessage(fullName: string, packageName: string | undefined, message: string): string {
  const lines = [packageName ? t("site.whatsapp.questionAbout", { name: packageName }) : t("site.whatsapp.corporate")];
  if (fullName) lines.push(t("site.whatsapp.myName", { name: fullName }));
  if (message) lines.push(message);
  return lines.join(" ");
}

/**
 * "Ask our team" — for questions about a package or corporate plans, not for booking a single session (that is the
 * /book wizard, which can hold a real slot). The enquiry lands in the same admin queue as before. Built on the shared
 * accessible <Sheet> (real dialog: focus trap, Escape, scroll lock, labelled fields).
 */
export function BookingModal({ open, initialPackageId, onClose }: BookingModalProps) {
  const whatsAppLink = useWhatsAppLink();
  const backendOffline = useBackendStatus() === "offline";
  const { data: packages } = usePackages();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // undefined = no explicit choice yet, so it falls back to initialPackageId/the first package below;
  // once the visitor picks one, that choice sticks even if `packages` re-fetches.
  // null = the visitor explicitly chose "Corporate / team wellbeing" (no package).
  const [pickedPackageId, setPickedPackageId] = useState<number | null | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Opened from a package card: that package. Opened from "Inquire for corporate": no package, never the first one.
  const packageId = pickedPackageId === undefined ? initialPackageId : (pickedPackageId ?? undefined);
  const selectedPackage = packages?.find((p) => p.id === packageId);

  // Closing keeps what the visitor typed (an accidental tap outside shouldn't erase a message); it is only cleared
  // after a successful send.
  function handleClose() {
    setError(null);
    if (submitted) {
      setSubmitted(false);
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setPickedPackageId(undefined);
    }
    onClose();
  }

  async function submitInquiry(channel: "WEBSITE_FORM" | "WHATSAPP") {
    return apiFetch<{ id: number }>("/public/booking-inquiries", {
      method: "POST",
      anonymous: true,
      body: JSON.stringify({
        fullName: fullName || null,
        email: email || null,
        phone: phone || null,
        packageId: packageId != null && packageId > 0 ? packageId : null,
        message: message || null,
        channel,
      }),
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitInquiry("WEBSITE_FORM");
      setSubmitted(true);
    } catch (err) {
      // A down backend swaps the form for the WhatsApp alternative (below) instead of leaving a dead end.
      if (isBackendUnavailable(err)) reportBackendUnavailable();
      else setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handleWhatsApp() {
    // Fire-and-forget: the lead still lands in the same admin queue as form submissions, but
    // the WhatsApp handoff shouldn't wait on the network round trip.
    // Skipped while the backend is known to be down: it would only fail.
    if (!backendOffline) {
      submitInquiry("WHATSAPP").catch(() => {
        /* best-effort — the visitor's WhatsApp conversation is the real record either way */
      });
    }
    window.open(whatsAppLink(buildWhatsAppMessage(fullName, selectedPackage?.name, message)), "_blank", "noopener,noreferrer");
    handleClose();
  }

  return (
    <Sheet open={open} onClose={handleClose} title={submitted ? t("site.enquiry.received") : t("site.enquiry.title")} labelledBy="enquiry-title">
      {submitted ? (
        <div className="flex flex-col gap-4" role="status">
          <InlineNotice tone="success">
            {fullName ? t("site.enquiry.thanksName", { name: fullName.split(" ")[0] }) : t("site.enquiry.thanks")}
          </InlineNotice>
          <p className="text-momentizing-muted">{t("site.enquiry.bookNow")}</p>
          <Link href="/book" onClick={handleClose}>
            <span className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-momentizing-teal px-6 py-3 text-sm font-semibold text-white hover:bg-momentizing-slate/90">
              {t("site.notFound.book")}
            </span>
          </Link>
        </div>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <p className="text-momentizing-muted">{backendOffline ? t("site.offline.enquiryBody") : t("site.enquiry.intro")}</p>
          <Field id="enq-name" label={t("site.form.yourName")}>
            <input name="fullName" id="enq-name" required autoComplete="name" autoCapitalize="words" autoCorrect="off" spellCheck={false} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </Field>
          {!backendOffline && (<>
          <Field id="enq-email" label={t("app.common.email")}>
            <input name="email" id="enq-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          <Field id="enq-phone" label={t("site.enquiry.phone")}>
            <input name="phone" id="enq-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </Field>
          {(packages ?? []).length > 0 && (
            <Field id="enq-package" label={t("site.enquiry.interested")}>
              <select name="packageId" id="enq-package" value={packageId ?? ""} onChange={(e) => setPickedPackageId(e.target.value === "" ? null : Number(e.target.value))} className={inputClass}>
                <option value="">{t("site.enquiry.corporateOption")}</option>
                {(packages ?? []).map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          </>)}
          <Field id="enq-message" label={t("site.enquiry.message")}>
            <textarea name="message" id="enq-message" rows={3} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputClass} resize-y`} />
          </Field>
          {error && (
            <InlineNotice tone="error" role="alert">
              {error}
            </InlineNotice>
          )}
          {!backendOffline && (
            <BookButton type="submit" loading={submitting}>
              {submitting ? t("site.common.sending") : t("site.enquiry.send")}
            </BookButton>
          )}
          <BookButton variant={backendOffline ? "primary" : "secondary"} onClick={handleWhatsApp} disabled={!fullName.trim()}>
            {backendOffline ? t("site.enquiry.whatsappOnly") : t("site.enquiry.whatsapp")}
          </BookButton>
        </form>
      )}
    </Sheet>
  );
}
