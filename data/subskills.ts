import type { Subskill, SubskillId } from "./types";

export const SUBSKILLS: Subskill[] = [
  {
    id: "algebra",
    name: "Rearranging & standard form",
    short: "Algebra",
    description:
      "Collecting like terms, moving everything to one side, and recognising ax² + bx + c = 0.",
    invitation: "a quick rearranging warm-up",
  },
  {
    id: "fractions",
    name: "Working with fractions",
    short: "Fractions",
    description:
      "Clearing denominators, simplifying fractional coefficients, and leaving roots in exact form.",
    invitation: "a short one on fractions",
  },
  {
    id: "factoring",
    name: "Factorising quadratics",
    short: "Factorising",
    description:
      "Monic and non-monic trinomials, difference of two squares, and checking factors by expanding back.",
    invitation: "a factorising warm-up",
  },
  {
    id: "expansion",
    name: "Binomial expansion",
    short: "Expansion",
    description:
      "Expanding (x + a)(x + b) and (x + a)², and using expansion to check a factorisation.",
    invitation: "a quick expansion check",
  },
  {
    id: "graphing",
    name: "Reading the graph",
    short: "Graphing",
    description:
      "x-intercepts as roots, the vertex, and what the discriminant says about how many times the parabola crosses.",
    invitation: "a look at the graph first",
  },
  {
    id: "roots",
    name: "Finding the roots of a quadratic",
    short: "Roots",
    description:
      "Choosing and carrying out a method — factorising, quadratic formula or completing the square — and interpreting the result.",
    invitation: "another roots problem",
  },
];

export const SUBSKILL_MAP = Object.fromEntries(SUBSKILLS.map((s) => [s.id, s])) as Record<
  SubskillId,
  Subskill
>;

export const PREREQ_IDS: SubskillId[] = ["algebra", "fractions", "factoring", "expansion", "graphing"];
