/** One answer to choose from. A distractor names the misconception that picks it, five words or fewer, shown to the teacher under its count. */
export interface DiagnosticOption {
  id: string;
  tex: string;
  misconception?: string;
}

/** A live multiple-choice diagnostic the teacher can push to the class mid-assignment. */
export interface Diagnostic {
  id: string;
  stem: string;
  tex: string;
  options: DiagnosticOption[];
  correct: string;
  /**
   * The classmates who pick each distractor when this fixture is pushed (the rest pick the right
   * one); the demo student answers for real. Absent on a teacher-written question, whose
   * classmates follow `writtenPick`.
   */
  picks?: Partial<Record<string, string[]>>;
  /** Why the teacher might push it, shown on the teacher side only. */
  why?: string;
  /** The assignment problem this checks; the mistake view offers it beside that problem. A teacher-written question carries the problem it was written under. */
  problemId?: string;
}

/**
 * One suggested check per problem of the demo assignment, each aimed at the slip the class
 * actually made on it. The first stays the class view's example (ticket 25); the mistake view
 * picks by `problemId` through `diagnosticFor`. The stem reads on into the expression, which
 * the panels follow with "?".
 */
export const DIAGNOSTICS: Diagnostic[] = [
  {
    id: "d-factor-check",
    problemId: "q2",
    stem: "Which of these is a factorisation of",
    tex: "2x^2 + 7x - 4",
    options: [
      { id: "a", tex: "(2x + 4)(x - 1)", misconception: "pair not expanded back" },
      { id: "b", tex: "(2x - 1)(x + 4)" },
      { id: "c", tex: "(2x + 1)(x - 4)", misconception: "signs swapped in the pair" },
      { id: "d", tex: "(x + 4)(x - 1)", misconception: "the 2 dropped" },
    ],
    picks: { a: ["jordan", "liam", "mia", "oliver", "sofia"], c: ["ethan"], d: ["chloe"] },
    correct: "b",
    why: "Separates students who expand back to check from those who guess a pair that looks right.",
  },
  {
    id: "d-monic-pair",
    problemId: "q1",
    stem: "Which of these is a factorisation of",
    tex: "x^2 - 5x + 6",
    options: [
      { id: "a", tex: "(x + 2)(x + 3)", misconception: "signs flipped in the pair" },
      { id: "b", tex: "(x - 1)(x - 6)", misconception: "pair adds to seven" },
      { id: "c", tex: "(x - 2)(x - 3)" },
      { id: "d", tex: "(x + 1)(x - 6)", misconception: "sum and product mixed" },
    ],
    picks: { a: ["ethan"], b: ["oliver", "liam"], d: ["mia"] },
    correct: "c",
    why: "Separates a sign slip on the pair from the wrong pair altogether.",
  },
  {
    id: "d-nfl-zero",
    problemId: "q3",
    stem: "Which equation should be factorised to solve",
    tex: "(x - 3)(x + 2) = 6",
    options: [
      { id: "a", tex: "x - 3 = 6 \\;\\text{or}\\; x + 2 = 6", misconception: "null factor law without zero" },
      { id: "b", tex: "x^2 - x - 6 = 6", misconception: "expanded, six not moved" },
      { id: "c", tex: "x^2 - x - 12 = 0" },
      { id: "d", tex: "x - 3 = 3 \\;\\text{or}\\; x + 2 = 2", misconception: "the six split in two" },
    ],
    picks: { a: ["noah", "oliver", "tomas", "zara"], b: ["harper"], d: ["liam"] },
    correct: "c",
    why: "Separates students who know the null factor law needs a zero from those who split the 6.",
  },
  {
    id: "d-formula-2a",
    problemId: "q4",
    stem: "Which is the quadratic formula applied to",
    tex: "3x^2 - 5x - 1 = 0",
    options: [
      { id: "a", tex: "x = \\dfrac{5 \\pm \\sqrt{37}}{3}", misconception: "divided by a, not 2a" },
      { id: "b", tex: "x = \\dfrac{-5 \\pm \\sqrt{37}}{6}", misconception: "−b copied as −5" },
      { id: "c", tex: "x = \\dfrac{5 \\pm \\sqrt{37}}{6}" },
      { id: "d", tex: "x = \\dfrac{5 \\pm \\sqrt{13}}{6}", misconception: "sign of 4ac lost" },
    ],
    picks: { a: ["tomas", "ethan", "finn", "sofia"], b: ["isla"], d: ["chloe"] },
    correct: "c",
    why: "The 2a, the sign of b and the discriminant each have their own wrong answer.",
  },
  {
    id: "d-intercepts",
    problemId: "q5",
    stem: "Which are the x-intercepts of the graph of",
    tex: "y = x^2 - 4x - 5",
    options: [
      { id: "a", tex: "x = -5 \\;\\text{or}\\; x = 1", misconception: "signs of the pair flipped" },
      { id: "b", tex: "x = 5 \\;\\text{or}\\; x = -1" },
      { id: "c", tex: "x = 5 \\;\\text{or}\\; x = 1", misconception: "one sign flipped" },
      { id: "d", tex: "x = 2", misconception: "axis read as intercept" },
    ],
    picks: { a: ["tomas"], c: ["liam"], d: ["harper", "ruby", "finn"] },
    correct: "b",
    why: "Separates the signs of the pair from reading the axis as an intercept.",
  },
  {
    id: "d-touch-once",
    problemId: "q6",
    stem: "Which discriminant makes the graph touch the x-axis exactly once, for",
    tex: "y = x^2 + 6x + k",
    options: [
      { id: "a", tex: "\\Delta > 0", misconception: "positive read as one root" },
      { id: "b", tex: "\\Delta < 0", misconception: "negative read as touching" },
      { id: "c", tex: "\\Delta = 0" },
      { id: "d", tex: "\\Delta = 36", misconception: "b squared alone" },
    ],
    picks: { a: ["amelia", "isla"], b: ["lucas"], d: ["chloe"] },
    correct: "c",
    why: "Which sign of the discriminant means one root, the class's slip on this problem.",
  },
  {
    id: "d-take-out-third",
    problemId: "q7",
    stem: "What is left after taking the third out of",
    tex: "\\tfrac{1}{3}x^2 + 2x + \\tfrac{8}{3}",
    options: [
      { id: "a", tex: "\\tfrac{1}{3}(x^2 + 6x + \\tfrac{8}{3})", misconception: "constant not scaled" },
      { id: "b", tex: "\\tfrac{1}{3}(x^2 + 2x + 8)", misconception: "x terms not scaled" },
      { id: "c", tex: "3(x^2 + 6x + 8)", misconception: "tripled, third never restored" },
      { id: "d", tex: "\\tfrac{1}{3}(x^2 + 6x + 8)" },
    ],
    picks: { a: ["aiden", "tomas", "isla", "oliver", "sofia"], b: ["mia"], c: ["ethan", "finn", "zara", "amelia"] },
    correct: "d",
    why: "Whether every term gets scaled, or only the ones with an x.",
  },
  {
    id: "d-read-intercept",
    problemId: "q8",
    stem: "Which of these is an x-intercept of the graph of",
    tex: "y = x^2 - 4x + 3",
    options: [
      { id: "a", tex: "x = -1", misconception: "sign of the factor flipped" },
      { id: "b", tex: "x = 3" },
      { id: "c", tex: "x = 4", misconception: "middle coefficient read off" },
      { id: "d", tex: "x = 2", misconception: "axis, not intercept" },
    ],
    picks: { d: ["chloe"] },
    correct: "b",
    why: "Reading the graph against substituting back to check.",
  },
  {
    id: "d-ball-lands",
    problemId: "q9",
    stem: "Where does the ball land, if its height after x metres is",
    tex: "h = -x^2 + 6x",
    options: [
      { id: "a", tex: "x = 3", misconception: "axis given as landing" },
      { id: "b", tex: "x = 9", misconception: "height, not distance" },
      { id: "c", tex: "x = 6" },
      { id: "d", tex: "x = 0", misconception: "start read as landing" },
    ],
    picks: { a: ["ethan", "harper", "ruby", "zara"], b: ["chloe"], d: ["liam"] },
    correct: "c",
    why: "The axis, the height and the landing point are three different numbers.",
  },
  {
    id: "d-negative-disc",
    problemId: "q10",
    stem: "What does a negative discriminant mean for the graph of",
    tex: "y = x^2 + 4x + 5",
    options: [
      { id: "a", tex: "\\text{crosses the x-axis twice}", misconception: "negative read as two roots" },
      { id: "b", tex: "\\text{touches the x-axis once}", misconception: "negative read as one root" },
      { id: "c", tex: "\\text{never meets the x-axis}" },
      { id: "d", tex: "\\text{crosses the y-axis twice}", misconception: "axes mixed up" },
    ],
    picks: { a: ["amelia", "isla", "lucas"], b: ["chloe"] },
    correct: "c",
    why: "Which way round the graph sits when there are no real roots.",
  },
];

export const DIAGNOSTIC_MAP = Object.fromEntries(DIAGNOSTICS.map((d) => [d.id, d])) as Record<string, Diagnostic>;
