"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { formatSessionFee, PRACTICE_MODE_LABEL } from "@/lib/marketing-directory";
import { formatDateShort } from "@/lib/local-date";
import { friendlyError, searchSpecialists, type PublicSpecialistCard } from "@/lib/guest-booking";
import { BookButton, inputClass } from "./ui";
import { Sheet } from "./Sheet";

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

/** Initials only, by design: the public site doesn't display specialists' photos. `url` is accepted so callers
 * stay unchanged if photos are ever switched back on. */
export function SpecialistAvatar({ name, size = 64 }: { name: string; url?: string | null; size?: number }) {
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

function ratingText(s: PublicSpecialistCard): string | null {
  return s.averageRating != null && s.reviewCount > 0 ? `★ ${s.averageRating.toFixed(1)} (${s.reviewCount})` : null;
}

function availabilityText(s: PublicSpecialistCard, requestedDate: string | null): { text: string; good: boolean } | null {
  if (requestedDate && s.slotsOnRequestedDate != null) {
    if (s.slotsOnRequestedDate > 0) return { text: `Open on ${formatDateShort(requestedDate)}`, good: true };
    if (s.nextAvailableDate) return { text: `Next open: ${formatDateShort(s.nextAvailableDate)}`, good: false };
    return { text: "No open times in the next 30 days", good: false };
  }
  if (s.nextAvailableDate) return { text: `Next open: ${formatDateShort(s.nextAvailableDate)}`, good: true };
  return null;
}

export function SpecialistSuggestionCard({
  specialist,
  requestedDate,
  selected,
  onChoose,
  onViewProfile,
}: {
  specialist: PublicSpecialistCard;
  requestedDate: string | null;
  selected?: boolean;
  onChoose: () => void;
  onViewProfile: () => void;
}) {
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
        {PRACTICE_MODE_LABEL[specialist.practiceMode] && <Fact>{PRACTICE_MODE_LABEL[specialist.practiceMode]}</Fact>}
        {specialist.freeFirstSession ? <Fact>Free first session</Fact> : fee && <Fact>{fee} / session</Fact>}
      </div>

      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
        <BookButton variant="secondary" onClick={onViewProfile} className="sm:flex-1" aria-label={`View ${specialist.name}'s profile`}>
          View profile
        </BookButton>
        <BookButton onClick={onChoose} className="sm:flex-1" aria-label={`Choose ${specialist.name}`}>
          {selected ? "Selected ✓" : `Choose ${firstName}`}
        </BookButton>
      </div>
    </article>
  );
}

export function SpecialistProfileSheet({
  specialist,
  onClose,
  onChoose,
}: {
  specialist: PublicSpecialistCard | null;
  onClose: () => void;
  onChoose: (s: PublicSpecialistCard) => void;
}) {
  const fee = specialist ? formatSessionFee(specialist.sessionFeeCents, specialist.sessionFeeCurrency ?? "IDR") : null;
  return (
    <Sheet open={specialist !== null} onClose={onClose} title={specialist?.name ?? "Specialist"}>
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
            {specialist.yearsExperience != null && <Detail label="Experience" value={`${specialist.yearsExperience} years`} />}
            {specialist.languages && <Detail label="Languages" value={specialist.languages} />}
            {PRACTICE_MODE_LABEL[specialist.practiceMode] && <Detail label="Sessions" value={PRACTICE_MODE_LABEL[specialist.practiceMode]} />}
            {specialist.locationLabel && <Detail label="Location" value={specialist.locationLabel} />}
            <Detail label="Fee" value={specialist.freeFirstSession ? "Free first session" : (fee ? `${fee} / session` : "Shared when you're contacted")} />
            {specialist.credentialsSummary && <Detail label="Credentials" value={specialist.credentialsSummary} wide />}
          </dl>

          <div className="flex flex-col gap-2 sm:flex-row">
            <BookButton onClick={() => onChoose(specialist)} className="sm:flex-1">
              Choose {firstNameOf(specialist.name)}
            </BookButton>
            <Link
              href={`/associates/${specialist.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-momentizing-slate/30 px-6 py-3 text-sm font-semibold text-momentizing-slate hover:bg-momentizing-slate/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal sm:flex-1"
            >
              Full profile &amp; reviews ↗
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
export function SpecialistNameSearch({ onPick, autoFocus = false }: { onPick: (s: PublicSpecialistCard) => void; autoFocus?: boolean }) {
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
    const t = setTimeout(async () => {
      try {
        const found = await searchSpecialists(q);
        if (mine !== seq.current) return; // a newer keystroke superseded this response
        setResults(found);
        setActive(-1);
        setStatus("idle");
        setError(null);
      } catch (e) {
        if (mine !== seq.current) return;
        setStatus("error");
        setError(friendlyError(e, "Search isn't working right now."));
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  function choose(s: PublicSpecialistCard) {
    setOpen(false);
    setQuery(s.name);
    onPick(s);
  }

  const showList = open && query.trim().length >= 2 && status !== "error";

  return (
    <div className="relative">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold">
        Specialist&apos;s full name
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
            setActive((a) => Math.min(results.length - 1, a + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === "Enter" && active >= 0 && results[active]) {
            e.preventDefault();
            choose(results[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="e.g. Dr. Anna Wijaya"
        // Focus only when the visitor just asked for this field, so they can type straight away (not on page load).
        autoFocus={autoFocus}
        className={inputClass}
      />
      <div aria-live="polite" className="mt-2 min-h-5 text-sm text-momentizing-muted">
        {status === "loading" && "Searching…"}
        {status === "idle" && showList && results.length === 0 && "No specialist with that name is taking new clients online. Check the spelling, or ask us for help below."}
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
          aria-label="Matching specialists"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-2xl border border-momentizing-slate/15 bg-white p-1 shadow-xl"
        >
          {results.map((s, i) => (
            <li
              key={s.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(s)}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 ${i === active ? "bg-momentizing-mint" : "hover:bg-momentizing-mint"}`}
            >
              <SpecialistAvatar name={s.name} url={s.avatarUrl} size={40} />
              <span className="min-w-0">
                <span className="block truncate font-semibold">{s.name}</span>
                {s.specialisation && <span className="block truncate text-sm text-momentizing-muted">{s.specialisation}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
