import type { CategoryId } from "@/data/taxonomy";
import type { Status } from "@/data/types";

/**
 * A student's recent history in a category (ticket 175): the status the same category rolled up
 * to on the last five assignments and assessments that touched it, oldest first. Real where the
 * data has the set (ticket 187: Problem Set 1's results, `lib/setHistory.ts`), simulated before
 * it: there is no earlier work in the data, so those points are drawn from a fixed mix around a
 * status (a red pill has red and orange behind it, an orange one mostly orange with some red and
 * some light green, a light green one a mix of orange, light green and dark green, a dark green one
 * mostly dark green with some light green) and shuffled by a seed from the student and category,
 * so every reload and every screenshot shows the same five. An average, not a trend: a dark green
 * three weeks ago on a red-today skill means that set was easier, not that the student has fallen.
 */
export interface HistoryPoint {
  /** The date the evidence was recorded, as the pill's label ("Sep 9"). */
  date: string;
  status: Status;
}

/**
 * The dates of the five simulated results, oldest first, the same for every student and category: all
 * before Problem Set 1 (due Thu 3 Sep, ticket 187), whose real result follows them.
 */
export const HISTORY_DATES = ["Aug 11", "Aug 14", "Aug 20", "Aug 25", "Aug 28"] as const;

/** How many results a history shows. */
export const HISTORY_LENGTH = 5;

/** The one student whose history is dark green everywhere: dark green today in every category, and on every earlier set behind it. */
export const ALL_SECURE_STUDENT = "priya";

/**
 * The mix behind each status today: a few five-pill multisets the seed picks between, so two
 * students red today do not show the same five. A student with nothing seen yet in a category
 * (a hollow pill) gets the orange mix: the past is coloured even when today is not.
 */
const MIXES: Record<Status, Status[][]> = {
  gap: [
    ["gap", "gap", "gap", "developing", "developing"],
    ["gap", "gap", "developing", "developing", "developing"],
    ["gap", "gap", "gap", "gap", "developing"],
  ],
  developing: [
    ["developing", "developing", "developing", "gap", "solid"],
    ["developing", "developing", "gap", "gap", "solid"],
    ["developing", "developing", "developing", "developing", "gap"],
  ],
  solid: [
    ["solid", "solid", "developing", "secure", "secure"],
    ["solid", "solid", "solid", "developing", "secure"],
    ["solid", "developing", "developing", "secure", "solid"],
  ],
  secure: [
    ["secure", "secure", "secure", "secure", "solid"],
    ["secure", "secure", "secure", "solid", "solid"],
    ["secure", "secure", "secure", "secure", "secure"],
  ],
  unseen: [
    ["developing", "developing", "developing", "gap", "solid"],
    ["developing", "developing", "gap", "gap", "solid"],
  ],
};

/** A small string hash (FNV-1a, 32-bit) so the same student and category always seed the same draw. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** A tiny seeded generator (mulberry32) for the shuffle. */
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

/** Five simulated points, oldest first, for one student in one category, drawn around `today` (the status the mix is centred on). */
export function historyFor(student: string, category: CategoryId, today: Status): HistoryPoint[] {
  if (student === ALL_SECURE_STUDENT) return HISTORY_DATES.map((date) => ({ date, status: "secure" }));
  const next = rng(hash(`${student}/${category}`));
  const mixes = MIXES[today];
  const statuses = [...mixes[Math.floor(next() * mixes.length)]];
  for (let i = statuses.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [statuses[i], statuses[j]] = [statuses[j], statuses[i]];
  }
  return HISTORY_DATES.map((date, i) => ({ date, status: statuses[i] }));
}

/**
 * A history with real results after the simulated ones (ticket 187): the simulated five, then the
 * `earlier` sets' results (oldest first), the last five of those. The simulated points are drawn around
 * the oldest real result when there is one, so a set's history and a later set's agree on every date
 * they share; with none, around `today`.
 */
export function historyWith(student: string, category: CategoryId, today: Status, earlier: readonly HistoryPoint[]): HistoryPoint[] {
  const simulated = historyFor(student, category, earlier[0]?.status ?? today);
  return [...simulated, ...earlier].slice(-HISTORY_LENGTH);
}

/** The pill's date for a set due on a day: "Thu 3 Sep" is "Sep 3". */
export function historyDate(due: string): string {
  const m = /(\d{1,2})\s+([A-Za-z]{3})/.exec(due);
  return m ? `${m[2]} ${m[1]}` : due;
}
