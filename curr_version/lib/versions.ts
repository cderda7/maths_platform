import { ASSIGNMENT } from "@/data/assignment";
import type { Problem, Stroke } from "@/data/types";
import type { RevealedLine } from "./recognition";
import type { StudentSession } from "./session";

/**
 * Submission history. Two preserved versions: what was handed in, and the final working after
 * the independent rework (a problem with no rework keeps its handed-in lines). Both are laid out
 * problem by problem with the same number of rows per problem, so two columns scroll line for line.
 */
export interface Version {
  id: "original" | "final";
  label: string;
  at: number;
  lines: Record<string, RevealedLine[]>;
  /** The handwriting behind each problem's lines in this version. */
  ink: Record<string, Stroke[]>;
}

export interface AlignedProblem {
  problem: Problem;
  /** Rows per problem = the longer version's line count; the shorter is padded with null. */
  rows: { left: RevealedLine | null; right: RevealedLine | null }[];
  changed: boolean;
}

export function versionsOf(session: StudentSession): Version[] {
  const final: Record<string, RevealedLine[]> = {};
  const finalInk: Record<string, Stroke[]> = {};
  for (const p of ASSIGNMENT.problems) {
    const rw = session.rework[p.id] ?? [];
    final[p.id] = rw.length > 0 ? rw : (session.lines[p.id] ?? []);
    finalInk[p.id] = rw.length > 0 ? (session.reworkInk[p.id] ?? []) : (session.ink[p.id] ?? []);
  }
  return [
    { id: "original", label: "Handed in", at: session.handedInAt, lines: session.lines, ink: session.ink },
    { id: "final", label: "After rework", at: session.reworkedAt, lines: final, ink: finalInk },
  ];
}

export function alignVersions(left: Version, right: Version): AlignedProblem[] {
  return ASSIGNMENT.problems.map((problem) => {
    const a = left.lines[problem.id] ?? [];
    const b = right.lines[problem.id] ?? [];
    const n = Math.max(a.length, b.length);
    const rows = Array.from({ length: n }, (_, i) => ({ left: a[i] ?? null, right: b[i] ?? null }));
    const changed = a.length !== b.length || a.some((l, i) => l.tex !== b[i]?.tex);
    return { problem, rows, changed };
  });
}

/** A row where the two versions differ (a line changed, appeared or disappeared). */
export const rowChanged = (r: AlignedProblem["rows"][number]) => (r.left?.tex ?? null) !== (r.right?.tex ?? null);

/** How many lines changed between the two versions, across the set. */
export function changedRowCount(aligned: AlignedProblem[]): number {
  return aligned.reduce((n, a) => n + a.rows.filter(rowChanged).length, 0);
}
