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
  /** Index of the group's first student in the ordered rows. */
  start: number;
  rows: MistakeRow[];
}

/**
 * Orders a problem's students so those who slipped on the same leaves sit next to each other
 * (groups in order of first appearance, students in their original order within a group) and
 * returns the groups; the flat order is the groups' rows concatenated.
 */
export function groupBySlip(rows: MistakeRow[]): SlipGroup[] {
  const groups: SlipGroup[] = [];
  for (const r of rows) {
    const slips = [...new Set(r.slips)];
    const key = slips.join("|");
    const g = groups.find((x) => x.slips.join("|") === key);
    if (g) g.rows.push(r);
    else groups.push({ slips, start: 0, rows: [r] });
  }
  let start = 0;
  for (const g of groups) {
    g.start = start;
    start += g.rows.length;
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
