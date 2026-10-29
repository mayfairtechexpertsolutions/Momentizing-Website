"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ApiError, hasCode } from "@/lib/api";
import { t } from "@/i18n";
import {
  createGuestBooking,
  fetchFormToken,
  fetchGuestBookingStatus,
  fetchPublicSpecialist,
  fetchSlots,
  fetchSuggestions,
  friendlyError,
  newIdempotencyKey,
  verificationLink,
  type GuestBooking,
  type PublicSlots,
  type PublicSpecialistCard,
} from "@/lib/guest-booking";
import { formatDateLong, formatSessionWhen, formatTime, icsStamp, localToUtc, todayIso, zoneLabel } from "@/lib/local-date";
import { BookButton, BookCard, Field, InlineNotice, inputClass } from "./ui";
import { DateStrip } from "./DateStrip";
import { HelpSheet } from "./HelpSheet";
import { SlotPicker } from "./SlotPicker";
import { SpecialistNameSearch, SpecialistProfileSheet, SpecialistSuggestionCard, firstNameOf } from "./SpecialistParts";
import { Stepper } from "./Stepper";
import { TurnstileWidget, TURNSTILE_ENABLED } from "./TurnstileWidget";
import { WhyJoinCard } from "./WhyJoinCard";
import { YesNoField } from "./YesNoField";
import {
  CONCERNS,
  COUPLE_MISMATCH_CODES,
  SLOT_GONE_CODES,
  EMPTY_DRAFT,
  LINKED_STEPS,
  STEPS,
  answersToRecord,
  clearActiveBooking,
  clearDraft,
  couplesMismatch,
  loadActiveBooking,
  loadDraft,
  looksLikePhone,
  saveActiveBooking,
  saveDraft,
  type ActiveBooking,
  type Draft,
  type StepId,
} from "./wizard-state";
import { withBase } from "@/lib/base-path";

/**
 * The public "book a session" flow. No account is needed. It ends with the visitor proving they own the WhatsApp
 * number they gave (so nobody can hold slots with someone else's number), then offers a free account.
 *
 *   date -> about you -> specialist -> time -> review -> [verify on WhatsApp] -> done
 *
 * Arriving from a specialist's profile (`?specialist=`) the specialist is already chosen, so the day is picked together
 * with the time and is never asked twice:  time -> about you -> review -> [verify on WhatsApp] -> done
 *
 * "I can't find my schedule, please help me find one" is reachable from every step after the first; it sends the
 * request to the team, who follow up on WhatsApp.
 */
export function BookingWizard() {
  const params = useSearchParams();
  const specialistParam = params.get("specialist");
  const dateParam = params.get("date");

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const [active, setActive] = useState<ActiveBooking | null>(null);
  const [formToken, setFormToken] = useState<string | null>(null);
  const [formTokenError, setFormTokenError] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  // Survives the review -> time step hop, so "that time was just taken" is still on screen after the bounce.
  const [slotNotice, setSlotNotice] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const patch = useCallback((p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p })), []);

  // ---- restore what the visitor already did (refresh / back button), then apply deep links
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from sessionStorage, which doesn't exist during SSR */
    const restoredBooking = loadActiveBooking();
    if (restoredBooking && restoredBooking.booking.status !== "CANCELLED") {
      setActive(restoredBooking);
    }
    const restored = loadDraft();
    let next: Draft = restored ?? EMPTY_DRAFT;
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) && dateParam >= todayIso()) {
      next = { ...next, date: dateParam };
    }
    setDraft(next);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [dateParam]);

  useEffect(() => {
    if (!hydrated || !specialistParam || !/^\d+$/.test(specialistParam)) return;
    let cancelled = false;
    fetchPublicSpecialist(Number(specialistParam))
      .then((s) => {
        // The link is the visitor's latest intent: it beats a specialist left over in an old draft. Switching to a
        // different specialist drops the old time (it belonged to someone else's calendar).
        if (!cancelled && s.acceptingNewClients) {
          setDraft((d) => {
            // The day and time are chosen together on the time step, so a linked visitor skips the standalone day step.
            const step: StepId = d.step === "date" || d.step === "specialist" || d.step === "review" ? "time" : d.step;
            const date = d.date ?? todayIso();
            return d.specialist?.id === s.id ? { ...d, date, step } : { ...d, specialist: s, mode: "SPECIFIC", time: null, date, step };
          });
        }
      })
      .catch(() => {
        /* an unknown/unavailable specialist in the link just falls back to the normal suggestions */
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, specialistParam]);

  useEffect(() => {
    if (hydrated && !active) saveDraft(draft);
  }, [draft, hydrated, active]);

  const loadFormToken = useCallback(() => {
    fetchFormToken()
      .then((t) => {
        setFormToken(t.formToken);
        setFormTokenError(null);
      })
      .catch((e) => setFormTokenError(friendlyError(e)));
  }, []);
  useEffect(() => {
    loadFormToken();
  }, [loadFormToken]);

  // Move keyboard/screen-reader focus to the new step's heading whenever the step changes.
  const stepKey = active ? `active-${active.booking.status}` : draft.step;
  useEffect(() => {
    if (hydrated) headingRef.current?.focus();
  }, [stepKey, hydrated]);

  const linked = !!specialistParam && draft.mode === "SPECIFIC" && draft.specialist?.id === Number(specialistParam);
  const steps = linked ? LINKED_STEPS : STEPS;
  const stepIndex = Math.max(0, steps.findIndex((s) => s.id === draft.step));
  const goto = (id: StepId) => {
    patch({ step: id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function startOver() {
    clearActiveBooking();
    clearDraft();
    setActive(null);
    setDraft({ ...EMPTY_DRAFT });
    window.scrollTo({ top: 0 });
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center" aria-busy="true">
        <p className="text-momentizing-muted">Getting things ready…</p>
      </div>
    );
  }

  // ---------------------------------------------------------------- after the hold is created
  if (active) {
    return (
      <>
        {active.booking.status === "CONFIRMED" ? (
          <StepDone active={active} headingRef={headingRef} onAnother={startOver} />
        ) : (
          <StepVerify
            active={active}
            headingRef={headingRef}
            onUpdate={(b) => {
              const next = { ...active, booking: { ...b, claimToken: active.claimToken } };
              if (b.status === "CONFIRMED") clearDraft(); // done: don't leave personal details in storage
              setActive(next);
              saveActiveBooking(next);
            }}
            onChooseAnother={() => {
              clearActiveBooking();
              setActive(null);
              patch({ step: "time", time: null });
            }}
            onHelp={() => setHelpOpen(true)}
          />
        )}
        <HelpSheet
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
          formToken={formToken ?? ""}
          prefill={{
            fullName: active.fullName,
            whatsapp: draft.whatsapp,
            specialistId: active.booking.specialistId,
            preferredDate: active.booking.sessionDate,
          }}
        />
      </>
    );
  }

  // ---------------------------------------------------------------- wizard steps
  const helpPrefill = {
    fullName: draft.fullName,
    whatsapp: draft.whatsapp,
    specialistId: draft.specialist?.id,
    preferredDate: draft.date ?? undefined,
    answers: answersToRecord(draft.answers, draft.concerns),
  };

  return (
    <>
      <Stepper step={stepIndex + 1} total={steps.length} label={steps[stepIndex].label} />

      {formTokenError && (
        <div className="mb-4">
          <InlineNotice tone="error" role="alert">
            {formTokenError}{" "}
            <button type="button" onClick={loadFormToken} className="relative font-semibold underline underline-offset-2 after:absolute after:-inset-x-2 after:-inset-y-3 after:content-['']">
              Try again
            </button>
          </InlineNotice>
        </div>
      )}

      {draft.step === "date" && <StepDate draft={draft} patch={patch} headingRef={headingRef} onNext={() => goto("about")} />}
      {draft.step === "about" && <StepAbout draft={draft} patch={patch} headingRef={headingRef} onBack={linked ? () => goto("time") : () => goto("date")} onNext={() => goto(linked ? "review" : draft.specialist ? "time" : "specialist")} />}
      {draft.step === "specialist" && (
        <StepSpecialist
          draft={draft}
          patch={patch}
          headingRef={headingRef}
          onBack={() => goto("about")}
          onNext={() => goto("time")}
          onHelp={() => setHelpOpen(true)}
        />
      )}
      {draft.step === "time" && (
        <StepTime
          draft={draft}
          patch={patch}
          headingRef={headingRef}
          linked={linked}
          onBack={linked ? undefined : () => goto("specialist")}
          onNext={() => {
            setSlotNotice(null);
            goto(linked ? "about" : "review");
          }}
          onHelp={() => setHelpOpen(true)}
          notice={slotNotice}
          onDismissNotice={() => setSlotNotice(null)}
        />
      )}
      {draft.step === "review" && (
        <StepReview
          draft={draft}
          headingRef={headingRef}
          formToken={formToken}
          refreshFormToken={loadFormToken}
          onBack={() => goto(linked ? "about" : "time")}
          onEdit={(id) => goto(linked && id === "specialist" ? "time" : id)}
          onHelp={() => setHelpOpen(true)}
          onSlotGone={(message) => {
            setSlotNotice(message);
            patch({ time: null });
            goto("time");
          }}
          onChangeSpecialist={() => {
            patch({ specialist: null, mode: "SUGGESTED", time: null });
            goto("specialist");
          }}
          onIndividual={() => patch({ answers: { ...draft.answers, couple: false } })}
          onHeld={(booking) => {
            const a: ActiveBooking = { booking, claimToken: booking.claimToken ?? "", fullName: draft.fullName };
            // Keep the draft while the hold is unverified: if the hold lapses, "choose a time again" must not make the
            // visitor retype everything. It is cleared once the booking is confirmed (see onUpdate below).
            saveActiveBooking(a);
            setActive(a);
            window.scrollTo({ top: 0 });
          }}
        />
      )}

      <p className="mt-10 text-center text-sm text-momentizing-muted">
        Feeling unsafe or in crisis right now? Please contact your local emergency number, or see our{" "}
        <Link href="/help" className="font-semibold underline">
          support resources
        </Link>
        .
      </p>

      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} prefill={helpPrefill} formToken={formToken ?? ""} />
    </>
  );
}

// ==================================================================== shared bits

function StepHeading({ headingRef, title, sub }: { headingRef: React.RefObject<HTMLHeadingElement | null>; title: string; sub?: string }) {
  return (
    <header className="mb-6">
      <h1 ref={headingRef} tabIndex={-1} className="font-marketing-serif text-3xl leading-tight outline-none sm:text-4xl">
        {title}
      </h1>
      {sub && <p className="mt-2 text-base text-momentizing-muted">{sub}</p>}
    </header>
  );
}

/** Back / Continue. Fixed to the bottom on phones (thumb reach, above the notch), inline on larger screens. */
function ActionBar({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  loading,
  hint,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  hint?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-momentizing-slate/10 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:z-auto md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
      <div className="mx-auto flex max-w-2xl flex-col gap-2">
        {hint && (
          <p className="text-center text-sm text-momentizing-muted" role="status">
            {hint}
          </p>
        )}
        <div className="flex gap-3">
          {onBack && (
            <BookButton variant="secondary" onClick={onBack} className="flex-shrink-0">
              Back
            </BookButton>
          )}
          <BookButton onClick={onNext} disabled={nextDisabled} loading={loading} className="flex-1">
            {nextLabel}
          </BookButton>
        </div>
      </div>
    </div>
  );
}

function HelpMeFind({ onHelp }: { onHelp: () => void }) {
  return (
    <div className="mt-8 rounded-3xl border border-dashed border-momentizing-slate/30 bg-momentizing-mint/60 p-5 text-center">
      <p className="text-sm text-momentizing-muted">Nothing quite right? We&apos;re happy to sort it out for you.</p>
      <BookButton variant="secondary" onClick={onHelp} className="mt-3 w-full sm:w-auto">
        I can&apos;t find my schedule — please help me find one
      </BookButton>
    </div>
  );
}

type Patch = (p: Partial<Draft>) => void;
type HeadingRef = React.RefObject<HTMLHeadingElement | null>;

// ==================================================================== 1. date

function StepDate({ draft, patch, headingRef, onNext }: { draft: Draft; patch: Patch; headingRef: HeadingRef; onNext: () => void }) {
  return (
    <BookCard>
      <StepHeading headingRef={headingRef} title="When would you like to come in?" sub="Pick the day that suits you best. Next we'll show you who's free." />
      <DateStrip value={draft.date} onChange={(iso) => patch({ date: iso, time: null })} />
      {draft.date && (
        <p className="mt-2 text-base" role="status">
          You chose <strong>{formatDateLong(draft.date)}</strong>.
        </p>
      )}
      <ActionBar onNext={onNext} nextDisabled={!draft.date} hint={!draft.date ? "Choose a day to continue" : undefined} />
    </BookCard>
  );
}

// ==================================================================== 2. about you

function StepAbout({
  draft,
  patch,
  headingRef,
  onBack,
  onNext,
}: {
  draft: Draft;
  patch: Patch;
  headingRef: HeadingRef;
  onBack: () => void;
  onNext: () => void;
}) {
  const [tried, setTried] = useState(false);
  const a = draft.answers;
  const setAnswer = (k: keyof Draft["answers"], v: boolean) => patch({ answers: { ...a, [k]: v } });

  const errors = {
    name: draft.fullName.trim().length < 2 ? "Please tell us your name." : null,
    phone: !looksLikePhone(draft.whatsapp) ? "Please enter a WhatsApp number we can reach you on, e.g. +62 812 3456 7890." : null,
    unanswered: Object.values(a).some((v) => v === null),
    minor: a.adult === false,
    mismatch: couplesMismatch(a, draft.specialist),
    consent: !draft.consent,
  };
  const valid = !errors.name && !errors.phone && !errors.unanswered && !errors.minor && !errors.mismatch && !errors.consent;

  function next() {
    setTried(true);
    if (valid) return onNext();
    // Take keyboard / screen-reader users to the first thing that needs fixing.
    const firstId = errors.name ? "fullName" : errors.phone ? "whatsapp" : null;
    setTimeout(() => {
      if (firstId) document.getElementById(firstId)?.focus();
      else document.querySelector<HTMLElement>('main [role="alert"]')?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 0);
  }

  const toggleConcern = (c: string) => patch({ concerns: draft.concerns.includes(c) ? draft.concerns.filter((x) => x !== c) : [...draft.concerns, c] });

  return (
    <BookCard>
      <StepHeading headingRef={headingRef} title="A little about you" sub="A few quick questions so we can suggest the right person. There are no wrong answers." />

      <div className="flex flex-col gap-6">
        <Field id="fullName" label="Your name" error={tried ? errors.name : null}>
          <input
            name="fullName" id="fullName"
            autoComplete="name"
            autoCapitalize="words"
            autoCorrect="off"
            spellCheck={false}
            value={draft.fullName}
            onChange={(e) => patch({ fullName: e.target.value })}
            aria-invalid={tried && !!errors.name}
            aria-describedby={tried && errors.name ? "fullName-error" : undefined}
            maxLength={150}
            className={inputClass}
          />
        </Field>

        <Field id="whatsapp" label="WhatsApp number" hint="We'll ask you to confirm it on WhatsApp, and use it only for your booking." error={tried ? errors.phone : null}>
          <input
            name="whatsapp" id="whatsapp"
            type="tel"
            autoCorrect="off"
            spellCheck={false}
            inputMode="tel"
            autoComplete="tel"
            value={draft.whatsapp}
            onChange={(e) => patch({ whatsapp: e.target.value })}
            placeholder="+62 812 3456 7890"
            aria-invalid={tried && !!errors.phone}
            aria-describedby={tried && errors.phone ? "whatsapp-error" : "whatsapp-hint"}
            maxLength={40}
            className={inputClass}
          />
        </Field>

        <YesNoField name="firstTime" legend="Is this your first time seeing a therapist or counsellor?" value={a.firstTime} onChange={(v) => setAnswer("firstTime", v)} error={tried && a.firstTime === null ? "Please choose yes or no." : null} />
        <YesNoField name="online" legend="Would you prefer online sessions?" value={a.online} onChange={(v) => setAnswer("online", v)} error={tried && a.online === null ? "Please choose yes or no." : null} />
        <YesNoField name="couple" legend="Is this session for a couple?" value={a.couple} onChange={(v) => setAnswer("couple", v)} error={tried && a.couple === null ? "Please choose yes or no." : null} />
        {errors.mismatch && draft.specialist && (
          <CoupleMismatchNotice
            name={draft.specialist.name}
            onChangeSpecialist={() => patch({ specialist: null, mode: "SUGGESTED", time: null })}
            onIndividual={() => setAnswer("couple", false)}
          />
        )}
        <YesNoField name="adult" legend="Are you 18 or older?" value={a.adult} onChange={(v) => setAnswer("adult", v)} error={tried && a.adult === null ? "Please choose yes or no." : null} />
        {a.adult === false && (
          <InlineNotice tone="warn" role="alert">
            Momentizing sessions are for adults. If you&apos;re under 18, please ask a parent or guardian to contact us on WhatsApp.
          </InlineNotice>
        )}
        <YesNoField
          name="urgent"
          legend="Is there anything urgent or unsafe happening right now?"
          hint="It's okay to answer honestly. Your answer helps us look after you."
          value={a.urgent}
          onChange={(v) => setAnswer("urgent", v)}
          error={tried && a.urgent === null ? "Please choose yes or no." : null}
        />
        {a.urgent === true && (
          <InlineNotice tone="warn" role="alert">
            <strong>Your safety comes first.</strong> If you or someone else is in immediate danger, please call your local emergency number now. You can also
            find support at{" "}
            <Link href="/help" className="font-semibold underline">
              our help page
            </Link>
            . You&apos;re welcome to continue booking — we&apos;ll take extra care.
          </InlineNotice>
        )}

        <fieldset>
          <legend className="text-sm font-semibold">What would you like support with? (optional)</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CONCERNS.map((c) => {
              const on = draft.concerns.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleConcern(c)}
                  className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal ${
                    on ? "border-momentizing-teal bg-momentizing-mint text-momentizing-teal" : "border-momentizing-slate/20 bg-white text-momentizing-slate hover:border-momentizing-slate/50"
                  }`}
                >
                  {on && <span aria-hidden="true">✓ </span>}
                  {c}
                </button>
              );
            })}
          </div>
        </fieldset>

        <Field id="note" label="Anything you'd like us to know? (optional)">
          <textarea name="note" id="note" rows={3} maxLength={500} value={draft.note} onChange={(e) => patch({ note: e.target.value })} className={`${inputClass} resize-y`} />
        </Field>

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-momentizing-muted">
            <input
              name="consentAccepted"
              type="checkbox"
              checked={draft.consent}
              onChange={(e) => patch({ consent: e.target.checked })}
              className="mt-1 h-5 w-5 flex-shrink-0 accent-[var(--momentizing-teal)]"
              aria-describedby={tried && errors.consent ? "consent-error" : undefined}
            />
            <span>
              I agree to the{" "}
              <a href={withBase("/legal/")} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                Terms &amp; Privacy
              </a>
              , to being contacted on WhatsApp about this booking, and that a session running past its booked time may be charged
              at the overtime rate.
            </span>
          </label>
          {tried && errors.consent && (
            <p id="consent-error" role="alert" className="mt-1 text-sm font-medium text-red-700">
              Please tick the box to continue.
            </p>
          )}
        </div>
      </div>

      <ActionBar onBack={onBack} onNext={next} hint={tried && !valid ? "A few things above still need your attention." : undefined} />
    </BookCard>
  );
}

// ==================================================================== 3. specialist

function StepSpecialist({
  draft,
  patch,
  headingRef,
  onBack,
  onNext,
  onHelp,
}: {
  draft: Draft;
  patch: Patch;
  headingRef: HeadingRef;
  onBack: () => void;
  onNext: () => void;
  onHelp: () => void;
}) {
  const [suggestions, setSuggestions] = useState<PublicSpecialistCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [profile, setProfile] = useState<PublicSpecialistCard | null>(null);
  const [byName, setByName] = useState(draft.mode === "SPECIFIC");
  const [justOpenedByName, setJustOpenedByName] = useState(false);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- reset before the (re)fetch */
    setSuggestions(null);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
    fetchSuggestions({
      date: draft.date ?? undefined,
      concerns: draft.concerns,
      note: draft.note || undefined,
      prefersOnline: draft.answers.online === true,
      forCouple: draft.answers.couple === true,
    })
      .then((s) => !cancelled && setSuggestions(s))
      .catch((e) => !cancelled && setError(friendlyError(e)));
    return () => {
      cancelled = true;
    };
    // The suggestion inputs are fixed once the visitor is on this step; `attempt` is the retry trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  function choose(s: PublicSpecialistCard, mode: Draft["mode"]) {
    setProfile(null);
    patch({ specialist: s, mode, time: null });
    onNext();
  }

  return (
    <>
      <div className="mb-4">
        <BookCard>
          <StepHeading
            headingRef={headingRef}
            title="Who would you like to see?"
            sub={`Here are people who may suit you${draft.date ? ` and are free around ${formatDateLong(draft.date)}` : ""}. Take your time — you can read about each one.`}
          />

          {error ? (
            <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">
              <p className="font-semibold">We couldn&apos;t load suggestions right now.</p>
              <p className="mt-1">{error}</p>
              <BookButton variant="secondary" onClick={() => setAttempt((n) => n + 1)} className="mt-3">
                Try again
              </BookButton>
            </div>
          ) : suggestions === null ? (
            <div aria-busy="true" aria-label="Finding specialists" className="grid gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-44 animate-pulse rounded-3xl bg-momentizing-slate/10 motion-reduce:animate-none" />
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <InlineNotice>We couldn&apos;t find a match automatically. You can search for a specialist by name below, or ask our team to help.</InlineNotice>
          ) : (
            <div className="grid gap-4">
              {suggestions.map((s) => (
                <SpecialistSuggestionCard
                  key={s.id}
                  specialist={s}
                  requestedDate={draft.date}
                  selected={draft.specialist?.id === s.id}
                  forCouple={draft.answers.couple === true}
                  onChoose={() => choose(s, "SUGGESTED")}
                  onViewProfile={() => setProfile(s)}
                />
              ))}
            </div>
          )}

          <div className="mt-8 border-t border-momentizing-slate/10 pt-6">
            {byName ? (
              <SpecialistNameSearch autoFocus={justOpenedByName} forCouple={draft.answers.couple === true} onPick={(s) => choose(s, "SPECIFIC")} />
            ) : (
              <BookButton
                variant="ghost"
                onClick={() => {
                  setJustOpenedByName(true);
                  setByName(true);
                }}
                className="w-full sm:w-auto"
              >
                I already have a specialist in mind
              </BookButton>
            )}
          </div>
        </BookCard>
      </div>

      <HelpMeFind onHelp={onHelp} />
      <ActionBar onBack={onBack} onNext={onNext} nextDisabled={!draft.specialist} nextLabel="Continue" hint={!draft.specialist ? "Choose a specialist to continue" : undefined} />
      <SpecialistProfileSheet specialist={profile} onClose={() => setProfile(null)} onChoose={(s) => choose(s, "SUGGESTED")} forCouple={draft.answers.couple === true} />
    </>
  );
}

// ==================================================================== 4. time

function StepTime({
  draft,
  patch,
  headingRef,
  linked,
  onBack,
  onNext,
  onHelp,
  notice,
  onDismissNotice,
}: {
  draft: Draft;
  patch: Patch;
  headingRef: HeadingRef;
  linked: boolean;
  onBack?: () => void;
  onNext: () => void;
  onHelp: () => void;
  notice: string | null;
  onDismissNotice: () => void;
}) {
  const specialist = draft.specialist;
  const date = draft.date ?? todayIso();

  if (!specialist) {
    return (
      <BookCard>
        <StepHeading headingRef={headingRef} title="Choose a time" />
        <InlineNotice tone="warn">Please choose a specialist first.</InlineNotice>
        <ActionBar onBack={onBack} onNext={onBack ?? onNext} nextLabel="Choose a specialist" />
      </BookCard>
    );
  }

  return (
    <>
      <BookCard>
        <StepHeading headingRef={headingRef} title={linked ? "Pick a day and time" : "Choose a time"} sub={`Real open times with ${specialist.name}.`} />
        {notice && (
          <div className="mb-5">
            <InlineNotice tone="warn" role="alert">
              {notice}
            </InlineNotice>
          </div>
        )}
        <div className="mb-5">
          <DateStrip value={date} onChange={(iso) => patch({ date: iso, time: null })} label="Change the day" />
        </div>
        <SlotPicker
          specialistId={specialist.id}
          date={date}
          onDateChange={(iso) => patch({ date: iso, time: null })}
          value={draft.time}
          onChange={(t) => {
            onDismissNotice();
            patch({ time: t });
          }}
        />
      </BookCard>
      <HelpMeFind onHelp={onHelp} />
      <ActionBar onBack={onBack} onNext={onNext} nextDisabled={!draft.time} hint={!draft.time ? "Choose a time to continue" : undefined} />
    </>
  );
}

// ==================================================================== 5. review + hold

function StepReview({
  draft,
  headingRef,
  formToken,
  refreshFormToken,
  onBack,
  onEdit,
  onHelp,
  onSlotGone,
  onHeld,
  onChangeSpecialist,
  onIndividual,
}: {
  draft: Draft;
  headingRef: HeadingRef;
  formToken: string | null;
  refreshFormToken: () => void;
  onBack: () => void;
  onEdit: (s: StepId) => void;
  onHelp: () => void;
  onSlotGone: (message: string) => void;
  onHeld: (b: GuestBooking) => void;
  onChangeSpecialist: () => void;
  onIndividual: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ text: string; help?: boolean; couple?: boolean } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [sessionTypes, setSessionTypes] = useState<string[]>([]);
  // Same details -> same key (a retry after a lost response can't double-book); any change -> a new key.
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);

  const specialist = draft.specialist;
  const fingerprint = useMemo(
    () => JSON.stringify([specialist?.id, draft.date, draft.time, draft.whatsapp.replace(/\D/g, "")]),
    [specialist?.id, draft.date, draft.time, draft.whatsapp]
  );

  // Learn the specialist's offered session types (for a valid choice) without showing a picker.
  useEffect(() => {
    if (!specialist || !draft.date) return;
    let cancelled = false;
    fetchSlots(specialist.id, draft.date, 1)
      .then((r: PublicSlots) => !cancelled && setSessionTypes(r.sessionTypes))
      .catch(() => {
        /* not critical: without it we fall back to an online session, which the server validates anyway */
      });
    return () => {
      cancelled = true;
    };
  }, [specialist, draft.date]);

  if (!specialist || !draft.date || !draft.time) {
    return (
      <BookCard>
        <StepHeading headingRef={headingRef} title="Almost there" />
        <InlineNotice tone="warn">Some details are missing. Please go back and complete the earlier steps.</InlineNotice>
        <ActionBar onBack={onBack} onNext={onBack} nextLabel="Go back" />
      </BookCard>
    );
  }

  const sessionType = draft.answers.online !== false && (sessionTypes.length === 0 || sessionTypes.includes("ONLINE"))
    ? "ONLINE"
    : (sessionTypes.find((t) => t !== "ONLINE") ?? "ONLINE");

  const mismatch = couplesMismatch(draft.answers, specialist) || error?.couple === true;

  async function hold() {
    if (mismatch || submitting || !specialist || !draft.date || !draft.time) return;
    setError(null);
    if (!formToken) {
      setError({ text: "The form isn't ready yet. Please wait a moment and try again." });
      refreshFormToken();
      return;
    }
    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError({ text: t("booking.securityWait") });
      return;
    }
    if (!attempt.current || attempt.current.fingerprint !== fingerprint) {
      attempt.current = { fingerprint, key: newIdempotencyKey() };
    }
    setSubmitting(true);
    try {
      const booking = await createGuestBooking(
        {
          specialistId: specialist.id,
          // The visitor picked on their own clock; the API stores UTC wall-clock.
          sessionDate: localToUtc(draft.date, draft.time).date,
          startTime: localToUtc(draft.date, draft.time).time,
          fullName: draft.fullName.trim(),
          whatsapp: draft.whatsapp.trim(),
          sessionType,
          forCouple: draft.answers.couple === true,
          mode: draft.mode,
          answers: answersToRecord(draft.answers, draft.concerns),
          note: draft.note.trim() || undefined,
          adultConfirmed: draft.answers.adult === true,
          consentAccepted: draft.consent,
          turnstileToken: turnstileToken || undefined,
          formToken,
          website: "",
        },
        attempt.current.key
      );
      onHeld(booking);
    } catch (e) {
      if (e instanceof ApiError) {
        if (hasCode(e, ...SLOT_GONE_CODES)) {
          onSlotGone(t("error.slotGone"));
        } else if (hasCode(e, ...COUPLE_MISMATCH_CODES)) {
          setError({ text: e.message, couple: true });
        } else if (e.status === 422) {
          setError({ text: e.message, help: true });
        } else {
          setError({ text: e.message, help: e.status === 409 || e.status === 429 });
        }
      } else {
        setError({ text: t("error.networkSaved") });
      }
      refreshFormToken();
    } finally {
      setSubmitting(false);
      setResetSignal((n) => n + 1);
    }
  }

  return (
    <>
      <BookCard>
        <StepHeading headingRef={headingRef} title="Check and hold your time" sub="Have a look that everything is right. We'll hold this time for you while you confirm on WhatsApp." />
        <dl className="grid gap-3">
          <ReviewRow label="Specialist" value={specialist.name} onEdit={() => onEdit("specialist")} />
          <ReviewRow label="When" value={`${formatDateLong(draft.date)} at ${formatTime(draft.time)} (${zoneLabel()})`} onEdit={() => onEdit("time")} />
          <ReviewRow label="Your name" value={draft.fullName} onEdit={() => onEdit("about")} />
          <ReviewRow label="WhatsApp" value={draft.whatsapp} onEdit={() => onEdit("about")} />
        </dl>
        <div className="mt-5">
          <InlineNotice>
            <strong>How payment works:</strong> there&apos;s nothing to pay now. Our team will arrange payment with you on WhatsApp.
          </InlineNotice>
        </div>

        <div className="mt-5">
          <TurnstileWidget onToken={setTurnstileToken} onError={(m) => setError({ text: m })} resetSignal={resetSignal} />
        </div>

        {mismatch && (
          <div className="mt-5">
            <CoupleMismatchNotice
              name={specialist.name}
              onChangeSpecialist={onChangeSpecialist}
              onIndividual={() => {
                setError(null);
                onIndividual();
              }}
            />
          </div>
        )}

        {error && !mismatch && (
          <div className="mt-5">
            <InlineNotice tone="error" role="alert">
              <p>{error.text}</p>
              {error.help && (
                <BookButton variant="secondary" onClick={onHelp} className="mt-3">
                  Ask the team to help me
                </BookButton>
              )}
            </InlineNotice>
          </div>
        )}
      </BookCard>
      <HelpMeFind onHelp={onHelp} />
      <ActionBar onBack={onBack} onNext={hold} nextDisabled={mismatch} loading={submitting} nextLabel={submitting ? "Holding your time…" : "Hold my time"} />
    </>
  );
}

/** Shown wherever a couple session meets a specialist who only sees individuals; both ways out are one tap. */
function CoupleMismatchNotice({
  name,
  onChangeSpecialist,
  onIndividual,
}: {
  name: string;
  onChangeSpecialist: () => void;
  onIndividual: () => void;
}) {
  return (
    <InlineNotice tone="warn" role="alert">
      <p>
        <strong>{firstNameOf(name)} sees individuals only</strong>, so can&apos;t take a couple session. Your details are saved, so this only takes a moment.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <BookButton onClick={onChangeSpecialist}>Choose a couple-friendly specialist</BookButton>
        <BookButton variant="secondary" onClick={onIndividual}>
          Book as an individual instead
        </BookButton>
      </div>
    </InlineNotice>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-momentizing-mint/60 px-4 py-3">
      <div className="min-w-0">
        <dt className="text-xs font-semibold tracking-wide text-momentizing-muted uppercase">{label}</dt>
        <dd className="mt-0.5 break-words text-base font-semibold">{value}</dd>
      </div>
      <button type="button" onClick={onEdit} className="min-h-11 flex-shrink-0 px-2 text-sm font-semibold underline focus-visible:outline-2 focus-visible:outline-momentizing-teal">
        Change<span className="sr-only"> {label}</span>
      </button>
    </div>
  );
}

// ==================================================================== 6. verify on WhatsApp

function useCountdown(expiresAt: string | null): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return expiresAt ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000)) : 0;
}

function StepVerify({
  active,
  headingRef,
  onUpdate,
  onChooseAnother,
  onHelp,
}: {
  active: ActiveBooking;
  headingRef: HeadingRef;
  onUpdate: (b: GuestBooking) => void;
  onChooseAnother: () => void;
  onHelp: () => void;
}) {
  const b = active.booking;
  const secondsLeft = useCountdown(b.holdExpiresAt);
  const [checking, setChecking] = useState(false);
  const [pollError, setPollError] = useState(false);
  const [copied, setCopied] = useState(false);
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  const check = useCallback(async () => {
    if (!active.claimToken) return;
    setChecking(true);
    try {
      const latest = await fetchGuestBookingStatus(active.claimToken);
      setPollError(false);
      if (latest.status !== "AWAITING_VERIFICATION") onUpdateRef.current(latest);
    } catch {
      setPollError(true);
    } finally {
      setChecking(false);
    }
  }, [active.claimToken]);

  // Poll every 4s while waiting, and immediately when the visitor returns to this tab from WhatsApp.
  const waiting = b.status === "AWAITING_VERIFICATION" && secondsLeft > 0;
  useEffect(() => {
    if (!waiting) return;
    const id = setInterval(check, 4000);
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [waiting, check]);

  // When the countdown reaches zero, ask the server once so we show the real outcome (it may have just been verified).
  const [expiredChecked, setExpiredChecked] = useState(false);
  useEffect(() => {
    if (b.status === "AWAITING_VERIFICATION" && secondsLeft === 0 && !expiredChecked) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot flag so the final status check runs exactly once
      setExpiredChecked(true);
      check();
    }
  }, [b.status, secondsLeft, check, expiredChecked]);

  const expired = b.status === "EXPIRED" || (b.status === "AWAITING_VERIFICATION" && secondsLeft === 0 && expiredChecked && !checking);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  async function copy() {
    try {
      await navigator.clipboard.writeText(b.verificationMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked — the text is visible on screen to copy by hand */
    }
  }

  if (expired) {
    return (
      <BookCard>
        <StepHeading headingRef={headingRef} title="Your held time has ended" sub="No worries — nothing was booked and nothing was charged." />
        <p className="text-momentizing-muted">We hold your time for a short while so you can confirm on WhatsApp. That window has passed, so the time has been released for others.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <BookButton onClick={onChooseAnother} className="sm:flex-1">
            Choose a time again
          </BookButton>
          <BookButton variant="secondary" onClick={onHelp} className="sm:flex-1">
            Ask the team to help me
          </BookButton>
        </div>
      </BookCard>
    );
  }

  return (
    <BookCard>
      <StepHeading headingRef={headingRef} title="One last step: confirm it's you" sub="This keeps your booking safe and stops anyone else from using your number." />

      <div className="rounded-2xl bg-momentizing-mint/60 p-4">
        <p className="text-sm font-semibold text-momentizing-muted">Your held time</p>
        <p className="mt-1 text-lg font-semibold">
          {formatSessionWhen(b.sessionDate, b.startTime)}
        </p>
        <p className="text-momentizing-muted">with {b.specialistName}</p>
        <p className="mt-2 text-sm text-momentizing-muted" role="timer" aria-live="off">
          Held for you for <strong className="tabular-nums">{mm}:{ss}</strong>
        </p>
      </div>

      <ol className="mt-6 flex flex-col gap-4 text-base">
        <li className="flex gap-3">
          <span aria-hidden="true" className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-momentizing-teal text-sm font-bold text-white">1</span>
          <span>
            Tap the button below. WhatsApp opens with your code already typed in.
          </span>
        </li>
        <li className="flex gap-3">
          <span aria-hidden="true" className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-momentizing-teal text-sm font-bold text-white">2</span>
          <span>
            Press <strong>Send</strong>. Use the WhatsApp account of the number you gave us.
          </span>
        </li>
        <li className="flex gap-3">
          <span aria-hidden="true" className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-momentizing-teal text-sm font-bold text-white">3</span>
          <span>Come back here — this page updates by itself.</span>
        </li>
      </ol>

      <a
        href={verificationLink(b)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#128C4A] px-6 py-3 text-base font-semibold text-white hover:bg-[#0f7a40] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal"
      >
        Confirm on WhatsApp
      </a>

      <div className="mt-5 rounded-2xl border border-momentizing-slate/15 p-4 text-sm">
        <p className="text-momentizing-muted">
          Prefer to send it yourself? Message <strong>+{b.verificationWhatsapp.replace(/^\+/, "")}</strong> with this text:
        </p>
        <p className="mt-2 rounded-xl bg-momentizing-mint/60 p-3 font-mono text-sm break-words select-all">{b.verificationMessage}</p>
        <BookButton variant="secondary" onClick={copy} className="mt-3 w-full sm:w-auto">
          {copied ? "Copied ✓" : "Copy the message"}
        </BookButton>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center" aria-live="polite">
        <BookButton variant="ghost" onClick={check} loading={checking} className="sm:mr-auto">
          I&apos;ve sent it — check now
        </BookButton>
        {pollError && <span className="text-sm text-amber-900">Can&apos;t reach the server just now. We&apos;ll keep trying.</span>}
      </div>

      <p className="mt-6 border-t border-momentizing-slate/10 pt-4 text-sm text-momentizing-muted">
        Reference: <strong className="font-mono">{b.referenceCode}</strong>. Trouble with WhatsApp?{" "}
        <button type="button" onClick={onHelp} className="font-semibold underline focus-visible:outline-2 focus-visible:outline-momentizing-teal">
          Ask the team to help you
        </button>
        .
      </p>
    </BookCard>
  );
}

// ==================================================================== 7. done

function StepDone({ active, headingRef, onAnother }: { active: ActiveBooking; headingRef: HeadingRef; onAnother: () => void }): ReactNode {
  const b = active.booking;

  function downloadIcs() {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Momentizing//Booking//EN",
      "BEGIN:VEVENT",
      `UID:${b.referenceCode}@momentizing`,
      `DTSTAMP:${icsStamp(todayIso(), "00:00")}`,
      `DTSTART:${icsStamp(b.sessionDate, b.startTime)}`,
      `DTEND:${icsStamp(b.sessionDate, b.startTime, b.durationMinutes)}`,
      `SUMMARY:Momentizing session with ${b.specialistName}`,
      `DESCRIPTION:Booking ${b.referenceCode}. We will WhatsApp you the details.`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `momentizing-${b.referenceCode}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <BookCard>
        <StepHeading headingRef={headingRef} title="You're all set" sub="Your session is confirmed. We're looking forward to seeing you." />
        <InlineNotice tone="success" role="status">
          <p className="text-lg font-semibold">
            {formatSessionWhen(b.sessionDate, b.startTime)}
          </p>
          <p>
            with {b.specialistName} · {b.durationMinutes} minutes
          </p>
          <p className="mt-2 text-sm">
            Reference <strong className="font-mono">{b.referenceCode}</strong>
          </p>
        </InlineNotice>
        <ul className="mt-5 flex list-disc flex-col gap-2 pl-5 text-momentizing-muted">
          <li>We&apos;ll message you on WhatsApp to arrange payment and share the session details.</li>
          <li>You&apos;ll get reminders before your session.</li>
        </ul>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <BookButton variant="secondary" onClick={downloadIcs} className="sm:flex-1">
            Add to my calendar
          </BookButton>
          <Link href="/" className="sm:flex-1" onClick={onAnother}>
            <span className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-momentizing-slate/30 bg-white px-6 py-3 text-sm font-semibold text-momentizing-slate hover:bg-momentizing-slate/5">
              Back to home
            </span>
          </Link>
        </div>
      </BookCard>

      <WhyJoinCard claimToken={active.claimToken || null} fullName={active.fullName} />
    </div>
  );
}

