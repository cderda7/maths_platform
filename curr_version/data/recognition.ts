/**
 * Simulated recognition. For each problem, the ordered lines the drawpad will "recognise" as the
 * demo student writes: one line per burst of strokes. The demo student's scripted run slips on
 * factorising in Q1 and Q2, applies the null factor law to a product that isn't zero in Q3, and
 * gets Q4 right. Evaluation of these lines is ticket 04's job; here they are just what appears.
 */
export const RECOGNITION: Record<string, string[]> = {
  q1: ["x^2 - 5x + 6 = 0", "(x + 2)(x + 3) = 0", "x = -2 \\;\\text{or}\\; x = -3"],
  q2: ["2x^2 + 7x - 4 = 0", "(2x + 4)(x - 1) = 0", "2x + 4 = 0 \\;\\text{or}\\; x - 1 = 0", "x = -2 \\;\\text{or}\\; x = 1"],
  q3: ["(x - 3)(x + 2) = 6", "x - 3 = 6 \\;\\text{or}\\; x + 2 = 6", "x = 9 \\;\\text{or}\\; x = 4"],
  q4: ["a = 3,\\; b = -5,\\; c = -1", "b^2 - 4ac = 25 + 12 = 37", "x = \\dfrac{5 \\pm \\sqrt{37}}{6}"],
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
};
