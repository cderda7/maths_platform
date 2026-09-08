import type { Subskill, SubskillId } from "./types";

export const SUBSKILLS: Subskill[] = [
  {
    id: "algebra",
    name: "Rearranging & standard form",
    short: "Algebra",
    description: "Collecting like terms, moving everything to one side, and recognising ax² + bx + c = 0.",
  },
  {
    id: "fractions",
    name: "Working with fractions",
    short: "Fractions",
    description: "Clearing denominators, simplifying fractional coefficients, and leaving roots in exact form.",
  },
  {
    id: "factoring",
    name: "Factorising quadratics",
    short: "Factorising",
    description: "Monic and non-monic trinomials, and checking factors by expanding back.",
  },
  {
    id: "expansion",
    name: "Binomial expansion",
    short: "Expansion",
    description: "Expanding (x + a)(x + b), and using expansion to check a factorisation.",
  },
  {
    id: "graphing",
    name: "Reading the graph",
    short: "Graphing",
    description: "x-intercepts as roots, the vertex, and what the discriminant says about how many crossings there are.",
  },
  {
    id: "roots",
    name: "Finding the roots of a quadratic",
    short: "Roots",
    description: "Choosing and carrying out a method — factorising, the quadratic formula or completing the square — and interpreting the result.",
  },
];

export const SUBSKILL_MAP = Object.fromEntries(SUBSKILLS.map((s) => [s.id, s])) as Record<SubskillId, Subskill>;

/** The five prerequisite subskills, in the order the teacher view shows them. */
export const PREREQ_IDS: SubskillId[] = ["algebra", "fractions", "factoring", "expansion", "graphing"];

/** The target skill. */
export const TARGET_ID: SubskillId = "roots";
