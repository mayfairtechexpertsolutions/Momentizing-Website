/** Photo-free hero art in the brand's Instagram style: soft mint/peach blobs, leaf sprigs, rust accents.
 * Decorative only (aria-hidden); fills its parent, so size it from the outside. */
const leaf = "M0 0 C 18 -14 40 -14 56 0 C 40 14 18 14 0 0 Z";

export function Sprig({ x, y, rotate, scale = 1 }: { x: number; y: number; rotate: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d="M0 0 C 40 -6 80 -30 120 -70" fill="none" stroke="#3b6b58" strokeWidth="3" strokeLinecap="round" />
      {[20, 50, 80].map((t, i) => (
        <g key={t}>
          <path d={leaf} transform={`translate(${t} ${-t * 0.32 - 4}) rotate(-55)`} fill={i % 2 ? "#cfe3d8" : "#9fc2b1"} />
          <path d={leaf} transform={`translate(${t + 6} ${-t * 0.32 + 4}) rotate(35)`} fill={i % 2 ? "#9fc2b1" : "#cfe3d8"} />
        </g>
      ))}
      <path d={leaf} transform="translate(120 -70) rotate(-55)" fill="#3b6b58" />
    </g>
  );
}

export function BrandIllustration({ variant }: { variant: "care" | "team" }) {
  return (
    <svg viewBox="0 0 480 440" className="h-full w-full" aria-hidden="true" focusable="false">
      <rect width="480" height="440" fill="#e6f0ea" />
      <circle cx="400" cy="70" r="150" fill="#fbe6d8" />
      <circle cx="60" cy="400" r="130" fill="#cfe3d8" />
      <Sprig x={30} y={150} rotate={-10} scale={1.1} />
      <Sprig x={450} y={420} rotate={180} scale={0.9} />

      {variant === "care" ? (
        <g>
          <circle cx="240" cy="215" r="128" fill="#fbf5ec" />
          {/* heart held by two rounded hands */}
          <path
            d="M240 290 C 150 230 168 150 214 150 C 232 150 240 164 240 164 C 240 164 248 150 266 150 C 312 150 330 230 240 290 Z"
            fill="#9a3f1a"
          />
          <path d="M140 262 C 170 318 310 318 340 262 C 318 296 162 296 140 262 Z" fill="#3b6b58" />
        </g>
      ) : (
        <g>
          <path d="M150 250 L240 160 L330 250 M150 250 L330 250" fill="none" stroke="#3b6b58" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
          {[
            [240, 150, "#9a3f1a"],
            [150, 260, "#3b6b58"],
            [330, 260, "#e8a07e"],
          ].map(([cx, cy, fill]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx as number} cy={(cy as number) - 26} r="22" fill={fill as string} />
              <path d={`M${(cx as number) - 40} ${(cy as number) + 40} a40 40 0 0 1 80 0 Z`} fill={fill as string} />
            </g>
          ))}
          <circle cx="240" cy="262" r="26" fill="#fbf5ec" stroke="#3b6b58" strokeWidth="3" />
          <path d="M228 262 l9 9 l17 -19" fill="none" stroke="#3b6b58" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}
