import { Sprig } from "../BrandIllustration";

/** Original illustrations for the About page. Decorative only (aria-hidden); each fills its parent.
 * Colours come from the --momentizing-* tokens so the art follows the theme. */
const C = {
  cream: "var(--momentizing-cream)",
  mint: "var(--momentizing-mint)",
  mintDeep: "var(--momentizing-mint-deep)",
  peach: "var(--momentizing-peach)",
  gold: "var(--momentizing-gold)",
  rust: "var(--momentizing-gold-deep)",
  teal: "var(--momentizing-teal)",
  slate: "var(--momentizing-slate)",
  white: "white",
};

const pinPath = "M0 0 C -15 -17 -19 -28 -19 -36 A19 19 0 1 1 19 -36 C 19 -28 15 -17 0 0 Z";

function MapPin({ x, y, fill, scale = 1 }: { x: number; y: number; fill: string; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="3" rx="11" ry="3.5" fill={C.slate} opacity="0.18" />
      <path d={pinPath} fill={fill} />
      <circle cx="0" cy="-36" r="7" fill={C.cream} />
    </g>
  );
}

/** Globe with routes between pins: the whole story in one glance (hero). */
export function HeroGlobe() {
  return (
    <svg viewBox="0 0 480 440" className="h-full w-full" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="about-globe-clip">
          <circle cx="240" cy="226" r="132" />
        </clipPath>
      </defs>
      <rect width="480" height="440" fill={C.mint} />
      <circle cx="410" cy="60" r="150" fill={C.peach} />
      <circle cx="50" cy="410" r="130" fill={C.mintDeep} />
      <Sprig x={26} y={170} rotate={-12} scale={1.05} />
      <Sprig x={456} y={430} rotate={180} scale={0.85} />

      <circle cx="240" cy="226" r="132" fill={C.cream} />
      <g clipPath="url(#about-globe-clip)" fill="none" stroke={C.mintDeep} strokeWidth="2.5">
        <ellipse cx="240" cy="226" rx="52" ry="132" />
        <ellipse cx="240" cy="226" rx="104" ry="132" />
        <line x1="240" y1="94" x2="240" y2="358" />
        <path d="M108 226 H372" />
        <path d="M122 160 Q240 190 358 160" />
        <path d="M122 292 Q240 322 358 292" />
        <path d="M150 112 Q240 128 330 112" />
        <path d="M150 340 Q240 324 330 340" />
        {/* soft continents */}
        <path d="M168 176 C 186 152 214 158 220 178 C 226 198 200 206 190 222 C 176 214 160 198 168 176 Z" fill={C.mint} stroke="none" />
        <path d="M262 204 C 286 190 322 200 326 226 C 330 252 300 262 288 286 C 270 274 254 232 262 204 Z" fill={C.mint} stroke="none" />
      </g>
      <circle cx="240" cy="226" r="132" fill="none" stroke={C.teal} strokeWidth="3" />

      {/* routes */}
      <g fill="none" stroke={C.rust} strokeWidth="3" strokeLinecap="round" strokeDasharray="2 10">
        <path d="M190 190 Q 236 96 318 168" />
        <path d="M318 168 Q 376 232 304 292" />
        <path d="M304 292 Q 236 340 196 276" />
      </g>
      <MapPin x={190} y={190} fill={C.teal} />
      <MapPin x={318} y={168} fill={C.rust} />
      <MapPin x={304} y={292} fill={C.gold} />
      <MapPin x={196} y={276} fill={C.slate} scale={0.9} />

      {/* paper plane */}
      <g transform="translate(392 118) rotate(-14)">
        <path d="M0 0 L58 -20 L40 28 L26 8 Z" fill={C.white} stroke={C.rust} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M26 8 L58 -20" fill="none" stroke={C.rust} strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <path d="M382 160 C 340 190 340 120 290 110" fill="none" stroke={C.rust} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 9" opacity="0.7" />
    </svg>
  );
}

const frame = "0 0 320 240";

/** 2019: a tiered tower against hills and a low sun. */
export function TaipeiArt() {
  const cx = 160;
  const tiers = Array.from({ length: 8 }, (_, i) => {
    const yBot = 184 - i * 13;
    const yTop = yBot - 12;
    return `${cx - 8},${yBot} ${cx + 8},${yBot} ${cx + 13},${yTop} ${cx - 13},${yTop}`;
  });
  return (
    <svg viewBox={frame} className="h-full w-full" aria-hidden="true" focusable="false">
      <rect width="320" height="240" fill={C.peach} />
      <circle cx="250" cy="76" r="36" fill={C.gold} opacity="0.9" />
      <path d="M0 176 L64 112 L120 160 L196 96 L320 180 L320 240 L0 240 Z" fill={C.mintDeep} />
      <path d="M0 196 C 80 164 210 214 320 184 L320 240 L0 240 Z" fill={C.teal} />
      <rect x={cx - 22} y="180" width="44" height="14" rx="4" fill={C.slate} />
      <rect x={cx - 10} y="186" width="20" height="16" fill={C.rust} />
      {tiers.map((points, i) => (
        <polygon key={points} points={points} fill={i % 2 ? C.rust : C.slate} stroke={C.peach} strokeWidth="1.5" strokeLinejoin="round" />
      ))}
      <polygon points={`${cx - 5},80 ${cx + 5},80 ${cx},36`} fill={C.rust} />
      <circle cx={cx} cy="34" r="3" fill={C.gold} />
      <path d="M0 214 C 90 198 230 226 320 208 L320 240 L0 240 Z" fill={C.slate} opacity="0.9" />
      <g fill={C.cream} opacity="0.85">
        <circle cx="60" cy="54" r="2.5" />
        <circle cx="96" cy="38" r="2" />
        <circle cx="210" cy="30" r="2.5" />
      </g>
    </svg>
  );
}

/** 2020-2022: faces on a call, and the conversation that grew from it. */
export function CallArt() {
  const tiles = [
    [C.peach, C.rust],
    [C.mintDeep, C.teal],
    [C.cream, C.gold],
    [C.mintDeep, C.slate],
    [C.peach, C.teal],
    [C.cream, C.rust],
  ] as const;
  return (
    <svg viewBox={frame} className="h-full w-full" aria-hidden="true" focusable="false">
      <rect width="320" height="240" fill={C.mint} />
      <circle cx="40" cy="210" r="84" fill={C.mintDeep} />
      <rect x="44" y="34" width="232" height="152" rx="14" fill={C.slate} />
      {tiles.map(([bg, fg], i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 54 + col * 74;
        const y = 44 + row * 66;
        return (
          <g key={i}>
            <rect x={x} y={y} width="68" height="60" rx="8" fill={bg} />
            <circle cx={x + 34} cy={y + 24} r="11" fill={fg} />
            <path d={`M${x + 12} ${y + 60} a22 22 0 0 1 44 0 Z`} fill={fg} />
          </g>
        );
      })}
      <rect x="22" y="188" width="276" height="10" rx="5" fill={C.teal} />
      <g transform="translate(222 4)">
        <path d="M0 14 a14 14 0 0 1 14 -14 H62 a14 14 0 0 1 14 14 V30 a14 14 0 0 1 -14 14 H34 L18 58 V44 H14 a14 14 0 0 1 -14 -14 Z" fill={C.white} stroke={C.rust} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="22" cy="22" r="4" fill={C.rust} />
        <circle cx="38" cy="22" r="4" fill={C.rust} />
        <circle cx="54" cy="22" r="4" fill={C.rust} />
      </g>
      <Sprig x={282} y={232} rotate={200} scale={0.55} />
    </svg>
  );
}

/** 2022: a tall monument and a city skyline. */
export function JakartaArt() {
  return (
    <svg viewBox={frame} className="h-full w-full" aria-hidden="true" focusable="false">
      <rect width="320" height="240" fill={C.mint} />
      <circle cx="70" cy="70" r="30" fill={C.peach} />
      <g fill={C.mintDeep}>
        <rect x="24" y="128" width="30" height="70" rx="3" />
        <rect x="58" y="104" width="34" height="94" rx="3" />
        <rect x="228" y="116" width="34" height="82" rx="3" />
        <rect x="266" y="140" width="32" height="58" rx="3" />
      </g>
      <g fill={C.teal} opacity="0.55">
        <rect x="98" y="132" width="26" height="66" rx="3" />
        <rect x="198" y="146" width="26" height="52" rx="3" />
      </g>
      <path d="M0 200 C 100 188 220 210 320 196 L320 240 L0 240 Z" fill={C.teal} />
      <ellipse cx="160" cy="206" rx="86" ry="8" fill={C.slate} opacity="0.25" />
      <rect x="112" y="190" width="96" height="12" rx="3" fill={C.cream} stroke={C.slate} strokeWidth="2" />
      <rect x="128" y="180" width="64" height="11" rx="3" fill={C.cream} stroke={C.slate} strokeWidth="2" />
      <polygon points="150,181 170,181 164,86 156,86" fill={C.white} stroke={C.slate} strokeWidth="2" strokeLinejoin="round" />
      <rect x="148" y="78" width="24" height="10" rx="2" fill={C.cream} stroke={C.slate} strokeWidth="2" />
      <path d="M160 24 C 150 40 146 52 160 66 C 174 52 170 40 160 24 Z" fill={C.gold} stroke={C.rust} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M160 46 C 156 52 156 58 160 62 C 164 58 164 52 160 46 Z" fill={C.rust} />
      <g fill={C.slate} opacity="0.9">
        <circle cx="64" cy="204" r="13" />
        <circle cx="262" cy="206" r="15" />
      </g>
    </svg>
  );
}

/** Now: a quiet room with a chair, a plant and a window. */
export function RoomArt() {
  return (
    <svg viewBox={frame} className="h-full w-full" aria-hidden="true" focusable="false">
      <rect width="320" height="240" fill={C.peach} />
      <rect y="186" width="320" height="54" fill={C.mintDeep} />
      <rect x="206" y="28" width="88" height="116" rx="8" fill={C.cream} stroke={C.white} strokeWidth="6" />
      <path d="M250 28 V144 M206 86 H294" stroke={C.white} strokeWidth="4" />
      <circle cx="270" cy="56" r="12" fill={C.gold} opacity="0.85" />
      <path d="M206 144 L250 108 L294 144 Z" fill={C.mintDeep} opacity="0.7" />
      {/* armchair */}
      <rect x="52" y="104" width="108" height="76" rx="26" fill={C.teal} />
      <rect x="44" y="144" width="124" height="42" rx="18" fill={C.mintDeep} />
      <rect x="36" y="124" width="26" height="62" rx="13" fill={C.teal} />
      <rect x="150" y="124" width="26" height="62" rx="13" fill={C.teal} />
      <rect x="70" y="150" width="68" height="22" rx="11" fill={C.rust} />
      <rect x="54" y="184" width="8" height="14" rx="3" fill={C.slate} />
      <rect x="146" y="184" width="8" height="14" rx="3" fill={C.slate} />
      {/* side table with a cup */}
      <ellipse cx="204" cy="170" rx="30" ry="7" fill={C.cream} stroke={C.slate} strokeWidth="2" />
      <rect x="201" y="176" width="6" height="26" fill={C.slate} />
      <ellipse cx="204" cy="203" rx="14" ry="3.5" fill={C.slate} opacity="0.5" />
      <path d="M192 150 h22 v14 a11 11 0 0 1 -22 0 Z" fill={C.white} stroke={C.rust} strokeWidth="2" />
      <path d="M200 142 c-3 -5 3 -7 0 -12 M207 142 c-3 -5 3 -7 0 -12" fill="none" stroke={C.rust} strokeWidth="2" strokeLinecap="round" />
      {/* plant */}
      <polygon points="262,176 298,176 292,214 268,214" fill={C.rust} />
      <g fill={C.teal}>
        <ellipse cx="280" cy="140" rx="9" ry="30" transform="rotate(-4 280 176)" />
        <ellipse cx="262" cy="150" rx="8" ry="26" transform="rotate(-38 270 176)" />
        <ellipse cx="298" cy="150" rx="8" ry="26" transform="rotate(38 290 176)" />
        <ellipse cx="270" cy="124" rx="7" ry="22" transform="rotate(-18 276 170)" fill={C.mintDeep} />
      </g>
    </svg>
  );
}

/** Journey stop marker. Sized from outside via className; colour set per stop. */
export function JourneyPin({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="-22 -58 44 64" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="0" cy="3" rx="12" ry="3.5" fill={C.slate} opacity="0.2" />
      <path d={pinPath} fill={color} />
      <circle cx="0" cy="-36" r="7.5" fill={C.cream} />
    </svg>
  );
}

export const pinColors = { teal: C.teal, rust: C.rust, gold: C.gold, slate: C.slate };
