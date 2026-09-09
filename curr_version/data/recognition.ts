/**
 * Simulated recognition. For each problem, the ordered lines the drawpad will "recognise" as the
 * demo student writes: one line per burst of strokes. The scripted run slips on monic factorising
 * in Q1 and non-monic in Q2, applies the null factor law to a product that isn't zero in Q3, gets
 * Q4–Q6 and Q8 right, multiplies only two of three terms in Q7, skips the height in Q9 (a
 * compounded step, not a mistake), and misreads a negative discriminant in Q10.
 */
export const RECOGNITION: Record<string, string[]> = {
  q1: ["x^2 - 5x + 6 = 0", "(x + 2)(x + 3) = 0", "x = -2 \\;\\text{or}\\; x = -3"],
  q2: ["2x^2 + 7x - 4 = 0", "(2x + 4)(x - 1) = 0", "2x + 4 = 0 \\;\\text{or}\\; x - 1 = 0", "x = -2 \\;\\text{or}\\; x = 1"],
  q3: ["(x - 3)(x + 2) = 6", "x - 3 = 6 \\;\\text{or}\\; x + 2 = 6", "x = 9 \\;\\text{or}\\; x = 4"],
  q4: ["a = 3,\\; b = -5,\\; c = -1", "b^2 - 4ac = 25 + 12 = 37", "x = \\dfrac{5 \\pm \\sqrt{37}}{6}"],
  q5: ["(x - 5)(x + 1) = 0", "x = 5 \\;\\text{or}\\; x = -1", "x = \\tfrac{5 + (-1)}{2} = 2", "y = 4 - 8 - 5 = -9,\\quad (2, -9)"],
  q6: ["b^2 - 4ac = 36 - 4k", "36 - 4k = 0", "k = 9"],
  q7: ["x^2 + 6x + \\tfrac{8}{3}", "2 \\times 4 = 8,\\quad 2 + 4 = 6", "(x + 2)(x + 4)"],
  q8: ["x = 1 \\;\\text{or}\\; x = 3", "1 - 4 + 3 = 0 \\;\\checkmark"],
  q9: ["-x(x - 6) = 0", "x = 0 \\;\\text{or}\\; x = 6", "\\text{turning point at } x = 3"],
  q10: ["b^2 - 4ac = 16 - 20 = -4", "\\Delta < 0 \\Rightarrow \\text{two real solutions}"],
};

/**
 * What the pad "reads" during the independent rework, one line per burst: the corrected path
 * for each problem that had a slip. Q4 held; reworking it anyway "reads" the classic slip of
 * dividing by a instead of 2a, which is what trips the guard in the demo (spec v3).
 */
export const RECOGNITION_REWORK: Record<string, string[]> = {
  q1: ["(x - 2)(x - 3) = 0", "x = 2 \\;\\text{or}\\; x = 3"],
  q2: ["ac = -8,\\quad 8 + (-1) = 7", "2x^2 + 8x - x - 4 = 0", "2x(x+4) - 1(x+4) = 0", "(2x - 1)(x + 4) = 0", "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4"],
  q3: ["x^2 - x - 6 = 6", "x^2 - x - 12 = 0", "(x - 4)(x + 3) = 0", "x = 4 \\;\\text{or}\\; x = -3"],
  q4: ["a = 3,\\; b = -5,\\; c = -1", "x = \\dfrac{5 \\pm \\sqrt{37}}{3}"],
  q7: ["\\tfrac{1}{3}(x^2 + 6x + 8)", "2 \\times 4 = 8,\\quad 2 + 4 = 6", "\\tfrac{1}{3}(x + 2)(x + 4)"],
  q10: ["b^2 - 4ac = 16 - 20 = -4", "\\Delta < 0 \\Rightarrow \\text{no real solutions}", "\\text{The graph never meets the x-axis}"],
};
