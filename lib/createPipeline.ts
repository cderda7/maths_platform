/**
 * The create flow's pipeline, as the strip under the title names it (ticket 288): which steps a kind of set goes
 * through, in order, and which one the teacher is on. Data, so a kind with a different pipeline is one more entry
 * (ticket 291's homework: Questions, Difficulty, Refine, Send, no Pathway) rather than a new strip.
 *
 * Send is not a page. It is always the last label, and lights for `SEND_LIGHT_MS` when Create is pressed, before
 * the page moves on. The step ids are the flow's internal names: Refine is still `assessment` inside (the assessing
 * run and its recommendations), only its label changed.
 */

import type { ReviewStep } from "./review";

/** A kind of set the create flow makes. Ticket 291 adds `"homework"`. */
export type CreateKind = "pset";

export type StepName = "questions" | "difficulty" | "assessment" | "pathway" | "send";

export type PipelineStep = { id: StepName; label: string };

const QUESTIONS: PipelineStep = { id: "questions", label: "Questions" };
const DIFFICULTY: PipelineStep = { id: "difficulty", label: "Difficulty" };
const REFINE: PipelineStep = { id: "assessment", label: "Refine" };
const PATHWAY: PipelineStep = { id: "pathway", label: "Pathway" };
const SEND: PipelineStep = { id: "send", label: "Send" };

export const PIPELINES: Record<CreateKind, readonly PipelineStep[]> = {
  pset: [QUESTIONS, DIFFICULTY, REFINE, PATHWAY, SEND],
};

/** How long Send stays lit after Create is pressed, before the set is sent and the page moves on. */
export const SEND_LIGHT_MS = 600;

/**
 * The step the strip marks current: Send while Create's light runs, Refine through the assessing run and its
 * recommendations, else the review's own step.
 */
export function currentStep({ step, assessing, sending }: { step: ReviewStep; assessing: boolean; sending: boolean }): StepName {
  if (sending) return "send";
  if (assessing || step === "recommendations") return "assessment";
  return step;
}
