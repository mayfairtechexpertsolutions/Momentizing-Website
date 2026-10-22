"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SpecialistCard } from "@/components/marketing/SpecialistCard";
import { useMarketingDirectory, specialisationTags } from "@/lib/marketing-directory";
import { useFavorites } from "@/lib/favorites";

/** `useSearchParams` (the ?specialisation= deep link) opts the page out of static prerendering unless it sits inside a
 * Suspense boundary — without this `next build` fails on this route. */
export default function AssociatesPage() {
  return (
    <Suspense
      fallback={
        <div role="status" className="flex min-h-dvh items-center justify-center bg-momentizing-cream font-marketing-serif text-lg text-momentizing-muted">
          Loading associates…
        </div>
      }
    >
      <AssociatesContent />
    </Suspense>
  );
}

function AssociatesContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(() => searchParams.get("specialisation"));
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { favorites, isFavorite } = useFavorites();

  const { data: page, error, isLoading, refetch } = useMarketingDirectory(100);
  const specialists = useMemo(() => page?.content ?? [], [page]);

  const allTags = useMemo(
    () => [...new Set(specialists.flatMap((p) => specialisationTags(p.specialisation)))].sort(),
    [specialists]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return specialists.filter((p) => {
      const matchesTag = !activeTag || specialisationTags(p.specialisation).includes(activeTag);
      const matchesAccepting = !acceptingOnly || p.acceptingNewClients;
      const matchesFavorite = !favoritesOnly || isFavorite(p.id);
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        (p.specialisation ?? "").toLowerCase().includes(term) ||
        (p.languages ?? "").toLowerCase().includes(term) ||
        (p.bio ?? "").toLowerCase().includes(term);
      return matchesTag && matchesAccepting && matchesFavorite && matchesSearch;
    });
  }, [specialists, search, activeTag, acceptingOnly, favoritesOnly, isFavorite]);

  return (
    <div className="min-h-dvh bg-momentizing-cream font-marketing-sans text-momentizing-slate">

      <header className="px-6 pt-40 pb-16 text-center">
        <h1 className="mb-4 font-marketing-serif text-5xl text-momentizing-gold-deep">Find Your Specialist</h1>
        <p className="mx-auto max-w-xl text-base text-momentizing-muted">
          Filter by clinical expertise, language, or specific challenges to find the expert best suited for your
          journey — then choose a real open time straight from their profile.
        </p>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-momentizing-gold/5 bg-white p-4 shadow-xl shadow-momentizing-gold/5 md:flex-row">
          <div className="relative flex-1">
            <i aria-hidden="true" className="fas fa-search absolute top-1/2 left-6 -translate-y-1/2 text-momentizing-teal" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, language, or keyword..."
              aria-label="Search associates by name, language or keyword"
              className="w-full rounded-2xl bg-momentizing-cream/50 py-4 pr-6 pl-14 text-base ring-momentizing-gold/20 outline-none transition focus:bg-white focus-visible:ring-2 focus-visible:ring-momentizing-teal"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAcceptingOnly((v) => !v)}
              aria-pressed={acceptingOnly}
              className={`min-h-11 rounded-full px-5 py-3 text-xs font-bold tracking-widest uppercase transition ${
                acceptingOnly ? "bg-momentizing-teal text-white" : "bg-momentizing-cream text-momentizing-muted hover:bg-momentizing-mint"
              }`}
            >
              Accepting clients
            </button>
            <button
              onClick={() => setFavoritesOnly((v) => !v)}
              aria-pressed={favoritesOnly}
              className={`flex min-h-11 items-center gap-1.5 rounded-full px-5 py-3 text-xs font-bold tracking-widest uppercase transition ${
                favoritesOnly ? "bg-momentizing-teal text-white" : "bg-momentizing-cream text-momentizing-muted hover:bg-momentizing-mint"
              }`}
            >
              <i aria-hidden="true" className={favoritesOnly ? "fas fa-heart" : "far fa-heart"} />
              Favorites{favorites.length > 0 ? ` (${favorites.length})` : ""}
            </button>
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="mb-16 flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                aria-pressed={activeTag === tag}
                className={`min-h-11 rounded-full border px-4 py-2 text-xs font-bold tracking-widest uppercase transition ${
                  activeTag === tag
                    ? "border-momentizing-teal bg-momentizing-teal text-white"
                    : "border-momentizing-slate/25 text-momentizing-slate hover:bg-momentizing-slate/5"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div role="status" className="py-24 text-center font-marketing-serif text-lg text-momentizing-muted">
            Loading associates…
          </div>
        ) : error ? (
          // A failed request is an error, not "no associates" — say so and offer a retry.
          <div role="alert" className="mx-auto max-w-md py-24 text-center">
            <p className="font-marketing-serif text-xl">We couldn&apos;t load our associates just now.</p>
            <p className="mt-2 text-sm text-momentizing-muted">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="mt-6 min-h-12 rounded-full bg-momentizing-teal px-8 py-3 text-sm font-semibold text-white hover:bg-momentizing-slate/90"
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center font-marketing-serif text-lg text-momentizing-muted">
            {favoritesOnly ? "No favorites yet — tap the heart on a profile to save it here." : "No associates found matching those criteria."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((specialist) => (
              <SpecialistCard key={specialist.id} specialist={specialist} />
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
