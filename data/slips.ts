/**
 * The recognised lines behind the classmates' Problem Set 6 working (moved out of `data/classmates.ts` in ticket 332 so the
 * review records and the simulated group boards can read them without an import cycle). Every line is in the evaluation table.
 */
export const Q2_GUESSED = ["2x^2 + 7x - 4 = 0", "(2x + 4)(x - 1) = 0", "x = -2 \\;\\text{or}\\; x = 1"];
export const Q3_NFL = ["(x - 3)(x + 2) = 6", "x - 3 = 6 \\;\\text{or}\\; x + 2 = 6", "x = 9 \\;\\text{or}\\; x = 4"];
export const Q4_OVER_A = ["a = 3,\\; b = -5,\\; c = -1", "b^2 - 4ac = 25 + 12 = 37", "x = \\dfrac{5 \\pm \\sqrt{37}}{3}"];
export const Q5_SIGNS = ["(x - 5)(x + 1) = 0", "x = -5 \\;\\text{or}\\; x = 1", "x = \\tfrac{-5 + 1}{2} = -2"];
export const Q6_TWICE = ["b^2 - 4ac = 36 - 4k", "36 - 4k > 0", "k < 9"];
export const Q7_TWO_TERMS = ["x^2 + 6x + \\tfrac{8}{3}", "2 \\times 4 = 8,\\quad 2 + 4 = 6", "(x + 2)(x + 4)"];
export const Q8_MIRROR = ["x = -1 \\;\\text{or}\\; x = -3"];
export const Q9_HEIGHT = ["-x(x - 6) = 0", "x = 0 \\;\\text{or}\\; x = 6", "x = 3", "h = 6"];
export const Q10_TWICE = ["b^2 - 4ac = 16 - 20 = -4", "\\Delta < 0 \\Rightarrow \\text{no real solutions}", "\\text{The graph crosses the x-axis twice}"];
/** Q5 with the turning point's height read off the wrong line, and Q9 rushed: the axis given as the height, a step skipped on the way. */
export const Q5_HEIGHT = ["(x - 5)(x + 1) = 0", "x = 5 \\;\\text{or}\\; x = -1", "x = \\tfrac{5 + (-1)}{2} = 2", "(2, -5)"];
export const Q9_RUSHED = ["-x(x - 6) = 0", "\\text{turning point at } x = 3", "h = 6"];
/** Q5 started and left (ticket 281, Liam): the factors right, the roots read off them with their signs flipped, no turning point. */
export const Q5_ROOTS_FLIPPED = ["(x - 5)(x + 1) = 0", "x = -5 \\;\\text{or}\\; x = 1"];
/** Right, but in one jump each: what a student who skips steps hands in. */
export const Q1_JUMP = ["x^2 - 5x + 6 = 0", "x = 2, 3"];
export const Q2_JUMP = ["2x^2 + 7x - 4 = (2x - 1)(x + 4)", "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4"];
export const Q3_JUMP = ["x^2 - x - 12 = 0 \\Rightarrow x = 4, -3"];
export const Q1_SIGNS = ["x^2 - 5x + 6 = 0", "(x + 2)(x + 3) = 0", "x = -2 \\;\\text{or}\\; x = -3"];
/**
 * The second way to go wrong on each of Q1, Q2, Q3, Q4, Q7 and Q9, and Q10's slip one line earlier (ticket 130):
 * a pair that multiplies to 6 but adds to 7; the right factors and a sign lost solving one; a sign lost in the
 * expansion; −b written as −5; the third taken out and then the wrong pair; −x taken out of −x² + 6x with the
 * sign left behind; a negative discriminant read as two solutions with the sentence following from it.
 */
export const Q1_PAIR = ["x^2 - 5x + 6 = 0", "(x - 1)(x - 6) = 0", "x = 1 \\;\\text{or}\\; x = 6"];
export const Q2_SIGN = ["2x^2 + 7x - 4 = 0", "ac = -8,\\quad 8 + (-1) = 7", "(2x - 1)(x + 4) = 0", "x = -\\tfrac{1}{2} \\;\\text{or}\\; x = -4"];
export const Q3_EXPAND = ["(x - 3)(x + 2) = 6", "x^2 + x - 6 = 6", "x^2 + x - 12 = 0", "(x + 4)(x - 3) = 0", "x = -4 \\;\\text{or}\\; x = 3"];
export const Q4_B_SIGN = ["a = 3,\\; b = -5,\\; c = -1", "b^2 - 4ac = 25 + 12 = 37", "x = \\dfrac{-5 \\pm \\sqrt{37}}{6}"];
export const Q7_LOST_THIRD = ["x^2 + 6x + 8", "2 \\times 4 = 8,\\quad 2 + 4 = 6", "(x + 2)(x + 4)"];
export const Q7_PAIR = ["\\tfrac{1}{3}(x^2 + 6x + 8)", "1 \\times 8 = 8,\\quad 1 + 8 = 9", "\\tfrac{1}{3}(x + 1)(x + 8)"];
export const Q9_SIGN = ["-x(x + 6) = 0", "x = 0 \\;\\text{or}\\; x = -6", "x = -3", "h = 9"];
export const Q10_FORMAL = ["b^2 - 4ac = 16 - 20 = -4", "\\Delta < 0 \\Rightarrow \\text{two real solutions}", "\\text{So the graph crosses the x-axis at two points}"];

/** One known slip per problem, every line in the evaluation table: what a lightweight classmate wrote when they got it wrong. */
export const SLIPS: Record<string, string[]> = { q1: Q1_SIGNS, q2: Q2_GUESSED, q3: Q3_NFL, q4: Q4_OVER_A, q5: Q5_SIGNS, q6: Q6_TWICE, q7: Q7_TWO_TERMS, q8: Q8_MIRROR, q9: Q9_HEIGHT, q10: Q10_TWICE };
