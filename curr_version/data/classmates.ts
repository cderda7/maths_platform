/**
 * Static classmates so the demo student's live row sits in a believable class of twenty. Their
 * skill statuses are derived from the same evidence path as the demo student's: the scripted
 * attempt where they slipped, the model solution where they got a problem right, nothing where
 * they never reached it (`done` problems, in assignment order). Six are authored in full; the
 * other thirteen are lightweight (a name, a confidence answer, a wrong list, how far they got)
 * and borrow the known slip for each wrong problem from `SLIPS`, so every line of theirs is
 * still one the evaluator can follow. Three of the full six (`GROUPMATE_IDS`) are the demo
 * student's group, with wrong sets chosen so the all-correct intersection and the union of
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
  /** Teacher-facing comments, each tied to the problems it is about (clicking one lights only those skills). */
  notes: { text: string; problems: string[] }[];
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
const Q1_SIGNS = ["x^2 - 5x + 6 = 0", "(x + 2)(x + 3) = 0", "x = -2 \\;\\text{or}\\; x = -3"];

/** One known slip per problem, every line in the evaluation table: what a lightweight classmate wrote when they got it wrong. */
export const SLIPS: Record<string, string[]> = { q1: Q1_SIGNS, q2: Q2_GUESSED, q3: Q3_NFL, q4: Q4_OVER_A, q5: Q5_SIGNS, q6: Q6_TWICE, q7: Q7_TWO_TERMS, q8: Q8_MIRROR, q9: Q9_HEIGHT, q10: Q10_TWICE };

/** A lightweight classmate: the slip for each wrong problem comes from `SLIPS`; no teacher notes. */
function light(id: string, name: string, initials: string, confidence: Classmate["confidence"], done: number, when: string, wrong: string[], groupStatus = "Quick pass done"): Classmate {
  return { id, name, initials, confidence, done, when, wrong, notes: [], attempts: Object.fromEntries(wrong.map((pid) => [pid, SLIPS[pid]])), groupStatus };
}

export const CLASSMATES: Classmate[] = [
  { id: "priya", name: "Priya Raman", initials: "PR", confidence: "confident", done: 10, when: "4:12 pm", wrong: [], notes: [], attempts: {}, groupStatus: "Quick pass done · nothing to discuss" },
  { id: "jordan", name: "Jordan Whitlock", initials: "JW", confidence: "confident", done: 3, when: "3:48 pm", wrong: ["q2"], notes: [{ text: "non-monic factors not checked by expanding", problems: ["q2"] }], attempts: { q2: Q2_GUESSED }, groupStatus: "Discussing Q2 · expanding back" },
  { id: "amelia", name: "Amelia Chen", initials: "AC", confidence: "low", done: 10, when: "2:30 pm", wrong: ["q6", "q10"], notes: [{ text: "read “touches once” as discriminant > 0", problems: ["q6"] }, { text: "said the graph crosses twice", problems: ["q10"] }], attempts: { q6: Q6_TWICE, q10: Q10_TWICE }, groupStatus: "Quick pass done · comparing Q4 methods" },
  { id: "tomas", name: "Tomas Reyes", initials: "TR", confidence: "low: fractions", done: 7, when: "Yesterday", wrong: ["q3", "q4", "q5", "q7"], notes: [{ text: "divided by a, not 2a", problems: ["q4"] }, { text: "scaled two of three terms", problems: ["q7"] }], attempts: { q3: Q3_NFL, q4: Q4_OVER_A, q5: Q5_SIGNS, q7: Q7_TWO_TERMS }, groupStatus: "Discussing Q4 · the 2a" },
  { id: "zara", name: "Zara Haddad", initials: "ZH", confidence: "confident", done: 10, when: "1:05 pm", wrong: ["q3", "q9"], notes: [{ text: "null factor law on a product that isn’t 0", problems: ["q3"] }, { text: "axis given as the height", problems: ["q9"] }], attempts: { q3: Q3_NFL, q9: Q9_HEIGHT }, groupStatus: "Discussing Q3 · when the null factor law applies" },
  { id: "liam", name: "Liam O'Connell", initials: "LO", confidence: "confident", done: 2, when: "9:40 am", wrong: ["q2", "q3"], notes: [{ text: "guessed a factor pair without expanding back", problems: ["q2", "q3"] }], attempts: { q2: Q2_GUESSED, q3: Q3_NFL }, groupStatus: "Discussing Q2 · listening" },
  // The lightweight thirteen (ticket 36). A full version of each is a candidate for a later run; see FUTURE_FEATURES.
  light("aiden", "Aiden Park", "AP", "confident", 10, "3:55 pm", ["q7"]),
  light("mia", "Mia Nguyen", "MN", "low: fractions", 10, "4:02 pm", ["q2", "q7"]),
  light("noah", "Noah Fitzgerald", "NF", "confident", 9, "3:51 pm", ["q3"]),
  light("chloe", "Chloe Abara", "CA", "confident", 10, "3:58 pm", []),
  light("ethan", "Ethan Kowalski", "EK", "low", 8, "4:05 pm", ["q1", "q4", "q9"]),
  light("isla", "Isla Moretti", "IM", "confident", 10, "3:49 pm", ["q10"]),
  light("lucas", "Lucas Tanaka", "LT", "low: discriminant", 10, "4:00 pm", ["q6", "q10"]),
  light("grace", "Grace Okoye", "GO", "confident", 10, "3:47 pm", []),
  light("harper", "Harper Singh", "HS", "confident", 9, "3:57 pm", ["q5"]),
  light("oliver", "Oliver Brennan", "OB", "low: factorising", 7, "4:08 pm", ["q1", "q2", "q3"]),
  light("ruby", "Ruby Castellanos", "RC", "confident", 10, "3:53 pm", ["q9"]),
  light("finn", "Finn Dlamini", "FD", "confident", 10, "3:56 pm", ["q4"]),
  light("sofia", "Sofia Petrov", "SP", "low: fractions", 10, "4:01 pm", ["q2", "q4"]),
];

export const CLASSMATE_MAP = Object.fromEntries(CLASSMATES.map((c) => [c.id, c])) as Record<string, Classmate>;

/** The demo student's mock review group (ticket 08). */
export const GROUPMATE_IDS = ["jordan", "zara", "liam"];

/** The other platform-suggested review groups (ticket 14), static, kept for reporting beside the teacher's seating groups. */
export const OTHER_GROUPS: string[][] = [
  ["priya", "amelia", "tomas"],
  ["aiden", "mia", "sofia", "oliver"],
  ["noah", "chloe", "ethan", "finn"],
  ["isla", "lucas", "grace", "harper", "ruby"],
];

/** Q8's mirrored read, kept for the evaluation table (no classmate makes it in the fixture). */
export const Q8_MIRROR_LINES = Q8_MIRROR;
