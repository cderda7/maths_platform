/**
 * One answer to choose from. A distractor names the misconception that picks it, five words or fewer, shown to the teacher
 * under its count, never a student's name.
 */
export interface DiagnosticOption {
  id: string;
  tex: string;
  misconception?: string;
  /**
   * The wrong line a student really wrote on the original problem that this distractor mirrors on the similar problem
   * (ticket 240), as its TeX in the evaluation table. A classmate whose work on the problem has that line picks this
   * option; absent on a common slip, which no student's work is tied to.
   */
  slip?: string;
}

/**
 * A live multiple-choice question the teacher can push to the class mid-assignment. The stem may carry inline maths
 * between `$` signs ("Given that $-3 \times (-4) = 12$, …"); `tex`, when present, follows the stem and takes the "?".
 */
export interface Diagnostic {
  id: string;
  stem: string;
  tex: string;
  options: DiagnosticOption[];
  correct: string;
  /**
   * Classmates who pick a common slip (an option with no `slip`), by option id: only ever students who have not reached
   * the problem (ticket 240). Everyone else's pick follows their own work (`classmatePick`); the demo student answers for real.
   */
  picks?: Partial<Record<string, string[]>>;
  /** The assignment problem this checks. */
  problemId?: string;
}

/** One step of a problem's model solution, asked on its similar problem (ticket 240). */
export interface DiagnosticStep extends Diagnostic {
  problemId: string;
  /** What the step does, for the teacher only: "Find the pair", "Factorise". */
  name: string;
}

/** A problem's live diagnostic: a similar problem (same type and difficulty, new numbers) and its steps in solution order. */
export interface ProblemDiagnostic {
  problemId: string;
  /** The similar problem's expression, as the steps ask it. */
  similar: string;
  steps: DiagnosticStep[];
}

type StepDef = Omit<DiagnosticStep, "id" | "problemId"> & { key: string };

const problem = (problemId: string, similar: string, steps: StepDef[]): ProblemDiagnostic => ({
  problemId,
  similar,
  steps: steps.map(({ key, ...s }) => ({ ...s, id: `d-${problemId}-${key}`, problemId })),
});

// The wrong lines students wrote on Problem Set 6 (data/classmates.ts, the demo session), each the source of a distractor.
const Q1_SIGNS = "(x + 2)(x + 3) = 0";
const Q1_PAIR = "(x - 1)(x - 6) = 0";
const Q2_GUESSED = "(2x + 4)(x - 1) = 0";
const Q2_SIGN = "x = -\\tfrac{1}{2} \\;\\text{or}\\; x = -4";
const Q3_NFL = "x - 3 = 6 \\;\\text{or}\\; x + 2 = 6";
const Q3_EXPAND = "x^2 + x - 6 = 6";
const Q4_OVER_A = "x = \\dfrac{5 \\pm \\sqrt{37}}{3}";
const Q4_B_SIGN = "x = \\dfrac{-5 \\pm \\sqrt{37}}{6}";
const Q5_SIGNS = "x = -5 \\;\\text{or}\\; x = 1";
const Q5_HEIGHT = "(2, -5)";
const Q6_TWICE = "36 - 4k > 0";
const Q7_TWO_TERMS = "x^2 + 6x + \\tfrac{8}{3}";
const Q7_LOST_THIRD = "x^2 + 6x + 8";
const Q7_PAIR = "1 \\times 8 = 8,\\quad 1 + 8 = 9";
const Q9_HEIGHT = "h = 6";
const Q9_SIGN = "-x(x + 6) = 0";
const Q10_FORMAL = "\\Delta < 0 \\Rightarrow \\text{two real solutions}";
const Q10_TWICE = "\\text{The graph crosses the x-axis twice}";

const OR = "\\;\\text{or}\\;";
const AND = "\\;\\text{and}\\;";

/**
 * Every Problem Set 6 problem's step questions (ticket 240), each on a similar problem, each step's stem giving the correct
 * result of the step before it so a wrong answer can only come from that step. Hand-authored and checked in
 * `lib/diagnostic.test.ts`: every factorisation expanded, every pair's sum and product, every root substituted back.
 */
export const PROBLEM_DIAGNOSTICS: ProblemDiagnostic[] = [
  problem("q1", "x^2 - 7x + 12 = 0", [
    {
      key: "pair",
      name: "Find the pair",
      stem: "Which two numbers add to $-7$ and multiply to $12$",
      tex: "",
      options: [
        { id: "a", tex: `3${AND}4`, misconception: "signs flipped in the pair", slip: Q1_SIGNS },
        { id: "b", tex: `-6${AND}{-2}`, misconception: "product right, sum wrong", slip: Q1_PAIR },
        { id: "c", tex: `-3${AND}{-4}` },
        { id: "d", tex: `3${AND}{-4}`, misconception: "multiplies to −12" },
      ],
      correct: "c",
    },
    {
      key: "factorise",
      name: "Factorise",
      stem: "Given that $-3 \\times (-4) = 12$ and $-3 + (-4) = -7$, which is the factorised form of",
      tex: "x^2 - 7x + 12",
      options: [
        { id: "a", tex: "(x + 3)(x + 4)", misconception: "signs flipped in the pair", slip: Q1_SIGNS },
        { id: "b", tex: "(x - 3)(x - 4)" },
        { id: "c", tex: "(x - 6)(x - 2)", misconception: "product right, sum wrong", slip: Q1_PAIR },
        { id: "d", tex: "(x + 3)(x - 4)", misconception: "multiplies to −12" },
      ],
      correct: "b",
    },
    {
      key: "zeros",
      name: "Find the zeros",
      stem: "Given that $(x - 3)(x - 4)$ is the factorised form of $x^2 - 7x + 12$, what are the zeros",
      tex: "",
      options: [
        { id: "a", tex: `x = 3${OR}x = 4` },
        { id: "b", tex: `x = -3${OR}x = -4`, misconception: "signs of the factors kept" },
        { id: "c", tex: `x = 3${OR}x = -4`, misconception: "one sign flipped" },
        { id: "d", tex: `x = -7${OR}x = 12`, misconception: "coefficients read as zeros" },
      ],
      correct: "a",
      picks: { c: ["chloe"] },
    },
  ]),

  problem("q2", "3x^2 + 5x - 2 = 0", [
    {
      key: "split",
      name: "Find the split",
      stem: "Which two numbers multiply to $ac = -6$ and add to $b = 5$, to split the middle term of",
      tex: "3x^2 + 5x - 2 = 0",
      options: [
        { id: "a", tex: `-6${AND}1`, misconception: "signs swapped in the pair" },
        { id: "b", tex: `6${AND}{-1}` },
        { id: "c", tex: `3${AND}2`, misconception: "sign of ac lost" },
        { id: "d", tex: `-3${AND}2`, misconception: "product right, sum wrong" },
      ],
      correct: "b",
    },
    {
      key: "split-term",
      name: "Split the middle term",
      stem: "Given that $6 \\times (-1) = -6$ and $6 + (-1) = 5$, which splits the middle term of",
      tex: "3x^2 + 5x - 2 = 0",
      options: [
        { id: "a", tex: "3x^2 - 6x + x - 2 = 0", misconception: "signs swapped in the split" },
        { id: "b", tex: "3x^2 + 6x + x - 2 = 0", misconception: "split adds to 7" },
        { id: "c", tex: "3x^2 + 6x - x - 2 = 0" },
        { id: "d", tex: "3x^2 + 6x - x + 2 = 0", misconception: "sign of the constant flipped" },
      ],
      correct: "c",
    },
    {
      key: "group",
      name: "Group",
      stem: "Given that the middle term splits as $3x^2 + 6x - x - 2 = 0$, which groups it",
      tex: "",
      options: [
        { id: "a", tex: "3x(x + 2) - 1(x + 2) = 0" },
        { id: "b", tex: "3x(x + 2) - 1(x - 2) = 0", misconception: "minus not carried into bracket" },
        { id: "c", tex: "3x(x + 6) - 1(x + 2) = 0", misconception: "6x not divided by 3x" },
        { id: "d", tex: "3x(x + 2) + 1(x + 2) = 0", misconception: "−1 taken out as +1" },
      ],
      correct: "a",
    },
    {
      key: "factorise",
      name: "Factorise",
      stem: "Given that $3x^2 + 5x - 2 = 3x(x + 2) - 1(x + 2)$, which is the factorised form of",
      tex: "3x^2 + 5x - 2",
      options: [
        { id: "a", tex: "(3x + 1)(x - 2)", misconception: "signs swapped in the pair" },
        { id: "b", tex: "(x - 1)(x + 2)", misconception: "the 3 dropped" },
        { id: "c", tex: "(3x + 2)(x - 1)", misconception: "pair not expanded back", slip: Q2_GUESSED },
        { id: "d", tex: "(3x - 1)(x + 2)" },
      ],
      correct: "d",
    },
    {
      key: "solve",
      name: "Null factor law",
      stem: "Given that $3x^2 + 5x - 2 = (3x - 1)(x + 2)$, what are the solutions of",
      tex: "3x^2 + 5x - 2 = 0",
      options: [
        { id: "a", tex: `x = -\\tfrac{1}{3}${OR}x = -2`, misconception: "sign lost solving a factor", slip: Q2_SIGN },
        { id: "b", tex: `x = \\tfrac{1}{3}${OR}x = -2` },
        { id: "c", tex: `x = 3${OR}x = -2`, misconception: "multiplied by 3, not divided" },
        { id: "d", tex: `x = 1${OR}x = -2`, misconception: "the 3 dropped" },
      ],
      correct: "b",
    },
  ]),

  problem("q3", "(x - 2)(x + 4) = 7", [
    {
      key: "expand",
      name: "Expand first",
      stem: "Which is a correct first line of working to solve",
      tex: "(x - 2)(x + 4) = 7",
      options: [
        { id: "a", tex: `x - 2 = 7${OR}x + 4 = 7`, misconception: "null factor law without zero", slip: Q3_NFL },
        { id: "b", tex: "x^2 - 2x - 8 = 7", misconception: "sign slip expanding", slip: Q3_EXPAND },
        { id: "c", tex: "x^2 - 8 = 7", misconception: "middle term dropped" },
        { id: "d", tex: "x^2 + 2x - 8 = 7" },
      ],
      correct: "d",
    },
    {
      key: "rearrange",
      name: "Rearrange to standard form",
      stem: "Given that $(x - 2)(x + 4) = 7$ expands to $x^2 + 2x - 8 = 7$, which is its standard form",
      tex: "",
      options: [
        { id: "a", tex: "x^2 + 2x - 8 = 0", misconception: "the 7 dropped" },
        { id: "b", tex: "x^2 + 2x - 15 = 0" },
        { id: "c", tex: "x^2 + 2x - 1 = 0", misconception: "7 added, not subtracted" },
        { id: "d", tex: "x^2 + 2x + 15 = 0", misconception: "sign of the constant flipped" },
      ],
      correct: "b",
    },
    {
      key: "factorise",
      name: "Factorise",
      stem: "Given that the standard form is $x^2 + 2x - 15 = 0$, which is the factorised form of",
      tex: "x^2 + 2x - 15",
      options: [
        { id: "a", tex: "(x - 5)(x + 3)", misconception: "signs flipped in the pair" },
        { id: "b", tex: "(x + 15)(x - 1)", misconception: "product right, sum wrong" },
        { id: "c", tex: "(x + 5)(x - 3)" },
        { id: "d", tex: "(x + 5)(x + 3)", misconception: "multiplies to +15" },
      ],
      correct: "c",
    },
    {
      key: "solve",
      name: "Null factor law",
      stem: "Given that $x^2 + 2x - 15 = (x + 5)(x - 3)$, what are the solutions of",
      tex: "(x - 2)(x + 4) = 7",
      options: [
        { id: "a", tex: `x = 5${OR}x = -3`, misconception: "signs of the factors kept" },
        { id: "b", tex: `x = -5${OR}x = -3`, misconception: "one sign flipped" },
        { id: "c", tex: `x = 2${OR}x = -4`, misconception: "the original brackets solved" },
        { id: "d", tex: `x = -5${OR}x = 3` },
      ],
      correct: "d",
    },
  ]),

  problem("q4", "2x^2 - 7x - 3 = 0", [
    {
      key: "abc",
      name: "Identify a, b, c",
      stem: "Which are $a$, $b$ and $c$ for",
      tex: "2x^2 - 7x - 3 = 0",
      options: [
        { id: "a", tex: "a = 2,\\; b = 7,\\; c = 3", misconception: "signs dropped" },
        { id: "b", tex: "a = 2,\\; b = -7,\\; c = -3" },
        { id: "c", tex: "a = 2,\\; b = -3,\\; c = -7", misconception: "b and c swapped" },
        { id: "d", tex: "a = 2,\\; b = -7,\\; c = 3", misconception: "sign of c dropped" },
      ],
      correct: "b",
      picks: { d: ["liam"] },
    },
    {
      key: "discriminant",
      name: "Discriminant",
      stem: "Given that $a = 2,\\; b = -7,\\; c = -3$, which is the discriminant $b^2 - 4ac$ of",
      tex: "2x^2 - 7x - 3 = 0",
      options: [
        { id: "a", tex: "49 - 24 = 25", misconception: "sign of 4ac lost" },
        { id: "b", tex: "-49 + 24 = -25", misconception: "b squared as negative" },
        { id: "c", tex: "49 + 12 = 61", misconception: "4ac taken as 2ac" },
        { id: "d", tex: "49 + 24 = 73" },
      ],
      correct: "d",
    },
    {
      key: "formula",
      name: "Quadratic formula",
      stem: "Given that $a = 2,\\; b = -7$ and $b^2 - 4ac = 49 + 24 = 73$, which are the solutions of",
      tex: "2x^2 - 7x - 3 = 0",
      options: [
        { id: "a", tex: "x = \\dfrac{7 \\pm \\sqrt{73}}{4}" },
        { id: "b", tex: "x = \\dfrac{7 \\pm \\sqrt{73}}{2}", misconception: "divided by a, not 2a", slip: Q4_OVER_A },
        { id: "c", tex: "x = 7 \\pm \\dfrac{\\sqrt{73}}{4}", misconception: "only the root divided" },
        { id: "d", tex: "x = \\dfrac{-7 \\pm \\sqrt{73}}{4}", misconception: "−b copied as −7", slip: Q4_B_SIGN },
      ],
      correct: "a",
    },
  ]),

  problem("q5", "y = x^2 - 6x - 7", [
    {
      key: "factorise",
      name: "Factorise",
      stem: "Which is the factorised form of",
      tex: "x^2 - 6x - 7",
      options: [
        { id: "a", tex: "(x + 7)(x - 1)", misconception: "signs flipped in the pair" },
        { id: "b", tex: "(x - 7)(x + 1)" },
        { id: "c", tex: "(x - 7)(x - 1)", misconception: "multiplies to +7" },
        { id: "d", tex: "(x - 5)(x - 1)", misconception: "sum right, product wrong" },
      ],
      correct: "b",
    },
    {
      key: "intercepts",
      name: "x-intercepts",
      stem: "Given that $x^2 - 6x - 7 = (x - 7)(x + 1)$, which are the x-intercepts of the graph of",
      tex: "y = x^2 - 6x - 7",
      options: [
        { id: "a", tex: `x = 7${OR}x = 1`, misconception: "one sign flipped" },
        { id: "b", tex: "x = -7", misconception: "constant read as intercept" },
        { id: "c", tex: `x = -7${OR}x = 1`, misconception: "signs of the pair flipped", slip: Q5_SIGNS },
        { id: "d", tex: `x = 7${OR}x = -1` },
      ],
      correct: "d",
    },
    {
      key: "axis",
      name: "Axis of symmetry",
      stem: "Given that the x-intercepts are $x = 7$ and $x = -1$, which is the axis of symmetry of",
      tex: "y = x^2 - 6x - 7",
      options: [
        { id: "a", tex: "x = 3" },
        { id: "b", tex: "x = 4", misconception: "half the gap, not midpoint" },
        { id: "c", tex: "x = -3", misconception: "sign of the axis flipped" },
        { id: "d", tex: "x = 6", misconception: "sum not halved" },
      ],
      correct: "a",
      picks: { b: ["grace"] },
    },
    {
      key: "turning-point",
      name: "Turning point",
      stem: "Given that the axis of symmetry is $x = 3$, which is the turning point of",
      tex: "y = x^2 - 6x - 7",
      options: [
        { id: "a", tex: "(3, -19)", misconception: "3 squared as 6" },
        { id: "b", tex: "(-16, 3)", misconception: "coordinates swapped" },
        { id: "c", tex: "(3, -16)" },
        { id: "d", tex: "(3, -7)", misconception: "height from the wrong line", slip: Q5_HEIGHT },
      ],
      correct: "c",
    },
  ]),

  problem("q6", "y = x^2 + 8x + k", [
    {
      key: "discriminant",
      name: "Discriminant",
      stem: "Which is the discriminant $b^2 - 4ac$ of",
      tex: "x^2 + 8x + k",
      options: [
        { id: "a", tex: "64 - 4k" },
        { id: "b", tex: "8 - 4k", misconception: "b not squared" },
        { id: "c", tex: "64 + 4k", misconception: "sign of 4ac lost" },
        { id: "d", tex: "64 - k", misconception: "the 4 in 4ac dropped" },
      ],
      correct: "a",
      picks: { d: ["chloe"] },
    },
    {
      key: "one-root",
      name: "One root: discriminant zero",
      stem: "Given that the discriminant is $64 - 4k$, when does the graph of $y = x^2 + 8x + k$ touch the x-axis exactly once",
      tex: "",
      options: [
        { id: "a", tex: "64 - 4k < 0", misconception: "one root read as negative" },
        { id: "b", tex: "64 - 4k > 0", misconception: "one root read as positive", slip: Q6_TWICE },
        { id: "c", tex: "64 - 4k = 0" },
        { id: "d", tex: "64 - 4k = 1", misconception: "zero confused with one" },
      ],
      correct: "c",
    },
    {
      key: "solve",
      name: "Solve for k",
      stem: "Given that the graph touches the x-axis once when $64 - 4k = 0$, what is $k$",
      tex: "",
      options: [
        { id: "a", tex: "k = -16", misconception: "sign lost moving 64" },
        { id: "b", tex: "k = 60", misconception: "4 subtracted, not divided" },
        { id: "c", tex: "k = 256", misconception: "multiplied by 4, not divided" },
        { id: "d", tex: "k = 16" },
      ],
      correct: "d",
    },
  ]),

  problem("q7", "\\tfrac{1}{3}x^2 + 3x + \\tfrac{20}{3}", [
    {
      key: "third",
      name: "Take out the third",
      stem: "Which is a correct first line when factorising",
      tex: "\\tfrac{1}{3}x^2 + 3x + \\tfrac{20}{3}",
      options: [
        { id: "a", tex: "x^2 + 9x + \\tfrac{20}{3}", misconception: "constant not scaled", slip: Q7_TWO_TERMS },
        { id: "b", tex: "\\tfrac{1}{3}(x^2 + 9x + 20)" },
        { id: "c", tex: "x^2 + 9x + 20", misconception: "third lost", slip: Q7_LOST_THIRD },
        { id: "d", tex: "\\tfrac{1}{3}(x^2 + 3x + 20)", misconception: "x term not scaled" },
      ],
      correct: "b",
    },
    {
      key: "pair",
      name: "Find the pair",
      stem: "Given the first line $\\tfrac{1}{3}(x^2 + 9x + 20)$, which two numbers add to $9$ and multiply to $20$",
      tex: "",
      options: [
        { id: "a", tex: `-4${AND}{-5}`, misconception: "signs flipped in the pair" },
        { id: "b", tex: `3${AND}6`, misconception: "sum right, product wrong" },
        { id: "c", tex: `1${AND}20`, misconception: "product right, sum wrong", slip: Q7_PAIR },
        { id: "d", tex: `4${AND}5` },
      ],
      correct: "d",
    },
    {
      key: "factorise",
      name: "Factorise",
      stem: "Given that $4 \\times 5 = 20$ and $4 + 5 = 9$, which is the full factorisation of",
      tex: "\\tfrac{1}{3}x^2 + 3x + \\tfrac{20}{3}",
      options: [
        { id: "a", tex: "\\tfrac{1}{3}(x + 4)(x + 5)" },
        { id: "b", tex: "(x + 4)(x + 5)", misconception: "third dropped at the end" },
        { id: "c", tex: "3(x + 4)(x + 5)", misconception: "tripled, not a third" },
        { id: "d", tex: "\\tfrac{1}{3}(x - 4)(x - 5)", misconception: "signs flipped in the pair" },
      ],
      correct: "a",
      picks: { b: ["harper"] },
    },
  ]),

  problem("q8", "y = x^2 - 6x + 8", [
    {
      key: "read",
      name: "Read the intercepts",
      stem: "Which are the x-intercepts of the graph of",
      tex: "y = x^2 - 6x + 8",
      options: [
        { id: "a", tex: `x = -2${OR}x = -4`, misconception: "mirrored in the y-axis" },
        { id: "b", tex: "x = 8", misconception: "y-intercept read off" },
        { id: "c", tex: `x = 2${OR}x = 4` },
        { id: "d", tex: "x = 3", misconception: "turning point read off" },
      ],
      correct: "c",
      picks: { a: ["tomas"], d: ["grace"] },
    },
    {
      key: "check",
      name: "Check by substitution",
      stem: "Given the intercepts $x = 2$ and $x = 4$, which line checks $x = 2$ in",
      tex: "y = x^2 - 6x + 8",
      options: [
        { id: "a", tex: "2^2 + 6(2) + 8 = 24", misconception: "sign of 6x lost" },
        { id: "b", tex: "2^2 - 6(2) + 8 = 0" },
        { id: "c", tex: "2 - 6(2) + 8 = -2", misconception: "x not squared" },
        { id: "d", tex: "2^2 - 6 + 8 = 6", misconception: "6x read as 6" },
      ],
      correct: "b",
      picks: { d: ["jordan"] },
    },
  ]),

  problem("q9", "h = -x^2 + 8x", [
    {
      key: "factorise",
      name: "Height zero, factorised",
      stem: "A ball's height after x metres is $h = -x^2 + 8x$. Which is a correct first line to find where it lands",
      tex: "",
      options: [
        { id: "a", tex: "-2x(x - 4) = 0", misconception: "2x taken out of x²" },
        { id: "b", tex: "-x(x + 8) = 0", misconception: "sign left in the bracket", slip: Q9_SIGN },
        { id: "c", tex: "-x(x - 8) = 0" },
        { id: "d", tex: "x(x + 8) = 0", misconception: "minus sign dropped" },
      ],
      correct: "c",
    },
    {
      key: "lands",
      name: "Where it lands",
      stem: "Given that the height $h = -x^2 + 8x$ is zero when $-x(x - 8) = 0$, where does the ball land",
      tex: "",
      options: [
        { id: "a", tex: "x = 0", misconception: "start read as landing" },
        { id: "b", tex: "x = 8" },
        { id: "c", tex: "x = -8", misconception: "sign of the factor flipped" },
        { id: "d", tex: "x = 4", misconception: "axis given as landing" },
      ],
      correct: "b",
      picks: { d: ["oliver"] },
    },
    {
      key: "axis",
      name: "Axis of symmetry",
      stem: "Given that the ball starts at $x = 0$ and lands at $x = 8$, which is the axis of symmetry of",
      tex: "h = -x^2 + 8x",
      options: [
        { id: "a", tex: "x = 8", misconception: "landing read as axis" },
        { id: "b", tex: "x = -4", misconception: "sign of the axis flipped" },
        { id: "c", tex: "x = 16", misconception: "doubled, not halved" },
        { id: "d", tex: "x = 4" },
      ],
      correct: "d",
    },
    {
      key: "height",
      name: "Greatest height",
      stem: "Given that the axis of symmetry is $x = 4$, what is the greatest height of",
      tex: "h = -x^2 + 8x",
      options: [
        { id: "a", tex: "h = 16" },
        { id: "b", tex: "h = 48", misconception: "−x² taken as +x²" },
        { id: "c", tex: "h = 4", misconception: "axis given as height", slip: Q9_HEIGHT },
        { id: "d", tex: "h = 8", misconception: "landing given as height" },
      ],
      correct: "a",
    },
  ]),

  problem("q10", "x^2 + 2x + 3 = 0", [
    {
      key: "discriminant",
      name: "Discriminant",
      stem: "Which is the discriminant $b^2 - 4ac$ of",
      tex: "x^2 + 2x + 3 = 0",
      options: [
        { id: "a", tex: "4 + 12 = 16", misconception: "sign of 4ac lost" },
        { id: "b", tex: "4 - 12 = -8" },
        { id: "c", tex: "2 - 12 = -10", misconception: "b not squared" },
        { id: "d", tex: "4 - 6 = -2", misconception: "4ac taken as 2ac" },
      ],
      correct: "b",
      picks: { a: ["noah"] },
    },
    {
      key: "justify",
      name: "Justify",
      stem: "Given that the discriminant of $x^2 + 2x + 3 = 0$ is $4 - 12 = -8$, how many real solutions does it have",
      tex: "",
      options: [
        { id: "a", tex: "\\text{no real solutions}" },
        { id: "b", tex: "\\text{one real solution}", misconception: "negative read as one solution" },
        { id: "c", tex: "\\text{two negative solutions}", misconception: "negative solutions, not none" },
        { id: "d", tex: "\\text{two real solutions}", misconception: "negative read as two solutions", slip: Q10_FORMAL },
      ],
      correct: "a",
    },
    {
      key: "context",
      name: "In context",
      stem: "Given that $x^2 + 2x + 3 = 0$ has $\\Delta < 0$, so no real solutions, what does that mean for the graph of",
      tex: "y = x^2 + 2x + 3",
      options: [
        { id: "a", tex: "\\text{crosses the x-axis twice}", misconception: "negative read as two roots", slip: Q10_TWICE },
        { id: "b", tex: "\\text{touches the x-axis once}", misconception: "negative read as one root" },
        { id: "c", tex: "\\text{never meets the y-axis}", misconception: "axes mixed up" },
        { id: "d", tex: "\\text{never meets the x-axis}" },
      ],
      correct: "d",
    },
  ]),
];

/**
 * The one fixed question a problem with no step questions falls back to: a problem of a set made through Create, which
 * has no class slips to draw on yet (FUTURE_FEATURES, 2026-09-14). No distractor is tied to a slip and nobody picks one.
 */
export const FALLBACK_STEP: DiagnosticStep = {
  id: "d-factor-check",
  problemId: "",
  name: "Factorise",
  stem: "Which of these is a factorisation of",
  tex: "2x^2 + 7x - 4",
  options: [
    { id: "a", tex: "(2x + 4)(x - 1)", misconception: "pair not expanded back" },
    { id: "b", tex: "(2x - 1)(x + 4)" },
    { id: "c", tex: "(2x + 1)(x - 4)", misconception: "signs swapped in the pair" },
    { id: "d", tex: "(x + 4)(x - 1)", misconception: "the 2 dropped" },
  ],
  correct: "b",
};

/** Every step question and the fallback, by id: what a push names. */
export const DIAGNOSTIC_MAP = Object.fromEntries([...PROBLEM_DIAGNOSTICS.flatMap((p) => p.steps), FALLBACK_STEP].map((d) => [d.id, d])) as Record<string, DiagnosticStep>;
