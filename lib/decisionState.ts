import type { Pathway } from "@/data/types";
import type { ClassStageId } from "./classStage";

/**
 * The lesson's decisions as the classroom stores them (ticket 335): the teacher's side of the decision card. Which decision
 * is due is derived from the class's progress (`lib/decision.ts`); what is stored is only what the teacher did about it, so
 * every teacher screen, every tab and a reload agree. Pure data plus a reducer, no app imports (the classroom reducer calls it).
 *
 * - `kind` names the decision. Ticket 335's is `close-to-finishing`: most of the class in the room is past the 70% question
 *   of the set, so the teacher is asked to keep the planned pathway (or, from ticket 336, change it). Ticket 337's
 *   `split-review` is the second: during individual review, once half the room has handed in corrections, the teacher is
 *   asked to move the questions fewest have right from group review to class review.
 * - `stage` is the class stage the decision came due in. Once the class leaves that stage the decision has lapsed: the plan
 *   runs as it was and nothing asks again (read by `lessonDecision`, never stored).
 * - `dueAt` is when the first teacher tab saw it due.
 * - `status` is `open` (the card is up), `tucked` ("Later": a dot on the pathway strip's current pill and on the live set's
 *   Classroom card) or `answered` (the card and the dot are gone). Answered is final; open and tucked go back and forth.
 * - `answer` is what the teacher chose: `keep`, or `change` with the pathway chosen on the card (ticket 336); ticket 337 its
 *   moved questions. An answer that carries a `pathway` is written to the assignment by the classroom reducer in the same
 *   step (`answerPathway`), so the strips and every student's next transition follow it. `answeredAt` stamps it.
 */
export type DecisionKind = "close-to-finishing" | "split-review";
export type DecisionStatus = "open" | "tucked" | "answered";
/**
 * The card's answers: keep the pathway as planned, or change it (ticket 336) to `pathway`, already resolved against the
 * stages students have entered (`changedPathway`, `lib/pathwayChange.ts`), or move questions from group review to class
 * review (ticket 337): `moved`, in set order, with the `pathway` that adds class review when it was not planned. Any answer
 * with a `pathway` changes the assignment's; any answer with `moved` takes those questions out of every group's list
 * (`movedToClassReview`). A change made on a card that also carries the split (a pathway without individual review, or
 * the split card's own "Change") can carry its moved questions too.
 */
export type DecisionAnswer = { kind: "keep" } | { kind: "change"; pathway: Pathway; moved?: readonly string[] } | { kind: "move"; moved: readonly string[]; pathway?: Pathway };

/** The pathway an answer writes to the assignment, if it writes one. */
export const answerPathway = (answer: DecisionAnswer): Pathway | null => ("pathway" in answer && answer.pathway ? answer.pathway : null);

/** The questions an answer moves from group review to class review (ticket 337); none for keep. */
export const answerMoved = (answer: DecisionAnswer): readonly string[] => ("moved" in answer && answer.moved ? answer.moved : NO_MOVED);

const NO_MOVED: readonly string[] = [];

/**
 * The questions the teacher moved from group review to class review during the lesson (ticket 337): every answered
 * decision's `moved`, in the order they were answered, each once. No group's list holds them (`lib/standings.ts`,
 * `lib/group.ts`), class review's setup has them ticked and locked, and the teacher's group grid (ticket 319) shows each as
 * a grey "class review" row. The one accessor every reader goes through.
 */
export function movedToClassReview(c: { decisions?: readonly LessonDecision[] } | null | undefined): readonly string[] {
  const answered = (c?.decisions ?? []).filter((d) => d.status === "answered" && d.answer);
  if (answered.length === 0) return NO_MOVED;
  const moved = [...new Set(answered.flatMap((d) => answerMoved(d.answer!)))];
  return moved.length === 0 ? NO_MOVED : moved;
}

export interface LessonDecision {
  kind: DecisionKind;
  stage: ClassStageId;
  dueAt: number;
  status: DecisionStatus;
  answer?: DecisionAnswer;
  answeredAt?: number;
  /** An answer that moved questions leaves the card up with "Set up class review →" until Close (ticket 337). */
  dismissed?: boolean;
}

/** Enough to raise a decision that no tab has stored yet: a press on a card only derived so far stores it as it acts. */
export interface DecisionDue {
  kind: DecisionKind;
  stage: ClassStageId;
  at: number;
}

export type DecisionAction =
  /** A decision came due: stored open, once per kind per lesson. A decision already stored is kept as it is. */
  | { type: "decision/raise"; due: DecisionDue }
  /** "Later": the card tucks into the dot. Nothing once answered. */
  | { type: "decision/tuck"; due: DecisionDue }
  /** The dot pressed: the card opens again. Nothing once answered. */
  | { type: "decision/reopen"; due: DecisionDue }
  /** "Keep", or "Done" after Change (ticket 336): the decision is answered for good. The first answer stands. */
  | { type: "decision/answer"; due: DecisionDue; answer: DecisionAnswer; at: number }
  /** Close on the card an answer left up (ticket 337: the moved questions and "Set up class review →"). Only once answered. */
  | { type: "decision/dismiss"; due: DecisionDue };

const NONE: readonly LessonDecision[] = [];

/** The stored decision of a kind, if any. */
export const storedDecision = (decisions: readonly LessonDecision[] | undefined, kind: DecisionKind): LessonDecision | null => (decisions ?? NONE).find((d) => d.kind === kind) ?? null;

/** The lesson's decisions after an action, in the order they were raised; the very value passed in (undefined too) when nothing changes. */
export function decisionsReducer(decisions: readonly LessonDecision[] | undefined, a: DecisionAction): readonly LessonDecision[] | undefined {
  const list = decisions ?? NONE;
  const stored = storedDecision(list, a.due.kind);
  const base: LessonDecision = stored ?? { kind: a.due.kind, stage: a.due.stage, dueAt: a.due.at, status: "open" };
  const next = ((): LessonDecision => {
    if (base.status === "answered") return a.type === "decision/dismiss" && !base.dismissed ? { ...base, dismissed: true } : base;
    switch (a.type) {
      case "decision/dismiss":
        return base;
      case "decision/raise":
        return base;
      case "decision/tuck":
        return base.status === "tucked" ? base : { ...base, status: "tucked" };
      case "decision/reopen":
        return base.status === "open" ? base : { ...base, status: "open" };
      case "decision/answer":
        return { ...base, status: "answered", answer: a.answer, answeredAt: a.at };
    }
  })();
  if (stored === next) return decisions;
  return stored ? list.map((d) => (d === stored ? next : d)) : [...list, next];
}
