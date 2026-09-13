import { tag, type Assignment, type Pathway, type Problem } from "../types";

/**
 * Problem Set 1 — Surds (ticket 211): the class's first set of the unit, due Tue 25 Aug, finished and
 * reviewed. Ten problems on simplifying surds and operating with them: take the largest square factor out
 * (Q1, Q2), simplify before collecting like surds (Q3, Q4), multiply under one root and simplify what
 * comes out (Q5, Q6), divide numbers by numbers and roots by roots (Q7), expand a bracket with a surd in
 * it (Q8), solve a linear equation whose coefficients are surds (Q9), and a square tile whose side and
 * diagonal are left exact (Q10). Hand-checked; surds are the set's New skills, so their evidence rolls up
 * under New skills on this set (ticket 209), and the collecting, index, fraction and expansion steps
 * under Algebra.
 *
 * Every line is written out whole (no line starts with "="), so each is a key in the evaluation table.
 * Ids are `ps1-q1` … `ps1-q10` (labels Q1 … Q10). Teacher-side only: nothing here reaches a student screen
 * or a hint box.
 */
export const PS1_PROBLEMS: Problem[] = [
  {
    id: "ps1-q1",
    label: "Q1",
    difficulty: "simple familiar",
    stem: "Simplify.",
    tex: "\\sqrt{48}",
    solution: [
      { tex: "\\sqrt{48} = \\sqrt{16 \\times 3}", label: "Largest square factor", tags: [tag("algebra.number.surds")] },
      { tex: "\\sqrt{16 \\times 3} = 4\\sqrt{3}", label: "Took its root out", tags: [tag("algebra.number.surds")] },
    ],
  },
  {
    id: "ps1-q2",
    label: "Q2",
    difficulty: "simple familiar",
    stem: "Simplify.",
    tex: "3\\sqrt{50}",
    solution: [
      { tex: "3\\sqrt{50} = 3\\sqrt{25 \\times 2}", label: "Largest square factor", tags: [tag("algebra.number.surds")] },
      { tex: "3\\sqrt{25 \\times 2} = 3 \\times 5\\sqrt{2}", label: "Took its root out", tags: [tag("algebra.number.surds")] },
      { tex: "3 \\times 5\\sqrt{2} = 15\\sqrt{2}", label: "Simplified", tags: [tag("algebra.number.surds")] },
    ],
  },
  {
    id: "ps1-q3",
    label: "Q3",
    difficulty: "simple familiar",
    stem: "Simplify, then collect like surds.",
    tex: "\\sqrt{12} + \\sqrt{27}",
    solution: [
      { tex: "\\sqrt{12} = 2\\sqrt{3},\\; \\sqrt{27} = 3\\sqrt{3}", label: "Simplified each surd", tags: [tag("algebra.number.surds")] },
      { tex: "\\sqrt{12} + \\sqrt{27} = 2\\sqrt{3} + 3\\sqrt{3}", label: "Rewrote the sum", tags: [tag("algebra.number.surds")] },
      { tex: "2\\sqrt{3} + 3\\sqrt{3} = 5\\sqrt{3}", label: "Collected like surds", tags: [tag("algebra.equations.linear"), tag("algebra.number.surds")] },
    ],
  },
  {
    id: "ps1-q4",
    label: "Q4",
    difficulty: "simple familiar",
    stem: "Simplify, then collect like surds.",
    tex: "2\\sqrt{18} - \\sqrt{8}",
    solution: [
      { tex: "2\\sqrt{18} = 2 \\times 3\\sqrt{2} = 6\\sqrt{2}", label: "Simplified 2√18", tags: [tag("algebra.number.surds")] },
      { tex: "\\sqrt{8} = 2\\sqrt{2}", label: "Simplified √8", tags: [tag("algebra.number.surds")] },
      { tex: "2\\sqrt{18} - \\sqrt{8} = 6\\sqrt{2} - 2\\sqrt{2}", label: "Rewrote the difference", tags: [tag("algebra.number.surds")] },
      { tex: "6\\sqrt{2} - 2\\sqrt{2} = 4\\sqrt{2}", label: "Collected like surds", tags: [tag("algebra.equations.linear"), tag("algebra.number.surds")] },
    ],
  },
  {
    id: "ps1-q5",
    label: "Q5",
    difficulty: "simple familiar",
    stem: "Multiply and simplify.",
    tex: "\\sqrt{6} \\times \\sqrt{10}",
    solution: [
      { tex: "\\sqrt{6} \\times \\sqrt{10} = \\sqrt{60}", label: "Multiplied under one root", tags: [tag("algebra.number.indices"), tag("algebra.number.surds")] },
      { tex: "\\sqrt{60} = \\sqrt{4 \\times 15}", label: "Largest square factor", tags: [tag("algebra.number.surds")] },
      { tex: "\\sqrt{4 \\times 15} = 2\\sqrt{15}", label: "Took its root out", tags: [tag("algebra.number.surds")] },
    ],
  },
  {
    id: "ps1-q6",
    label: "Q6",
    difficulty: "simple unfamiliar",
    stem: "Multiply and simplify.",
    tex: "2\\sqrt{3} \\times 5\\sqrt{6}",
    solution: [
      { tex: "2\\sqrt{3} \\times 5\\sqrt{6} = 2 \\times 5 \\times \\sqrt{3 \\times 6}", label: "Numbers together, roots together", tags: [tag("algebra.number.indices")] },
      { tex: "2 \\times 5 \\times \\sqrt{3 \\times 6} = 10\\sqrt{18}", label: "Multiplied", tags: [tag("algebra.number.indices"), tag("algebra.number.surds")] },
      { tex: "10\\sqrt{18} = 10 \\times 3\\sqrt{2}", label: "Simplified √18", tags: [tag("algebra.number.surds")] },
      { tex: "10 \\times 3\\sqrt{2} = 30\\sqrt{2}", label: "Simplified", tags: [tag("algebra.number.surds")] },
    ],
  },
  {
    id: "ps1-q7",
    label: "Q7",
    difficulty: "simple unfamiliar",
    stem: "Divide and simplify.",
    tex: "6\\sqrt{10} \\div 2\\sqrt{5}",
    solution: [
      { tex: "6\\sqrt{10} \\div 2\\sqrt{5} = \\dfrac{6\\sqrt{10}}{2\\sqrt{5}}", label: "Wrote it as a fraction", tags: [tag("algebra.number.fractions")] },
      { tex: "\\dfrac{6\\sqrt{10}}{2\\sqrt{5}} = \\dfrac{6}{2} \\times \\sqrt{\\dfrac{10}{5}}", label: "Numbers by numbers, roots by roots", tags: [tag("algebra.number.fractions"), tag("algebra.number.surds")] },
      { tex: "\\dfrac{6}{2} \\times \\sqrt{\\dfrac{10}{5}} = 3\\sqrt{2}", label: "Simplified", tags: [tag("algebra.number.fractions"), tag("algebra.number.surds")] },
    ],
  },
  {
    id: "ps1-q8",
    label: "Q8",
    difficulty: "complex familiar",
    stem: "Expand and simplify.",
    tex: "\\sqrt{2}(3 + \\sqrt{8})",
    solution: [
      { tex: "\\sqrt{2}(3 + \\sqrt{8}) = \\sqrt{2} \\times 3 + \\sqrt{2} \\times \\sqrt{8}", label: "√2 into both terms", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "\\sqrt{2} \\times 3 + \\sqrt{2} \\times \\sqrt{8} = 3\\sqrt{2} + \\sqrt{16}", label: "Multiplied each term", tags: [tag("algebra.expand-factor.expand"), tag("algebra.number.surds")] },
      { tex: "3\\sqrt{2} + \\sqrt{16} = 3\\sqrt{2} + 4", label: "Simplified √16", tags: [tag("algebra.number.surds"), tag("algebra.expand-factor.expand")] },
    ],
  },
  {
    id: "ps1-q9",
    label: "Q9",
    difficulty: "complex familiar",
    stem: "Solve for x, leaving the answer exact.",
    tex: "x\\sqrt{3} = \\sqrt{75} - \\sqrt{12}",
    solution: [
      { tex: "\\sqrt{75} = 5\\sqrt{3},\\; \\sqrt{12} = 2\\sqrt{3}", label: "Simplified each surd", tags: [tag("algebra.number.surds")] },
      { tex: "x\\sqrt{3} = 5\\sqrt{3} - 2\\sqrt{3}", label: "Rewrote the right side", tags: [tag("algebra.number.surds"), tag("algebra.equations.linear")] },
      { tex: "x\\sqrt{3} = 3\\sqrt{3}", label: "Collected like surds", tags: [tag("algebra.equations.linear"), tag("algebra.number.surds")] },
      { tex: "x = \\dfrac{3\\sqrt{3}}{\\sqrt{3}}", label: "Divided both sides by √3", tags: [tag("algebra.equations.linear"), tag("algebra.number.fractions")] },
      { tex: "x = 3", label: "Solved", tags: [tag("algebra.number.fractions"), tag("algebra.number.surds")] },
    ],
  },
  {
    id: "ps1-q10",
    label: "Q10",
    difficulty: "complex unfamiliar",
    stem: "A square tile has an area of 72 cm². Find the length of its side and of its diagonal, leaving both exact.",
    tex: "\\text{Area} = 72\\text{ cm}^2",
    answerAs: "sentence",
    solution: [
      { tex: "s^2 = 72", label: "Area as the side squared", tags: [tag("reasoning.interpret.worded")] },
      { tex: "s = \\sqrt{72} = \\sqrt{36 \\times 2} = 6\\sqrt{2}", label: "Side length", tags: [tag("reasoning.interpret.worded"), tag("algebra.number.surds")] },
      { tex: "d^2 = s^2 + s^2 = 72 + 72 = 144", label: "Pythagoras on the diagonal", tags: [tag("reasoning.interpret.worded")] },
      { tex: "d = \\sqrt{144} = 12", label: "Diagonal", tags: [tag("algebra.number.surds")] },
      { tex: "\\text{Side } 6\\sqrt{2}\\text{ cm, diagonal } 12\\text{ cm}", label: "In context", tags: [tag("reasoning.justify.conclusions")] },
    ],
  },
];

export const PS1_ASSIGNMENT: Assignment = {
  id: "pset-1",
  title: "PROBLEM SET 1 — SURDS",
  className: "11 Methods",
  classCode: "11MAM2",
  teacher: "Ms Okafor",
  due: "Tue 25 Aug",
  unit: { number: 1, topic: "Topic 1", title: "Surds and quadratic functions" },
  goal: "Surds are exact numbers, and this unit keeps them exact. By Tuesday I want you to take the largest square factor out of a root, simplify every surd before you collect like ones, and multiply and divide roots with the numbers in front kept separate. Write each step on its own line: the slips in this set hide inside a root, and a line you can read back is where you catch them.",
  problems: PS1_PROBLEMS,
  newSkills: ["algebra.number.surds"],
};

/** Problem Set 1 ran individual working, then individual review, then group review; every stage is over. */
export const PS1_PATHWAY: Pathway = ["individual", "group"];
