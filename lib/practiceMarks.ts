import type { Classmate } from "@/data/classmates";
import { STREAM_PACES, type StreamPace } from "@/data/stream";
import { leafName, type LeafId } from "@/data/taxonomy";
import type { Problem } from "@/data/types";
import { classmateTimeline } from "./place";
import { warmupFocus, type StudentSession } from "./session";
import { streamElapsed, streamOver, type StreamSet } from "./stream";
import { joinSkills, warmupSequence } from "./warmup";

/**
 * The practice a student took on a set, for the teacher's report (ticket 317): the skills each question was practised on
 * before the student answered it, and the skills the set's warm-up took. Facts of what happened, never a score: the set's
 * score (`lib/setScore.ts`) reads the first submission alone and none of this reaches it.
 *
 * Only practice the student started counts: an offer declined is none, and help left from its worked example ("Back to
 * Qn" from Q*) still is, because the student saw a question like it worked. Sam's comes from his session; a classmate's
 * from ticket 314's story (`data/stream.ts`), read at the stream's clock on a live set so a step not reached yet is not
 * there. No React. See DECISION_LOG.md, 2026-09-15 (a question answered after practice is marked, the score unchanged).
 */
export interface PracticeMarks {
  /** Per problem id, the skills practised on it, in the order first taken. */
  questions: Record<string, LeafId[]>;
  /** The skills the warm-up took, in the order taken. */
  warmUp: LeafId[];
}

export const NO_MARKS: PracticeMarks = { questions: {}, warmUp: [] };

const add = (list: LeafId[] | undefined, leaf: LeafId): LeafId[] => (list?.includes(leaf) ? list : [...(list ?? []), leaf]);

/**
 * Sam's marks from his session: every accepted practice on its question (Q* reached, or the older isolated practice
 * opened), and every warm-up skill whose steps began or that he moved past, once he took the warm-up.
 */
export function sessionPracticeMarks(session: Pick<StudentSession, "practices" | "practice" | "warmup" | "confidence">): PracticeMarks {
  const questions: Record<string, LeafId[]> = {};
  for (const p of session.practices) if (p.accepted) questions[p.problem] = add(questions[p.problem], p.leaf);
  const warmUp =
    session.practice === "taken"
      ? warmupSequence(warmupFocus(session))
          .filter((p) => session.warmup.phases[p.id] !== undefined || session.warmup.done.includes(p.id))
          .map((p) => p.leaf)
      : [];
  return { questions, warmUp: [...new Set(warmUp)] };
}

/**
 * A classmate's marks from their story: the warm-up skills and the question help their timeline reaches by `elapsed` ms
 * after the set went live (null: the whole story, a set not started on the stream's clock or one the class has handed in).
 */
export function classmatePracticeMarks(m: Pick<Classmate, "id" | "done" | "confidence">, problems: readonly Problem[], elapsed: number | null, paces: Record<string, StreamPace> = STREAM_PACES): PracticeMarks {
  const questions: Record<string, LeafId[]> = {};
  let warmUp: LeafId[] = [];
  for (const seg of classmateTimeline(m, problems, paces)) {
    if (elapsed !== null && seg.at > elapsed) continue;
    const p = seg.place;
    if (p.kind === "warmup") warmUp = add(warmUp, p.leaf);
    if (p.kind === "question" && p.detail?.kind === "practice") questions[p.problem] = add(questions[p.problem], p.detail.leaf);
  }
  return { questions, warmUp };
}

/**
 * The marks the report shows for a student on a set: none on a finished set (the story is the live lesson's), Sam's from his
 * session on the live set, a classmate's from the stream at `now` (the whole story before the set goes live on the stream's
 * clock and once the class has handed in, as `classPlaces` reads it).
 */
export function reportPracticeMarks(set: StreamSet & { kind: "live" | "finished" }, student: Pick<Classmate, "id" | "done" | "confidence"> | null, session: StudentSession | null, now: number): PracticeMarks {
  if (set.kind !== "live") return NO_MARKS;
  if (!student) return session ? sessionPracticeMarks(session) : NO_MARKS;
  const start = set.startedAt;
  const whole = start === null || start === undefined || streamOver(session);
  return classmatePracticeMarks(student, set.problems, whole ? null : streamElapsed(start, set.pauses ?? [], now));
}

/** A skill as the report names it: the short name the teacher's report uses beside it ("monic factorising"). */
const skillWord = (l: LeafId): string => leafName(l).short;

/** A question's marker: "after practice on non-monic factorising", or null with none. */
export const afterPracticeText = (leaves: readonly LeafId[] | undefined): string | null => (leaves && leaves.length > 0 ? `after practice on ${joinSkills(leaves.map(skillWord))}` : null);

/** The set's warm-up, named once: "Warmed up on fractions & non-monic factorising", or null with none. */
export const warmUpText = (leaves: readonly LeafId[]): string | null => (leaves.length > 0 ? `Warmed up on ${joinSkills(leaves.map(skillWord))}` : null);
