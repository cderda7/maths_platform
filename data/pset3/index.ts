import type { FinishedSet } from "../finishedSet";
import { classReviewFrom } from "../recordReview";
import { PS3_ASSIGNMENT, PS3_PATHWAY } from "./assignment";
import { PS3_CLASSMATES, PS3_SAM } from "./classmates";
import { PS3_EVALUATION } from "./evaluation";
import { PS3_CLASS_REVIEW_PICKS } from "./review";

/** Problem Set 3 — Expanding and factorising (ticket 213), as a finished set (ticket 210). */
export const PS3: FinishedSet = {
  fixture: PS3_ASSIGNMENT,
  name: "Problem Set 3 — Expanding and factorising",
  pathway: PS3_PATHWAY,
  sam: PS3_SAM,
  classmates: PS3_CLASSMATES,
  evaluation: PS3_EVALUATION,
  classReview: classReviewFrom(PS3_CLASS_REVIEW_PICKS, [PS3_SAM, ...PS3_CLASSMATES], PS3_ASSIGNMENT.problems),
};
