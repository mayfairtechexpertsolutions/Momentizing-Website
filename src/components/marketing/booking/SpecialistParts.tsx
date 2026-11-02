"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { formatSessionFee, practiceModeLabel } from "@/lib/marketing-directory";
import { formatDateShort } from "@/lib/local-date";
import { friendlyError, searchSpecialists, type PublicSpecialistCard } from "@/lib/guest-booking";
import { BookButton, inputClass } from "./ui";
import { Sheet } from "./Sheet";
import { t } from "@/i18n";

export function initials(name: string): string {
  return name
    .replace(/^(dr|drs|prof)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** "Dr. Anna Wijaya" -> "Anna" (titles are dropped so buttons read "Choose Anna", not "Choose Dr."). */
export function firstNameOf(name: string): string {
  const parts = name.replace(/^((dr|drs|prof|ir)\.?\s+)+/i, "").trim().split(/\s+/);
  return parts[0] || name;
}

/** The specialist's profile photo when they uploaded one, otherwise their initials. */
export function SpecialistAvatar({ name, url, size = 64 }: { name: string; url?: string | null; size?: number }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" aria-hidden="true" width={size} height={size} loading="lazy"
        className="flex-shrink-0 rounded-full bg-momentizing-mint object-cover" style={{ width: size, height: size }} />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex flex-shrink-0 items-center justify-center rounded-full bg-momentizing-mint font-marketing-serif text-lg font-semibold text-momentizing-teal"
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </span>
  );
}

function Fact({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-momentizing-mint px-3 py-1 text-xs font-semibold text-momentizing-slate">{children}</span>;
}

function IndividualOnlyChip() {
  return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">{t("site.book.individualOnly")}</span>;
}

function ratingText(s: PublicSpecialistCard): string | null {
  return s.averageRating != null && s.reviewCount > 0 ? `★ ${s.averageRating.toFixed(1)} (${s.reviewCount})` : null;
}

function availabilityText(s: PublicSpecialistCard, requestedDate: string | null): { text: string; good: boolean } | null {
  if (requestedDate && s.slotsOnRequestedDate != null) {
    if (s.slotsOnRequestedDate > 0) return { text: t("site.book.openOn", { date: formatDateShort(requestedDate) }), good: true };
    if (s.nextAvailableDate) return { text: t("site.book.nextOpen", { date: formatDateShort(s.nextAvailableDate) }), good: false };
    return { text: t("site.book.noTimes30"), good: false };
  }
  if (s.nextAvailableDate) return { text: t("site.book.nextOpen", { date: formatDateShort(s.nextAvailableDate) }), good: true };
  return null;
}

export function SpecialistSuggestionCard({
  specialist,
  requestedDate,
  selected,
  forCouple = false,
  onChoose,
  onViewProfile,
}: {
  specialist: PublicSpecialistCard;
  requestedDate: string | null;
  selected?: boolean;
  forCouple?: boolean;
  onChoose: () => void;
  onViewProfile: () => void;
}) {
  const noCouples = forCouple && !specialist.acceptsCouple;
  const fee = formatSessionFee(specialist.sessionFeeCents, specialist.sessionFeeCurrency ?? "IDR");
  const rating = ratingText(specialist);
  const availability = availabilityText(specialist, requestedDate);
  const firstName = firstNameOf(specialist.name);

  return (
    <article
      className={`flex flex-col gap-4 rounded-3xl border bg-white p-5 shadow-[0_6px_24px_rgba(47,62,70,0.05)] transition ${
        selected ? "border-momentizing-teal ring-2 ring-momentizing-teal/30" : "border-momentizing-slate/10"
      }`}
    >
      <div className="flex items-start gap-4">
        <SpecialistAvatar name={specialist.name} url={specialist.avatarUrl} />
        <div className="min-w-0">
          <h3 className="font-marketing-serif text-xl leading-tight">{specialist.name}</h3>
          {specialist.specialisation && <p className="mt-1 text-sm text-momentizing-muted">{specialist.specialisation}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {forCouple && (specialist.acceptsCouple ? <Fact>{t("site.book.couplesWelcome")}</Fact> : <IndividualOnlyChip />)}
        {availability && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              availability.good ? "bg-momentizing-mint text-momentizing-teal" : "bg-amber-50 text-amber-900"
            }`}
          >
            {availability.text}
          </span>
        )}
        {rating && <Fact>{rating}</Fact>}
        {specialist.languages && <Fact>{specialist.languages}</Fact>}
        {practiceModeLabel(specialist.practiceMode) && <Fact>{practiceModeLabel(specialist.practiceMode)}</Fact>}
        {specialist.freeFirstSession ? <Fact>{t("site.spec.freeFirst")}</Fact> : fee && <Fact>{t("site.book.feePerSession", { fee })}</Fact>}
      </div>

      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
        <BookButton variant="secondary" onClick={onViewProfile} className="sm:flex-1" aria-label={t("site.spec.viewProfileOf", { name: specialist.name })}>
          {t("site.spec.viewProfile")}
        </BookButton>
        <BookButton onClick={onChoose} disabled={noCouples} className="sm:flex-1" aria-label={noCouples ? t("site.book.noCouplesName", { name: specialist.name }) : t("site.book.choose", { name: specialist.name })}>
          {noCouples ? t("site.book.notForCouples") : selected ? t("site.book.selected") : t("site.book.choose", { name: firstName })}
        </BookButton>
      </div>
    </article>
  );
}

export function SpecialistProfileSheet({
  specialist,
  onClose,
  onChoose,
  forCouple = false,
}: {
  specialist: PublicSpecialistCard | null;
  onClose: () => void;
  onChoose: (s: PublicSpecialistCard) => void;
  forCouple?: boolean;
}) {
  const noCouples = forCouple && specialist != null && !specialist.acceptsCouple;
  const fee = specialist ? formatSessionFee(specialist.sessionFeeCents, specialist.sessionFeeCurrency ?? "IDR") : null;
  return (
    <Sheet open={specialist !== null} onClose={onClose} title={specialist?.name ?? t("site.spec.specialist")}>
      {specialist && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <SpecialistAvatar name={specialist.name} url={specialist.avatarUrl} size={80} />
            <div>
              {specialist.specialisation && <p className="text-base text-momentizing-muted">{specialist.specialisation}</p>}
              {ratingText(specialist) && <p className="mt-1 text-sm font-semibold">{ratingText(specialist)}</p>}
            </div>
          </div>

          {specialist.bio && <p className="text-base leading-relaxed text-momentizing-muted">{specialist.bio}</p>}

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {specialist.yearsExperience != null && <Detail label={t("site.spec.experience")} value={t("site.book.years", { n: specialist.yearsExperience })} />}
            {specialist.languages && <Detail label={t("site.spec.languages")} value={specialist.languages} />}
            {practiceModeLabel(specialist.practiceMode) && <Detail label={t("site.spec.sessions")} value={practiceModeLabel(specialist.practiceMode)!} />}
            {specialist.locationLabel && <Detail label={t("site.spec.location")} value={specialist.locationLabel} />}
            <Detail label={t("site.book.fee")} value={specialist.freeFirstSession ? t("site.spec.freeFirst") : (fee ? t("site.book.feePerSession", { fee }) : t("site.book.feeShared"))} />
            {specialist.credentialsSummary && <Detail label={t("site.spec.credentials")} value={specialist.credentialsSummary} wide />}
          </dl>

          {noCouples && (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {t("site.book.individualsOnlyBody", { name: firstNameOf(specialist.name) })}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <BookButton onClick={() => onChoose(specialist)} disabled={noCouples} className="sm:flex-1">
              {noCouples ? t("site.book.notForCouples") : t("site.book.choose", { name: firstNameOf(specialist.name) })}
            </BookButton>
            <Link
              href={`/associates/view?id=${specialist.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-momentizing-slate/30 px-6 py-3 text-sm font-semibold text-momentizing-slate hover:bg-momentizing-slate/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal sm:flex-1"
            >
              {t("site.book.fullProfile")} ↗
            </Link>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function Detail({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl bg-momentizing-mint/60 px-4 py-3 ${wide ? "sm:col-span-2" : ""}`}>
      <dt className="text-xs font-semibold tracking-wide text-momentizing-muted uppercase">{label}</dt>
      <dd className="mt-0.5 text-momentizing-slate">{value}</dd>
    </div>
  );
}

/**
 * "I already have a specialist in mind": type a name, pick from the list. ARIA 1.2 combobox (arrow keys, Enter,
 * Escape). Search is debounced and only ever returns approved, bookable specialists.
 */
export function SpecialistNameSearch({
  onPick,
  autoFocus = false,
  forCouple = false,
}: {
  onPick: (s: PublicSpecialistCard) => void;
  autoFocus?: boolean;
  forCouple?: boolean;
}) {
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicSpecialistCard[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      /* eslint-disable react-hooks/set-state-in-effect -- clear stale results when the query becomes too short */
      setResults([]);
      setStatus("idle");
      setError(null);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }
    const mine = ++seq.current;
    setStatus("loading");
    const timer = setTimeout(async () => {
      try {
        const found = await searchSpecialists(q);
        if (mine !== seq.current) return; // a newer keystroke superseded this response
        // Couple-friendly specialists first (stable), so the ones the visitor can actually book are on top.
        setResults(forCouple ? [...found].sort((x, y) => Number(y.acceptsCouple) - Number(x.acceptsCouple)) : found);
        setActive(-1);
        setStatus("idle");
        setError(null);
      } catch (e) {
        if (mine !== seq.current) return;
        setStatus("error");
        setError(friendlyError(e));
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, forCouple]);

  const blocked = (s: PublicSpecialistCard) => forCouple && !s.acceptsCouple;

  function choose(s: PublicSpecialistCard) {
    if (blocked(s)) return;
    setOpen(false);
    setQuery(s.name);
    onPick(s);
  }

  /** Arrow-key step that skips options the visitor can't book. */
  function nextEnabled(from: number, dir: 1 | -1): number {
    for (let i = from + dir; i >= 0 && i < results.length; i += dir) if (!blocked(results[i])) return i;
    return from;
  }

  const showList = open && query.trim().length >= 2 && status !== "error";

  return (
    <div className="relative">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold">
        {t("site.book.fullName")}
      </label>
      <input
        id={inputId}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        autoCapitalize="words"
        autoCorrect="off"
        spellCheck={false}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => nextEnabled(a, 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => nextEnabled(a, -1));
          } else if (e.key === "Enter" && active >= 0 && results[active]) {
            e.preventDefault();
            choose(results[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={t("site.book.namePlaceholder")}
        // Focus only when the visitor just asked for this field, so they can type straight away (not on page load).
        autoFocus={autoFocus}
        className={inputClass}
      />
      {forCouple && <p className="mt-1.5 text-sm text-momentizing-muted">{t("site.book.coupleFirst")}</p>}
      <div aria-live="polite" className="mt-2 min-h-5 text-sm text-momentizing-muted">
        {status === "loading" && t("site.book.searching")}
        {status === "idle" && showList && results.length === 0 && t("site.book.noNameMatch")}
      </div>
      {status === "error" && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      {showList && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("site.book.matching")}
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-2xl border border-momentizing-slate/15 bg-white p-1 shadow-xl"
        >
          {results.map((s, i) => (
            <li
              key={s.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              aria-disabled={blocked(s) || undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(s)}
              className={`flex min-h-14 items-center gap-3 rounded-xl px-3 py-2 ${
                blocked(s) ? "cursor-not-allowed opacity-70" : `cursor-pointer ${i === active ? "bg-momentizing-mint" : "hover:bg-momentizing-mint"}`
              }`}
            >
              <SpecialistAvatar name={s.name} url={s.avatarUrl} size={40} />
              <span className="min-w-0">
                <span className="block truncate font-semibold">{s.name}</span>
                {s.specialisation && <span className="block truncate text-sm text-momentizing-muted">{s.specialisation}</span>}
                {blocked(s) && <span className="block text-sm font-semibold text-amber-900">{t("site.book.individualOnly")}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
