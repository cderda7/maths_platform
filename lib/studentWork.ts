import { DEMO_STUDENT } from "@/data/assignment";
import type { Problem } from "@/data/types";
import { classmateEvidence, sessionEvidence } from "./hierarchy";
import type { Place } from "./place";
import type { ReviewStudent } from "./reviewPlaces";
import { confidenceLabel, NO_CONFIDENCE } from "./report";
import type { StudentSession } from "./session";
import { classmatesAt, type StreamSet } from "./stream";

/**
 * A student's work so far, as the panel on Where students are shows it when the teacher presses their name (ticket 316):
 * their confidence answer as the Class view's Confidence column words it, every question they have moved past in set order
 * with their lines, and the question they are on (no lines: the work is still in progress). Questions after it are not
 * shown. No React.
 *
 * "Moved past" follows ticket 314's place model, the same place that puts the student's pill in its row, so the panel and
 * the row always agree: a student on question i has moved past the questions before it; one who has handed in, past every
 * question (a question with no lines reads "not attempted"); one not started, on the check-in or in the warm-up, past none.
 * A classmate's lines are the part of their record the stream has reached (`classmatesAt`), which holds exactly the answered
 * questions before the one they are on; Sam's are his session's first-attempt lines.
 */

export interface MovedPast<P> {
  problem: P;
  /** The student's lines on it, in the order written; empty when they wrote none. */
  lines: string[];
}

export interface WorkSoFar<P> {
  /** The Class view's Confidence column's words: "confident", "low", "low: fractions", or "—" before an answer. */
  confidence: string;
  moved: MovedPast<P>[];
  /** The question the student is on, or null (not started, on the check-in, in the warm-up, handed in). */
  on: P | null;
  /** In individual review (ticket 318): every problem the student has to fix, in set order, with both versions. */
  review?: ReviewedProblem<P>[];
}

/** A problem the student has to fix in individual review: their first submission, their correction so far, and whether it is open. */
export interface ReviewedProblem<P> {
  problem: P;
  first: string[];
  /** The correction's lines as far as they have come: Sam's as he writes, a classmate's once it has landed right. */
  correction: string[];
  open: boolean;
}

/** The questions moved past and the one the student is on, from their place. */
export function workFromPlace<P extends Pick<Problem, "id">>(place: Place, problems: readonly P[], lines: Readonly<Record<string, readonly string[]>>, confidence: string): WorkSoFar<P> {
  const past = (n: number): MovedPast<P>[] => problems.slice(0, n).map((problem) => ({ problem, lines: [...(lines[problem.id] ?? [])] }));
  if (place.kind === "handed-in") return { confidence, moved: past(problems.length), on: null };
  if (place.kind === "question") {
    const i = problems.findIndex((p) => p.id === place.problem);
    if (i >= 0) return { confidence, moved: past(i), on: problems[i] };
  }
  return { confidence, moved: [], on: null };
}

/**
 * One student's work so far on the live set at `now`, from the place their pill is in. Sam's confidence is his session's
 * answer the moment he gives it; a classmate's is their record's once they are past the check-in (on it, or not started,
 * no answer yet).
 */
export function studentWorkAt(set: StreamSet, session: StudentSession | null, now: number, id: string, place: Place): WorkSoFar<Problem> {
  const problems = set.problems as Problem[];
  if (id === DEMO_STUDENT.id) {
    const lines = session ? sessionEvidence(session).lines : {};
    return workFromPlace(place, problems, lines, confidenceLabel(session?.confidence ?? null));
  }
  const record = classmatesAt(set, session, now).find((m) => m.record.id === id)?.record;
  if (!record) return workFromPlace({ kind: "not-started" }, problems, {}, NO_CONFIDENCE);
  const answered = place.kind !== "not-started" && place.kind !== "confidence" && place.kind !== "absent";
  return workFromPlace(place, problems, classmateEvidence(record, problems).lines, answered ? record.confidence : NO_CONFIDENCE);
}

/**
 * One student's work in individual review at the moment `student` was read (ticket 318): their confidence answer, then every
 * problem they have to fix with the first submission and the correction so far. Sam's correction is his rework as he writes
 * it; a classmate's is their second submission once it has landed right (a correction that stays wrong has no lines of its
 * own in the record, so only the first submission shows).
 */
export function reviewWorkAt(set: StreamSet, session: StudentSession | null, student: ReviewStudent): WorkSoFar<Problem> {
  const problems = set.problems as Problem[];
  const open = student.place.kind === "problem" ? student.place.problem : null;
  const of = (first: Readonly<Record<string, readonly string[]>>, correction: (p: string) => readonly string[]) =>
    student.toFix.flatMap((id) => {
      const problem = problems.find((p) => p.id === id);
      return problem ? [{ problem, first: [...(first[id] ?? [])], correction: [...correction(id)], open: id === open }] : [];
    });
  if (student.id === DEMO_STUDENT.id) {
    const lines = session ? sessionEvidence(session).lines : {};
    return { confidence: confidenceLabel(session?.confidence ?? null), moved: [], on: null, review: of(lines, (p) => (session?.rework[p] ?? []).map((l) => l.tex)) };
  }
  const record = set.classmates.find((m) => m.id === student.id);
  if (!record) return { confidence: NO_CONFIDENCE, moved: [], on: null, review: [] };
  return { confidence: record.confidence, moved: [], on: null, review: of(classmateEvidence(record, problems).lines, (p) => (student.fixed.includes(p) ? (record.review?.[p]?.second ?? []) : [])) };
}
