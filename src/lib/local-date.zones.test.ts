import { describe, expect, it } from "vitest";
import { addDaysIso, icsStamp, localToUtc, parseIsoLocal, toIsoLocal, utcToLocal } from "./local-date";

/**
 * Zone-independent checks: the expected answer is computed with Intl for the zone the process runs in, so these hold in
 * any zone. Run them in several with e.g. `TEST_TZ=Asia/Jakarta npm test` (the other date tests are tied to Los Angeles).
 */
const ZONE = () => process.env.TZ ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

function expectedLocal(utcMs: number): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE(), year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(utcMs));
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

const pad = (n: number) => String(n).padStart(2, "0");
/** Every half hour of the UTC days around the clock changes of the zones we care about, plus ordinary days. */
const DAYS = ["2026-03-08", "2026-03-29", "2026-10-25", "2026-11-01", "2027-03-14", "2026-12-31", "2027-01-01", "2026-10-24"];

describe("UTC slots on the visitor's own clock, in whatever zone the browser is", () => {
  it("utcToLocal agrees with Intl for every half hour, including clock-change days", () => {
    for (const day of DAYS) {
      for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
        const time = `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
        const [y, m, d] = day.split("-").map(Number);
        const ms = Date.UTC(y, m - 1, d, Math.floor(minutes / 60), minutes % 60);
        expect(utcToLocal(day, time), `${day} ${time}Z`).toEqual(expectedLocal(ms));
      }
    }
  });

  it("localToUtc undoes utcToLocal for every instant that is not in a repeated or skipped local hour", () => {
    let checked = 0;
    for (const day of DAYS) {
      for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
        const time = `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
        const local = utcToLocal(day, time);
        const back = localToUtc(local.date, local.time);
        // During the repeated hour of a fall-back change two instants share one local time; localToUtc picks one of them.
        const sameInstant = back.date === day && back.time === time;
        const ambiguous = utcToLocal(back.date, back.time).time === local.time && utcToLocal(back.date, back.time).date === local.date;
        expect(sameInstant || ambiguous, `${day} ${time}Z -> ${local.date} ${local.time} -> ${back.date} ${back.time}Z`).toBe(true);
        checked++;
      }
    }
    expect(checked).toBe(DAYS.length * 48);
  });

  it("a calendar date round-trips through parseIsoLocal/toIsoLocal for every day of 2026 and 2027, and addDaysIso steps one day at a time", () => {
    let iso = "2026-01-01";
    for (let i = 0; i < 730; i++) {
      expect(toIsoLocal(parseIsoLocal(iso)), iso).toBe(iso);
      const next = addDaysIso(iso, 1);
      expect((parseIsoLocal(next).getTime() - parseIsoLocal(iso).getTime()) / 86_400_000, `${iso} -> ${next}`).toBeGreaterThanOrEqual(0.95);
      expect(addDaysIso(next, -1), iso).toBe(iso);
      iso = next;
    }
    expect(iso).toBe("2028-01-01");
  });

  it("the calendar-file timestamp is the same instant in every zone", () => {
    expect(icsStamp("2026-10-24", "23:30", 60)).toBe("20261025T003000Z");
    expect(icsStamp("2026-12-31", "23:00", 120)).toBe("20270101T010000Z");
  });
});
