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

import type { CategoryId, LeafId } from "./taxonomy";

/** A step or a line is tagged with one or more taxonomy leaves. Confidence is stored, not yet read. */
export interface Tag {
  leaf: LeafId;
  confidence?: number;
}
export const tag = (leaf: LeafId, confidence?: number): Tag => (confidence === undefined ? { leaf } : { leaf, confidence });

/** Five-level status for a leaf, group or category, plus "not seen yet". */
export type Status = "secure" | "solid" | "developing" | "gap" | "unseen";
/** @deprecated alias kept while call sites migrate. */
export type SubskillStatus = Status;

export interface SolutionStep {
  tex: string;
  /** What the step does, in the student's terms. */
  label: string;
  tags: Tag[];
}

/** Figures a problem can show beside its statement. */
export type FigureId = "q8-parabola";

export interface Problem {
  id: string;
  label: string;
  difficulty: Difficulty;
  stem: string;
  tex: string;
  solution: SolutionStep[];
  figure?: FigureId;
}

/** QCAA unit and topic, rendered to the eyebrow by `unitLabel`. */
export interface UnitRef {
  number: 1 | 2 | 3 | 4;
  topic: string;
  title: string;
}

export interface Assignment {
  id: string;
  title: string;
  className: string;
  teacher: string;
  due: string;
  unit: UnitRef;
  intro: string;
  /** Ordered set of core problems. */
  problems: Problem[];
}

/** The three confidence-survey answers from the spec; "low when" names a category the set touches. */
export type Confidence =
  | { level: "confident" }
  | { level: "low-when"; category: CategoryId }
  | { level: "low" };

/** Handwriting: a stroke is the points of one pen-down to pen-up, in pad coordinates. */
export type Point = { x: number; y: number };
export type Stroke = Point[];

/** Where the student is in the closed loop. Each stage is one screen on the iPad. */
export type Stage =
  | "overview"
  | "practice"
  | "confidence"
  | "working"
  | "feedback"
  | "waiting"
  | "frozen"
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

/** A short isolated problem on one leaf: the pre-set warm-up and the mid-set practices. */
export interface PracticeProblem {
  id: string;
  leaf: LeafId;
  stem: string;
  tex: string;
  steps: SolutionStep[];
  /** One friendly line about why this warm-up is worth two minutes. */
  why: string;
  /** One sentence of help that names the move, never the answer. */
  hint: string;
  /** A fresh problem on the same leaf, offered once this one's worked example has been seen. */
  followUp?: PracticeProblem;
}
