import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import type { Problem } from "@/data/types";
import type { LeafId } from "@/data/taxonomy";
import { evaluateLine, type Verdict } from "./evaluate";
import { feedbackFor } from "./feedback";
import type { StudentSession } from "./session";

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
}

export interface ProblemMistakes {
  problem: Problem;
  rows: MistakeRow[];
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

export function mistakesByProblem(session: StudentSession | null): ProblemMistakes[] {
  const mine = session ? feedbackFor(session) : [];
  return ASSIGNMENT.problems
    .map((problem) => {
      const rows: MistakeRow[] = [];
      const me = mine.find((p) => p.problem.id === problem.id);
      if (me && me.slips.length > 0) {
        const lines = me.lines.map((l) => ({ tex: l.tex, verdict: l.verdict }));
        rows.push({ id: DEMO_STUDENT.id, name: DEMO_STUDENT.name, initials: DEMO_STUDENT.initials, live: true, lines, slips: slipsOf(lines) });
      }
      for (const c of CLASSMATES) {
        if (!c.wrong.includes(problem.id)) continue;
        const lines = evaluateAll(problem.id, c.attempts[problem.id] ?? []);
        rows.push({ id: c.id, name: c.name, initials: c.initials, live: false, lines, slips: slipsOf(lines) });
      }
      return { problem, rows };
    })
    .filter((p) => p.rows.length > 0);
}
