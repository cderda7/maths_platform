import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES, type Classmate } from "@/data/classmates";
import type { Problem } from "@/data/types";
import type { LeafId } from "@/data/taxonomy";
import { evaluateLine, type Verdict } from "./evaluate";
import { feedbackFor, progressOf, type ProblemFeedback } from "./feedback";
import { CLASS_SIZE } from "./readiness";
import type { StudentSession } from "./session";
import { classmatesAt, streamOver, type StreamSet } from "./stream";

/**
 * The teacher's mistake view: problems first, then the students who slipped on each, with
 * their recognised working ready to expand inline. The demo student's rows come from the live
 * session; classmates' from fixture attempts. Both are read through the same evaluation table.
 */
export interface MistakeRow {
  id: string;
  name: string;
  initials: string;
  live: boolean;
  lines: { tex: string; verdict: Verdict }[];
  /** Leaves of the steps that didn't hold. */
  slips: LeafId[];
  /**
   * When the student submitted this problem, absolute ms, on a live set's stream (ticket 189): the rows come
   * in this order, so a new name lands at the end of its cluster, and the view highlights it for a moment.
   * Absent for the live student and on a fixed set.
   */
  arrivedAt?: number;
}

export interface ProblemMistakes {
  problem: Problem;
  rows: MistakeRow[];
  /** How many of the class of `CLASS_SIZE` got the problem right (ticket 140); the rest are the rows, or never reached it. */
  right: number;
  /**
   * How many are still on the set and have not answered the problem yet (ticket 189): classmates in the live
   * stream who have not reached it and the live student before he hands in. Neither correct, wrong nor
   * skipped; always 0 on a fixed set and once the class has handed in.
   */
  pending: number;
}

/** Students who slipped on the same leaves, adjacent, so the view can draw one pill across them. */
export interface SlipGroup {
  slips: LeafId[];
  /** Index of the group's first column among the problem's columns. */
  start: number;
  /** The group's students in view order: its columns' rows concatenated. */
  rows: MistakeRow[];
  /** The group's students again, partitioned by the exact mistake (ticket 135); the rows above are these concatenated. */
  mistakes: MistakeGroup[];
  /** The group's columns: its mistake groups' columns concatenated (ticket 138). */
  columns: WorkColumn[];
}

/**
 * Students who made the exact same mistake: the same wrong line (the same entry of the
 * evaluation table, whatever the lines around it), adjacent, so the view can box them together.
 */
export interface MistakeGroup {
  /** The wrong lines' TeX, in order, joined; a student with two wrong lines is keyed on both. */
  key: string;
  /** Index of the group's first column among the problem's columns. */
  start: number;
  /** The group's students in view order: its columns' rows concatenated. */
  rows: MistakeRow[];
  /** The group's students partitioned by their exact working (ticket 138); one column each. */
  columns: WorkColumn[];
}

/**
 * Students whose working is the same line for line: the view writes the work once and puts
 * every one of their headers over it (ticket 138), so a problem twelve students got wrong in
 * three ways takes three columns, not twelve. Identical working implies the same wrong line,
 * so a column never crosses a mistake group.
 */
export interface WorkColumn {
  /** The lines every student in the column wrote, in order. */
  lines: MistakeRow["lines"];
  rows: MistakeRow[];
  /** Whether the live student is one of them. */
  live: boolean;
}

/** A mistake's identity is its wrong line's entry in the evaluation table (DECISION_LOG, 2026-09-12). */
export const mistakeKey = (r: MistakeRow): string =>
  r.lines
    .filter((l) => l.verdict.verdict === "wrong")
    .map((l) => l.tex)
    .join(" | ");

/** A student's working, line for line; two students with the same key share a column. */
export const workKey = (r: MistakeRow): string => r.lines.map((l) => l.tex).join("\n");

/** Partitions rows by exact working: columns in order of first appearance, students in their original order within one. */
export function groupByWork(rows: MistakeRow[]): WorkColumn[] {
  const columns: WorkColumn[] = [];
  for (const r of rows) {
    const key = workKey(r);
    const c = columns.find((x) => workKey(x.rows[0]) === key);
    if (c) {
      c.rows.push(r);
      c.live ||= r.live;
    } else columns.push({ lines: r.lines, rows: [r], live: r.live });
  }
  return columns;
}

/**
 * Partitions rows by exact mistake, groups in order of first appearance, rows in their original
 * order within a group, and each group by exact working; `start` numbers the groups' first
 * columns from `start`.
 */
export function groupByMistake(rows: MistakeRow[], start = 0): MistakeGroup[] {
  const groups: MistakeGroup[] = [];
  for (const r of rows) {
    const key = mistakeKey(r);
    const g = groups.find((x) => x.key === key);
    if (g) g.rows.push(r);
    else groups.push({ key, start: 0, rows: [r], columns: [] });
  }
  for (const g of groups) {
    g.columns = groupByWork(g.rows);
    g.rows = g.columns.flatMap((c) => c.rows);
    g.start = start;
    start += g.columns.length;
  }
  return groups;
}

/**
 * Orders a problem's students so those who slipped on the same leaves sit next to each other
 * (groups in order of first appearance, students in their original order within a group),
 * inside each of those, those who made the exact same mistake next to each other (the same
 * rule again), and inside each of those, those whose working is identical in one column;
 * returns the groups. The problem's columns are the groups' columns concatenated, and the
 * flat order of students is the columns' rows concatenated.
 */
export function groupBySlip(rows: MistakeRow[]): SlipGroup[] {
  const groups: SlipGroup[] = [];
  for (const r of rows) {
    const slips = [...new Set(r.slips)];
    const key = slips.join("|");
    const g = groups.find((x) => x.slips.join("|") === key);
    if (g) g.rows.push(r);
    else groups.push({ slips, start: 0, rows: [r], mistakes: [], columns: [] });
  }
  let start = 0;
  for (const g of groups) {
    g.start = start;
    g.mistakes = groupByMistake(g.rows, start);
    g.columns = g.mistakes.flatMap((m) => m.columns);
    g.rows = g.columns.flatMap((c) => c.rows);
    start += g.columns.length;
  }
  return groups;
}

const evaluateAll = (pid: string, texs: string[]) => texs.map((tex) => ({ tex, verdict: evaluateLine(pid, tex) }));
const slipsOf = (lines: { verdict: Verdict }[]) => lines.flatMap((l) => (l.verdict.verdict === "wrong" ? [l.verdict.tags[0].leaf] : []));

/**
 * Whether the live student got a problem right: a finished hand-in on it with no wrong line.
 * The teacher's view of the first hand-in, like the rows: a rework that fixed a slip still
 * leaves the student among the wrong, so the right and the wrong never overlap.
 */
const liveRight = (session: StudentSession, me: ProblemFeedback | undefined): boolean => !!me?.clean && progressOf(session, me.problem.id) === "finished";

/**
 * How many of the class got a problem right (ticket 140; DECISION_LOG, 2026-09-12): each classmate who reached it (in
 * assignment order, `done`) and is not wrong on it, the same rule that gives them the model
 * solution on the skill grid (`classmateLines`), plus the live student when his hand-in on it is
 * clean and finished. Out of `CLASS_SIZE`, the class of twenty; the rows are the wrong, and the
 * remainder never finished it (a classmate who stopped before it, the live student with a
 * working that reaches no answer).
 */
export function rightCount(problem: Problem, index: number, session: StudentSession | null, me?: ProblemFeedback, classmates: readonly Classmate[] = CLASSMATES): number {
  const live = session && liveRight(session, me ?? feedbackFor(session).find((p) => p.problem.id === problem.id)) ? 1 : 0;
  return live + classmates.filter((c) => index < c.done && !c.wrong.includes(problem.id)).length;
}

/**
 * One assignment's problems and classmates' results (ticket 185): the fixture's, or an assignment bundle's (`lib/assignments`).
 * With `startedAt` (the live set, ticket 189) the classmates' results are the stream's at `now`.
 */
export interface MistakeSet extends StreamSet {
  /** Sam's handed-in record on a finished set (ticket 187): his row comes from it instead of a session, first like his live row. */
  sam?: Classmate | null;
}

export { CLASS_SIZE };

/**
 * `now` places a live set's stream (ticket 189; the end of it when omitted). A classmate's rows on a problem come in
 * the order they submitted it, so the list only ever grows at the end of a cluster.
 */
export function mistakesByProblem(session: StudentSession | null, set: MistakeSet = { problems: ASSIGNMENT.problems, classmates: CLASSMATES }, now: number = Number.POSITIVE_INFINITY): ProblemMistakes[] {
  const mine = session ? feedbackFor(session) : [];
  const roster = classmatesAt(set, session, now);
  const live = set.startedAt !== null && set.startedAt !== undefined;
  const over = !live || streamOver(session);
  const byArrival = (problemId: string) => [...roster].filter((m) => m.record.wrong.includes(problemId)).sort((a, b) => (a.answeredAt[problemId] ?? 0) - (b.answeredAt[problemId] ?? 0));
  return set.problems
    .map((problem, index) => {
      const rows: MistakeRow[] = [];
      const me = mine.find((p) => p.problem.id === problem.id);
      if (me && me.slips.length > 0) {
        const lines = me.lines.map((l) => ({ tex: l.tex, verdict: l.verdict }));
        rows.push({ id: DEMO_STUDENT.id, name: DEMO_STUDENT.name, initials: DEMO_STUDENT.initials, live: true, lines, slips: slipsOf(lines) });
      }
      // On a finished set Sam is one more record, read like the classmates' and listed first.
      if (set.sam?.wrong.includes(problem.id)) rows.push(recordRow(set.sam, problem.id));
      for (const m of byArrival(problem.id)) rows.push({ ...recordRow(m.record, problem.id), ...(live ? { arrivedAt: m.answeredAt[problem.id] } : {}) });
      const records = roster.map((m) => m.record);
      const right = rightCount(problem, index, session, me, set.sam ? [set.sam, ...records] : records);
      const samPending = !over && !rows.some((r) => r.live) && !(session && liveRight(session, me)) ? 1 : 0;
      const pending = over ? 0 : samPending + roster.filter((m) => !m.state.submitted && m.record.done <= index).length;
      return { problem, rows, right, pending };
    })
    .filter((p) => p.rows.length > 0);
}

function recordRow(c: Classmate, problemId: string): MistakeRow {
  const lines = evaluateAll(problemId, c.attempts[problemId] ?? []);
  return { id: c.id, name: c.name, initials: c.initials, live: false, lines, slips: slipsOf(lines) };
}
