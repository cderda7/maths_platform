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

import type { LeafId } from "./taxonomy";

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
  /** Not confident when any of these skills is involved: up to seven of the set's most relevant. */
  | { level: "low-when"; leaves: LeafId[] }
  | { level: "low" };

/** Handwriting: a stroke is the points of one pen-down to pen-up, in pad coordinates. */
export type Point = { x: number; y: number };
export type Stroke = Point[];

/** Where the student is in the closed loop. Each stage is one screen on the iPad. */
export type Stage =
  | "overview"
  | "confidence"
  /** The warm-up chooser: pick problems, say it in words, get one warm-up problem. */
  | "warmup-pick"
  | "practice"
  | "working"
  | "feedback"
  | "waiting"
  /** Corrections handed in; waiting for the whole class before group review starts. */
  | "class-wait"
  | "frozen"
  /** Group review on the shared whiteboard. */
  | "group"
  | "report"
  | "peers"
  | "history";

/**
 * The review stages a teacher can put after 1st submit. Order is fixed (individual < group <
 * whole-class), each optional, each at most once; see `lib/pathway.ts`.
 */
export type ReviewStage = "individual" | "group" | "whole-class";
export type Pathway = ReviewStage[];

/** A word in a hint linked to parts of the problem; see `PracticeProblem.hintTerms`. */
export interface HintTerm {
  /** Matched whole-word in the hint, case-insensitively, every occurrence. */
  phrase: string;
  /** When set, the phrase is matched once, inside the first occurrence of this text, instead of as a whole word ("a" inside "4ac"). */
  within?: string;
  /** Fragments of the problem's TeX that light while the word is hovered, each as written there. */
  tex: string[];
  /** While the word is hovered, this TeX is conjured, lit, just before the first whole occurrence of `before`: the unwritten 1 in front of x². */
  insert?: { before: string; tex: string };
}

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
  /**
   * Words in the hint that point at parts of the problem: hovering "constant" lights the 12.
   * Warm-up only; the mid-set practice card shows the hint plain.
   */
  hintTerms?: HintTerm[];
  /** A fresh problem on the same leaf, offered once this one's worked example has been seen. */
  followUp?: PracticeProblem;
}
