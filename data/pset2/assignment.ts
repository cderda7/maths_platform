import { tag, type Assignment, type Pathway, type Problem } from "../types";

/**
 * Problem Set 2 — Rationalising and expanding with surds (ticket 212): due Fri 28 Aug, finished and
 * reviewed. Ten problems on surds in brackets and in denominators: expand a surd through a bracket and
 * two brackets through each other, a perfect square and a difference of two squares with surds,
 * rationalise a single-term denominator and a binomial one with its conjugate, add two fractions whose
 * denominators are conjugates, and a rectangle whose area and diagonal come out exact. Hand-checked:
 *
 * - Q1  √3(2√3 − 1) = 6 − √3
 * - Q2  (2 + √5)(3 − √5) = 6 − 2√5 + 3√5 − 5 = 1 + √5
 * - Q3  (√7 + 2)² = 7 + 4√7 + 4 = 11 + 4√7
 * - Q4  (3 − √2)(3 + √2) = 9 − 2 = 7
 * - Q5  6/√3 = 6√3/3 = 2√3
 * - Q6  √2/(2√5) = √10/10
 * - Q7  4/(√5 − 1) = 4(√5 + 1)/4 = √5 + 1
 * - Q8  (√3 + 1)/(√3 − 1) = (4 + 2√3)/2 = 2 + √3
 * - Q9  1/(2 + √3) + 1/(2 − √3) = 4/(4 − 3) = 4
 * - Q10 area (3 + √2)(3 − √2) = 7 cm²; diagonal² = (11 + 6√2) + (11 − 6√2) = 22, so √22 cm
 *
 * The set's New skills are surds and the binomial identity, so their evidence shows under New skills on
 * this set; expansion and fractions stay in Algebra, the rectangle's lines in Reasoning. Every step is
 * tagged: a line that uses (a + b)² or (a + b)(a − b) carries the binomial identity, a line that
 * multiplies or simplifies roots carries surds, a line that multiplies out or collects terms carries
 * expansion, a line that builds, clears or cancels a fraction carries fractions, and every line of the
 * rectangle carries interpreting the question (so one misread sentence reads solid, not a gap).
 *
 * Ids are `ps2-q1` … `ps2-q10` (labels Q1 … Q10), so no table keyed by problem id collides with another
 * set's. Teacher-side only: nothing here reaches a student screen or a hint box.
 */
export const PS2_PROBLEMS: Problem[] = [
  {
    id: "ps2-q1",
    label: "Q1",
    difficulty: "simple familiar",
    stem: "Expand and simplify.",
    tex: "\\sqrt{3}(2\\sqrt{3} - 1)",
    solution: [
      { tex: "\\sqrt{3} \\times 2\\sqrt{3} - \\sqrt{3} \\times 1", label: "Multiplied √3 into both terms", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "6 - \\sqrt{3}", label: "Simplified", tags: [tag("algebra.number.surds"), tag("algebra.expand-factor.expand")] },
    ],
  },
  {
    id: "ps2-q2",
    label: "Q2",
    difficulty: "simple familiar",
    stem: "Expand and simplify.",
    tex: "(2 + \\sqrt{5})(3 - \\sqrt{5})",
    solution: [
      { tex: "6 - 2\\sqrt{5} + 3\\sqrt{5} - 5", label: "Expanded, four terms", tags: [tag("algebra.expand-factor.expand"), tag("algebra.number.surds")] },
      { tex: "1 + \\sqrt{5}", label: "Collected like terms", tags: [tag("algebra.number.surds"), tag("algebra.expand-factor.expand")] },
    ],
  },
  {
    id: "ps2-q3",
    label: "Q3",
    difficulty: "simple familiar",
    stem: "Expand and simplify.",
    tex: "(\\sqrt{7} + 2)^2",
    solution: [
      { tex: "(\\sqrt{7})^2 + 2(\\sqrt{7})(2) + 2^2", label: "Perfect square", tags: [tag("algebra.expand-factor.binomial")] },
      { tex: "7 + 4\\sqrt{7} + 4", label: "Squared the root", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.number.surds")] },
      { tex: "11 + 4\\sqrt{7}", label: "Simplified", tags: [tag("algebra.number.surds")] },
    ],
  },
  {
    id: "ps2-q4",
    label: "Q4",
    difficulty: "simple familiar",
    stem: "Expand and simplify.",
    tex: "(3 - \\sqrt{2})(3 + \\sqrt{2})",
    solution: [
      { tex: "3^2 - (\\sqrt{2})^2", label: "Difference of two squares", tags: [tag("algebra.expand-factor.binomial")] },
      { tex: "9 - 2 = 7", label: "Simplified", tags: [tag("algebra.number.surds")] },
    ],
  },
  {
    id: "ps2-q5",
    label: "Q5",
    difficulty: "simple familiar",
    stem: "Rationalise the denominator.",
    tex: "\\dfrac{6}{\\sqrt{3}}",
    solution: [
      { tex: "\\dfrac{6}{\\sqrt{3}} \\times \\dfrac{\\sqrt{3}}{\\sqrt{3}}", label: "Multiplied by √3 over √3", tags: [tag("algebra.number.surds"), tag("algebra.number.fractions")] },
      { tex: "\\dfrac{6\\sqrt{3}}{3}", label: "Denominator rational", tags: [tag("algebra.number.surds"), tag("algebra.number.fractions")] },
      { tex: "2\\sqrt{3}", label: "Cancelled", tags: [tag("algebra.number.fractions")] },
    ],
  },
  {
    id: "ps2-q6",
    label: "Q6",
    difficulty: "simple unfamiliar",
    stem: "Rationalise the denominator.",
    tex: "\\dfrac{\\sqrt{2}}{2\\sqrt{5}}",
    solution: [
      { tex: "\\dfrac{\\sqrt{2}}{2\\sqrt{5}} \\times \\dfrac{\\sqrt{5}}{\\sqrt{5}}", label: "Multiplied by √5 over √5", tags: [tag("algebra.number.surds"), tag("algebra.number.fractions")] },
      { tex: "\\dfrac{\\sqrt{10}}{10}", label: "Denominator rational", tags: [tag("algebra.number.surds"), tag("algebra.number.fractions")] },
    ],
  },
  {
    id: "ps2-q7",
    label: "Q7",
    difficulty: "complex familiar",
    stem: "Rationalise the denominator.",
    tex: "\\dfrac{4}{\\sqrt{5} - 1}",
    solution: [
      { tex: "\\dfrac{4}{\\sqrt{5} - 1} \\times \\dfrac{\\sqrt{5} + 1}{\\sqrt{5} + 1}", label: "Multiplied by the conjugate", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.number.fractions")] },
      { tex: "\\dfrac{4(\\sqrt{5} + 1)}{5 - 1}", label: "Difference of two squares below", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.number.surds")] },
      { tex: "\\sqrt{5} + 1", label: "Cancelled the 4", tags: [tag("algebra.number.fractions")] },
    ],
  },
  {
    id: "ps2-q8",
    label: "Q8",
    difficulty: "complex familiar",
    stem: "Rationalise the denominator and simplify.",
    tex: "\\dfrac{\\sqrt{3} + 1}{\\sqrt{3} - 1}",
    solution: [
      { tex: "\\dfrac{\\sqrt{3} + 1}{\\sqrt{3} - 1} \\times \\dfrac{\\sqrt{3} + 1}{\\sqrt{3} + 1}", label: "Multiplied by the conjugate", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.number.fractions")] },
      { tex: "\\dfrac{3 + \\sqrt{3} + \\sqrt{3} + 1}{3 - 1}", label: "Expanded the top, difference of squares below", tags: [tag("algebra.expand-factor.expand"), tag("algebra.expand-factor.binomial"), tag("algebra.number.surds")] },
      { tex: "\\dfrac{4 + 2\\sqrt{3}}{2}", label: "Collected the surds", tags: [tag("algebra.number.surds")] },
      { tex: "2 + \\sqrt{3}", label: "Divided every term by 2", tags: [tag("algebra.number.fractions")] },
    ],
  },
  {
    id: "ps2-q9",
    label: "Q9",
    difficulty: "complex unfamiliar",
    stem: "Simplify.",
    tex: "\\dfrac{1}{2 + \\sqrt{3}} + \\dfrac{1}{2 - \\sqrt{3}}",
    solution: [
      { tex: "\\dfrac{(2 - \\sqrt{3}) + (2 + \\sqrt{3})}{(2 + \\sqrt{3})(2 - \\sqrt{3})}", label: "Common denominator", tags: [tag("algebra.number.fractions")] },
      { tex: "\\dfrac{4}{4 - 3}", label: "Difference of two squares below", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.number.surds")] },
      { tex: "4", label: "Simplified", tags: [tag("algebra.number.fractions")] },
    ],
  },
  {
    id: "ps2-q10",
    label: "Q10",
    difficulty: "complex unfamiliar",
    stem: "A rectangle is (3 + √2) cm long and (3 − √2) cm wide. Find its area and the length of its diagonal, exactly.",
    tex: "\\ell = 3 + \\sqrt{2},\\quad w = 3 - \\sqrt{2}",
    answerAs: "sentence",
    solution: [
      { tex: "A = (3 + \\sqrt{2})(3 - \\sqrt{2}) = 9 - 2 = 7", label: "Area", tags: [tag("reasoning.interpret.worded"), tag("algebra.expand-factor.binomial")] },
      { tex: "d^2 = (3 + \\sqrt{2})^2 + (3 - \\sqrt{2})^2", label: "Pythagoras on the diagonal", tags: [tag("reasoning.interpret.worded"), tag("algebra.number.surds")] },
      { tex: "d^2 = (11 + 6\\sqrt{2}) + (11 - 6\\sqrt{2}) = 22", label: "Squared both sides", tags: [tag("reasoning.interpret.worded"), tag("algebra.expand-factor.binomial"), tag("algebra.number.surds")] },
      { tex: "d = \\sqrt{22}", label: "Diagonal", tags: [tag("reasoning.interpret.worded"), tag("algebra.number.surds")] },
      { tex: "\\text{Area } 7 \\text{ cm}^2 \\text{, diagonal } \\sqrt{22} \\text{ cm}", label: "In context", tags: [tag("reasoning.justify.conclusions"), tag("reasoning.interpret.worded")] },
    ],
  },
];

export const PS2_ASSIGNMENT: Assignment = {
  id: "pset-2",
  title: "PROBLEM SET 2 — RATIONALISING AND EXPANDING WITH SURDS",
  className: "11 Methods",
  classCode: "11MAM2",
  teacher: "Ms Okafor",
  due: "Fri 28 Aug",
  unit: { number: 1, topic: "Topic 1", title: "Surds and quadratic functions" },
  goal: "Surds follow the same rules as any other number in a bracket. Multiply every term by every term, and square a bracket by writing it out twice until (a + b)² and (a + b)(a − b) are second nature. Then use the difference of two squares to clear a root out of a denominator. Leave every answer exact and simplified, and read your last line back: is there still a root on the bottom?",
  problems: PS2_PROBLEMS,
  newSkills: ["algebra.number.surds", "algebra.expand-factor.binomial"],
};

/** Problem Set 2 ran individual working, then individual review, then group review; every stage is over. */
export const PS2_PATHWAY: Pathway = ["individual", "group"];
