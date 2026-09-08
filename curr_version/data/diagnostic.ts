import type { SubskillId } from "./types";

/** A live multiple-choice diagnostic the teacher can push to the class mid-assignment. */
export interface Diagnostic {
  id: string;
  subskill: SubskillId;
  stem: string;
  tex: string;
  options: { id: string; tex: string }[];
  correct: string;
  /** Why the teacher might push it, shown on the teacher side only. */
  why: string;
}

export const DIAGNOSTICS: Diagnostic[] = [
  {
    id: "d-factor-check",
    subskill: "factoring",
    stem: "Which of these is a factorisation of",
    tex: "2x^2 + 7x - 4",
    options: [
      { id: "a", tex: "(2x + 4)(x - 1)" },
      { id: "b", tex: "(2x - 1)(x + 4)" },
      { id: "c", tex: "(2x + 1)(x - 4)" },
      { id: "d", tex: "(x + 4)(x - 1)" },
    ],
    correct: "b",
    why: "Separates students who expand back to check from those who guess a pair that looks right.",
  },
];

export const DIAGNOSTIC_MAP = Object.fromEntries(DIAGNOSTICS.map((d) => [d.id, d])) as Record<string, Diagnostic>;
