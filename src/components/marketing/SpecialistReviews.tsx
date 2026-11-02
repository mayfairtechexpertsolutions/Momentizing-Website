"use client";

import { useState } from "react";
import { useSpecialistReviews } from "@/lib/marketing-directory";
import { StarRating } from "./StarRating";
import { intlLocale, t } from "@/i18n";

interface SpecialistReviewsProps {
  specialistId: number;
  /** Used to make the empty state personal; optional so other callers keep working. */
  specialistName?: string;
  averageRating: number | null;
  reviewCount: number;
}

function ReviewStars({ value }: { value: number }) {
  return (
    <div role="img" aria-label={t("site.reviews.stars", { n: value })} className="flex text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <i key={i} aria-hidden="true" className={i < value ? "fas fa-star text-momentizing-gold-deep" : "far fa-star text-momentizing-gold-deep/40"} />
      ))}
    </div>
  );
}

const pagerClass =
  "min-h-11 rounded-full border-2 border-momentizing-mint-deep px-5 text-sm font-bold text-momentizing-teal transition hover:bg-momentizing-mint focus-visible:outline-2 focus-visible:outline-momentizing-teal disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

export function SpecialistReviews({ specialistId, specialistName, averageRating, reviewCount }: SpecialistReviewsProps) {
  const [page, setPage] = useState(0);
  const { data, error, isLoading } = useSpecialistReviews(specialistId, page);
  const hasReviews = averageRating != null && reviewCount > 0;

  return (
    <div className="space-y-6">
      {hasReviews ? (
        <div className="flex items-center gap-5 rounded-2xl bg-momentizing-peach/60 p-5">
          <p className="font-marketing-serif text-5xl leading-none font-bold text-momentizing-gold-deep">{averageRating.toFixed(1)}</p>
          <div>
            <StarRating rating={averageRating} reviewCount={reviewCount} size="md" showCount={false} />
            <p className="mt-1 text-sm text-momentizing-muted">
              From {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4 rounded-2xl bg-momentizing-mint/60 p-5">
          <span aria-hidden="true" className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white text-lg text-momentizing-teal shadow-sm">
            <i aria-hidden="true" className="fas fa-seedling" />
          </span>
          <div>
            <p className="font-marketing-serif text-lg font-bold text-momentizing-slate">
              {specialistName ? t("site.reviews.isNew", { name: specialistName.split(" ")[0] }) : t("site.reviews.none")}
            </p>
            <p className="mt-1 text-base leading-relaxed text-momentizing-muted">
              {t("site.reviews.emptyBody")}
            </p>
          </div>
        </div>
      )}

      {isLoading && hasReviews && <p role="status" className="text-sm text-momentizing-muted">{t("site.reviews.loading")}</p>}
      {error && <p role="alert" className="text-sm text-momentizing-muted">{t("site.reviews.loadError")}</p>}

      {data && data.content.length > 0 && (
        <ul className="space-y-4">
          {data.content.map((review) => (
            <li key={review.id} className="rounded-2xl border border-momentizing-slate/10 bg-momentizing-cream p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-momentizing-slate">{review.clientDisplayName}</p>
                <ReviewStars value={review.rating} />
              </div>
              {review.comment && <p className="mt-2 text-base leading-relaxed text-momentizing-slate/90">{review.comment}</p>}
              <p className="mt-2 text-xs text-momentizing-muted">
                {new Date(review.createdAt).toLocaleDateString(intlLocale(), { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </li>
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <nav aria-label={t("site.reviews.pages")} className="flex items-center justify-center gap-4">
          <button disabled={data.first} onClick={() => setPage((p) => p - 1)} className={pagerClass}>
            {t("site.common.previous")}
          </button>
          <span className="text-sm text-momentizing-muted">
            {t("site.common.pageOf", { page: data.number + 1, total: data.totalPages })}
          </span>
          <button disabled={data.last} onClick={() => setPage((p) => p + 1)} className={pagerClass}>
            {t("site.common.next")}
          </button>
        </nav>
      )}
    </div>
  );
}
