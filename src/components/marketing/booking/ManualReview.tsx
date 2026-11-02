"use client";

import { useEffect, useState, type RefObject } from "react";
import { buildManualBookingMessage, formatManualWhen } from "@/lib/manual-booking";
import { useWhatsAppLink } from "@/lib/whatsapp";
import { ActionBar, BookButton, BookCard, InlineNotice, ReviewRow, StepHeading } from "./ui";
import type { Draft, StepId } from "./wizard-state";

/**
 * Final step when the backend is unavailable: nothing is held or posted. "Send on WhatsApp" opens a chat with the
 * summary pre-written; the visitor presses Send. The request is NOT a confirmed booking until the team replies.
 */
export function ManualReview({
  draft,
  headingRef,
  onBack,
  onEdit,
  onSent,
  onStartOver,
}: {
  draft: Draft;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onEdit: (step: StepId) => void;
  /** Called once WhatsApp has been opened, so the wizard can drop the stored draft (it holds a name and phone number). */
  onSent: () => void;
  onStartOver: () => void;
}) {
  const whatsAppLink = useWhatsAppLink();
  // Kept in component state (not storage) so "open again" still works after the draft has been cleared.
  const [sentLink, setSentLink] = useState<string | null>(null);

  useEffect(() => {
    if (sentLink) headingRef.current?.focus();
  }, [sentLink, headingRef]);

  const specialist = draft.specialist;
  if (!specialist || !draft.date || !draft.time) {
    return (
      <BookCard>
        <StepHeading headingRef={headingRef} title="Almost there" />
        <InlineNotice tone="warn">Some details are missing. Please go back and complete the earlier steps.</InlineNotice>
        <ActionBar onBack={onBack} onNext={onBack} nextLabel="Go back" />
      </BookCard>
    );
  }

  const when = formatManualWhen(draft.date, draft.time);
  const link = whatsAppLink(
    buildManualBookingMessage({
      specialistName: specialist.name,
      date: draft.date,
      time: draft.time,
      fullName: draft.fullName,
      whatsapp: draft.whatsapp,
      answers: draft.answers,
      concerns: draft.concerns,
      note: draft.note,
    })
  );

  function send() {
    window.open(link, "_blank", "noopener,noreferrer");
    setSentLink(link);
    onSent();
  }

  if (sentLink) {
    return (
      <BookCard>
        <StepHeading headingRef={headingRef} title="Almost done — press Send in WhatsApp" />
        <InlineNotice tone="info" role="status">
          <p>
            We&apos;ve opened WhatsApp with your request for <strong>{specialist.name}</strong> on <strong>{when}</strong>. Press <strong>Send</strong> to pass it to our team.
          </p>
          <p className="mt-2">
            <strong>Your session isn&apos;t confirmed yet.</strong> Our team will reply on WhatsApp to agree a time with you.
          </p>
        </InlineNotice>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a
            href={sentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-momentizing-teal px-6 py-3 text-sm font-semibold text-white transition hover:bg-momentizing-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal"
          >
            <i aria-hidden="true" className="fab fa-whatsapp text-lg" /> Open WhatsApp again
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <BookButton variant="secondary" onClick={onStartOver}>
            Start over
          </BookButton>
        </div>
      </BookCard>
    );
  }

  return (
    <>
      <BookCard>
        <StepHeading headingRef={headingRef} title="Check and send your request" sub="Have a look that everything is right. We'll open WhatsApp with this message ready for you to send." />
        <dl className="grid gap-3">
          <ReviewRow label="Specialist" value={specialist.name} onEdit={() => onEdit("specialist")} />
          <ReviewRow label="When" value={when} onEdit={() => onEdit("time")} />
          <ReviewRow label="Your name" value={draft.fullName} onEdit={() => onEdit("about")} />
          <ReviewRow label="WhatsApp" value={draft.whatsapp} onEdit={() => onEdit("about")} />
        </dl>
        <div className="mt-5">
          <InlineNotice>
            <strong>This is a request, not a booking.</strong> Our team will reply on WhatsApp to confirm the time and arrange payment — there&apos;s nothing to pay now.
          </InlineNotice>
        </div>
      </BookCard>
      <ActionBar onBack={onBack} onNext={send} nextLabel="Send request on WhatsApp" />
    </>
  );
}
