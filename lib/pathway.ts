import type { Pathway, ReviewStage, Stage } from "@/data/types";

/**
 * The review pathway: which review stages follow 1st submit, in a fixed order, each optional,
 * each at most once. Eight pathways fall out of the rule (including submit-only), so nothing is
 * enumerated by hand: the creation map asks `successors`, the student flow asks `nextStage`.
 */
export const REVIEW_ORDER: ReviewStage[] = ["individual", "group", "whole-class"];

/** The build's original pipeline, used whenever no assignment has been created. */
export const DEFAULT_PATHWAY: Pathway = ["individual", "group"];

export function isValidPathway(p: readonly ReviewStage[]): boolean {
  let last = -1;
  for (const s of p) {
    const i = REVIEW_ORDER.indexOf(s);
    if (i < 0 || i <= last) return false;
    last = i;
  }
  return true;
}

/** Stages that may legally follow `prefix`: everything later in the order than its last stage. */
export function successors(prefix: readonly ReviewStage[]): ReviewStage[] {
  const last = prefix.length ? REVIEW_ORDER.indexOf(prefix[prefix.length - 1]) : -1;
  return REVIEW_ORDER.slice(last + 1);
}

/** Every valid pathway, shortest first. */
export function allPathways(): Pathway[] {
  const out: Pathway[] = [];
  const n = REVIEW_ORDER.length;
  for (let mask = 0; mask < 1 << n; mask++) out.push(REVIEW_ORDER.filter((_, i) => mask & (1 << i)));
  return out.sort((a, b) => a.length - b.length);
}

/** The three moments the student flow consults the pathway. */
export type Transition = "handed-in" | "reworked" | "group-done";

/** Group review is entered through the class-wait gate: the whole class starts it together (ticket 39). */
const ENTRY: Record<ReviewStage, Stage> = { individual: "feedback", group: "class-wait", "whole-class": "waiting" };

/** The student stage after a transition under a pathway. `report` when nothing is left. */
export function nextStage(pathway: readonly ReviewStage[], from: Transition): Stage {
  const done: ReviewStage | null = from === "handed-in" ? null : from === "reworked" ? "individual" : "group";
  const i = done ? pathway.indexOf(done) : -1;
  const next = pathway[i + 1];
  return next ? ENTRY[next] : "report";
}

export const STAGE_WORD: Record<ReviewStage, string> = { individual: "individual review", group: "group review", "whole-class": "class review" };
export const STAGE_SHORT: Record<ReviewStage, string> = { individual: "indiv review", group: "group review", "whole-class": "class review" };

/** "individual working → individual review → group review → done" */
export function pathwaySentence(p: readonly ReviewStage[]): string {
  return ["individual working", ...p.map((s) => STAGE_WORD[s]), "done"].join(" → ");
}

/** "indiv working → indiv review → group review" for the chip (the class view's card, ticket 129). */
export function pathwayChip(p: readonly ReviewStage[]): string {
  return ["indiv working", ...p.map((s) => STAGE_SHORT[s])].join(" → ");
}

const TOKENS: Record<string, ReviewStage> = {
  individual: "individual", indiv: "individual", i: "individual",
  group: "group", g: "group",
  "whole-class": "whole-class", wc: "whole-class", w: "whole-class", class: "whole-class",
};

/** Deep-link form: `indiv,group`, `wc`, `group,wc`, `none`. Null when absent or invalid. */
export function parsePathway(raw: string | undefined | null): Pathway | null {
  if (raw === undefined || raw === null) return null;
  const parts = raw.split(/[,+>\s]+/).map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (parts.length === 0 || (parts.length === 1 && (parts[0] === "none" || parts[0] === "submit"))) return [];
  const stages: ReviewStage[] = [];
  for (const t of parts) {
    const s = TOKENS[t];
    if (!s) return null;
    stages.push(s);
  }
  return isValidPathway(stages) ? stages : null;
}
