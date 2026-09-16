import { DEMO_STUDENT } from "@/data/assignment";
import type { Pathway, ReviewStage } from "@/data/types";
import { pathwayOf, type ClassroomState } from "./classroom";
import { currentClassStage, type ClassStageId } from "./classStage";
import { movedToClassReview, type DecisionAnswer, type DecisionKind } from "./decisionState";
import { changedPathway, samePathway, type LiveSet, type PathwayLocks } from "./pathwayChange";
import { reviewDoneCount, reviewPlaces } from "./reviewPlaces";
import { recordWork, sessionWork } from "./reviewUnion";
import type { StudentSession } from "./session";
import { groupsAt } from "./standings";
import { classmatesAt } from "./stream";

/**
 * The split of group review and class review (ticket 337): which questions the class is worst at, and the answer that takes
 * them out of every group's list and gives them to class review. Pure: the class's own work says what to suggest, the
 * teacher says what is moved. See DECISION_LOG.md, 2026-09-16 (the split of group review and class review).
 *
 * "Correct" counts corrections: once the class is in individual review a question is right for a student when their own
 * correction is in and right (Where students are's rule, `lib/reviewPlaces.ts`), so it is the same number the Mistakes tab
 * shows as still to fix. While the class is still working (a pathway without individual review, or one without group
 * review, where the split rides on ticket 335's card) the count is first submissions so far, and the card says "so far".
 *
 * The suggestion is the two questions the fewest students in the room have right; every other question fewer than half of
 * them have right is offered unticked ("also often wrong"), and the rest sit behind "all questions". A question moved out
 * of group review is never dropped: accepting puts class review on the pathway when it was not planned, the moved
 * questions are ticked and locked on its setup page (`movedToClassReview`, `lib/decisionState.ts`), and every group's list,
 * race, progress card and grid leave them out.
 */

/** How many of the class in the room have one question right. */
export interface QuestionTally {
  problem: string;
  label: string;
  correct: number;
  present: number;
}

/** Fewer than half of the room have it right: what "also often wrong" lists, and what may be suggested. */
export const belowHalf = (t: QuestionTally): boolean => t.present > 0 && t.correct * 2 < t.present;

/** How many questions the card pre-ticks. */
export const SUGGESTED = 2;

/** The card's three groups of rows: pre-ticked, offered unticked, and behind "all questions". */
export interface SplitSuggestion {
  /** The (up to) two questions the fewest have right, fewest first; only questions below half. */
  suggested: QuestionTally[];
  /** Every other question below half, in set order. */
  often: QuestionTally[];
  /** The rest, in set order. */
  rest: QuestionTally[];
}

/**
 * The two questions to pre-tick, the others often wrong, and the rest. Ties are broken by the later question in the set
 * (the harder end of a set, and the one fewest have reached): of two questions three students have right, Q10 is
 * suggested before Q4.
 */
export function splitSuggestion(tallies: readonly QuestionTally[]): SplitSuggestion {
  const order = new Map(tallies.map((t, i) => [t.problem, i]));
  const low = tallies.filter(belowHalf).sort((a, b) => a.correct - b.correct || order.get(b.problem)! - order.get(a.problem)!);
  const suggested = low.slice(0, SUGGESTED);
  const inSetOrder = (list: QuestionTally[]) => [...list].sort((a, b) => order.get(a.problem)! - order.get(b.problem)!);
  return {
    suggested,
    often: inSetOrder(low.slice(SUGGESTED)),
    rest: inSetOrder(tallies.filter((t) => !low.includes(t))),
  };
}

/** How many of the room have each question right once corrections are in, at `now`: Where students are's own count. */
export function talliesAfterCorrections(set: LiveSet, c: ClassroomState | null | undefined, session: StudentSession | null, now: number): QuestionTally[] {
  const present = reviewPlaces(set, c, session, now).filter((s) => s.place.kind !== "absent");
  return set.problems.map((p) => ({
    problem: p.id,
    label: p.label,
    correct: present.filter((s) => !s.toFix.includes(p.id) || s.fixed.includes(p.id)).length,
    present: present.length,
  }));
}

/** How many of the room have each question right on their first submission so far, at `now`: the count while the class is still working. */
export function talliesSoFar(set: LiveSet, session: StudentSession | null, now: number): QuestionTally[] {
  const classmates = classmatesAt(set, session, now).filter((m) => !set.absent.includes(m.record.id));
  const samHere = !set.absent.includes(DEMO_STUDENT.id);
  return set.problems.map((p) => {
    const sam = samHere && session && sessionWork(session, p.id).rightFirstTime ? 1 : 0;
    return {
      problem: p.id,
      label: p.label,
      correct: sam + classmates.filter((m) => recordWork(m.record, set.problems, p.id).rightFirstTime).length,
      present: (samHere ? 1 : 0) + classmates.length,
    };
  });
}

/** What the card shows of the split, and what its ticks start as. */
export interface SplitEvidence {
  /** The counts are corrections; false while the class is still working, where the card says "so far". */
  afterCorrections: boolean;
  /** Students in the room whose corrections are in (the trigger's evidence); 0 without individual review. */
  handedIn: number;
  present: number;
  tallies: QuestionTally[];
  suggestion: SplitSuggestion;
}

/**
 * The counts and the suggestion at `now`, read the way the class allows: corrections once the class is in individual
 * review (where the split's own card comes), first submissions so far while it is still working (the close-to-finishing
 * card, on a pathway without individual review or without group review). Counting corrections before individual review
 * has happened would read the class's finished work, which is a projection, not what the teacher can see.
 */
export function splitEvidence(c: ClassroomState | null | undefined, set: LiveSet, session: StudentSession | null, now: number): SplitEvidence {
  const afterCorrections = pathwayOf(c).includes("individual") && currentClassStage(c, session, now) === "individual";
  const tallies = afterCorrections ? talliesAfterCorrections(set, c, session, now) : talliesSoFar(set, session, now);
  const places = afterCorrections ? reviewPlaces(set, c, session, now).filter((s) => s.place.kind !== "absent") : [];
  return {
    afterCorrections,
    handedIn: afterCorrections ? reviewDoneCount(places) : 0,
    present: tallies[0]?.present ?? 0,
    tallies,
    suggestion: splitSuggestion(tallies),
  };
}

/** Half or more of the room, the trigger's own rule (10 of 19, 10 of 20): "about to end" is not "over". */
export const halfOrMore = (count: number, present: number): boolean => present > 0 && count * 2 >= present;

/**
 * Whether the split decision is due at `now`: the class is in individual review (so the pathway has it), group review is
 * next, half or more of the room have handed their corrections in, and there is a question fewer than half have right.
 * On a pathway without individual review there is no such moment: the split joins the close-to-finishing card instead
 * (`splitOnCard`).
 */
export function dueSplit(c: ClassroomState | null | undefined, set: LiveSet, session: StudentSession | null, now: number): { kind: DecisionKind; stage: ClassStageId; evidence: SplitEvidence } | null {
  const pathway = pathwayOf(c);
  if (!c?.assignment || set.problems.length === 0) return null;
  if (!pathway.includes("individual") || !pathway.includes("group")) return null;
  if (currentClassStage(c, session, now) !== "individual") return null;
  const evidence = splitEvidence(c, set, session, now);
  if (!halfOrMore(evidence.handedIn, evidence.present)) return null;
  return evidence.suggestion.suggested.length > 0 ? { kind: "split-review", stage: "individual", evidence } : null;
}

/**
 * Whether the close-to-finishing card carries the split itself (ticket 337's "no individual review" variant): the pathway
 * has group review and no individual review, so there is no later moment to ask. With no group review at all the card has
 * no split to offer; it says instead that these questions go to class review (`toClassReview`).
 */
export const splitOnCard = (c: ClassroomState | null | undefined): boolean => !pathwayOf(c).includes("individual") && pathwayOf(c).includes("group");

/** On a pathway without group review: class review is where the questions most got wrong are covered, said plainly on the card. */
export const toClassReview = (c: ClassroomState | null | undefined): boolean => !pathwayOf(c).includes("group") && pathwayOf(c).includes("whole-class");

/** The groups that would still have something to review with `moved` out of their lists: empty means group review has nothing to do. */
export const groupsWithout = (c: ClassroomState | null | undefined, session: StudentSession | null, moved: readonly string[]) => groupsAt(c, session, 0, moved);

/** Every group would sit out: the card offers to skip group review and go to class review (ticket 337). */
export const everyGroupEmpty = (c: ClassroomState | null | undefined, session: StudentSession | null, moved: readonly string[]): boolean => moved.length > 0 && groupsWithout(c, session, moved).length === 0;

/**
 * The answer a press on the card writes, resolved against the locks at that moment (`changedPathway`, ticket 336):
 * `requested` is the pathway the card's toggles have (the planned one when the teacher changed nothing), `moved` the
 * questions ticked. A move always ends with class review on the pathway, so a moved question is never dropped; with class
 * review locked off (which no lesson can reach) the move is dropped rather than the question.
 */
export function moveAnswer(planned: Pathway, requested: readonly ReviewStage[], moved: readonly string[], locks: PathwayLocks): DecisionAnswer {
  const chosen = changedPathway(planned, requested, locks);
  const withClass = moved.length > 0 && !chosen.includes("whole-class") ? changedPathway(planned, [...requested, "whole-class"], locks) : chosen;
  const changed = samePathway(withClass, planned) ? null : withClass;
  if (moved.length === 0 || !withClass.includes("whole-class")) return changed ? { kind: "change", pathway: changed } : { kind: "keep" };
  return { kind: "move", moved: [...moved], ...(changed ? { pathway: changed } : {}) };
}

/** The questions moved so far, in set order: what every group's list, class review's setup and the group grid read. */
export const movedInSetOrder = (c: ClassroomState | null | undefined, problems: readonly { id: string }[]): string[] => {
  const moved = movedToClassReview(c);
  return problems.map((p) => p.id).filter((id) => moved.includes(id));
};

/** "Q7", "Q7 and Q10", "Q7, Q10 and Q3". */
export const listWords = (words: readonly string[]): string => (words.length <= 1 ? (words[0] ?? "") : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`);

/**
 * The confirm step's heading (ticket 350): every consequence of the press named plainly, and always forward-looking, never
 * a past-tense "added" — that reads as already decided, which is exactly what this step exists to not do. Nothing here is
 * settled until the press after it. `labels` are the ticked questions, fewest-correct first, as the rows above list them.
 *
 * The `emptyAfter` case (ticking these leaves every group with nothing left) states the stage-skip as a plain mechanical
 * fact — that part is not being decided in this sentence, the ticks already decided it — but keeps the question selection
 * itself open ("add any others"), since a bigger structural call like this one deserves more than a pre-filled yes.
 */
export function moveConfirmSentence(labels: readonly string[], emptyAfter: boolean, addsClassReview: boolean): string {
  const moved = listWords(labels);
  if (emptyAfter) {
    const also = addsClassReview ? "; this adds class review to the pathway" : "";
    return `Skip group review — nothing would be left there${also}. ${moved} got the fewest right — add any others before confirming?`;
  }
  const also = addsClassReview ? ", and add class review to the pathway" : "";
  return `Move ${moved} out of group review and into class review${also}?`;
}
