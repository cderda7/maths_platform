import type { Assignment, Problem } from "./types";

/**
 * The demo assignment: four problems on the roots of a quadratic, hand-checked. The set is
 * shaped so a scripted run can slip on factorising twice (Q1 then Q2), slip on the null factor
 * law once (Q3), and finish Q4 correctly but unsure. Later tickets build on exactly this shape.
 */
export const PROBLEMS: Problem[] = [
  {
    id: "q1",
    label: "Q1",
    subskill: "roots",
    prereqs: ["factoring"],
    difficulty: "simple familiar",
    stem: "Solve for x.",
    tex: "x^2 - 5x + 6 = 0",
    solution: [
      { tex: "x^2 - 5x + 6 = 0", label: "Standard form", subskill: "algebra" },
      { tex: "(x-2)(x-3) = 0", label: "Factorised", subskill: "factoring" },
      { tex: "x = 2 \\;\\text{or}\\; x = 3", label: "Null factor law", subskill: "roots" },
    ],
  },
  {
    id: "q2",
    label: "Q2",
    subskill: "roots",
    prereqs: ["factoring", "expansion"],
    difficulty: "simple familiar",
    stem: "Solve for x.",
    tex: "2x^2 + 7x - 4 = 0",
    solution: [
      { tex: "2x^2 + 7x - 4 = 0", label: "Standard form", subskill: "algebra" },
      { tex: "ac = -8,\\quad 8 + (-1) = 7", label: "Found the split", subskill: "factoring" },
      { tex: "2x^2 + 8x - x - 4 = 0", label: "Split the middle term", subskill: "factoring" },
      { tex: "2x(x+4) - 1(x+4) = 0", label: "Grouped", subskill: "factoring" },
      { tex: "(2x - 1)(x + 4) = 0", label: "Factorised", subskill: "factoring" },
      { tex: "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4", label: "Null factor law", subskill: "roots" },
    ],
  },
  {
    id: "q3",
    label: "Q3",
    subskill: "roots",
    prereqs: ["expansion", "algebra", "factoring"],
    difficulty: "simple unfamiliar",
    stem: "Find all values of x for which the following holds.",
    tex: "(x - 3)(x + 2) = 6",
    solution: [
      { tex: "x^2 - x - 6 = 6", label: "Expanded first", subskill: "expansion" },
      { tex: "x^2 - x - 12 = 0", label: "Rearranged to standard form", subskill: "algebra" },
      { tex: "(x - 4)(x + 3) = 0", label: "Factorised", subskill: "factoring" },
      { tex: "x = 4 \\;\\text{or}\\; x = -3", label: "Null factor law", subskill: "roots" },
    ],
  },
  {
    id: "q4",
    label: "Q4",
    subskill: "roots",
    prereqs: ["algebra", "fractions"],
    difficulty: "complex familiar",
    stem: "Solve, giving exact values.",
    tex: "3x^2 - 5x - 1 = 0",
    solution: [
      { tex: "a = 3,\\; b = -5,\\; c = -1", label: "Identified a, b, c", subskill: "algebra" },
      { tex: "b^2 - 4ac = 25 + 12 = 37", label: "Discriminant", subskill: "roots" },
      { tex: "x = \\dfrac{5 \\pm \\sqrt{37}}{6}", label: "Quadratic formula", subskill: "fractions" },
    ],
  },
];

export const PROBLEM_MAP = Object.fromEntries(PROBLEMS.map((p) => [p.id, p])) as Record<string, Problem>;

export const ASSIGNMENT: Assignment = {
  id: "set-3",
  title: "Roots of a quadratic — Set 3",
  className: "11 Methods B",
  teacher: "Ms Okafor",
  due: "Thu 10 Sep",
  unit: "Unit 1 · Topic 2 · Functions and graphs",
  intro: "Four problems on finding where a quadratic crosses the x-axis. Each one leans on a couple of skills you already have.",
  problems: PROBLEMS,
};

/** The one student the demo follows. */
export const DEMO_STUDENT = { id: "sam", name: "Sam Okonkwo", initials: "SO" };
