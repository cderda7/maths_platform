import type { CreateKind } from "./createPipeline";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/**
 * A due date's place in the (one) school year, for sorting: "Mon 7 Sep" is later than "Fri 28 Aug".
 * The sets carry their due day as it reads on the card, weekday, day and month with no year (one
 * class, one term, ASSUMPTIONS.md); a date that does not read that way sorts last (-1).
 * Ticket 216 wrote it for the Classroom's cards; ticket 210 moved it here so the registry orders its finished sets by it.
 */
export function dueOrder(due: string): number {
  const m = /(\d{1,2})\s+([A-Z][a-z]{2})/.exec(due);
  const month = m ? MONTHS.indexOf(m[2] as (typeof MONTHS)[number]) : -1;
  return m && month >= 0 ? month * 31 + Number(m[1]) : -1;
}

/**
 * A calendar day as Create stores a due date (ticket 289): "2026-09-10". Stored with its year so the day is never
 * ambiguous; every screen shows it the way the fixtures' `due` reads (`dayLabel`: "Thu 10 Sep"), so cards, sorting
 * and the history pills treat a picked date and a fixture's alike.
 */
export type IsoDay = string;

/**
 * The demo's today (ticket 289): Thursday 10 September 2026, the day Problem Set 6 is taught in class. The picker
 * offers no day before it. Fixed, not the machine's clock, so the demo reads the same on any day it is shown.
 */
export const DEMO_TODAY: IsoDay = "2026-09-10";

/**
 * Where the picker starts for each kind of set: for an in-class set the next lesson day, which for Problem Set 6 is
 * today's lesson, so the created set is due Thu 10 Sep as the fixture (and every presenter skip, which sends the fixture)
 * has it; for homework (ticket 291) the Monday after, Mon 14 Sep, a week after Homework 2 (`nextHomework` keeps a later
 * homework a week after its previous one).
 */
export const DUE_DEFAULT: Record<CreateKind, IsoDay> = { pset: DEMO_TODAY, homework: "2026-09-14" };

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** The day's UTC midnight, or null when `iso` is not a real calendar day ("2026-02-30" is not). */
function utc(iso: unknown): Date | null {
  if (typeof iso !== "string") return null;
  const m = ISO.exec(iso);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.getUTCFullYear() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3]) ? d : null;
}

const isoOf = (d: Date): IsoDay => d.toISOString().slice(0, 10);

/** Whether a stored value is a real calendar day in `IsoDay` form. */
export const isIsoDay = (v: unknown): v is IsoDay => utc(v) !== null;

/** The day as cards show a due date: "Thu 10 Sep". */
export function dayLabel(iso: IsoDay): string {
  const d = utc(iso);
  if (!d) return iso;
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** The day's full name for a screen reader: "Thursday 10 September 2026". */
export function dayName(iso: IsoDay): string {
  const d = utc(iso);
  if (!d) return iso;
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getUTCDay()];
  return `${weekday} ${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** `n` days after `iso` (before, when negative). */
export function addDays(iso: IsoDay, n: number): IsoDay {
  const d = utc(iso);
  if (!d) return iso;
  d.setUTCDate(d.getUTCDate() + n);
  return isoOf(d);
}

/** A month in the picker: its year and its month, 0-based. */
export interface Month {
  year: number;
  month: number;
}

export const monthOf = (iso: IsoDay): Month => {
  const d = utc(iso) ?? new Date(0);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
};

/** "September 2026". */
export const monthLabel = ({ year, month }: Month): string => `${MONTH_NAMES[month]} ${year}`;

/** The month `n` months on (back, when negative). */
export function addMonths({ year, month }: Month, n: number): Month {
  const total = year * 12 + month + n;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

/** The same day of the month `n` months on, kept inside that month (31 Aug + 1 month is 30 Sep). */
export function addMonthsToDay(iso: IsoDay, n: number): IsoDay {
  const d = utc(iso);
  if (!d) return iso;
  const { year, month } = addMonths({ year: d.getUTCFullYear(), month: d.getUTCMonth() }, n);
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return isoOf(new Date(Date.UTC(year, month, Math.min(d.getUTCDate(), last))));
}

const pad = (n: number) => String(n).padStart(2, "0");

/** The day of a month: `day` 1-based. */
export const dayIn = ({ year, month }: Month, day: number): IsoDay => `${year}-${pad(month + 1)}-${pad(day)}`;

/**
 * A month as the picker lays it out: weeks from Monday to Sunday (an Australian school's week), each seven cells,
 * a cell outside the month null. Four to six weeks.
 */
export function monthWeeks(m: Month): (IsoDay | null)[][] {
  const first = new Date(Date.UTC(m.year, m.month, 1));
  const days = new Date(Date.UTC(m.year, m.month + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7;
  const cells: (IsoDay | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => dayIn(m, i + 1))];
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

/** The Monday of the week `iso` is in, and its Sunday. */
export function weekStart(iso: IsoDay): IsoDay {
  const d = utc(iso);
  return d ? addDays(iso, -((d.getUTCDay() + 6) % 7)) : iso;
}
export const weekEnd = (iso: IsoDay): IsoDay => addDays(weekStart(iso), 6);

/** ISO days compare as strings; the later of two. */
export const laterOf = (a: IsoDay, b: IsoDay): IsoDay => (a > b ? a : b);

/**
 * A stored due date as the picker reads it back: the day when it is a real day on or after `min`, else `fallback`
 * (a draft stored before ticket 289 has none; one stored on an earlier "today" may have fallen behind).
 */
export function dueOrDefault(stored: unknown, min: IsoDay, fallback: IsoDay): IsoDay {
  return isIsoDay(stored) && stored >= min ? stored : laterOf(fallback, min);
}
