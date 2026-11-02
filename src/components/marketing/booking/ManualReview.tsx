"use client";

import { t } from "@/i18n";
import { useEffect, useState, type RefObject } from "react";
import { getFallbackSpecialist } from "@/lib/fallback-specialists";
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
  const expertTimeZone = specialist ? getFallbackSpecialist(specialist.id)?.timeZone : undefined;
  if (!specialist || !expertTimeZone || !draft.date || !draft.time) {
    return (
      <BookCard>
        <StepHeading headingRef={headingRef} title={t("site.book.almost")} />
        <InlineNotice tone="warn">{t("site.book.missing")}</InlineNotice>
        <ActionBar onBack={onBack} onNext={onBack} nextLabel={t("site.common.back")} />
      </BookCard>
    );
  }

  const when = formatManualWhen(draft.date, draft.time, expertTimeZone);
  const link = whatsAppLink(
    buildManualBookingMessage({
      specialistName: specialist.name,
      expertTimeZone,
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
        <StepHeading headingRef={headingRef} title={t("site.fallback.sentTitle")} />
        <InlineNotice tone="info" role="status">
          <p>{t("site.fallback.sentBody", { name: specialist.name, when })}</p>
          <p className="mt-2 font-semibold">{t("site.fallback.notConfirmed")}</p>
        </InlineNotice>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a
            href={sentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-momentizing-teal px-6 py-3 text-sm font-semibold text-white transition hover:bg-momentizing-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal"
          >
            <i aria-hidden="true" className="fab fa-whatsapp text-lg" /> {t("site.fallback.openAgain")}
            <span className="sr-only"> {t("site.common.newTab")}</span>
          </a>
          <BookButton variant="secondary" onClick={onStartOver}>
            {t("site.fallback.startOver")}
          </BookButton>
        </div>
      </BookCard>
    );
  }

  return (
    <>
      <BookCard>
        <StepHeading headingRef={headingRef} title={t("site.fallback.reviewTitle")} sub={t("site.fallback.reviewSub")} />
        <dl className="grid gap-3">
          <ReviewRow label={t("site.spec.specialist")} value={specialist.name} onEdit={() => onEdit("specialist")} />
          <ReviewRow label={t("site.events.when")} value={when} onEdit={() => onEdit("time")} />
          <ReviewRow label={t("site.form.yourName")} value={draft.fullName} onEdit={() => onEdit("about")} />
          <ReviewRow label="WhatsApp" value={draft.whatsapp} onEdit={() => onEdit("about")} />
        </dl>
        <div className="mt-5">
          <InlineNotice>
            <strong>{t("site.fallback.notBooking")}</strong> {t("site.fallback.notBookingBody")}
          </InlineNotice>
        </div>
      </BookCard>
      <ActionBar onBack={onBack} onNext={send} nextLabel={t("site.fallback.sendButton")} />
    </>
  );
}
