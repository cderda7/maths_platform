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
}

const st = (a: SubskillStatus, f: SubskillStatus, fa: SubskillStatus, e: SubskillStatus, g: SubskillStatus, r: SubskillStatus): Record<SubskillId, SubskillStatus> => ({
  algebra: a,
  fractions: f,
  factoring: fa,
  expansion: e,
  graphing: g,
  roots: r,
});

export const CLASSMATES: Classmate[] = [
  { id: "priya", name: "Priya Raman", initials: "PR", statuses: st("secure", "secure", "secure", "secure", "unseen", "secure"), confidence: "confident", done: 4, when: "4:12 pm", wrong: [] },
  { id: "jordan", name: "Jordan Whitlock", initials: "JW", statuses: st("secure", "unseen", "developing", "secure", "unseen", "developing"), confidence: "confident", done: 3, when: "3:48 pm", wrong: ["q2"], note: "Non-monic factorising: factors not checked by expanding." },
  { id: "amelia", name: "Amelia Chen", initials: "AC", statuses: st("secure", "secure", "secure", "secure", "unseen", "secure"), confidence: "low", done: 4, when: "2:30 pm", wrong: [] },
  { id: "tomas", name: "Tomas Reyes", initials: "TR", statuses: st("developing", "gap", "secure", "secure", "unseen", "developing"), confidence: "low: fractions", done: 3, when: "Yesterday", wrong: ["q3", "q4"], note: "Cleared the denominator on one side only in Q4." },
  { id: "zara", name: "Zara Haddad", initials: "ZH", statuses: st("secure", "developing", "secure", "secure", "unseen", "developing"), confidence: "confident", done: 4, when: "1:05 pm", wrong: ["q3"], note: "Applied the null factor law to (x − 3)(x + 2) = 6 without rearranging." },
  { id: "liam", name: "Liam O'Connell", initials: "LO", statuses: st("gap", "developing", "developing", "gap", "unseen", "developing"), confidence: "confident", done: 2, when: "9:40 am", wrong: ["q2", "q3"], note: "Guessed a factor pair without expanding back." },
];

export const CLASSMATE_MAP = Object.fromEntries(CLASSMATES.map((c) => [c.id, c])) as Record<string, Classmate>;

/** The demo student's mock review group (ticket 08). */
export const GROUPMATE_IDS = ["jordan", "zara", "liam"];
