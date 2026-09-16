import type { MisconceptionId } from "./misconceptions";

/**
 * One answer to choose from. A distractor names the misconception that picks it (ticket 302): its id in the misconception
 * taxonomy, so a pick counts against the same misconception as a wrong line. `detail` says exactly what this distractor
 * does, five words or fewer, never a student's name and never what the student is supposed to have done. On the teacher's
 * laptop the option reads the misconception's name with the detail beneath it, which tells apart two options sharing a
 * misconception; the maths checks in `lib/diagnostic.test.ts` hold the option to its detail. The board shows neither.
 */
export interface DiagnosticOption {
  id: string;
  tex: string;
  misconception?: MisconceptionId;
  detail?: string;
  /**
   * What picking this distractor means, for the students (ticket 304): the rest of "If you chose A, you…" on the board and
   * "You chose A, meaning you…" on the student's own iPad, once the step is revealed. What the choice gives, never why the
   * student made it; inline maths between `$` signs. Absent on the right option, which reads "correct".
   */
  ifChosen?: string;
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
const Q8_MIRROR = "x = -1 \\;\\text{or}\\; x = -3";
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
        { id: "a", tex: `3${AND}4`, detail: "signs flipped in the pair", misconception: "pair-signs-swapped", ifChosen: "found a pair that adds to $7$, not $-7$", slip: Q1_SIGNS },
        { id: "b", tex: `-6${AND}{-2}`, detail: "product right, sum wrong", misconception: "pair-sum-wrong", ifChosen: "found a pair that adds to $-8$, not $-7$", slip: Q1_PAIR },
        { id: "c", tex: `-3${AND}{-4}` },
        { id: "d", tex: `3${AND}{-4}`, detail: "multiplies to −12", misconception: "pair-signs-swapped", ifChosen: "found a pair that multiplies to $-12$" },
      ],
      correct: "c",
    },
    {
      key: "factorise",
      name: "Factorise",
      stem: "Given that $-3 \\times (-4) = 12$ and $-3 + (-4) = -7$, which is the factorised form of",
      tex: "x^2 - 7x + 12",
      options: [
        { id: "a", tex: "(x + 3)(x + 4)", detail: "signs flipped in the pair", misconception: "pair-signs-swapped", ifChosen: "used $3$ and $4$, which add to $7$", slip: Q1_SIGNS },
        { id: "b", tex: "(x - 3)(x - 4)" },
        { id: "c", tex: "(x - 6)(x - 2)", detail: "product right, sum wrong", misconception: "pair-sum-wrong", ifChosen: "used $-6$ and $-2$, which add to $-8$", slip: Q1_PAIR },
        { id: "d", tex: "(x + 3)(x - 4)", detail: "multiplies to −12", misconception: "pair-signs-swapped", ifChosen: "used $3$ and $-4$, which multiply to $-12$" },
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
        { id: "b", tex: `x = -3${OR}x = -4`, detail: "signs of the factors kept", misconception: "root-vertex-sign", ifChosen: "kept the signs inside the brackets" },
        { id: "c", tex: `x = 3${OR}x = -4`, detail: "one sign flipped", misconception: "root-vertex-sign", ifChosen: "got the sign of one zero wrong" },
        { id: "d", tex: `x = -7${OR}x = 12`, detail: "coefficients read as zeros", misconception: "wrong-feature", ifChosen: "gave the coefficients as the zeros" },
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
        { id: "a", tex: `-6${AND}1`, detail: "signs swapped in the pair", misconception: "pair-signs-swapped", ifChosen: "found a pair that adds to $-5$, not $5$" },
        { id: "b", tex: `6${AND}{-1}` },
        { id: "c", tex: `3${AND}2`, detail: "sign of ac lost", misconception: "product-sign", ifChosen: "found a pair that multiplies to $6$" },
        { id: "d", tex: `-3${AND}2`, detail: "product right, sum wrong", misconception: "pair-sum-wrong", ifChosen: "found a pair that adds to $-1$, not $5$" },
      ],
      correct: "b",
    },
    {
      key: "split-term",
      name: "Split the middle term",
      stem: "Given that $6 \\times (-1) = -6$ and $6 + (-1) = 5$, which splits the middle term of",
      tex: "3x^2 + 5x - 2 = 0",
      options: [
        { id: "a", tex: "3x^2 - 6x + x - 2 = 0", detail: "signs swapped in the split", misconception: "pair-signs-swapped", ifChosen: "split $5x$ into terms adding to $-5x$" },
        { id: "b", tex: "3x^2 + 6x + x - 2 = 0", detail: "split adds to 7", misconception: "pair-sum-wrong", ifChosen: "split $5x$ into terms adding to $7x$" },
        { id: "c", tex: "3x^2 + 6x - x - 2 = 0" },
        { id: "d", tex: "3x^2 + 6x - x + 2 = 0", detail: "sign of the constant flipped", misconception: "rearranging-sign", ifChosen: "changed the constant from $-2$ to $+2$" },
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
        { id: "b", tex: "3x(x + 2) - 1(x - 2) = 0", detail: "minus not carried into bracket", misconception: "minus-not-distributed", ifChosen: "took out $-1$ but kept $-2$ inside" },
        { id: "c", tex: "3x(x + 6) - 1(x + 2) = 0", detail: "6x not divided by 3x", misconception: "partial-distribution", ifChosen: "didn't divide $6x$ by $3x$" },
        { id: "d", tex: "3x(x + 2) + 1(x + 2) = 0", detail: "−1 taken out as +1", misconception: "minus-not-distributed", ifChosen: "took out $+1$ from $-x - 2$" },
      ],
      correct: "a",
    },
    {
      key: "factorise",
      name: "Factorise",
      stem: "Given the grouping $3x(x + 2) - 1(x + 2)$, which is the factorised form of",
      tex: "3x^2 + 5x - 2",
      options: [
        { id: "a", tex: "(3x + 1)(x - 2)", detail: "signs swapped in the pair", misconception: "pair-signs-swapped", ifChosen: "swapped the signs in both brackets" },
        { id: "b", tex: "(x - 1)(x + 2)", detail: "the 3 dropped", misconception: "factor-missing", ifChosen: "dropped the $3$ from $3x$" },
        { id: "c", tex: "(3x + 2)(x - 1)", detail: "pair not expanded back", misconception: "brackets-dont-expand", ifChosen: "have brackets that expand to $3x^2 - x - 2$", slip: Q2_GUESSED },
        { id: "d", tex: "(3x - 1)(x + 2)" },
      ],
      correct: "d",
    },
    {
      key: "solve",
      name: "Null factor law",
      stem: "Given the factorised form, what are the solutions of",
      tex: "(3x - 1)(x + 2) = 0",
      options: [
        { id: "a", tex: `x = -\\tfrac{1}{3}${OR}x = -2`, detail: "sign lost solving a factor", misconception: "solving-sign", ifChosen: "solved $3x - 1 = 0$ as $x = -\\tfrac{1}{3}$", slip: Q2_SIGN },
        { id: "b", tex: `x = \\tfrac{1}{3}${OR}x = -2` },
        { id: "c", tex: `x = 3${OR}x = -2`, detail: "multiplied by 3, not divided", misconception: "divided-wrong-way", ifChosen: "multiplied by $3$ instead of dividing" },
        { id: "d", tex: `x = 1${OR}x = -2`, detail: "the 3 dropped", misconception: "factor-missing", ifChosen: "dropped the $3$ from $3x - 1$" },
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
        { id: "a", tex: `x - 2 = 7${OR}x + 4 = 7`, detail: "null factor law without zero", misconception: "nfl-without-zero", ifChosen: "used the null factor law with $7$, not $0$", slip: Q3_NFL },
        { id: "b", tex: "x^2 - 2x - 8 = 7", detail: "sign wrong expanding", misconception: "collecting-sign", ifChosen: "got the sign of the $x$ term wrong", slip: Q3_EXPAND },
        { id: "c", tex: "x^2 - 8 = 7", detail: "middle term dropped", misconception: "partial-distribution", ifChosen: "left out the $x$ terms" },
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
        { id: "a", tex: "x^2 + 2x - 8 = 0", detail: "the 7 dropped", misconception: "term-lost-rearranging", ifChosen: "dropped the $7$" },
        { id: "b", tex: "x^2 + 2x - 15 = 0" },
        { id: "c", tex: "x^2 + 2x - 1 = 0", detail: "7 added, not subtracted", misconception: "rearranging-sign", ifChosen: "added $7$ instead of subtracting it" },
        { id: "d", tex: "x^2 + 2x + 15 = 0", detail: "sign of the constant flipped", misconception: "rearranging-sign", ifChosen: "wrote the constant as $+15$, not $-15$" },
      ],
      correct: "b",
    },
    {
      key: "factorise",
      name: "Factorise",
      stem: "Given the standard form, which is the factorised form of",
      tex: "x^2 + 2x - 15",
      options: [
        { id: "a", tex: "(x - 5)(x + 3)", detail: "signs flipped in the pair", misconception: "pair-signs-swapped", ifChosen: "used a pair that adds to $-2$, not $2$" },
        { id: "b", tex: "(x + 15)(x - 1)", detail: "product right, sum wrong", misconception: "pair-sum-wrong", ifChosen: "used a pair that adds to $14$, not $2$" },
        { id: "c", tex: "(x + 5)(x - 3)" },
        { id: "d", tex: "(x + 5)(x + 3)", detail: "multiplies to +15", misconception: "pair-signs-swapped", ifChosen: "used a pair that multiplies to $15$" },
      ],
      correct: "c",
    },
    {
      key: "solve",
      name: "Null factor law",
      stem: "Given that $x^2 + 2x - 15 = (x + 5)(x - 3)$, what are the solutions of",
      tex: "(x - 2)(x + 4) = 7",
      options: [
        { id: "a", tex: `x = 5${OR}x = -3`, detail: "signs of the factors kept", misconception: "root-vertex-sign", ifChosen: "kept the signs inside the brackets" },
        { id: "b", tex: `x = -5${OR}x = -3`, detail: "one sign flipped", misconception: "root-vertex-sign", ifChosen: "got the sign of one solution wrong" },
        { id: "c", tex: `x = 2${OR}x = -4`, detail: "the original brackets solved", misconception: "nfl-without-zero", ifChosen: "solved brackets that multiply to $7$, not $0$" },
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
        { id: "a", tex: "a = 2,\\; b = 7,\\; c = 3", detail: "signs dropped", misconception: "coefficients-wrong", ifChosen: "dropped the minus signs from $b$ and $c$" },
        { id: "b", tex: "a = 2,\\; b = -7,\\; c = -3" },
        { id: "c", tex: "a = 2,\\; b = -3,\\; c = -7", detail: "b and c swapped", misconception: "coefficients-wrong", ifChosen: "swapped $b$ and $c$" },
        { id: "d", tex: "a = 2,\\; b = -7,\\; c = 3", detail: "sign of c dropped", misconception: "coefficients-wrong", ifChosen: "dropped the minus sign from $c$" },
      ],
      correct: "b",
      // Ticket 281: Liam, who picked the common slip here while he never reached Q4, now hands Q4 in right and picks b.
    },
    {
      key: "discriminant",
      name: "Discriminant",
      stem: "Given that $a = 2,\\; b = -7,\\; c = -3$, which is the discriminant $b^2 - 4ac$ of",
      tex: "2x^2 - 7x - 3 = 0",
      options: [
        { id: "a", tex: "49 - 24 = 25", detail: "sign of 4ac lost", misconception: "product-sign", ifChosen: "took $-4ac$ as $-24$, not $+24$" },
        { id: "b", tex: "-49 + 24 = -25", detail: "b squared as negative", misconception: "product-sign", ifChosen: "took $(-7)^2$ as $-49$" },
        { id: "c", tex: "49 + 12 = 61", detail: "4ac taken as 2ac", misconception: "discriminant-formula", ifChosen: "used $2ac$ instead of $4ac$" },
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
        { id: "b", tex: "x = \\dfrac{7 \\pm \\sqrt{73}}{2}", detail: "divided by a, not 2a", misconception: "formula-2a", ifChosen: "divided by $a$, not $2a$", slip: Q4_OVER_A },
        { id: "c", tex: "x = 7 \\pm \\dfrac{\\sqrt{73}}{4}", detail: "only the root divided", misconception: "partial-distribution", ifChosen: "divided only the square root by $4$" },
        { id: "d", tex: "x = \\dfrac{-7 \\pm \\sqrt{73}}{4}", detail: "−b written as −7", misconception: "minus-b-dropped", ifChosen: "wrote $-b$ as $-7$, not $7$", slip: Q4_B_SIGN },
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
        { id: "a", tex: "(x + 7)(x - 1)", detail: "signs flipped in the pair", misconception: "pair-signs-swapped", ifChosen: "used a pair that adds to $6$, not $-6$" },
        { id: "b", tex: "(x - 7)(x + 1)" },
        { id: "c", tex: "(x - 7)(x - 1)", detail: "multiplies to +7", misconception: "pair-signs-swapped", ifChosen: "used a pair that multiplies to $7$" },
        { id: "d", tex: "(x - 5)(x - 1)", detail: "sum right, product wrong", misconception: "pair-product-wrong", ifChosen: "used a pair that multiplies to $5$" },
      ],
      correct: "b",
    },
    {
      key: "intercepts",
      name: "x-intercepts",
      stem: "Given the factorised form, which are the x-intercepts of the graph of",
      tex: "y = (x - 7)(x + 1)",
      options: [
        { id: "a", tex: `x = 7${OR}x = 1`, detail: "one sign flipped", misconception: "root-vertex-sign", ifChosen: "got the sign of one intercept wrong" },
        { id: "b", tex: "x = -7", detail: "constant read as intercept", misconception: "wrong-feature", ifChosen: "gave the constant as an intercept" },
        { id: "c", tex: `x = -7${OR}x = 1`, detail: "signs of the pair flipped", misconception: "root-vertex-sign", ifChosen: "kept the signs inside the brackets", slip: Q5_SIGNS },
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
        { id: "b", tex: "x = 4", detail: "half the gap, not midpoint", misconception: "halving-wrong", ifChosen: "took half the gap, not the midpoint" },
        { id: "c", tex: "x = -3", detail: "sign of the axis flipped", misconception: "root-vertex-sign", ifChosen: "got the sign of the axis wrong" },
        { id: "d", tex: "x = 6", detail: "sum not halved", misconception: "halving-wrong", ifChosen: "added the intercepts but didn't halve" },
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
        { id: "a", tex: "(3, -19)", detail: "3 squared as 6", misconception: "substitution-wrong", ifChosen: "worked out $3^2$ as $6$" },
        { id: "b", tex: "(-16, 3)", detail: "coordinates swapped", misconception: "x-for-y", ifChosen: "swapped the $x$ and $y$ coordinates" },
        { id: "c", tex: "(3, -16)" },
        { id: "d", tex: "(3, -7)", detail: "height from the wrong line", misconception: "vertex-y-wrong", ifChosen: "used the $y$-intercept as the height", slip: Q5_HEIGHT },
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
        { id: "b", tex: "8 - 4k", detail: "b not squared", misconception: "discriminant-formula", ifChosen: "didn't square $b$" },
        { id: "c", tex: "64 + 4k", detail: "sign of 4ac lost", misconception: "product-sign", ifChosen: "took $-4ac$ as $+4k$" },
        { id: "d", tex: "64 - k", detail: "the 4 in 4ac dropped", misconception: "discriminant-formula", ifChosen: "left out the $4$ in $4ac$" },
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
        { id: "a", tex: "64 - 4k < 0", detail: "one root read as negative", misconception: "discriminant-root-count", ifChosen: "used $< 0$, which means no roots" },
        { id: "b", tex: "64 - 4k > 0", detail: "one root read as positive", misconception: "discriminant-root-count", ifChosen: "used $> 0$, which means two roots", slip: Q6_TWICE },
        { id: "c", tex: "64 - 4k = 0" },
        { id: "d", tex: "64 - 4k = 1", detail: "equal to one, not zero", misconception: "discriminant-root-count", ifChosen: "set it equal to $1$, not $0$" },
      ],
      correct: "c",
    },
    {
      key: "solve",
      name: "Solve for k",
      stem: "Given that the graph touches the x-axis once when $64 - 4k = 0$, what is $k$",
      tex: "",
      options: [
        { id: "a", tex: "k = -16", detail: "sign lost moving 64", misconception: "rearranging-sign", ifChosen: "got the sign of $k$ wrong" },
        { id: "b", tex: "k = 60", detail: "4 subtracted, not divided", misconception: "wrong-inverse", ifChosen: "subtracted $4$ instead of dividing" },
        { id: "c", tex: "k = 256", detail: "multiplied by 4, not divided", misconception: "wrong-inverse", ifChosen: "multiplied by $4$ instead of dividing" },
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
        { id: "a", tex: "x^2 + 9x + \\tfrac{20}{3}", detail: "constant not scaled", misconception: "partial-distribution", ifChosen: "scaled two terms but not the constant", slip: Q7_TWO_TERMS },
        { id: "b", tex: "\\tfrac{1}{3}(x^2 + 9x + 20)" },
        { id: "c", tex: "x^2 + 9x + 20", detail: "third lost", misconception: "factor-missing", ifChosen: "dropped the $\\tfrac{1}{3}$ in front", slip: Q7_LOST_THIRD },
        { id: "d", tex: "\\tfrac{1}{3}(x^2 + 3x + 20)", detail: "x term not scaled", misconception: "partial-distribution", ifChosen: "didn't scale the $3x$ term" },
      ],
      correct: "b",
    },
    {
      key: "pair",
      name: "Find the pair",
      stem: "Given the first line $\\tfrac{1}{3}(x^2 + 9x + 20)$, which two numbers add to $9$ and multiply to $20$",
      tex: "",
      options: [
        { id: "a", tex: `-4${AND}{-5}`, detail: "signs flipped in the pair", misconception: "pair-signs-swapped", ifChosen: "found a pair that adds to $-9$, not $9$" },
        { id: "b", tex: `3${AND}6`, detail: "sum right, product wrong", misconception: "pair-product-wrong", ifChosen: "found a pair that multiplies to $18$" },
        { id: "c", tex: `1${AND}20`, detail: "product right, sum wrong", misconception: "pair-sum-wrong", ifChosen: "found a pair that adds to $21$, not $9$", slip: Q7_PAIR },
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
        { id: "b", tex: "(x + 4)(x + 5)", detail: "third dropped at the end", misconception: "factor-missing", ifChosen: "dropped the $\\tfrac{1}{3}$ at the end" },
        { id: "c", tex: "3(x + 4)(x + 5)", detail: "tripled, not a third", misconception: "divided-wrong-way", ifChosen: "put $3$ in front, not $\\tfrac{1}{3}$" },
        { id: "d", tex: "\\tfrac{1}{3}(x - 4)(x - 5)", detail: "signs flipped in the pair", misconception: "pair-signs-swapped", ifChosen: "used a pair that adds to $-9$, not $9$" },
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
        { id: "a", tex: `x = -2${OR}x = -4`, detail: "mirrored in the y-axis", misconception: "graph-signs", ifChosen: "flipped the signs of both intercepts", slip: Q8_MIRROR },
        { id: "b", tex: "x = 8", detail: "y-intercept read off", misconception: "wrong-feature", ifChosen: "gave the $y$-intercept" },
        { id: "c", tex: `x = 2${OR}x = 4` },
        { id: "d", tex: "x = 3", detail: "turning point read off", misconception: "wrong-feature", ifChosen: "gave the axis of symmetry" },
      ],
      correct: "c",
      // Ticket 347: option "a" now ties a real slip (Priya, Amelia and Aiden all made it), so it is picked by the
      // `mirrored` branch instead; Tomas, who never reached Q8, is left to the correct answer rather than a plausible guess.
      picks: { d: ["grace"] },
    },
    {
      key: "check",
      name: "Check by substitution",
      stem: "Given the intercepts $x = 2$ and $x = 4$, which line checks $x = 2$ in",
      tex: "y = x^2 - 6x + 8",
      options: [
        { id: "a", tex: "2^2 + 6(2) + 8 = 24", detail: "sign of 6x lost", misconception: "product-sign", ifChosen: "wrote $-6x$ as $+6(2)$" },
        { id: "b", tex: "2^2 - 6(2) + 8 = 0" },
        { id: "c", tex: "2 - 6(2) + 8 = -2", detail: "x not squared", misconception: "substitution-wrong", ifChosen: "didn't square the $2$" },
        { id: "d", tex: "2^2 - 6 + 8 = 6", detail: "6x read as 6", misconception: "substitution-wrong", ifChosen: "wrote $6x$ as $6$" },
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
        { id: "a", tex: "-2x(x - 4) = 0", detail: "2x taken out of x²", misconception: "brackets-dont-expand", ifChosen: "have brackets that expand to $-2x^2 + 8x$" },
        { id: "b", tex: "-x(x + 8) = 0", detail: "sign left in the bracket", misconception: "minus-not-distributed", ifChosen: "took out $-x$ but kept $+8$ inside", slip: Q9_SIGN },
        { id: "c", tex: "-x(x - 8) = 0" },
        { id: "d", tex: "x(x + 8) = 0", detail: "minus sign dropped", misconception: "minus-not-distributed", ifChosen: "dropped the minus sign on $x^2$" },
      ],
      correct: "c",
    },
    {
      key: "lands",
      name: "Where it lands",
      stem: "Given that the height $h = -x^2 + 8x$ is zero when $-x(x - 8) = 0$, where does the ball land",
      tex: "",
      options: [
        { id: "a", tex: "x = 0", detail: "start read as landing", misconception: "context-not-checked", ifChosen: "gave where the ball starts" },
        { id: "b", tex: "x = 8" },
        { id: "c", tex: "x = -8", detail: "sign of the factor flipped", misconception: "root-vertex-sign", ifChosen: "got the sign of the landing point wrong" },
        { id: "d", tex: "x = 4", detail: "axis given as landing", misconception: "wrong-feature", ifChosen: "gave the axis of symmetry" },
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
        { id: "a", tex: "x = 8", detail: "landing read as axis", misconception: "wrong-feature", ifChosen: "gave where the ball lands" },
        { id: "b", tex: "x = -4", detail: "sign of the axis flipped", misconception: "root-vertex-sign", ifChosen: "got the sign of the axis wrong" },
        { id: "c", tex: "x = 16", detail: "doubled, not halved", misconception: "halving-wrong", ifChosen: "doubled instead of halving" },
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
        { id: "b", tex: "h = 48", detail: "−x² taken as +x²", misconception: "product-sign", ifChosen: "took $-x^2$ as $+x^2$" },
        { id: "c", tex: "h = 4", detail: "axis given as height", misconception: "x-for-y", ifChosen: "gave the axis, not the height", slip: Q9_HEIGHT },
        { id: "d", tex: "h = 8", detail: "landing given as height", misconception: "x-for-y", ifChosen: "gave where the ball lands" },
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
        { id: "a", tex: "4 + 12 = 16", detail: "sign of 4ac lost", misconception: "product-sign", ifChosen: "took $-4ac$ as $+12$" },
        { id: "b", tex: "4 - 12 = -8" },
        { id: "c", tex: "2 - 12 = -10", detail: "b not squared", misconception: "discriminant-formula", ifChosen: "didn't square $b$" },
        { id: "d", tex: "4 - 6 = -2", detail: "4ac taken as 2ac", misconception: "discriminant-formula", ifChosen: "used $2ac$ instead of $4ac$" },
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
        { id: "b", tex: "\\text{one real solution}", detail: "negative read as one solution", misconception: "discriminant-root-count", ifChosen: "said one, but $\\Delta < 0$ means none" },
        { id: "c", tex: "\\text{two negative solutions}", detail: "negative solutions, not none", misconception: "discriminant-root-count", ifChosen: "said two negative, but $\\Delta < 0$ means none" },
        { id: "d", tex: "\\text{two real solutions}", detail: "negative read as two solutions", misconception: "discriminant-root-count", ifChosen: "said two, but $\\Delta < 0$ means none", slip: Q10_FORMAL },
      ],
      correct: "a",
    },
    {
      key: "context",
      name: "In context",
      stem: "Given that $\\Delta < 0$, so no real solutions, what does that mean for the graph of",
      tex: "y = x^2 + 2x + 3",
      options: [
        { id: "a", tex: "\\text{crosses the x-axis twice}", detail: "negative read as two roots", misconception: "context-not-checked", ifChosen: "said twice, but $\\Delta < 0$ means never", slip: Q10_TWICE },
        { id: "b", tex: "\\text{touches the x-axis once}", detail: "negative read as one root", misconception: "context-not-checked", ifChosen: "said once, but $\\Delta < 0$ means never" },
        { id: "c", tex: "\\text{never meets the y-axis}", detail: "y-axis for x-axis", misconception: "wrong-feature", ifChosen: "gave the $y$-axis, not the $x$-axis" },
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
    { id: "a", tex: "(2x + 4)(x - 1)", detail: "pair not expanded back", misconception: "brackets-dont-expand", ifChosen: "have brackets that expand to $2x^2 + 2x - 4$" },
    { id: "b", tex: "(2x - 1)(x + 4)" },
    { id: "c", tex: "(2x + 1)(x - 4)", detail: "signs swapped in the pair", misconception: "pair-signs-swapped", ifChosen: "swapped the signs in both brackets" },
    { id: "d", tex: "(x + 4)(x - 1)", detail: "the 2 dropped", misconception: "factor-missing", ifChosen: "dropped the $2$ from $2x$" },
  ],
  correct: "b",
};

/** Every step question and the fallback, by id: what a push names. */
export const DIAGNOSTIC_MAP = Object.fromEntries([...PROBLEM_DIAGNOSTICS.flatMap((p) => p.steps), FALLBACK_STEP].map((d) => [d.id, d])) as Record<string, DiagnosticStep>;
