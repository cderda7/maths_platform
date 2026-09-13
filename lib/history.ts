import type { Status } from "@/data/types";

/**
 * A student's recent history in a category (tickets 175, 187, 215, 237): the status the category rolled up to on
 * the last five earlier sets that assessed it, oldest first, above today's pill on a set's Class View.
 *
 * Only sets the Classroom holds (`lib/setHistory.ts` reads the registry): a category no earlier set assessed has
 * no history, and one with fewer than five shows only those (ticket 237 removed the simulated points that filled
 * the stack before the class's first set). An average, not a trend: a dark green a week ago on a red-today skill
 * means that set was easier, not that the student has fallen. Pure.
 */

/** A set a history point came from. */
export interface HistorySet {
  id: string;
  /** "Problem Set 5 — Features of a parabola", for the pill's accessible name. */
  name: string;
  /** The set's day, as its fixture's `due` reads ("Mon 7 Sep"). */
  due: string;
}

export interface HistoryPoint {
  /** The day the evidence was recorded ("Mon 7 Sep"). */
  date: string;
  status: Status;
  /** The set it came from. */
  set: HistorySet;
}

/** An earlier set that assessed the category, and the student's status in it there (oldest first in a list). */
export interface EarlierResult {
  set: HistorySet;
  status: Status;
}

/** The most results a history shows. */
export const HISTORY_LENGTH = 5;

/** The colour ladder a history walks: red, orange, light green, dark green. A hollow (unseen) pill is off it. */
const LADDER: readonly Exclude<Status, "unseen">[] = ["gap", "developing", "solid", "secure"];

/** How many ladder steps apart two statuses are; 0 when either is hollow (nothing to compare). */
export function stepsApart(a: Status, b: Status): number {
  if (a === "unseen" || b === "unseen") return 0;
  return Math.abs(LADDER.indexOf(a) - LADDER.indexOf(b));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
/** The demo's school year: a set's `due` ("Mon 7 Sep") names no year. */
const YEAR = 2026;

/** A set's day ("Mon 7 Sep") as a UTC midnight, or null when it does not read as a day. */
export function parseDay(due: string): number | null {
  const m = /(\d{1,2})\s+([A-Za-z]{3})/.exec(due);
  const month = m ? MONTHS.findIndex((x) => x.toLowerCase() === m[2].toLowerCase()) : -1;
  return m && month >= 0 ? Date.UTC(YEAR, month, Number(m[1])) : null;
}

/** A history: the last five `earlier` results, oldest first. */
export function historyWith(earlier: readonly EarlierResult[]): HistoryPoint[] {
  return earlier.slice(-HISTORY_LENGTH).map(({ set, status }) => ({ date: set.due, status, set }));
}

/** The words on a history pill: the set's day alone ("Mon 7 Sep", ticket 237); the set's name is in its accessible name. */
export function pillLabel(p: HistoryPoint): string {
  return p.date;
}

/** A set's short name for the way back from an earlier set's report (ticket 237): "Problem Set 6 — Roots of a quadratic" is "PSet 6"; a name without a number keeps its own words. */
export function psetName(name: string): string {
  const m = /problem\s+set\s+(\d+)/i.exec(name);
  return m ? `PSet ${m[1]}` : name;
}
