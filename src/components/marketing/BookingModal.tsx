"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { apiFetch, errorMessage } from "@/lib/api";
import { usePackages } from "@/lib/session-packages";
import { useWhatsAppLink } from "@/lib/whatsapp";
import { BookButton, Field, InlineNotice, inputClass } from "./booking/ui";
import { Sheet } from "./booking/Sheet";

interface BookingModalProps {
  open: boolean;
  initialPackageId?: number;
  onClose: () => void;
}

function buildWhatsAppMessage(fullName: string, packageName: string | undefined, message: string): string {
  const lines = [`Hi Momentizing, I have a question${packageName ? ` about the ${packageName}` : ""}.`];
  if (fullName) lines.push(`My name is ${fullName}.`);
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
  const { data: packages } = usePackages();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // undefined = no explicit choice yet, so it falls back to initialPackageId/the first package below;
  // once the visitor picks one, that choice sticks even if `packages` re-fetches.
  const [pickedPackageId, setPickedPackageId] = useState<number | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const packageId = pickedPackageId ?? initialPackageId ?? packages?.[0]?.id;
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
        packageId: packageId ?? null,
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
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handleWhatsApp() {
    // Fire-and-forget: the lead still lands in the same admin queue as form submissions, but
    // the WhatsApp handoff shouldn't wait on the network round trip.
    submitInquiry("WHATSAPP").catch(() => {
      /* best-effort — the visitor's WhatsApp conversation is the real record either way */
    });
    window.open(whatsAppLink(buildWhatsAppMessage(fullName, selectedPackage?.name, message)), "_blank", "noopener,noreferrer");
    handleClose();
  }

  return (
    <Sheet open={open} onClose={handleClose} title={submitted ? "Request received" : "Ask our team"} labelledBy="enquiry-title">
      {submitted ? (
        <div className="flex flex-col gap-4" role="status">
          <InlineNotice tone="success">
            Thanks{fullName ? `, ${fullName.split(" ")[0]}` : ""} — our team will reach out within one business day.
          </InlineNotice>
          <p className="text-momentizing-muted">Want to secure a time right now? You can book a session in a few minutes — no account needed.</p>
          <Link href="/book" onClick={handleClose}>
            <span className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-momentizing-teal px-6 py-3 text-sm font-semibold text-white hover:bg-momentizing-slate/90">
              Book a session
            </span>
          </Link>
        </div>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <p className="text-momentizing-muted">Questions about a package or a corporate plan? Leave your details and we&apos;ll get back to you.</p>
          <Field id="enq-name" label="Your name">
            <input name="fullName" id="enq-name" required autoComplete="name" autoCapitalize="words" autoCorrect="off" spellCheck={false} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </Field>
          <Field id="enq-email" label="Email">
            <input name="email" id="enq-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          <Field id="enq-phone" label="WhatsApp or phone (optional)">
            <input name="phone" id="enq-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </Field>
          {(packages ?? []).length > 0 && (
            <Field id="enq-package" label="I'm interested in">
              <select name="packageId" id="enq-package" value={packageId ?? ""} onChange={(e) => setPickedPackageId(Number(e.target.value))} className={inputClass}>
                {(packages ?? []).map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field id="enq-message" label="How can we help? (optional)">
            <textarea name="message" id="enq-message" rows={3} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputClass} resize-y`} />
          </Field>
          {error && (
            <InlineNotice tone="error" role="alert">
              {error}
            </InlineNotice>
          )}
          <BookButton type="submit" loading={submitting}>
            {submitting ? "Sending…" : "Send to our team"}
          </BookButton>
          <BookButton variant="secondary" onClick={handleWhatsApp} disabled={!fullName.trim()}>
            Or continue on WhatsApp
          </BookButton>
        </form>
      )}
    </Sheet>
  );
}
