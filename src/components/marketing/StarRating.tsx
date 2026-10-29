interface StarRatingProps {
  rating: number | null;
  reviewCount: number;
  size?: "sm" | "md";
  showCount?: boolean;
}

/** Renders 5 stars filled proportionally to `rating` (rounded to the nearest half-star visually via
 * width clipping). `rating === null` means no reviews yet — shown as "New" rather than fake zero stars. */
export function StarRating({ rating, reviewCount, size = "sm", showCount = true }: StarRatingProps) {
  const starSize = size === "sm" ? "text-xs" : "text-base";

  if (rating == null || reviewCount === 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${starSize} font-bold text-momentizing-teal`}>
        <i aria-hidden="true" className="fas fa-seedling" /> New to Momentizing
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="sr-only">Rated {rating.toFixed(1)} out of 5 from {reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
      <div aria-hidden="true" className={`flex ${starSize} text-momentizing-gold/40`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, rating - i));
          return (
            <span key={i} className="relative">
              <i aria-hidden="true" className="fas fa-star" />
              <span className="absolute inset-0 overflow-hidden text-momentizing-gold-deep" style={{ width: `${fill * 100}%` }}>
                <i aria-hidden="true" className="fas fa-star" />
              </span>
            </span>
          );
        })}
      </div>
      {showCount && (
        <span aria-hidden="true" className="text-xs font-bold text-momentizing-muted">
          {rating.toFixed(1)} ({reviewCount})
        </span>
      )}
    </div>
  );
}
