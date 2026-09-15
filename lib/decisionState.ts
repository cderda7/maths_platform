import type { ClassStageId } from "./classStage";

/**
 * The lesson's decisions as the classroom stores them (ticket 335): the teacher's side of the decision card. Which decision
 * is due is derived from the class's progress (`lib/decision.ts`); what is stored is only what the teacher did about it, so
 * every teacher screen, every tab and a reload agree. Pure data plus a reducer, no app imports (the classroom reducer calls it).
 *
 * - `kind` names the decision. Ticket 335's is `close-to-finishing`: most of the class in the room is past the 70% question
 *   of the set, so the teacher is asked to keep the planned pathway (or, from ticket 336, change it). Ticket 337's split of
 *   group review and class review joins it as a second kind, raised during individual review.
 * - `stage` is the class stage the decision came due in. Once the class leaves that stage the decision has lapsed: the plan
 *   runs as it was and nothing asks again (read by `lessonDecision`, never stored).
 * - `dueAt` is when the first teacher tab saw it due.
 * - `status` is `open` (the card is up), `tucked` ("Later": a dot on the pathway strip's current pill and on the live set's
 *   Classroom card) or `answered` (the card and the dot are gone). Answered is final; open and tucked go back and forth.
 * - `answer` is what the teacher chose: `keep` today. Ticket 336 adds `change` with the pathway chosen; ticket 337 its moved
 *   questions. `answeredAt` stamps it.
 */
export type DecisionKind = "close-to-finishing";
export type DecisionStatus = "open" | "tucked" | "answered";
/** The card's answers. Ticket 336 adds `{ kind: "change"; pathway }` beside keep. */
export type DecisionAnswer = { kind: "keep" };

export interface LessonDecision {
  kind: DecisionKind;
  stage: ClassStageId;
  dueAt: number;
  status: DecisionStatus;
  answer?: DecisionAnswer;
  answeredAt?: number;
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
  /** "Keep" (and, from ticket 336, "Change"): the decision is answered for good. The first answer stands. */
  | { type: "decision/answer"; due: DecisionDue; answer: DecisionAnswer; at: number };

const NONE: readonly LessonDecision[] = [];

/** The stored decision of a kind, if any. */
export const storedDecision = (decisions: readonly LessonDecision[] | undefined, kind: DecisionKind): LessonDecision | null => (decisions ?? NONE).find((d) => d.kind === kind) ?? null;

/** The lesson's decisions after an action, in the order they were raised; the very value passed in (undefined too) when nothing changes. */
export function decisionsReducer(decisions: readonly LessonDecision[] | undefined, a: DecisionAction): readonly LessonDecision[] | undefined {
  const list = decisions ?? NONE;
  const stored = storedDecision(list, a.due.kind);
  const base: LessonDecision = stored ?? { kind: a.due.kind, stage: a.due.stage, dueAt: a.due.at, status: "open" };
  const next = ((): LessonDecision => {
    if (base.status === "answered") return base;
    switch (a.type) {
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
