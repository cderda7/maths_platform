import type { EvalStep, SubskillId, SubskillStatus } from "./types";

export type ChatRole = "tutor" | "student";

export interface ChatTurn {
  role: ChatRole;
  text: string;
  /** Optional tex rendered under the text. */
  tex?: string;
  /** Snapshot of the evaluation trace after this turn. */
  trace?: EvalStep[];
  surfaced?: { id: SubskillId; status: SubskillStatus; note: string }[];
  /** Show the help picker after this turn. */
  offerHelp?: boolean;
}

/** Jordan working Q4 (3x² − 5x − 1 = 0, exact roots) with the tutor. */
export const CHAT_PROBLEM_ID = "q4";

const T0: EvalStep[] = [
  { tex: "x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", marker: "sound", label: "Chose the formula", subskill: "roots", note: "Good choice — the discriminant isn't a perfect square." },
  { tex: "a = 3,\\; b = 5,\\; c = 1", marker: "slip", label: "Coefficients", subskill: "algebra", note: "Two signs to look at again." },
];

const T1: EvalStep[] = [
  T0[0],
  { tex: "a = 3,\\; b = -5,\\; c = -1", marker: "sound", label: "Coefficients", subskill: "algebra", note: "Corrected in chat." },
];

const T2: EvalStep[] = [
  ...T1,
  { tex: "b^2 - 4ac = 25 - 4(3)(-1) = 37", marker: "sound", label: "Discriminant", subskill: "algebra", note: "Double negative handled." },
];

const T3: EvalStep[] = [
  ...T2,
  { tex: "x = \\dfrac{5 \\pm \\sqrt{37}}{6}", marker: "sound", label: "Substituted", subskill: "fractions" },
];

const T4: EvalStep[] = [
  ...T3,
  { tex: "x = \\dfrac{5 \\pm \\sqrt{37}}{6}", marker: "unclear", label: "Final answer", subskill: "fractions", note: "Can anything here be simplified? Say why or why not." },
];

const T5: EvalStep[] = [
  ...T3,
  { tex: "x = \\dfrac{5 \\pm \\sqrt{37}}{6} \\quad (\\text{exact, no further simplification})", marker: "sound", label: "Final answer, justified", subskill: "fractions", note: "37 is prime, and 5, √37 and 6 share no common factor." },
];

export const CHAT_SCRIPT: ChatTurn[] = [
  {
    role: "tutor",
    text: "I can see you've written the quadratic formula out. Before we go on — what are a, b and c for this equation?",
    trace: T0,
    surfaced: [{ id: "roots", status: "sound", note: "Chose the formula because 37 isn't a perfect square." }],
  },
  {
    role: "student",
    text: "a = 3, b = 5, c = 1",
  },
  {
    role: "tutor",
    text: "Two of those are worth a second look. Which terms in 3x² − 5x − 1 are being subtracted?",
    surfaced: [
      { id: "roots", status: "sound", note: "Chose the formula because 37 isn't a perfect square." },
      { id: "algebra", status: "slip", note: "Signs of b and c dropped when reading the coefficients." },
    ],
  },
  {
    role: "student",
    text: "oh. b = −5 and c = −1",
    trace: T1,
  },
  {
    role: "tutor",
    text: "Right. So with those signs, what does b² − 4ac come to? Take it slowly — there's a double negative in there.",
    offerHelp: true,
  },
  {
    role: "student",
    text: "25 − 4(3)(−1) = 25 + 12 = 37",
    trace: T2,
    surfaced: [
      { id: "roots", status: "sound", note: "Chose the formula because 37 isn't a perfect square." },
      { id: "algebra", status: "sound", note: "Sign slip caught and corrected by the student, not told." },
    ],
  },
  {
    role: "tutor",
    text: "That's it. Now put it all into the formula.",
  },
  {
    role: "student",
    text: "x = (5 ± √37) / 6",
    tex: "x = \\dfrac{5 \\pm \\sqrt{37}}{6}",
    trace: T4,
  },
  {
    role: "tutor",
    text: "The question says exact values. Is that as simple as it gets? What would you check?",
    surfaced: [
      { id: "roots", status: "sound", note: "Chose the formula because 37 isn't a perfect square." },
      { id: "algebra", status: "sound", note: "Sign slip caught and corrected by the student, not told." },
      { id: "fractions", status: "unseen", note: "Waiting to see whether the fraction gets a simplification check." },
    ],
  },
  {
    role: "student",
    text: "37 is prime so the root doesn't simplify, and 5 and 6 don't have a common factor with it so the fraction stays",
    trace: T5,
    surfaced: [
      { id: "roots", status: "sound", note: "Chose the formula because 37 isn't a perfect square." },
      { id: "algebra", status: "sound", note: "Sign slip caught and corrected by the student, not told." },
      { id: "fractions", status: "sound", note: "Justified why the surd fraction is already in simplest form." },
    ],
  },
  {
    role: "tutor",
    text: "That's a complete answer, and you gave the reason without being asked. Worth noticing: the only thing that went wrong today was reading off the signs. Everything after that was yours.",
  },
];

export interface HelpContent {
  example: { title: string; intro: string; steps: { tex: string; note: string }[]; outro: string };
  hint: { title: string; intro: string; waysIn: string[] };
  video: { title: string; duration: string; chapters: { at: string; label: string }[]; note: string };
}

/** Help for Q4. Deliberately keeps the thinking with the student: the example is a parallel
 * problem, the hint is a set of questions (not a prescription), and the video is short. */
export const HELP_Q4: HelpContent = {
  example: {
    title: "A parallel example",
    intro: "Same shape, different numbers. Notice where the signs come from — then go back to yours.",
    steps: [
      { tex: "2x^2 - 3x - 4 = 0", note: "Read off a, b, c with their signs: a = 2, b = −3, c = −4." },
      { tex: "b^2 - 4ac = 9 - 4(2)(-4) = 9 + 32 = 41", note: "The minus in c turns −4ac into a plus." },
      { tex: "x = \\dfrac{3 \\pm \\sqrt{41}}{4}", note: "−b becomes +3. √41 stays as a surd." },
    ],
    outro: "Now try the same read-off on 3x² − 5x − 1.",
  },
  hint: {
    title: "Some ways in",
    intro: "Pick whichever one sounds like you. None of them is the 'right' one.",
    waysIn: [
      "Rewrite the equation as 3x² + (−5)x + (−1) = 0. Does that change what b and c are?",
      "What does −4ac come to when c is negative? Work out the sign before the size.",
      "Would factorising work here? Try to find a pair — if you can't, that tells you something about the discriminant.",
    ],
  },
  video: {
    title: "Reading coefficients with their signs",
    duration: "1:40",
    chapters: [
      { at: "0:00", label: "Why b and c carry their signs" },
      { at: "0:35", label: "−4ac with a negative c" },
      { at: "1:10", label: "Leaving a surd exact" },
    ],
    note: "This clip explains the idea, not this question. Pause it and try yours.",
  },
};
