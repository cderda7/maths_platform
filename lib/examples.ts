import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { STANDOUT } from "@/data/evaluation";
import { leafName, type LeafId } from "@/data/taxonomy";
import { BEFORE_HAND_IN_STAGES, type Problem } from "@/data/types";
import { evaluateLine } from "./evaluate";
import type { GroupRun } from "./groupReview";
import { classmateLines } from "./hierarchy";
import type { StudentSession } from "./session";

/**
 * Examples for the whole-class board. Every student who handed in a problem is a candidate with
 * their final transcription. A candidate's identity for the picker is the exact mistake they
 * made (the wrong lines' TeX, DECISION_LOG 2026-09-12), or "correct"; `bucket` is the coarser
 * subskill of the first wrong step. The board sees letters and lines only; names, verdicts and
 * counts stay in the private setup view.
 */
export type Bucket = "correct" | LeafId;

/** The mistake key of a correct working. */
export const CORRECT = "";

export interface Candidate {
  studentId: string;
  name: string;
  problemId: string;
  lines: string[];
  bucket: Bucket;
  /** The wrong lines' TeX in order, `CORRECT` when none (ticket 148). */
  mistake: string;
}

export interface ExampleRef {
  studentId: string;
  problemId: string;
}

export interface BoardExample {
  letter: string;
  lines: string[];
}

/**
 * One choice in the setup's example picker (ticket 148): the students on one exact mistake, or
 * everyone who got the problem right. `columns` are their identical workings, largest first;
 * the option's example is the first student of the first column.
 */
export interface ExampleOption {
  /** `CORRECT`, or the mistake key. */
  key: string;
  /** "correct", or the wrong line's name in five words or fewer. */
  name: string;
  leaf: LeafId | null;
  count: number;
  columns: { lines: string[]; students: Candidate[] }[];
  /** The mistake sits on one of the set's New skills (ticket 209; the unit's focus leaves before it). */
  newSkill: boolean;
  /** Someone on this mistake was in the group whose review checked this problem correct. */
  fixedInGroup: boolean;
  /** Someone on this mistake was in the group that closed this problem unsolved (ticket 223): the class review is where it gets fixed. */
  unsolvedInGroup: boolean;
}

/** What `optionsFor` reads besides the candidates: the set's New skills and the demo student's group run. */
export interface PickerContext {
  newSkills?: readonly LeafId[];
  group?: GroupRun | null;
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

/** The exact mistake in a working: its wrong lines' TeX joined, `CORRECT` when there is none. */
export function mistakeOf(problemId: string, lines: string[]): string {
  return lines.filter((tex) => evaluateLine(problemId, tex).verdict === "wrong").join(" | ");
}

/** The final transcription of the live student: the rework where there is one, else the first attempt. */
function liveLines(session: StudentSession, problemId: string): string[] {
  const rw = session.rework[problemId] ?? [];
  return (rw.length > 0 ? rw : (session.lines[problemId] ?? [])).map((l) => l.tex);
}

const HANDED_IN = BEFORE_HAND_IN_STAGES;

const candidate = (studentId: string, name: string, problemId: string, lines: string[]): Candidate => ({ studentId, name, problemId, lines, bucket: bucketOf(problemId, lines), mistake: mistakeOf(problemId, lines) });

export function candidatesFor(problemId: string, session: StudentSession | null): Candidate[] {
  const index = ASSIGNMENT.problems.findIndex((p) => p.id === problemId);
  const problem = ASSIGNMENT.problems[index];
  if (!problem) return [];
  const out: Candidate[] = [];
  if (session && !HANDED_IN.includes(session.stage)) {
    const lines = liveLines(session, problemId);
    if (lines.length > 0) out.push(candidate(DEMO_STUDENT.id, DEMO_STUDENT.name, problemId, lines));
  }
  for (const c of CLASSMATES) {
    const lines = classmateLines(c, problem, index);
    if (lines) out.push(candidate(c.id, c.name, problemId, lines));
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

/** The first wrong line's verdict in a working, if any. */
function firstWrong(problemId: string, lines: string[]) {
  for (const tex of lines) {
    const v = evaluateLine(problemId, tex);
    if (v.verdict === "wrong") return v;
  }
  return null;
}

/**
 * The picker's choices for a problem: the correct working first, then each exact mistake by how
 * many made it, those the group already worked through last; within an option, identical
 * workings largest first, students in candidate order (the live student first).
 */
export function optionsFor(cands: Candidate[], ctx: PickerContext = {}): ExampleOption[] {
  const byKey = new Map<string, Candidate[]>();
  for (const c of cands) byKey.set(c.mistake, [...(byKey.get(c.mistake) ?? []), c]);
  const problemId = cands[0]?.problemId;
  const resolvedHere = !!problemId && !!ctx.group?.resolved.includes(problemId);
  const unsolvedHere = !!problemId && !!ctx.group?.unsolved?.includes(problemId);
  const members = new Set(ctx.group?.members ?? []);
  const options: ExampleOption[] = [...byKey.entries()].map(([key, students]) => {
    const columns = new Map<string, Candidate[]>();
    for (const c of students) {
      const k = c.lines.join("\n");
      columns.set(k, [...(columns.get(k) ?? []), c]);
    }
    const first = key === CORRECT ? null : firstWrong(students[0].problemId, students[0].lines);
    const leaf = first ? first.tags[0].leaf : null;
    return {
      key,
      name: key === CORRECT ? "correct" : (first?.name ?? (leaf ? leafName(leaf).short : "mistake")),
      leaf,
      count: students.length,
      columns: [...columns.values()].sort((a, b) => b.length - a.length).map((s) => ({ lines: s[0].lines, students: s })),
      newSkill: !!first && first.tags.some((t) => ctx.newSkills?.includes(t.leaf)),
      fixedInGroup: key !== CORRECT && resolvedHere && students.some((s) => members.has(s.studentId)),
      unsolvedInGroup: key !== CORRECT && unsolvedHere && students.some((s) => members.has(s.studentId)),
    };
  });
  return options.sort((a, b) => {
    if (a.key === CORRECT !== (b.key === CORRECT)) return a.key === CORRECT ? -1 : 1;
    if (a.fixedInGroup !== b.fixedInGroup) return a.fixedInGroup ? 1 : -1;
    return b.count - a.count;
  });
}

/** The option a candidate belongs to. */
export function optionOf(options: ExampleOption[], studentId: string): ExampleOption | undefined {
  return options.find((o) => o.columns.some((c) => c.students.some((s) => s.studentId === studentId)));
}

/** The student whose working stands for an option: the first of its largest identical column. */
export const exampleOf = (o: ExampleOption): ExampleRef => ({ studentId: o.columns[0].students[0].studentId, problemId: o.columns[0].students[0].problemId });

/**
 * The correct working, then the most common mistakes, capped at three: one example per option in
 * picker order, the group-fixed ones only to reach two. Options are what the teacher swaps
 * between; the setup's count is the option's.
 */
export function suggestExamples(cands: Candidate[], max = MAX_EXAMPLES, ctx: PickerContext = {}): ExampleRef[] {
  const options = optionsFor(cands, ctx);
  const picked = options.filter((o) => !o.fixedInGroup).slice(0, max);
  for (const o of options) {
    if (picked.length >= MIN_EXAMPLES) break;
    if (!picked.includes(o)) picked.push(o);
  }
  return picked.slice(0, max).map(exampleOf);
}

export function resolveRef(ref: ExampleRef, session: StudentSession | null): Candidate | null {
  return candidatesFor(ref.problemId, session).find((c) => c.studentId === ref.studentId) ?? null;
}

/**
 * What the board shows for one slide: letters and lines. Nothing that names a student, marks a
 * line or counts how many students share the working (ticket 202): the counts stay on the
 * teacher's laptop, in the setup's example picker.
 */
export function boardExamples(refs: ExampleRef[], problemId: string, session: StudentSession | null): BoardExample[] {
  const cands = candidatesFor(problemId, session);
  return refs
    .map((r) => cands.find((c) => c.studentId === r.studentId))
    .filter((c): c is Candidate => !!c)
    .map((c, i) => ({ letter: LETTERS[i], lines: c.lines }));
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
