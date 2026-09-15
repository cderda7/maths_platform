import { DEMO_STUDENT } from "@/data/assignment";
import type { Classmate } from "@/data/classmates";
import { REWORK_LANDS_AT, REWORK_PROBLEM_MS, REWORK_READ_MS, REWORK_STILL_WRONG_MS } from "@/data/classmates-rework";
import { BEFORE_HAND_IN_STAGES, type Problem } from "@/data/types";
import type { ClassroomState } from "./classroom";
import { evaluateLine } from "./evaluate";
import { feedbackFor } from "./feedback";
import { ARRIVAL_OFFSETS_MS } from "./readiness";
import type { StudentSession } from "./session";
import { firstFinished } from "./setScore";
import { CHECK_IN_MS, duration, type WherePill, type WhereRow } from "./whereStudents";

/**
 * Where each student is in individual review, and what each still has to fix (ticket 318): the Mistakes tab's left column
 * while the class corrects its own work. Every student is in one row: Not started until they open a problem, then the row of
 * the problem they have open (a student between problems stays in the row of the last one), then Done reviewing once they
 * have handed their corrections in. Beside each question, how many still need to fix it: every student in the room who
 * got it wrong, left it unfinished or never reached it on the first submission, less those whose correction is in and
 * right. No React.
 *
 * Sam is his session: the problem he has open (`reworkIndex`, from `reworkOpenedAt`), his rework lines, and his hand-in
 * (`reworkedAt`). A classmate is their record read on the demo's rework pacing (`data/classmates-rework.ts`) from the moment
 * the class entered individual review (Sam's hand-in): what they fix is their second submissions, and they are done when
 * they reach the gate into group review (`ARRIVAL_OFFSETS_MS` after Sam's own arrival, `lib/readiness.ts`), or from the start
 * when they have nothing to fix. At that moment every correction they make lands. See DECISION_LOG.md, 2026-09-15 (Where
 * students are during individual review).
 */

/** Where a student is in individual review. */
export type ReviewPlace = { kind: "not-started" } | { kind: "problem"; problem: string } | { kind: "done" } | { kind: "absent" };

export interface ReviewStudent {
  id: string;
  place: ReviewPlace;
  /** When they came into the row they are in (absolute ms), or null when not known. */
  entered: number | null;
  /** The problems they had to fix, in set order: not right on the first submission. */
  toFix: string[];
  /** Of `toFix`, the ones whose correction is in and right by now. */
  fixed: string[];
}

/** A correction that holds: some lines, none of them wrong, and an answer on it (a line the table marks as one, or `typed`). */
export function correctionRight(problem: string, lines: readonly string[], typed = false): boolean {
  const verdicts = lines.map((tex) => evaluateLine(problem, tex));
  return verdicts.length > 0 && verdicts.every((v) => v.verdict !== "wrong") && (typed || verdicts.some((v) => v.verdict !== "unclear" && v.answer === true));
}

/** A classmate's problems to fix, in set order: every problem not handed in right first time (wrong, or at or past `done`). */
export const recordToFix = (m: Pick<Classmate, "done" | "wrong">, problems: readonly Pick<Problem, "id">[]): string[] => problems.filter((p, i) => i >= m.done || m.wrong.includes(p.id)).map((p) => p.id);

/** Sam's problems to fix, in set order: a wrong line on the first submission, or not finished on it. */
export const sessionToFix = (session: StudentSession, problems: readonly Pick<Problem, "id">[]): string[] => {
  const fb = feedbackFor(session);
  return problems.filter((p) => (fb.find((f) => f.problem.id === p.id)?.slips.length ?? 0) > 0 || !firstFinished(session, p.id)).map((p) => p.id);
};

/** A small fixed hash of a string, for spreading the demo's times. */
function spread(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

/** One problem in a classmate's scripted review: when it opens, when its correction lands, and whether that correction is right. */
export interface ReworkStep {
  problem: string;
  opens: number;
  lands: number;
  right: boolean;
}

/**
 * A classmate's review as ms after the class entered individual review: reading, then each problem to fix in turn. The order
 * is set order, or for an odd roster position the wrong ones first; a problem's correction is right exactly when their second
 * submission on it holds.
 */
export function reworkScript(m: Pick<Classmate, "id" | "done" | "wrong" | "review">, index: number, problems: readonly Pick<Problem, "id">[]): ReworkStep[] {
  const toFix = recordToFix(m, problems);
  const order = index % 2 === 1 ? [...toFix.filter((p) => m.wrong.includes(p)), ...toFix.filter((p) => !m.wrong.includes(p))] : toFix;
  let t = REWORK_READ_MS.least + Math.round(spread(`${m.id}:read`) * REWORK_READ_MS.spread);
  return order.map((problem) => {
    const right = correctionRight(problem, m.review?.[problem]?.second ?? []);
    const span = REWORK_PROBLEM_MS.least + Math.round(spread(`${m.id}:${problem}`) * REWORK_PROBLEM_MS.spread) + (right ? 0 : REWORK_STILL_WRONG_MS);
    const step = { problem, opens: t, lands: t + Math.round(REWORK_LANDS_AT * span), right };
    t += span;
    return step;
  });
}

/** What the class's review is read from: the set's problems and classmates, the classroom (Sam's arrival at the gate) and the students away. */
export interface ReviewSet {
  problems: readonly Problem[];
  classmates: readonly Classmate[];
  absent?: readonly string[];
}

/**
 * Every student's place in individual review at `now`, Sam first then the classmates in roster order. The class entered
 * individual review when Sam handed the set in (`handedInAt`); before that (or with no session) nobody has started. Sam is
 * done once his session is past the individual review screen.
 */
export function reviewPlaces(set: ReviewSet, c: ClassroomState | null | undefined, session: StudentSession | null, now: number): ReviewStudent[] {
  const absent = set.absent ?? [];
  const start = session?.handedInAt || null;
  const samArrived = c?.arrivals?.[DEMO_STUDENT.id];
  const sam = (): ReviewStudent => {
    if (!session || BEFORE_HAND_IN_STAGES.includes(session.stage)) return { id: DEMO_STUDENT.id, place: { kind: "not-started" }, entered: null, toFix: [], fixed: [] };
    const toFix = sessionToFix(session, set.problems);
    const fixed = toFix.filter((p) => correctionRight(p, (session.rework[p] ?? []).map((l) => l.tex), (session.answers[p] ?? "").trim().length > 0 && (session.rework[p]?.length ?? 0) > 0));
    if (session.stage !== "feedback") return { id: DEMO_STUDENT.id, place: { kind: "done" }, entered: session.reworkedAt || samArrived || null, toFix, fixed };
    if (!session.reworkOpenedAt) return { id: DEMO_STUDENT.id, place: { kind: "not-started" }, entered: start, toFix, fixed };
    const problem = set.problems[Math.max(0, Math.min(session.reworkIndex, set.problems.length - 1))];
    return { id: DEMO_STUDENT.id, place: { kind: "problem", problem: problem.id }, entered: session.reworkOpenedAt, toFix, fixed };
  };
  const classmates = set.classmates.map((m, index): ReviewStudent => {
    const toFix = recordToFix(m, set.problems);
    if (absent.includes(m.id)) return { id: m.id, place: { kind: "absent" }, entered: null, toFix, fixed: [] };
    if (start === null) return { id: m.id, place: { kind: "not-started" }, entered: null, toFix, fixed: [] };
    const script = reworkScript(m, index, set.problems);
    const atGate = samArrived !== undefined ? samArrived + ARRIVAL_OFFSETS_MS[m.id] : null;
    // Nothing to fix: done from the start, and at the gate at the latest.
    const doneAt = script.length === 0 ? Math.min(start, atGate ?? start) : atGate;
    if (doneAt !== null && now >= doneAt) return { id: m.id, place: { kind: "done" }, entered: doneAt, toFix, fixed: script.filter((s) => s.right).map((s) => s.problem) };
    const e = now - start;
    const fixed = script.filter((s) => s.right && s.lands <= e).map((s) => s.problem);
    const open = [...script].reverse().find((s) => s.opens <= e);
    if (!open) return { id: m.id, place: { kind: "not-started" }, entered: start, toFix, fixed };
    return { id: m.id, place: { kind: "problem", problem: open.problem }, entered: start + open.opens, toFix, fixed };
  });
  return [sam(), ...classmates].map((s) => (s.id === DEMO_STUDENT.id && absent.includes(s.id) ? { ...s, place: { kind: "absent" as const }, entered: null } : s));
}

/** How many of the class in the room are done with individual review at `now`: the Done reviewing row, and the stage's count. */
export const reviewDoneCount = (students: readonly ReviewStudent[]): number => students.filter((s) => s.place.kind === "done").length;

/** A row of the review column: a `WhereRow` with the count beside its label ("12 need to fix", "3 done"), or null for none. */
export interface ReviewRow extends WhereRow {
  count: { n: number; words: string } | null;
}

/**
 * The rows to draw: Not started, each question in set order, Done reviewing; every row always present. A pill on a question
 * reads "fixed n of m" and how long the student has had it open; Not started and Done reviewing pills carry no words. The
 * absent are named under Done reviewing. A question's count is everyone in the room still to fix it (blank at none).
 */
export function reviewRows(students: readonly ReviewStudent[], problems: readonly Pick<Problem, "id" | "label">[], classmates: readonly Pick<Classmate, "id" | "name" | "initials">[], now: number): ReviewRow[] {
  const person = (id: string) => (id === DEMO_STUDENT.id ? DEMO_STUDENT : (classmates.find((m) => m.id === id) ?? { id, name: id, initials: id.slice(0, 2).toUpperCase() }));
  const order = new Map(students.map((s, i) => [s.id, i]));
  const present = students.filter((s) => s.place.kind !== "absent");
  const pill = (s: ReviewStudent): WherePill => {
    const { name, initials } = person(s.id);
    const onProblem = s.place.kind === "problem";
    const label = onProblem ? (problems.find((p) => p.id === (s.place as { problem: string }).problem)?.label ?? "") : "";
    const time = onProblem && s.entered !== null ? { kind: "here" as const, span: duration(now - s.entered), checkIn: now - s.entered >= CHECK_IN_MS } : null;
    return {
      id: s.id,
      name,
      initials,
      detail: onProblem ? `fixed ${s.fixed.length} of ${s.toFix.length}` : null,
      tone: "plain",
      step: null,
      time,
      arrivedAt: s.entered,
      place: s.place.kind === "problem" ? { kind: "question", problem: s.place.problem, label, detail: null } : s.place.kind === "done" ? { kind: "handed-in" } : { kind: "not-started" },
    };
  };
  const inRow = (match: (s: ReviewStudent) => boolean) =>
    present
      .filter(match)
      .sort((a, b) => (a.entered ?? Infinity) - (b.entered ?? Infinity) || order.get(a.id)! - order.get(b.id)!)
      .map(pill);
  const needFix = (problem: string) => present.filter((s) => s.toFix.includes(problem) && !s.fixed.includes(problem)).length;
  const done = inRow((s) => s.place.kind === "done");
  return [
    { key: "not-started", label: "Not started", sub: null, pills: inRow((s) => s.place.kind === "not-started"), absent: [], count: null },
    ...problems.map((p): ReviewRow => {
      const n = needFix(p.id);
      return { key: p.id, label: p.label, sub: null, pills: inRow((s) => s.place.kind === "problem" && s.place.problem === p.id), absent: [], count: n > 0 ? { n, words: "need to fix" } : null };
    }),
    { key: "done", label: "Done reviewing", sub: null, pills: done, absent: students.filter((s) => s.place.kind === "absent").map((s) => ({ id: s.id, name: person(s.id).name })), count: done.length > 0 ? { n: done.length, words: "done" } : null },
  ];
}

/** Whether a student has fixed `problem` by now: used to thin the mistake cards to those still to fix. */
export const stillToFix = (students: readonly ReviewStudent[], id: string, problem: string): boolean => {
  const s = students.find((x) => x.id === id);
  return !s || !s.fixed.includes(problem);
};
