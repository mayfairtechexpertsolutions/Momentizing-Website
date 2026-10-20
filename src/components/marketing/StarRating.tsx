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
    return <span className={`${starSize} font-bold tracking-wide text-momentizing-muted uppercase`}>New — no reviews yet</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex ${starSize} text-momentizing-gold/40`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, rating - i));
          return (
            <span key={i} className="relative">
              <i className="fas fa-star" />
              <span className="absolute inset-0 overflow-hidden text-momentizing-gold-deep" style={{ width: `${fill * 100}%` }}>
                <i className="fas fa-star" />
              </span>
            </span>
          );
        })}
      </div>
      {showCount && (
        <span className="text-xs font-bold text-momentizing-muted">
          {rating.toFixed(1)} ({reviewCount})
        </span>
      )}
    </div>
  );
}
