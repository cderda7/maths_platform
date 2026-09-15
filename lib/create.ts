import { LIVE_ASSIGNMENT_ID, recentSets } from "./assignments";
import { classroomReducer, type ClassroomAction, type ClassroomState } from "./classroom";
import type { CreateKind } from "./createPipeline";
import { RECENT_SETS } from "./newSkills";
import { allAnswered, applyReview, bankProblemsOf, recommendationsFor, reviewFor, reviewNewSkills } from "./review";
import { seatingOf } from "./seating";
import { isIsoDay } from "./dueDate";
import { nextHomework } from "./homeworks";

/**
 * Create on the pathway step, as a pure step (ticket 272, lifted out of `ReviewAssignment`): the draft as the review leaves
 * it sent as Problem Set 6, with the pathway, the New skills in force and the groups confirmed there (the class defaults
 * when nobody was moved) and the due date picked beside the title (ticket 289). Null while nothing is drafted or the pathway is undecided: an undecided pathway never creates
 * (ticket 246). `at` is the moment of creation; the store stamps it when absent.
 */
export function createAction(c: ClassroomState, at?: number): ClassroomAction | null {
  const draft = c.draft;
  const questions = draft?.questions ?? [];
  const review = reviewFor(questions, c.review);
  if (!draft || questions.length === 0 || review.pathway === null) return null;
  const final = applyReview(questions, review);
  return {
    type: "assignment/create",
    id: LIVE_ASSIGNMENT_ID,
    groups: review.groups ?? seatingOf(c.groups),
    title: draft.title,
    problemIds: bankProblemsOf(final).map((p) => p.id),
    pathway: review.pathway,
    newSkills: reviewNewSkills(final, review, recentSets(LIVE_ASSIGNMENT_ID, RECENT_SETS)).chosen,
    goal: draft.goal ?? "",
    questions: final,
    ...(isIsoDay(draft.due) ? { due: draft.due } : {}),
    ...(at !== undefined ? { at } : {}),
  };
}

/** The draft and its review once Create has sent them: both cleared, so the next +In-Class PSet starts blank. */
export const CLEAR_DRAFT: ClassroomAction[] = [
  { type: "draft/set", draft: null },
  { type: "review/set", review: null },
];

/**
 * +Homework's Create (ticket 291), as a pure step: the homework draft as Refine leaves it sent as the class's next homework
 * (`nextHomework`: Homework 3), due on the day picked beside the title (a day before the earliest allowed reads as the
 * default), titled as typed. Null while nothing is drafted or a recommendation is unanswered (Refine's Create waits for every
 * answer, as Finalise set does). Sending starts no lesson: the action touches nothing but the homework list.
 */
export function homeworkSendAction(c: ClassroomState, at: number): ClassroomAction | null {
  const draft = c.homeworkDraft;
  const questions = draft?.questions ?? [];
  const review = reviewFor(questions, c.homeworkReview);
  if (!draft || questions.length === 0 || !allAnswered(recommendationsFor(questions, "homework"), review.answers)) return null;
  const next = nextHomework(c);
  const due = isIsoDay(draft.due) && draft.due >= next.min ? draft.due : next.due;
  return { type: "homework/send", homework: { id: next.id, n: next.n, name: draft.title.trim() || `Homework ${next.n}`, due, questions: applyReview(questions, review, "homework"), sentAt: at } };
}

/** A kind's draft and review cleared once sent. */
export const clearDraft = (kind: CreateKind): ClassroomAction[] => [
  { type: "draft/set", draft: null, kind },
  { type: "review/set", review: null, kind },
];

/** The classroom after +Homework's Create at `at`: the homework sent and its draft cleared; unchanged when Create would not send. */
export function homeworkSent(c: ClassroomState, at: number): ClassroomState {
  const action = homeworkSendAction(c, at);
  return action ? [action, ...clearDraft("homework")].reduce(classroomReducer, c) : c;
}

/** The classroom after Create at `at`: the set sent (a new lesson, ticket 263) and the draft cleared; unchanged when Create would not create. */
export function created(c: ClassroomState, at: number): ClassroomState {
  const action = createAction(c, at);
  return action ? [action, ...CLEAR_DRAFT].reduce(classroomReducer, c) : c;
}
