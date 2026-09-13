import type { CategoryId } from "@/data/taxonomy";
import type { Status } from "@/data/types";

/**
 * A student's recent history in a category (tickets 175, 187, 215): the status the category rolled up to on
 * the last five earlier sets that assessed it, oldest first, above today's pill on a set's Class View.
 *
 * Real where the Classroom holds the set (`lib/setHistory.ts` reads the registry): each real point names its
 * set and links to it. Too few real sets and simulated points fill the top of the stack, read as the class's
 * work before Edexia: dated from a week before the class's first set up to (never on or after) that set, on
 * weekdays, and walked one colour step at a time from the oldest real result (or today's pill with none), so
 * nothing jumps (red beside light green): a student's results are consistent between sets. Seeded by student
 * and category, so every reload shows the same walk. An average, not a trend: a dark green a week ago on a
 * red-today skill means that set was easier, not that the student has fallen. Pure.
 */

/** A set a real history point came from. */
export interface HistorySet {
  id: string;
  /** "PS5": the set's short name on the pill. */
  short: string;
  /** "Problem Set 5 — Features of a parabola", for the pill's accessible name. */
  name: string;
  /** The set's day, as its fixture's `due` reads ("Mon 7 Sep"). */
  due: string;
}

export interface HistoryPoint {
  /** The day the evidence was recorded ("Mon 7 Sep"). */
  date: string;
  status: Status;
  /** The set it came from; null on a simulated point. */
  set: HistorySet | null;
}

/** An earlier set that assessed the category, and the student's status in it there (oldest first in a list). */
export interface EarlierResult {
  set: HistorySet;
  status: Status;
}

/** How many results a history shows. */
export const HISTORY_LENGTH = 5;

/** The one student whose history is dark green everywhere: dark green today in every category, and on every earlier set behind it. */
export const ALL_SECURE_STUDENT = "priya";

/** The colour ladder a history walks: red, orange, light green, dark green. A hollow (unseen) pill is off it. */
const LADDER: readonly Exclude<Status, "unseen">[] = ["gap", "developing", "solid", "secure"];

/** How many ladder steps apart two statuses are; 0 when either is hollow (nothing to compare). */
export function stepsApart(a: Status, b: Status): number {
  if (a === "unseen" || b === "unseen") return 0;
  return Math.abs(LADDER.indexOf(a) - LADDER.indexOf(b));
}

/** A small string hash (FNV-1a, 32-bit) so the same student and category always seed the same walk. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** A tiny seeded generator (mulberry32) for the walk. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * `n` simulated statuses, oldest first, for one student in one category: a walk back from `anchor` (the status
 * the newest simulated point sits beside), each point the same as the one after it about half the time and one
 * step up or down otherwise, so neighbours never differ by more than one step and the newest is within one of
 * the anchor. A hollow anchor walks around orange. `ALL_SECURE_STUDENT` is dark green throughout.
 */
export function simulatedWalk(student: string, category: CategoryId, anchor: Status, n: number): Exclude<Status, "unseen">[] {
  if (n <= 0) return [];
  if (student === ALL_SECURE_STUDENT) return Array.from({ length: n }, () => "secure");
  const next = rng(hash(`${student}/${category}`));
  let at = LADDER.indexOf(anchor === "unseen" ? "developing" : anchor);
  const out: Exclude<Status, "unseen">[] = [];
  for (let i = 0; i < n; i++) {
    const r = next();
    const move = r < 0.5 ? 0 : r < 0.75 ? -1 : 1;
    // At an end of the ladder a step off it turns back inwards.
    at = at + move < 0 || at + move >= LADDER.length ? at - move : at + move;
    out.push(LADDER[at]);
  }
  return out.reverse();
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
/** The demo's school year: a set's `due` ("Mon 7 Sep") names no year. */
const YEAR = 2026;
const DAY_MS = 24 * 60 * 60 * 1000;

/** A set's day ("Mon 7 Sep") as a UTC midnight, or null when it does not read as a day. */
export function parseDay(due: string): number | null {
  const m = /(\d{1,2})\s+([A-Za-z]{3})/.exec(due);
  const month = m ? MONTHS.findIndex((x) => x.toLowerCase() === m[2].toLowerCase()) : -1;
  return m && month >= 0 ? Date.UTC(YEAR, month, Number(m[1])) : null;
}

/** A UTC midnight as a pill's day: "Fri 21 Aug". */
export function formatDay(t: number): string {
  const d = new Date(t);
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/**
 * The days of `n` simulated points, oldest first: the oldest a week before the class's first set (`firstDue`),
 * the rest spread evenly over the weekdays after it and before that set, so they read as class days before
 * Edexia and never land on or after the first set.
 */
export function simulatedDates(firstDue: string, n: number): string[] {
  if (n <= 0) return [];
  const first = parseDay(firstDue);
  if (first === null) return Array.from({ length: n }, () => "");
  const oldest = first - 7 * DAY_MS;
  const between: number[] = [];
  for (let t = oldest + DAY_MS; t < first; t += DAY_MS) {
    const wd = new Date(t).getUTCDay();
    if (wd !== 0 && wd !== 6) between.push(t);
  }
  const pool = between.length >= n - 1 ? between : Array.from({ length: 6 }, (_, i) => oldest + (i + 1) * DAY_MS);
  // n - 1 picks spread over the pool, the latest on its last day: even steps back from the end.
  const picks = Array.from({ length: n - 1 }, (_, i) => pool[Math.round(((i + 1) * pool.length) / (n - 1 || 1)) - 1]);
  return [oldest, ...picks].map(formatDay);
}

/**
 * A history: the last five `earlier` results (oldest first), topped up with simulated points when there are
 * fewer than five. The simulated walk ends beside the oldest real result that has a colour (else today's pill,
 * else orange); its days run from a week before the class's first set (`firstDue`).
 */
export function historyWith(student: string, category: CategoryId, today: Status, earlier: readonly EarlierResult[], firstDue: string): HistoryPoint[] {
  const real = earlier.slice(-HISTORY_LENGTH).map(({ set, status }) => ({ date: set.due, status, set }));
  const missing = HISTORY_LENGTH - real.length;
  const anchor = real.find((p) => p.status !== "unseen")?.status ?? today;
  const dates = simulatedDates(firstDue, missing);
  const simulated = simulatedWalk(student, category, anchor, missing).map((status, i) => ({ date: dates[i], status, set: null }));
  return [...simulated, ...real];
}

/** A set's short name for its pill: "Problem Set 5 — Features of a parabola" is "PS5"; a name without a number keeps its first word. */
export function shortSetName(name: string): string {
  const m = /problem\s+set\s+(\d+)/i.exec(name);
  return m ? `PS${m[1]}` : (name.split(/\s+/)[0] ?? name);
}

/** The words on a history pill: "PS5 · Mon 7 Sep" for a real set, the day alone ("Fri 21 Aug") for a simulated point. */
export function pillLabel(p: HistoryPoint): string {
  return p.set ? `${p.set.short} · ${p.date}` : p.date;
}
