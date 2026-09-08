import type { SubskillId, SubskillStatus } from "./types";

/**
 * Static classmates so the demo student's live row sits in a believable class. Their statuses
 * never change. Three of them (`groupmates`) are also the mock review group in ticket 08, with
 * pre-set wrong-problem sets chosen so the all-correct intersection and the union of wrongs are
 * both non-empty and different.
 */
export interface Classmate {
  id: string;
  name: string;
  initials: string;
  statuses: Record<SubskillId, SubskillStatus>;
  confidence: "confident" | "low" | `low: ${string}`;
  /** Problems finished, out of four. */
  done: number;
  when: string;
  /** Problem ids this classmate got wrong. */
  wrong: string[];
  note?: string;
  /** Their recognised working on the problems they got wrong, for the teacher's mistake view. */
  attempts: Record<string, string[]>;
}

const Q2_GUESSED = ["2x^2 + 7x - 4 = 0", "(2x + 4)(x - 1) = 0", "x = -2 \\;\\text{or}\\; x = 1"];
const Q3_NFL = ["(x - 3)(x + 2) = 6", "x - 3 = 6 \\;\\text{or}\\; x + 2 = 6", "x = 9 \\;\\text{or}\\; x = 4"];
const Q4_OVER_A = ["a = 3,\\; b = -5,\\; c = -1", "b^2 - 4ac = 25 + 12 = 37", "x = \\dfrac{5 \\pm \\sqrt{37}}{3}"];

const st = (a: SubskillStatus, f: SubskillStatus, fa: SubskillStatus, e: SubskillStatus, g: SubskillStatus, r: SubskillStatus): Record<SubskillId, SubskillStatus> => ({
  algebra: a,
  fractions: f,
  factoring: fa,
  expansion: e,
  graphing: g,
  roots: r,
});

export const CLASSMATES: Classmate[] = [
  { id: "priya", name: "Priya Raman", initials: "PR", statuses: st("secure", "secure", "secure", "secure", "unseen", "secure"), confidence: "confident", done: 4, when: "4:12 pm", wrong: [], attempts: {} },
  { id: "jordan", name: "Jordan Whitlock", initials: "JW", statuses: st("secure", "unseen", "developing", "secure", "unseen", "developing"), confidence: "confident", done: 3, when: "3:48 pm", wrong: ["q2"], note: "Non-monic factorising: factors not checked by expanding.", attempts: { q2: Q2_GUESSED } },
  { id: "amelia", name: "Amelia Chen", initials: "AC", statuses: st("secure", "secure", "secure", "secure", "unseen", "secure"), confidence: "low", done: 4, when: "2:30 pm", wrong: [], attempts: {} },
  { id: "tomas", name: "Tomas Reyes", initials: "TR", statuses: st("developing", "gap", "secure", "secure", "unseen", "developing"), confidence: "low: fractions", done: 3, when: "Yesterday", wrong: ["q3", "q4"], note: "Divided by a instead of 2a in the quadratic formula.", attempts: { q3: Q3_NFL, q4: Q4_OVER_A } },
  { id: "zara", name: "Zara Haddad", initials: "ZH", statuses: st("secure", "developing", "secure", "secure", "unseen", "developing"), confidence: "confident", done: 4, when: "1:05 pm", wrong: ["q3"], note: "Applied the null factor law to (x − 3)(x + 2) = 6 without rearranging.", attempts: { q3: Q3_NFL } },
  { id: "liam", name: "Liam O'Connell", initials: "LO", statuses: st("gap", "developing", "developing", "gap", "unseen", "developing"), confidence: "confident", done: 2, when: "9:40 am", wrong: ["q2", "q3"], note: "Guessed a factor pair without expanding back.", attempts: { q2: Q2_GUESSED, q3: Q3_NFL } },
];

export const CLASSMATE_MAP = Object.fromEntries(CLASSMATES.map((c) => [c.id, c])) as Record<string, Classmate>;

/** The demo student's mock review group (ticket 08). */
export const GROUPMATE_IDS = ["jordan", "zara", "liam"];
