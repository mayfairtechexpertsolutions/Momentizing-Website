"use client";

import type { ReactNode } from "react";
import { CallArt, JakartaArt, JourneyPin, RoomArt, TaipeiArt, pinColors } from "./AboutArt";
import { Reveal } from "./Reveal";
import { t } from "@/i18n";

interface Stop {
  when: string;
  place: string;
  title: string;
  body: ReactNode;
  art: ReactNode;
  artLabel: string;
  pin: string;
}

/** Built at render time so the text follows the chosen language. */
function stops(): Stop[] {
  return [
    {
      when: "2019",
      place: t("site.about.stop1.place"),
      title: t("site.about.stop1.title"),
      body: <p>{t("site.about.stop1.body")}</p>,
      art: <TaipeiArt />,
      artLabel: t("site.about.stop1.art"),
      pin: pinColors.rust,
    },
    {
      when: "2020 – 2022",
      place: t("site.about.stop2.place"),
      title: t("site.about.stop2.title"),
      body: (
        <>
          <p>{t("site.about.stop2.body1")}</p>
          <p>{t("site.about.stop2.body2")}</p>
        </>
      ),
      art: <CallArt />,
      artLabel: t("site.about.stop2.art"),
      pin: pinColors.teal,
    },
    {
      when: "2022",
      place: t("site.about.stop3.place"),
      title: t("site.about.stop3.title"),
      body: <p>{t("site.about.stop3.body")}</p>,
      art: <JakartaArt />,
      artLabel: t("site.about.stop3.art"),
      pin: pinColors.gold,
    },
    {
      when: t("site.about.stop4.when"),
      place: t("site.about.stop4.place"),
      title: "Momentizing Holistic Center",
      body: <p>{t("site.about.stop4.body")}</p>,
      art: <RoomArt />,
      artLabel: t("site.about.stop4.art"),
      pin: pinColors.slate,
    },
  ];
}

/** Desktop road segment for one stop. It enters and leaves at the centre line and bulges toward `side`, where the
 * stop's pin sits; stacked segments therefore join into one winding road. Stretched with preserveAspectRatio="none",
 * so strokes use non-scaling-stroke to stay a constant width. */
function RoadSegment({ side, first, last }: { side: "left" | "right"; first: boolean; last: boolean }) {
  const bulge = side === "left" ? 14 : 86;
  const d = last
    ? `M50 0 C 50 22 ${bulge} 28 ${bulge} 50`
    : first
      ? `M${bulge} 50 C ${bulge} 72 50 78 50 100`
      : `M50 0 C 50 22 ${bulge} 28 ${bulge} 50 C ${bulge} 72 50 78 50 100`;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="journey-road absolute inset-0 h-full w-full overflow-visible" aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="var(--momentizing-mint-deep)" strokeWidth="30" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d={d} fill="none" stroke="var(--momentizing-cream)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="9 11" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function JourneyTimeline() {
  const STOPS = stops();
  return (
    <ol className="mx-auto mt-16 max-w-6xl">
      {STOPS.map((stop, i) => {
        const textLeft = i % 2 === 0;
        const side = textLeft ? "left" : "right";
        return (
          <li
            key={stop.when}
            className="relative pb-14 pl-12 before:absolute before:top-0 before:bottom-0 before:left-[15px] before:border-l-2 before:border-dashed before:border-momentizing-mint-deep last:pb-0 last:before:h-8 last:before:bottom-auto md:pb-0 md:pl-0 md:before:hidden"
          >
            <Reveal className="md:grid md:min-h-[22rem] md:grid-cols-[1fr_8rem_1fr] md:items-center md:gap-x-4">
              <div className="absolute top-0 left-0 md:hidden" aria-hidden="true">
                <JourneyPin color={stop.pin} className="h-12 w-8" />
              </div>

              <div className={`md:py-10 ${textLeft ? "md:order-1 md:pr-8" : "md:order-3 md:pl-8"}`}>
                <p className="font-marketing-serif text-4xl leading-none font-semibold text-momentizing-gold-deep md:text-5xl">
                  {stop.when}
                </p>
                <p className="mt-2 text-sm font-bold text-momentizing-teal">{stop.place}</p>
                <h3 className="mt-4 font-marketing-serif text-2xl leading-snug font-semibold text-momentizing-slate">{stop.title}</h3>
                <div className="mt-3 max-w-prose space-y-3 leading-relaxed text-momentizing-muted [&_p]:max-w-prose">
                  {stop.body}
                </div>
              </div>

              <div className="relative hidden self-stretch md:order-2 md:block" aria-hidden="true">
                <RoadSegment side={side} first={i === 0} last={i === STOPS.length - 1} />
                <div
                  className="journey-pin absolute top-1/2 h-14 w-10"
                  style={{ left: side === "left" ? "14%" : "86%" }}
                >
                  <JourneyPin color={stop.pin} className="h-full w-full" />
                </div>
              </div>

              <div className={`mt-6 md:mt-0 md:py-8 ${textLeft ? "md:order-3 md:pl-6" : "md:order-1 md:pr-6"}`}>
                <div
                  role="img"
                  aria-label={stop.artLabel}
                  className={`aspect-[4/3] w-full max-w-sm overflow-hidden rounded-[2rem] border-[6px] border-white shadow-[0_8px_30px_rgba(47,62,70,0.1)] md:max-w-none`}
                >
                  {stop.art}
                </div>
              </div>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
