export type Difficulty =
  | "simple familiar"
  | "simple unfamiliar"
  | "complex familiar"
  | "complex unfamiliar";

export type SubskillId =
  | "algebra"
  | "fractions"
  | "factoring"
  | "expansion"
  | "graphing"
  | "roots";

export interface Subskill {
  id: SubskillId;
  name: string;
  short: string;
  description: string;
  /** Plain-language phrasing used when nudging a student toward it. */
  invitation: string;
}

export type ProblemKind = "core" | "prereq";

export interface SolutionStep {
  tex: string;
  note: string;
  /** What the step does, in the student's terms — shown in the margin of a step trace. */
  label: string;
  subskill: SubskillId;
}

/**
 * A line students commonly write that doesn't hold (slip) or holds without justification (shaky).
 * The simulated evaluator recognises these so a live attempt gets the same quality of note as a
 * scripted one. `then` lists lines that are correct *given* the misstep — they are marked sound
 * with a "built on the line above" note.
 */
export interface Misstep {
  tex: string;
  marker: "slip" | "shaky";
  label: string;
  subskill: SubskillId;
  note: string;
  then?: { tex: string; label: string; subskill: SubskillId }[];
}

export interface Problem {
  id: string;
  label: string;
  kind: ProblemKind;
  subskill: SubskillId;
  prereqs: SubskillId[];
  difficulty: Difficulty;
  stem: string;
  tex?: string;
  context?: string;
  minutes: number;
  solution: SolutionStep[];
  /** Where students most often go wrong — surfaced to the teacher at creation. */
  stumble: string;
  /** Why the system tagged it with this difficulty. */
  difficultyWhy: string;
  /** One line said when this problem is offered as the next step. */
  lead?: string;
  missteps?: Misstep[];
}

export type MarkerKind = "sound" | "shaky" | "slip" | "unclear";

export interface EvalStep {
  tex: string;
  marker: MarkerKind;
  /** What the step is doing, in the student's own terms. */
  label: string;
  /** Feedback for that step, if any. */
  note?: string;
  subskill?: SubskillId;
}

export type SubskillStatus = "sound" | "shaky" | "slip" | "unseen";

export interface NextStep {
  kind: "advance" | "sidestep" | "stretch" | "finish";
  title: string;
  body: string;
  targetProblemId?: string;
  reason?: string;
}

export interface Evaluation {
  problemId: string;
  steps: EvalStep[];
  summary: string;
  exercised: { id: SubskillId; status: SubskillStatus; note: string }[];
  next: NextStep;
  /** Live attempts only: whether the working reached the final line of the solution. */
  reached?: boolean;
}

export type Confidence = "not sure" | "a bit unsure" | "fairly sure" | "certain";

export interface FlowStage {
  problemId: string;
  evaluation: Evaluation;
  /** The confidence this sample student would pick, used to preselect. */
  confidence: Confidence;
}

export type GapStatus = "secure" | "developing" | "gap" | "unseen";

export interface Student {
  id: string;
  name: string;
  initials: string;
  subskills: Record<SubskillId, GapStatus>;
  confidenceSignal: "calibrated" | "over" | "under" | "mixed";
  confidenceNote: string;
  lastActive: string;
  progress: { done: number; total: number };
  flag?: string;
}
