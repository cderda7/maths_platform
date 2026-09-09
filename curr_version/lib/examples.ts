import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { STANDOUT } from "@/data/evaluation";
import type { LeafId } from "@/data/taxonomy";
import type { Problem } from "@/data/types";
import { evaluateLine } from "./evaluate";
import { classmateLines } from "./hierarchy";
import type { StudentSession } from "./session";

/**
 * Examples for the whole-class board. Every student who handed in a problem is a candidate with
 * their final transcription; candidates are bucketed coarsely (fully correct, or the subskill of
 * the first step that didn't hold). The board sees letters, lines and bucket counts only; names
 * and verdicts stay in the private setup view.
 */
export type Bucket = "correct" | LeafId;

export interface Candidate {
  studentId: string;
  name: string;
  problemId: string;
  lines: string[];
  bucket: Bucket;
}

export interface ExampleRef {
  studentId: string;
  problemId: string;
}

export interface BoardExample {
  letter: string;
  lines: string[];
  /** Students in the same bucket as this example. */
  count: number;
  /** Students who handed in this problem. */
  denominator: number;
}

export const MAX_EXAMPLES = 3;
export const MIN_EXAMPLES = 2;
const LETTERS = ["A", "B", "C", "D"];

export function bucketOf(problemId: string, lines: string[]): Bucket {
  for (const tex of lines) {
    const v = evaluateLine(problemId, tex);
    if (v.verdict === "wrong") return v.tags[0].leaf;
  }
  return "correct";
}

/** The final transcription of the live student: the rework where there is one, else the first attempt. */
function liveLines(session: StudentSession, problemId: string): string[] {
  const rw = session.rework[problemId] ?? [];
  return (rw.length > 0 ? rw : (session.lines[problemId] ?? [])).map((l) => l.tex);
}

const HANDED_IN = ["overview", "practice", "confidence", "working"];

export function candidatesFor(problemId: string, session: StudentSession | null): Candidate[] {
  const index = ASSIGNMENT.problems.findIndex((p) => p.id === problemId);
  const problem = ASSIGNMENT.problems[index];
  if (!problem) return [];
  const out: Candidate[] = [];
  if (session && !HANDED_IN.includes(session.stage)) {
    const lines = liveLines(session, problemId);
    if (lines.length > 0) out.push({ studentId: DEMO_STUDENT.id, name: DEMO_STUDENT.name, problemId, lines, bucket: bucketOf(problemId, lines) });
  }
  for (const c of CLASSMATES) {
    const lines = classmateLines(c, problem, index);
    if (lines) out.push({ studentId: c.id, name: c.name, problemId, lines, bucket: bucketOf(problemId, lines) });
  }
  return out;
}

export function bucketCounts(cands: Candidate[]): Map<Bucket, number> {
  const m = new Map<Bucket, number>();
  for (const c of cands) m.set(c.bucket, (m.get(c.bucket) ?? 0) + 1);
  return m;
}

/** Students who handed in this problem with a mistake in it. */
export function struggleCount(problemId: string, session: StudentSession | null): number {
  return candidatesFor(problemId, session).filter((c) => c.bucket !== "correct").length;
}

/**
 * One fully correct example, then one per distinct error bucket by bucket size, capped at three.
 * If that leaves fewer than two and more candidates exist, a second from the largest bucket.
 */
export function suggestExamples(cands: Candidate[], max = MAX_EXAMPLES): ExampleRef[] {
  const counts = bucketCounts(cands);
  const picked: Candidate[] = [];
  const correct = cands.find((c) => c.bucket === "correct");
  if (correct) picked.push(correct);
  const errorBuckets = [...counts.entries()].filter(([b]) => b !== "correct").sort((a, b) => b[1] - a[1]);
  for (const [bucket] of errorBuckets) {
    if (picked.length >= max) break;
    const c = cands.find((x) => x.bucket === bucket && !picked.includes(x));
    if (c) picked.push(c);
  }
  if (picked.length < MIN_EXAMPLES) {
    const largest = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const extra = cands.find((x) => x.bucket === largest && !picked.includes(x)) ?? cands.find((x) => !picked.includes(x));
    if (extra) picked.push(extra);
  }
  return picked.slice(0, max).map((c) => ({ studentId: c.studentId, problemId: c.problemId }));
}

export function resolveRef(ref: ExampleRef, session: StudentSession | null): Candidate | null {
  return candidatesFor(ref.problemId, session).find((c) => c.studentId === ref.studentId) ?? null;
}

/** What the board shows for one slide: letters, lines and counts. Nothing that names a student or marks a line. */
export function boardExamples(refs: ExampleRef[], problemId: string, session: StudentSession | null): BoardExample[] {
  const cands = candidatesFor(problemId, session);
  const counts = bucketCounts(cands);
  return refs
    .map((r) => cands.find((c) => c.studentId === r.studentId))
    .filter((c): c is Candidate => !!c)
    .map((c, i) => ({ letter: LETTERS[i], lines: c.lines, count: counts.get(c.bucket) ?? 0, denominator: cands.length }));
}

/** Problems ordered by how many struggled, most first; ties keep assignment order. */
export function problemsByStruggle(session: StudentSession | null): { problem: Problem; struggled: number; handedIn: number }[] {
  return ASSIGNMENT.problems
    .map((problem) => ({ problem, struggled: struggleCount(problem.id, session), handedIn: candidatesFor(problem.id, session).length }))
    .sort((a, b) => b.struggled - a.struggled);
}

/** The marked view's two layers: red on a step that didn't hold, blue on a curated standout that did. */
export type LineMark = "wrong" | "standout" | null;

export function lineMarks(problemId: string, lines: string[]): LineMark[] {
  const verdicts = lines.map((tex) => evaluateLine(problemId, tex));
  const kind = verdicts.some((v) => v.verdict === "wrong") ? "weak" : "strong";
  return lines.map((tex, i) => {
    const v = verdicts[i];
    if (v.verdict === "wrong") return "wrong";
    const so = STANDOUT[problemId]?.[tex];
    return v.verdict === "ok" && so && (so.when === "both" || so.when === kind) ? "standout" : null;
  });
}
