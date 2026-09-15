import { ASSIGNMENT } from "@/data/assignment";
import { SIMILAR_MAP, type SimilarProblem } from "@/data/homework";
import { PS5_SIMILAR_PROBLEMS } from "@/data/homework-similar-ps5";
import type { Problem } from "@/data/types";
import { holds, sessionReviews, type ProblemReview } from "./report";
import type { StudentSession } from "./session";

/**
 * The homework bank (ticket 256): after the reflection is sent, every problem the student ever got wrong goes into their
 * homework as its problem type, shown by changing the question into a similar one (`data/homework.ts`). Only this
 * screen's data for now: there are no homework screens. Pure, so the sequence can be tested and a reload picks it up
 * where it was: everything is derived from the moment the report was sent (`StudentSession.homeworkAt`) and the clock.
 */

/**
 * Wrong at any point: the first submission does not hold (a wrong line, or nothing written), or the student's own
 * second submission has a wrong line. A problem fixed in review still goes; the type is what needs practice.
 */
export function everWrong(problem: string, review: ProblemReview): boolean {
  return !holds(problem, review.first) || (review.second.length > 0 && !holds(problem, review.second));
}

/** The problems that go into homework, in set order. */
export function homeworkProblems(session: StudentSession, problems: Problem[] = ASSIGNMENT.problems): Problem[] {
  const reviews = sessionReviews(session, null, problems);
  return problems.filter((p) => everWrong(p.id, reviews[p.id]));
}

/** Every set's similar problems by problem id: Problem Set 6's (`data/homework.ts`) and Problem Set 5's (ticket 293). Ids never collide (`ps5-q4` beside `q4`). */
const ALL_SIMILAR: Readonly<Record<string, SimilarProblem>> = { ...SIMILAR_MAP, ...Object.fromEntries(PS5_SIMILAR_PROBLEMS.map((s) => [s.problemId, s])) };

export const similarFor = (problemId: string): SimilarProblem | undefined => ALL_SIMILAR[problemId];

/** An expression with its numbers blanked: two questions of the same shape set at the same width, glyph for glyph. */
export const texShape = (tex: string): string => tex.replace(/[0-9]/g, "0");

/** The class a changing number carries in both typeset expressions (`HomeworkScreen`, `.hw-diff` in app/globals.css). */
export const DIFF_CLASS = "hw-diff";

/**
 * The original and the similar expression, each with every number that differs wrapped in `\htmlClass{hw-diff}`, so
 * the two can be stacked and only those numbers change. KaTeX gives the group no spacing of its own (the hint boxes
 * rely on the same, `lib/hint.ts`), and a number in a superscript is braced, which sets the same. `aligned` is false
 * when the two are not the same shape; the screen then changes the whole expression at once.
 */
export function texDiff(from: string, to: string): { from: string; to: string; aligned: boolean; changes: number } {
  if (texShape(from) !== texShape(to)) return { from, to, aligned: false, changes: 1 };
  let a = "";
  let b = "";
  let changes = 0;
  for (let i = 0; i < from.length; ) {
    if (!/[0-9]/.test(from[i])) {
      a += from[i];
      b += to[i];
      i++;
      continue;
    }
    let j = i;
    while (j < from.length && /[0-9]/.test(from[j])) j++;
    const x = from.slice(i, j);
    const y = to.slice(i, j);
    if (x === y) {
      a += x;
      b += y;
    } else {
      changes++;
      const script = from[i - 1] === "^" || from[i - 1] === "_";
      const wrap = (n: string) => (script ? `{\\htmlClass{${DIFF_CLASS}}{${n}}}` : `\\htmlClass{${DIFF_CLASS}}{${n}}`);
      a += wrap(x);
      b += wrap(y);
    }
    i = j;
  }
  return { from: a, to: b, aligned: true, changes };
}

/** A run of a stem's words: the same in both (`from === to`), or changed. */
export interface WordRun {
  from: string;
  to: string;
}

/** Two stems as runs of words, the words they share kept in order (longest common subsequence), the rest paired up as changes. */
export function wordDiff(from: string, to: string): WordRun[] {
  const a = from.split(" ");
  const b = to.split(" ");
  const lcs = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
  const runs: WordRun[] = [];
  let pendingA: string[] = [];
  let pendingB: string[] = [];
  const flush = () => {
    if (pendingA.length || pendingB.length) runs.push({ from: pendingA.join(" "), to: pendingB.join(" ") });
    pendingA = [];
    pendingB = [];
  };
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      flush();
      const last = runs[runs.length - 1];
      if (last && last.from === last.to) {
        last.from += ` ${a[i]}`;
        last.to = last.from;
      } else runs.push({ from: a[i], to: b[j] });
      i++;
      j++;
    } else if (j < b.length && (i >= a.length || lcs[i][j + 1] >= lcs[i + 1][j])) pendingB.push(b[j++]);
    else pendingA.push(a[i++]);
  }
  flush();
  return runs;
}

const NBSP = "\u00a0";

/**
 * A stem's runs with the maths written in its words kept on one line (the maths-never-splits rule): from a lone letter
 * followed by "=" ("y = x² + 4x + 5.") to the end, every space inside a run and every join between runs is a no-break
 * space. `joins[i]` goes before run `i` (empty before the first).
 */
export function glueRuns(runs: WordRun[]): { runs: WordRun[]; joins: string[] } {
  const words = runs.flatMap((r) => r.from.split(" "));
  const start = words.findIndex((w, i) => /^[a-z]$/i.test(w) && words[i + 1] === "=");
  let k = 0;
  const joins: string[] = [];
  const out = runs.map((r, i) => {
    const glued = start >= 0 && k > start;
    joins.push(i === 0 ? "" : glued ? NBSP : " ");
    const n = r.from.split(" ").length;
    const inner = (text: string) => text.split(" ").map((w, j) => (j === 0 ? w : `${start >= 0 && k + j > start ? NBSP : " "}${w}`)).join("");
    const next = { from: inner(r.from), to: r.from === r.to ? inner(r.from) : r.to.split(" ").join(start >= 0 && k >= start ? NBSP : " ") };
    k += n;
    return next;
  });
  return { runs: out, joins };
}

/** One stem with its maths kept on one line. */
export const glueStem = (stem: string): string => {
  const g = glueRuns([{ from: stem, to: stem }]);
  return g.runs[0].from;
};

/** The line under the changed question: what stays the same, and what changed. */
export function sameTypeLine(problem: Pick<Problem, "stem">, similar: SimilarProblem): string {
  const words = wordDiff(problem.stem, similar.stem).filter((r) => r.from !== r.to);
  const setUp = words.some((r) => /[a-z]{2,}/i.test(r.from.replace(/x²/g, "")) || /[a-z]{2,}/i.test(r.to.replace(/x²/g, "")));
  return `Same type, new ${setUp ? "set-up" : "numbers"}: ${similar.type}`;
}

/**
 * The sequence, one problem at a time in set order after a moment to take the screen in: the tile expands in place to its
 * question, the numbers change, the similar question holds with its line, then it shrinks and flies into the folder.
 * With reduced motion the tile's question and its similar one show side by side, then the tile is in the folder.
 *
 * Ticket 274: about two seconds a problem. The student is not meant to read the question and think how to solve it, only
 * to see it turn into the same type with different numbers, so the holds either side are just long enough to see what
 * was there and what came, and the change itself is the longest phase.
 */
export const HOMEWORK_LEAD_MS = 1200;
export const MOTION = { expand: 250, read: 250, morph: 650, hold: 350, fly: 450, gap: 50 } as const;
export const REDUCED_MOTION = { show: 1950, gap: 50 } as const;
/** One problem's whole turn, from leaving its slot to the next one leaving: about two seconds either way. */
export const perTile = (reduced: boolean): number => (reduced ? REDUCED_MOTION.show + REDUCED_MOTION.gap : MOTION.expand + MOTION.read + MOTION.morph + MOTION.hold + MOTION.fly + MOTION.gap);

export type TilePhase = "waiting" | "expanding" | "original" | "morphing" | "similar" | "flying" | "showing" | "banked";

/** When the i-th tile going into homework starts, from the moment the report was sent. */
export const tileStart = (index: number, reduced: boolean): number => HOMEWORK_LEAD_MS + index * perTile(reduced);
/** When that tile is in the folder: the folder bumps then. */
export const tileLands = (index: number, reduced: boolean): number => tileStart(index, reduced) + perTile(reduced) - (reduced ? REDUCED_MOTION.gap : MOTION.gap);
/** When the last tile has landed: nothing moves after this. */
export const homeworkDone = (count: number, reduced: boolean): number => (count === 0 ? 0 : tileLands(count - 1, reduced));

/** Where the i-th tile is at `elapsed` ms after sending, and how far through that phase (0–1). */
export function tileMoment(index: number, elapsed: number, reduced: boolean): { phase: TilePhase; p: number } {
  const t = elapsed - tileStart(index, reduced);
  if (t < 0) return { phase: "waiting", p: 0 };
  if (reduced) return t < REDUCED_MOTION.show ? { phase: "showing", p: t / REDUCED_MOTION.show } : { phase: "banked", p: 1 };
  const phases: [TilePhase, number][] = [
    ["expanding", MOTION.expand],
    ["original", MOTION.read],
    ["morphing", MOTION.morph],
    ["similar", MOTION.hold],
    ["flying", MOTION.fly],
  ];
  let from = 0;
  for (const [phase, ms] of phases) {
    if (t < from + ms) return { phase, p: (t - from) / ms };
    from += ms;
  }
  return { phase: "banked", p: 1 };
}

/**
 * The problem whose tile landed in the folder last at `elapsed` (null before the first lands), so the folder can bump as
 * each arrives. The folder shows no count (ticket 274): these are not all the homework, other problems join them.
 */
export function lastLanded<T>(problems: T[], elapsed: number, reduced: boolean): T | null {
  let last: T | null = null;
  problems.forEach((p, i) => {
    if (elapsed >= tileLands(i, reduced)) last = p;
  });
  return last;
}
