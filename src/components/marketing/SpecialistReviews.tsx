"use client";

import { useState } from "react";
import { useSpecialistReviews } from "@/lib/marketing-directory";
import { StarRating } from "./StarRating";

interface SpecialistReviewsProps {
  specialistId: number;
  averageRating: number | null;
  reviewCount: number;
}

function ReviewStars({ value }: { value: number }) {
  return (
    <div className="flex text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <i key={i} className={i < value ? "fas fa-star text-momentizing-gold-deep" : "far fa-star text-momentizing-gold-deep/40"} />
      ))}
    </div>
  );
}

export function SpecialistReviews({
  specialistId,
  averageRating,
  reviewCount,
}: SpecialistReviewsProps) {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useSpecialistReviews(specialistId, page);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-momentizing-peach/60 p-6">
        <StarRating rating={averageRating} reviewCount={reviewCount} size="md" />
      </div>

      <div className="space-y-4">
        {isLoading && <p className="text-sm text-momentizing-muted">Loading reviews…</p>}
        {data && data.content.length === 0 && <p className="text-sm text-momentizing-muted italic">No reviews yet.</p>}
        {data?.content.map((review) => (
          <div key={review.id} className="border-b border-momentizing-gold/10 pb-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold">{review.clientDisplayName}</p>
              <ReviewStars value={review.rating} />
            </div>
            {review.comment && <p className="mt-1 text-sm text-momentizing-muted">{review.comment}</p>}
            <p className="mt-1 text-xs text-momentizing-muted">
              {new Date(review.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={data.first}
            onClick={() => setPage((p) => p - 1)}
            className="text-xs font-bold text-momentizing-gold-deep disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-xs text-momentizing-muted">
            Page {data.number + 1} of {data.totalPages}
          </span>
          <button
            disabled={data.last}
            onClick={() => setPage((p) => p + 1)}
            className="text-xs font-bold text-momentizing-gold-deep disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
