import type { FinishedSet } from "../finishedSet";
import { PS1_ASSIGNMENT, PS1_PATHWAY } from "./assignment";
import { PS1_CLASSMATES, PS1_SAM } from "./classmates";
import { PS1_EVALUATION } from "./evaluation";

/** Problem Set 1 — Surds (ticket 211), a finished set on the class's default seating. */
export const PS1: FinishedSet = {
  fixture: PS1_ASSIGNMENT,
  name: "Problem Set 1 — Surds",
  pathway: PS1_PATHWAY,
  sam: PS1_SAM,
  classmates: PS1_CLASSMATES,
  evaluation: PS1_EVALUATION,
};
