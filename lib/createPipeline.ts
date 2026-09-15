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

/**
 * A kind of set the create flow makes: an in-class problem set ("+In-Class PSet", ticket 288) or a homework
 * ("+Homework", ticket 291). Each has its own draft and review in the classroom (`draftFor`, `reviewStateFor`), its own
 * routes (`CREATE_ROUTES`) and its own pipeline.
 */
export type CreateKind = "pset" | "homework";

export const CREATE_KINDS: readonly CreateKind[] = ["pset", "homework"];

export type StepName = "questions" | "difficulty" | "assessment" | "pathway" | "send";

export type PipelineStep = { id: StepName; label: string };

const QUESTIONS: PipelineStep = { id: "questions", label: "Questions" };
const DIFFICULTY: PipelineStep = { id: "difficulty", label: "Difficulty" };
const REFINE: PipelineStep = { id: "assessment", label: "Refine" };
const PATHWAY: PipelineStep = { id: "pathway", label: "Pathway" };
const SEND: PipelineStep = { id: "send", label: "Send" };

export const PIPELINES: Record<CreateKind, readonly PipelineStep[]> = {
  pset: [QUESTIONS, DIFFICULTY, REFINE, PATHWAY, SEND],
  // Homework (ticket 291): the teacher's ten everyone does. No New skills, no pathway, no groups: Refine's last button creates.
  homework: [QUESTIONS, DIFFICULTY, REFINE, SEND],
};

/**
 * Each kind's two routes: Questions (blank until generated) and the review steps after it. Homework's are its own, so a
 * PSet draft and a homework draft never share a page, and the same components serve both (`kind` from the route).
 */
export const CREATE_ROUTES: Record<CreateKind, { questions: string; review: string }> = {
  pset: { questions: "/teacher/assignments/create", review: "/teacher/assignments/create/review" },
  homework: { questions: "/teacher/homework/create", review: "/teacher/homework/create/review" },
};

/** The step after Refine's recommendations: the pathway for an in-class set; homework has none, so its Refine creates. */
export const hasPathway = (kind: CreateKind): boolean => PIPELINES[kind].some((s) => s.id === "pathway");

/**
 * The assessing bar's length from the review route's `?assess=<ms>` (the browser sweeps pass 300): anything missing or
 * invalid runs `fallback`, and never under 100 ms.
 */
export function assessMsFrom(raw: string | string[] | undefined, fallback: number): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v !== undefined && /^\d+$/.test(v) ? Math.max(100, Number(v)) : fallback;
}

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
