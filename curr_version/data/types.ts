/**
 * Vocabulary for the closed-loop demo. Everything here is static fixture data; there is no
 * backend. Rationale for the words lives in DECISION_LOG.md at the repo root.
 */

/** QCE degree-of-difficulty categories. */
export type Difficulty =
  | "simple familiar"
  | "simple unfamiliar"
  | "complex familiar"
  | "complex unfamiliar";

/** The one skill the assignment targets plus the five prerequisite subskills it leans on. */
export type SubskillId = "algebra" | "fractions" | "factoring" | "expansion" | "graphing" | "roots";

export interface Subskill {
  id: SubskillId;
  name: string;
  short: string;
  description: string;
}

/** Status the teacher (and, symmetrically, the student's final report) sees per subskill. */
export type SubskillStatus = "secure" | "developing" | "gap" | "unseen";

export interface SolutionStep {
  tex: string;
  /** What the step does, in the student's terms. */
  label: string;
  subskill: SubskillId;
}

export interface Problem {
  id: string;
  label: string;
  /** The skill this problem is really about. */
  subskill: SubskillId;
  /** Prerequisite subskills the working will lean on. */
  prereqs: SubskillId[];
  difficulty: Difficulty;
  stem: string;
  tex: string;
  solution: SolutionStep[];
}

export interface Assignment {
  id: string;
  title: string;
  className: string;
  teacher: string;
  due: string;
  unit: string;
  intro: string;
  /** Ordered set of core problems. */
  problems: Problem[];
}

/** The three confidence-survey answers from the spec. */
export type Confidence =
  | { level: "confident" }
  | { level: "low-when"; subskill: SubskillId }
  | { level: "low" };

/** Where the student is in the closed loop. Each stage is one screen on the iPad. */
export type Stage =
  | "overview"
  | "practice"
  | "confidence"
  | "working"
  | "feedback"
  | "waiting"
  | "rework"
  | "group-pass"
  | "group-discuss"
  | "report"
  | "peers"
  | "history";

/**
 * The review stages a teacher can put after 1st submit. Order is fixed (individual < group <
 * whole-class), each optional, each at most once; see `lib/pathway.ts`.
 */
export type ReviewStage = "individual" | "group" | "whole-class";
export type Pathway = ReviewStage[];

/** A short warm-up offered before the set, one per prerequisite subskill it makes sense for. */
export interface PracticeProblem {
  id: string;
  subskill: SubskillId;
  stem: string;
  tex: string;
  steps: SolutionStep[];
  /** One friendly line about why this warm-up is worth two minutes. */
  why: string;
}
