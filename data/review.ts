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
  // Homework 3's ten (ticket 291, `data/homework-draft-seed.ts`): none is in the bank.
  "y=x^2-2x-15": "simple familiar",
  "y=-(x+2)^2+5": "simple unfamiliar",
  "x^2+3x-10=0": "simple familiar",
  "2x^2-5x-3=0": "complex familiar",
  "x^2-6x+4=0": "complex familiar",
  "y=2x^2+12x+7": "simple unfamiliar",
  "x^2+4x+k=0": "complex unfamiliar",
  "y=(x-3)^2+4": "simple familiar",
  "x^2+2x-8=0": "simple familiar",
  "y=-x^2+4x+5": "complex familiar",
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

/**
 * Homework 3's scripted assessment (ticket 291), matched to `data/homework-draft-seed.ts` the same way: Q8's parabola never
 * meets the x-axis, Q9 repeats Q3, and nothing in the ten goes from a parabola's features back to its rule. Accepting all
 * three leaves ten problems, the new one in Q9's slot.
 */
export const HOMEWORK_NO_INTERCEPTS: ChangeRecommendation = {
  id: "hw-no-intercepts",
  kind: "change",
  target: "y=(x-3)^2+4",
  to: { text: "Find the x-intercepts of the graph of y = (x-3)**2 - 4", stem: "Find the x-intercepts of the graph of", tex: "y = (x - 3)^{2} - 4", difficulty: "simple familiar" },
  reason: "This parabola never meets the x-axis: it opens upward from a turning point above it, at (3, 4). A student working alone at home who finds no x-intercepts can't tell a right answer from a slip. Lowering it by 8 keeps the turning-point form and gives intercepts at 1 and 5.",
};

export const HOMEWORK_REMOVE_REPEAT: RemoveRecommendation = {
  id: "hw-remove-repeat",
  kind: "remove",
  target: "x^2+2x-8=0",
  reason: "This is Q3 again with the numbers changed. Each student's homework already starts with the problems they got wrong this week, so a second monic factorising here adds length, not practice.",
};

export const HOMEWORK_ADD_RULE: AddRecommendation = {
  id: "hw-add-rule",
  kind: "add",
  reason: "Every problem goes from a rule to the graph's features; none goes back. Finding a rule from its intercepts or its turning point checks that students know what each form shows.",
  evidence: "On Problem Set 5, five students got a root or vertex sign wrong.",
  options: [
    {
      text: "A parabola crosses the x-axis at x = -2 and x = 4, and the y-axis at y = -16. Find its rule. y = a(x+2)(x-4)",
      stem: "A parabola crosses the x-axis at $x = -2$ and $x = 4$, and the y-axis at $y = -16$. Find its rule.",
      tex: "y = a(x + 2)(x - 4)",
      difficulty: "complex unfamiliar",
    },
    {
      text: "A parabola's turning point is at x = 1 with a least value of -8, and it crosses the x-axis at x = 3. Find its rule. y = a(x-1)**2 - 8",
      stem: "A parabola's turning point is at $x = 1$ with a least value of $-8$, and it crosses the x-axis at $x = 3$. Find its rule.",
      tex: "y = a(x - 1)^{2} - 8",
      difficulty: "complex unfamiliar",
    },
    {
      text: "A parabola crosses the x-axis at x = 1 and x = 7, and its greatest value is 18. Find its rule. y = a(x-1)(x-7)",
      stem: "A parabola crosses the x-axis at $x = 1$ and $x = 7$, and its greatest value is $18$. Find its rule.",
      tex: "y = a(x - 1)(x - 7)",
      difficulty: "complex unfamiliar",
    },
  ],
};

/** Homework 3's assessment, in the order the cards stack. */
export const HOMEWORK_RECOMMENDATIONS: Recommendation[] = [HOMEWORK_NO_INTERCEPTS, HOMEWORK_REMOVE_REPEAT, HOMEWORK_ADD_RULE];

/** How long the assessing bar runs, and the three lines beneath it with when each takes over (a fraction of the run). */
export const ASSESS_MS = 5000;
export const ASSESS_LINES: { at: number; text: string }[] = [
  { at: 0, text: "Reading the set" },
  { at: 0.2, text: "Checking coverage against Unit 1" },
  { at: 0.5, text: "Comparing with this class's recent gaps" },
];
/** The beat between the bar reaching the end and the recommendations appearing. */
export const ASSESS_BEAT_MS = 400;
