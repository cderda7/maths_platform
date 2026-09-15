import { LIVE_ASSIGNMENT_ID, recentSets } from "./assignments";
import { classroomReducer, type ClassroomAction, type ClassroomState } from "./classroom";
import { RECENT_SETS } from "./newSkills";
import { applyReview, bankProblemsOf, reviewFor, reviewNewSkills } from "./review";
import { seatingOf } from "./seating";

/**
 * Create on the pathway step, as a pure step (ticket 272, lifted out of `ReviewAssignment`): the draft as the review leaves
 * it sent as Problem Set 6, with the pathway, the New skills in force and the groups confirmed there (the class defaults
 * when nobody was moved). Null while nothing is drafted or the pathway is undecided: an undecided pathway never creates
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
    ...(at !== undefined ? { at } : {}),
  };
}

/** The draft and its review once Create has sent them: both cleared, so the next +In-Class PSet starts blank. */
export const CLEAR_DRAFT: ClassroomAction[] = [
  { type: "draft/set", draft: null },
  { type: "review/set", review: null },
];

/** The classroom after Create at `at`: the set sent (a new lesson, ticket 263) and the draft cleared; unchanged when Create would not create. */
export function created(c: ClassroomState, at: number): ClassroomState {
  const action = createAction(c, at);
  return action ? [action, ...CLEAR_DRAFT].reduce(classroomReducer, c) : c;
}
