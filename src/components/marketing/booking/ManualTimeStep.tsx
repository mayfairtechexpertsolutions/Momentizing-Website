"use client";

import { t } from "@/i18n";
import type { RefObject } from "react";
import {
  FALLBACK_TIME_ZONE_LABEL,
  formatClock,
  formatWorkingWindow,
  getFallbackSpecialist,
  isWithinWorkingHours,
} from "@/lib/fallback-specialists";
import { todayIso } from "@/lib/local-date";
import { MANUAL_TIME_OPTIONS } from "@/lib/manual-booking";
import { DateStrip } from "./DateStrip";
import { ActionBar, BookCard, Field, InlineNotice, StepHeading, inputClass } from "./ui";
import { firstNameOf } from "./SpecialistParts";
import type { Draft } from "./wizard-state";

/**
 * "Pick a day and time" when the specialist has no live calendar (the backend is unavailable). Any day and time can be
 * requested; the expert's usual hours are only a hint, never a block. The request goes out by WhatsApp (ManualReview).
 */
export function ManualTimeStep({
  draft,
  patch,
  headingRef,
  onBack,
  onNext,
}: {
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBack?: () => void;
  onNext: () => void;
}) {
  const specialist = draft.specialist;
  const date = draft.date ?? todayIso();
  const windows = specialist ? (getFallbackSpecialist(specialist.id)?.workingHours ?? []) : [];
  const first = specialist ? firstNameOf(specialist.name) : "";
  const outsideUsualHours = !!draft.time && windows.length > 0 && !isWithinWorkingHours(windows, date, draft.time);

  return (
    <>
      <BookCard>
        <StepHeading
          headingRef={headingRef}
          title={t("site.fallback.timeTitle")}
          sub={t("site.fallback.timeSub", { name: first || t("site.fallback.yourSpecialist") })}
        />

        {windows.length > 0 && (
          <div className="mb-5">
            <InlineNotice>
              <p className="font-semibold">{t("site.fallback.usualHours", { name: first, zone: FALLBACK_TIME_ZONE_LABEL })}</p>
              <ul className="mt-1">
                {windows.map((w) => (
                  <li key={formatWorkingWindow(w)}>{formatWorkingWindow(w)}</li>
                ))}
              </ul>
            </InlineNotice>
          </div>
        )}

        <div className="mb-5">
          <DateStrip value={date} onChange={(iso) => patch({ date: iso })} label={t("site.fallback.chooseDay")} />
        </div>

        <Field id="manualTime" label={t("site.fallback.startTime", { zone: FALLBACK_TIME_ZONE_LABEL })} hint={t("site.fallback.tzHint")}>
          <select
            id="manualTime"
            name="manualTime"
            value={draft.time ?? ""}
            onChange={(e) => patch({ time: e.target.value || null, date })}
            className={inputClass}
          >
            <option value="">{t("site.fallback.chooseTimeOption")}</option>
            {MANUAL_TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {formatClock(time)}
              </option>
            ))}
          </select>
        </Field>

        {outsideUsualHours && (
          <div className="mt-4">
            <InlineNotice tone="warn" role="status">
              {t("site.fallback.outsideHours", { name: first })}
            </InlineNotice>
          </div>
        )}
      </BookCard>
      <ActionBar onBack={onBack} onNext={onNext} nextDisabled={!draft.time} hint={!draft.time ? t("site.fallback.chooseTimeHint") : undefined} />
    </>
  );
}
