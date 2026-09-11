import type { Difficulty } from "./types";

/**
 * Fixtures for the review step of a new assignment (ticket 120): the labels of the two problems
 * that exist only in the teacher's draft (`data/draft-seed` is the draft itself: Q1 as
 * `x^2 + 5x + 6 = 0`, which the first recommendation changes back, and the ball problem's slot
 * taken by a repeat of Q3, which the second removes and the third replaces), and the three
 * scripted recommendations. Everything here is matched to the draft by the normalised TeX of a
 * question's expression (`lib/review`), never by position, so the order of the draft does not
 * matter and a recommendation whose target is not in it is simply not shown.
 */

/** Labels for problems the bank does not hold, by normalised expression. */
export const DRAFT_LABELS: Record<string, Difficulty> = {
  "x^2+5x+6=0": "simple familiar",
  "(x+1)(x-4)=6": "simple unfamiliar",
};

/** A question the review step can put into the set: the typed form, and its card shape. */
export interface ProposedQuestion {
  text: string;
  stem: string;
  tex: string;
  difficulty: Difficulty;
}

export type RecommendationKind = "change" | "remove" | "add";

interface RecommendationBase {
  id: string;
  kind: RecommendationKind;
  /** The one-line reason, in the teacher's terms. */
  reason: string;
  /** What the class did, when the reason rests on it. */
  evidence?: string;
}
export interface ChangeRecommendation extends RecommendationBase {
  kind: "change";
  /** The normalised expression of the question to change. */
  target: string;
  to: ProposedQuestion;
}
export interface RemoveRecommendation extends RecommendationBase {
  kind: "remove";
  target: string;
}
export interface AddRecommendation extends RecommendationBase {
  kind: "add";
  /** Alternatives, "Try another" cycling through them; the first is the default. */
  options: ProposedQuestion[];
}
export type Recommendation = ChangeRecommendation | RemoveRecommendation | AddRecommendation;

export const CHANGE_SIGNS: ChangeRecommendation = {
  id: "change-signs",
  kind: "change",
  target: "x^2+5x+6=0",
  to: { text: "Solve for x. x**2 - 5x + 6 = 0", stem: "Solve for x.", tex: "x^{2} - 5x + 6 = 0", difficulty: "simple familiar" },
  reason: "Every factorisation in this set uses two positive numbers. Nobody has to choose two negatives for a positive product and a negative sum, which is the sign slip this class makes most.",
  evidence: "Last unit, 7 of 20 students slipped on the sign of the factor pair in monic factorising.",
};

export const REMOVE_REPEAT: RemoveRecommendation = {
  id: "remove-repeat",
  kind: "remove",
  target: "(x+1)(x-4)=6",
  reason: "This is Q3 again with the numbers changed. Q3 is simple unfamiliar: if students slip there, a group diagnostic to address it, and some spacing before they meet the type again, will do more than a repeat.",
};

export const ADD_CONTEXT: AddRecommendation = {
  id: "add-context",
  kind: "add",
  reason: "Nothing in the set is set in a context, so nobody has to decide what the algebra means. One worded problem, complex unfamiliar, closes that gap.",
  options: [
    {
      text: "A ball's height after travelling x metres is given below. Where does it land, and what is its greatest height? h = -x**2 + 6x",
      stem: "A ball's height after travelling x metres is given below. Where does it land, and what is its greatest height?",
      tex: "h = -x^{2} + 6x",
      difficulty: "complex unfamiliar",
    },
    {
      text: "A rectangular garden is 3 metres longer than it is wide, with an area of 40 square metres. Find its dimensions. w(w + 3) = 40",
      stem: "A rectangular garden is 3 metres longer than it is wide, with an area of 40 square metres. Find its dimensions.",
      tex: "w(w + 3) = 40",
      difficulty: "complex unfamiliar",
    },
    {
      text: "A model rocket's height in metres after t seconds is given below. When does it come back down, and how high does it get? h = 20t - 5t**2",
      stem: "A model rocket's height in metres after t seconds is given below. When does it come back down, and how high does it get?",
      tex: "h = 20t - 5t^{2}",
      difficulty: "complex unfamiliar",
    },
  ],
};

/** The scripted assessment, in the order the cards stack. */
export const RECOMMENDATIONS: Recommendation[] = [CHANGE_SIGNS, REMOVE_REPEAT, ADD_CONTEXT];

/** How long the assessing bar runs, and the three lines beneath it with when each takes over (a fraction of the run). */
export const ASSESS_MS = 5000;
export const ASSESS_LINES: { at: number; text: string }[] = [
  { at: 0, text: "Reading the set" },
  { at: 0.2, text: "Checking coverage against Unit 1" },
  { at: 0.5, text: "Comparing with this class's recent gaps" },
];
/** The beat between the bar reaching the end and the recommendations appearing. */
export const ASSESS_BEAT_MS = 400;
