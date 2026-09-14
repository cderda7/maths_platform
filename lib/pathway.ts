import type { Pathway, ReviewStage, Stage } from "@/data/types";

/**
 * The review pathway: which review stages follow 1st submit, in a fixed order, each optional,
 * each at most once. Eight pathways fall out of the rule (including submit-only), so nothing is
 * enumerated by hand: the creation line asks `togglePathway`, the student flow asks `nextStage`.
 */
export const REVIEW_ORDER: ReviewStage[] = ["individual", "group", "whole-class"];

/** The demo's pipeline, used whenever no assignment has been created: individual, then group, then class review (ticket 278, the user's 14a). A new set on Create starts undecided (`initialReview`, ticket 246). */
export const DEFAULT_PATHWAY: Pathway = ["individual", "group", "whole-class"];

export function isValidPathway(p: readonly ReviewStage[]): boolean {
  let last = -1;
  for (const s of p) {
    const i = REVIEW_ORDER.indexOf(s);
    if (i < 0 || i <= last) return false;
    last = i;
  }
  return true;
}

/**
 * One stop on the creation line switched on or off (ticket 246), the result kept in `REVIEW_ORDER`. `null` is
 * undecided: switching the last stop off goes back to it, since No review is only ever picked by its own button.
 */
export function togglePathway(p: readonly ReviewStage[] | null, stage: ReviewStage): Pathway | null {
  const on = p ?? [];
  const next = REVIEW_ORDER.filter((s) => (s === stage ? !on.includes(s) : on.includes(s)));
  return next.length ? next : null;
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
/** The grey line under a stop on the creation line (tickets 239, 246). */
export const STAGE_DESCRIPTION: Record<ReviewStage, string> = {
  individual: "students find and fix their own mistakes",
  group: "groups compare answers and fix mistakes together",
  "whole-class": "you lead the class through anonymous examples on the board",
};
export const STAGE_SHORT:Record<ReviewStage, string> = { individual: "indiv review", group: "group review", "whole-class": "class review" };

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
