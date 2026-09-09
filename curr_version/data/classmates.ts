/**
 * Static classmates so the demo student's live row sits in a believable class. Their skill
 * statuses are derived from the same evidence path as the demo student's: the scripted attempt
 * where they slipped, the model solution where they got a problem right, nothing where they
 * never reached it (`done` problems, in assignment order). Three of them (`groupmates`) are also
 * the mock review group, with wrong sets chosen so the all-correct intersection and the union of
 * wrongs are both non-empty and different.
 */
export interface Classmate {
  id: string;
  name: string;
  initials: string;
  confidence: "confident" | "low" | `low: ${string}`;
  /** Problems finished, in assignment order, out of ten. */
  done: number;
  when: string;
  /** Problem ids this classmate got wrong. */
  wrong: string[];
  note?: string;
  /** Their recognised working on the problems they got wrong, for the teacher's mistake view. */
  attempts: Record<string, string[]>;
  /** One line for the teacher's "during review groups" view. Static; the demo student's is live. */
  groupStatus: string;
}

const Q2_GUESSED = ["2x^2 + 7x - 4 = 0", "(2x + 4)(x - 1) = 0", "x = -2 \\;\\text{or}\\; x = 1"];
const Q3_NFL = ["(x - 3)(x + 2) = 6", "x - 3 = 6 \\;\\text{or}\\; x + 2 = 6", "x = 9 \\;\\text{or}\\; x = 4"];
const Q4_OVER_A = ["a = 3,\\; b = -5,\\; c = -1", "b^2 - 4ac = 25 + 12 = 37", "x = \\dfrac{5 \\pm \\sqrt{37}}{3}"];
const Q5_SIGNS = ["(x - 5)(x + 1) = 0", "x = -5 \\;\\text{or}\\; x = 1", "x = \\tfrac{-5 + 1}{2} = -2"];
const Q6_TWICE = ["b^2 - 4ac = 36 - 4k", "36 - 4k > 0", "k < 9"];
const Q7_TWO_TERMS = ["x^2 + 6x + \\tfrac{8}{3}", "2 \\times 4 = 8,\\quad 2 + 4 = 6", "(x + 2)(x + 4)"];
const Q8_MIRROR = ["x = -1 \\;\\text{or}\\; x = -3"];
const Q9_HEIGHT = ["-x(x - 6) = 0", "x = 0 \\;\\text{or}\\; x = 6", "x = 3", "h = 6"];
const Q10_TWICE = ["b^2 - 4ac = 16 - 20 = -4", "\\Delta < 0 \\Rightarrow \\text{no real solutions}", "\\text{The graph crosses the x-axis twice}"];

export const CLASSMATES: Classmate[] = [
  { id: "priya", name: "Priya Raman", initials: "PR", confidence: "confident", done: 10, when: "4:12 pm", wrong: [], attempts: {}, groupStatus: "Quick pass done · nothing to discuss" },
  { id: "jordan", name: "Jordan Whitlock", initials: "JW", confidence: "confident", done: 3, when: "3:48 pm", wrong: ["q2"], note: "Non-monic factorising: factors not checked by expanding.", attempts: { q2: Q2_GUESSED }, groupStatus: "Discussing Q2 · expanding back" },
  { id: "amelia", name: "Amelia Chen", initials: "AC", confidence: "low", done: 10, when: "2:30 pm", wrong: ["q6", "q10"], note: "Read “touches once” as a positive discriminant; concluded the graph crosses twice.", attempts: { q6: Q6_TWICE, q10: Q10_TWICE }, groupStatus: "Quick pass done · comparing Q4 methods" },
  { id: "tomas", name: "Tomas Reyes", initials: "TR", confidence: "low: fractions", done: 7, when: "Yesterday", wrong: ["q3", "q4", "q5", "q7"], note: "Divided by a instead of 2a; multiplied only two of three terms by 3.", attempts: { q3: Q3_NFL, q4: Q4_OVER_A, q5: Q5_SIGNS, q7: Q7_TWO_TERMS }, groupStatus: "Discussing Q4 · the 2a" },
  { id: "zara", name: "Zara Haddad", initials: "ZH", confidence: "confident", done: 10, when: "1:05 pm", wrong: ["q3", "q9"], note: "Applied the null factor law to (x − 3)(x + 2) = 6 without rearranging; gave the axis as the height.", attempts: { q3: Q3_NFL, q9: Q9_HEIGHT }, groupStatus: "Discussing Q3 · when the null factor law applies" },
  { id: "liam", name: "Liam O'Connell", initials: "LO", confidence: "confident", done: 2, when: "9:40 am", wrong: ["q2", "q3"], note: "Guessed a factor pair without expanding back.", attempts: { q2: Q2_GUESSED, q3: Q3_NFL }, groupStatus: "Discussing Q2 · listening" },
];

export const CLASSMATE_MAP = Object.fromEntries(CLASSMATES.map((c) => [c.id, c])) as Record<string, Classmate>;

/** The demo student's mock review group (ticket 08). */
export const GROUPMATE_IDS = ["jordan", "zara", "liam"];

/** The other review groups in the class (ticket 14), static. */
export const OTHER_GROUPS: string[][] = [["priya", "amelia", "tomas"]];

/** Q8's mirrored read, kept for the evaluation table (no classmate makes it in the fixture). */
export const Q8_MIRROR_LINES = Q8_MIRROR;
