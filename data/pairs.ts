import type { LeafId } from "./taxonomy";
import { tag, type PracticeProblem, type QuestionPair } from "./types";

/**
 * The questions the worked example-problem pair runs on (ticket 310; the shape and the blank-line rule are documented beside
 * `PracticeProblem` in `data/types.ts`, the rule itself is `blankSteps` in `lib/pairs.ts`). Hand-checked, every fact held by
 * `lib/pairs.test.ts`.
 *
 * `QUESTION_PAIRS`: for each of Problem Set 6's ten questions, Q* (worked) and Q** (finished by the student). Each is a whole
 * question like Q: its stem, difficulty and kind of figure, as many steps in the same order with Q's skill tags step for
 * step, and one or two surface things changed (a coefficient, a sign, the context's numbers). Q** carries a hint for every
 * point in its working and, where Q has a real choice of ways in, the help chat's approaches.
 *
 * `COMPLETIONS`: for each of the 15 practice skills (`PRACTICES` in `data/practice.ts`), the completion problem that sits
 * between the practice problem (the worked example) and its follow-up (the problem done alone): the example's working with
 * one thing changed, its own hint for every point, and the example's approaches when it has them.
 *
 * None of these repeats a problem anywhere else in the app (the set, the practice bank, the diagnostics' and homework's
 * similar problems, the finished sets, the homework drafts), nor each other.
 */
export const QUESTION_PAIRS: QuestionPair[] = [
  {
    problemId: "q1",
    worked: {
      id: "q1-star",
      label: "Q1*",
      difficulty: "simple familiar",
      stem: "Solve for x.",
      tex: "x^2 - 9x + 14 = 0",
      solution: [
        { tex: "x^2 - 9x + 14 = 0", label: "Standard form", tags: [tag("algebra.equations.quadratic")] },
        { tex: "(x-2)(x-7) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
        { tex: "x = 2 \\;\\text{or}\\; x = 7", label: "Null factor law", tags: [tag("functions.zeros.nfl"), tag("algebra.equations.quadratic")] },
      ],
    },
    completion: {
      id: "q1-star-star",
      label: "Q1**",
      difficulty: "simple familiar",
      stem: "Solve for x.",
      tex: "x^2 - 9x + 18 = 0",
      solution: [
        { tex: "x^2 - 9x + 18 = 0", label: "Standard form", tags: [tag("algebra.equations.quadratic")] },
        { tex: "(x-3)(x-6) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
        { tex: "x = 3 \\;\\text{or}\\; x = 6", label: "Null factor law", tags: [tag("functions.zeros.nfl"), tag("algebra.equations.quadratic")] },
      ],
      hints: [
        { text: "It is already in standard form, with zero on one side. Write the equation down as your first line.", at: [0], terms: [{ phrase: "zero", tex: ["0"] }] },
        {
          text: "Look for two numbers that multiply to the constant and add to the middle coefficient. The constant is positive and the middle term negative, so both numbers are negative.",
          at: [1],
          terms: [
            { phrase: "constant", tex: ["18"] },
            { phrase: "middle term", tex: ["- 9x"] },
          ],
        },
        {
          text: "The two factors multiply to give 0, so one of them must be zero. Set each factor equal to zero on its own.",
          at: [2],
          terms: [
            { phrase: "factors", tex: ["(x-3)", "(x-6)"] },
            { phrase: "0", tex: ["0"] },
          ],
        },
      ],
      approaches: [
        { name: "factorise", hint: "Find two numbers that multiply to $18$ and add to $-9$, then write the two factors and use the null factor law." },
        { name: "the quadratic formula", hint: "Read off $a$, $b$ and $c$, watching the sign of $b$, and put them straight into the formula." },
      ],
    },
  },
  {
    problemId: "q2",
    worked: {
      id: "q2-star",
      label: "Q2*",
      difficulty: "simple familiar",
      stem: "Solve for x.",
      tex: "2x^2 + 11x - 6 = 0",
      solution: [
        { tex: "2x^2 + 11x - 6 = 0", label: "Standard form", tags: [tag("algebra.equations.quadratic")] },
        { tex: "ac = -12,\\quad 12 + (-1) = 11", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
        { tex: "2x^2 + 12x - x - 6 = 0", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
        { tex: "2x(x+6) - 1(x+6) = 0", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
        { tex: "(2x - 1)(x + 6) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
        { tex: "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -6", label: "Null factor law", tags: [tag("functions.zeros.nfl"), tag("algebra.number.fractions")] },
      ],
    },
    completion: {
      id: "q2-star-star",
      label: "Q2**",
      difficulty: "simple familiar",
      stem: "Solve for x.",
      tex: "2x^2 + 7x - 15 = 0",
      solution: [
        { tex: "2x^2 + 7x - 15 = 0", label: "Standard form", tags: [tag("algebra.equations.quadratic")] },
        { tex: "ac = -30,\\quad 10 + (-3) = 7", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
        { tex: "2x^2 + 10x - 3x - 15 = 0", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
        { tex: "2x(x+5) - 3(x+5) = 0", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
        { tex: "(2x - 3)(x + 5) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
        { tex: "x = \\tfrac{3}{2} \\;\\text{or}\\; x = -5", label: "Null factor law", tags: [tag("functions.zeros.nfl"), tag("algebra.number.fractions")] },
      ],
      hints: [
        { text: "Everything is already on one side, with zero on the other. Write the equation down as your first line.", at: [0], terms: [{ phrase: "zero", tex: ["0"] }] },
        {
          text: "Multiply a by c, then look for two numbers that multiply to ac and add to b.",
          at: [1],
          terms: [
            { phrase: "a", tex: ["2"] },
            { phrase: "b", tex: ["7"] },
            { phrase: "c", tex: ["- 15"] },
            { phrase: "ac", tex: ["2", "- 15"] },
          ],
        },
        {
          text: "The pair checks out. Split the middle term into two x terms using those two numbers; the first and last terms stay as they are.",
          at: [2],
          terms: [{ phrase: "two numbers", tex: ["10", "(-3)"] }],
        },
        {
          text: "Take a common factor out of the first two terms, then out of the last two. Take the minus out with the 3, so the brackets match.",
          at: [3],
          terms: [
            { phrase: "first two terms", tex: ["2x^2 + 10x"] },
            { phrase: "last two", tex: ["- 3x - 15"] },
          ],
        },
        {
          text: "Both parts share the same bracket. Take it out as a common factor, and what is left makes the other factor.",
          at: [4],
          terms: [{ phrase: "same bracket", tex: ["(x+5)", { tex: "(x+5)", within: "3(x+5)" }] }],
        },
        {
          text: "The two factors multiply to give 0, so one of them must be zero. Set each factor equal to zero and solve; one answer is a fraction.",
          at: [5],
          terms: [{ phrase: "factors", tex: ["(2x - 3)", "(x + 5)"] }],
        },
      ],
      approaches: [
        { name: "split the middle term", hint: "Multiply $a$ by $c$, find the pair that multiplies to that and adds to $b$, then split $7x$ into those two parts and group." },
        { name: "the cross method", hint: "Write the factor pairs of $2x^2$ down one side and of $-15$ down the other, and cross-multiply until the two products add to $7x$." },
      ],
    },
  },
  {
    problemId: "q3",
    worked: {
      id: "q3-star",
      label: "Q3*",
      difficulty: "simple unfamiliar",
      stem: "Find all values of x for which the following holds.",
      tex: "(x - 2)(x + 3) = 14",
      solution: [
        { tex: "(x - 2)(x + 3) = 14", label: "Copied the equation", tags: [tag("algebra.equations.quadratic")] },
        { tex: "x^2 + x - 6 = 14", label: "Expanded first", tags: [tag("algebra.expand-factor.expand")] },
        { tex: "x^2 + x - 20 = 0", label: "Rearranged to standard form", tags: [tag("algebra.equations.linear")] },
        { tex: "(x - 4)(x + 5) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
        { tex: "x = 4 \\;\\text{or}\\; x = -5", label: "Null factor law", tags: [tag("functions.zeros.nfl"), tag("algebra.equations.quadratic")] },
      ],
    },
    completion: {
      id: "q3-star-star",
      label: "Q3**",
      difficulty: "simple unfamiliar",
      stem: "Find all values of x for which the following holds.",
      tex: "(x - 5)(x + 2) = 8",
      solution: [
        { tex: "(x - 5)(x + 2) = 8", label: "Copied the equation", tags: [tag("algebra.equations.quadratic")] },
        { tex: "x^2 - 3x - 10 = 8", label: "Expanded first", tags: [tag("algebra.expand-factor.expand")] },
        { tex: "x^2 - 3x - 18 = 0", label: "Rearranged to standard form", tags: [tag("algebra.equations.linear")] },
        { tex: "(x - 6)(x + 3) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
        { tex: "x = 6 \\;\\text{or}\\; x = -3", label: "Null factor law", tags: [tag("functions.zeros.nfl"), tag("algebra.equations.quadratic")] },
      ],
      hints: [
        { text: "Copy the equation down as your first line. The right side is 8, not 0, so nothing can be said about each bracket on its own yet.", at: [0], terms: [{ phrase: "right side", tex: ["8"] }] },
        {
          text: "The null factor law needs a zero on one side. Expand the brackets first: every term in one meets every term in the other.",
          at: [1],
          terms: [{ phrase: "brackets", tex: ["(x - 5)", "(x + 2)"] }],
        },
        { text: "Now move the 8 across so the right side is zero. It changes sign as it goes.", at: [2], terms: [{ phrase: "8", tex: ["8"] }] },
        {
          text: "Look for two numbers that multiply to -18 and add to -3.",
          at: [3],
          terms: [
            { phrase: "-18", tex: ["- 18"] },
            { phrase: "-3", tex: ["- 3"] },
          ],
        },
        {
          text: "The two factors multiply to give 0, so one of them must be zero. Set each factor equal to zero on its own, and mind the signs.",
          at: [4],
          terms: [{ phrase: "factors", tex: ["(x - 6)", "(x + 3)"] }],
        },
      ],
      approaches: [
        { name: "expand, then factorise", hint: "Expand the left side, bring the $8$ across so one side is zero, then find two numbers for the factors." },
        { name: "expand, then the formula", hint: "Expand the left side, bring the $8$ across so one side is zero, then read off $a$, $b$ and $c$ for the quadratic formula." },
      ],
    },
  },
  {
    problemId: "q4",
    worked: {
      id: "q4-star",
      label: "Q4*",
      difficulty: "complex familiar",
      stem: "Solve, giving exact values.",
      tex: "2x^2 - 5x - 1 = 0",
      solution: [
        { tex: "a = 2,\\; b = -5,\\; c = -1", label: "Identified a, b, c", tags: [tag("algebra.equations.quadratic")] },
        { tex: "b^2 - 4ac = 25 + 8 = 33", label: "Discriminant", tags: [tag("algebra.equations.discriminant")] },
        { tex: "x = \\dfrac{5 \\pm \\sqrt{33}}{4}", label: "Quadratic formula", tags: [tag("algebra.equations.quadratic"), tag("algebra.number.fractions")] },
      ],
    },
    completion: {
      id: "q4-star-star",
      label: "Q4**",
      difficulty: "complex familiar",
      stem: "Solve, giving exact values.",
      tex: "3x^2 - 7x - 1 = 0",
      solution: [
        { tex: "a = 3,\\; b = -7,\\; c = -1", label: "Identified a, b, c", tags: [tag("algebra.equations.quadratic")] },
        { tex: "b^2 - 4ac = 49 + 12 = 61", label: "Discriminant", tags: [tag("algebra.equations.discriminant")] },
        { tex: "x = \\dfrac{7 \\pm \\sqrt{61}}{6}", label: "Quadratic formula", tags: [tag("algebra.equations.quadratic"), tag("algebra.number.fractions")] },
      ],
      hints: [
        {
          text: "This does not factorise with whole numbers, so read off a, b and c, signs included.",
          at: [0],
          terms: [
            { phrase: "a", tex: ["3"] },
            { phrase: "b", tex: ["- 7"] },
            { phrase: "c", tex: ["- 1"] },
          ],
        },
        {
          text: "Work out the discriminant, b² − 4ac, first. Mind the signs: b is negative, and so is c.",
          at: [1],
          terms: [
            { phrase: "b", tex: ["-7"] },
            { phrase: "c", tex: ["-1"] },
          ],
        },
        { text: "Put b and the discriminant into the quadratic formula. The ± gives both solutions, and the whole top is over 2a.", at: [2], terms: [{ phrase: "discriminant", tex: ["61"] }] },
      ],
      approaches: [
        { name: "the quadratic formula", hint: "Read off $a$, $b$ and $c$, work out $b^2 - 4ac$, then put them into $x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$." },
        { name: "complete the square", hint: "Divide every term by $3$, move the constant across, and add the square of half the $x$ coefficient to both sides." },
      ],
    },
  },
  {
    problemId: "q5",
    worked: {
      id: "q5-star",
      label: "Q5*",
      difficulty: "simple unfamiliar",
      stem: "Find the x-intercepts and the turning point of the graph of",
      tex: "y = x^2 - 4x - 21",
      solution: [
        { tex: "(x - 7)(x + 3) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
        { tex: "x = 7 \\;\\text{or}\\; x = -3", label: "x-intercepts", tags: [tag("functions.zeros.nfl"), tag("functions.zeros.zero-finding")] },
        { tex: "x = \\tfrac{7 + (-3)}{2} = 2", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features"), tag("algebra.number.fractions")] },
        { tex: "y = 4 - 8 - 21 = -25", label: "Height on the axis", tags: [tag("graphing.quadratics.features")] },
        { tex: "(2, -25)", label: "Turning point", tags: [tag("graphing.quadratics.features"), tag("graphing.quadratics.sketch")] },
      ],
    },
    completion: {
      id: "q5-star-star",
      label: "Q5**",
      difficulty: "simple unfamiliar",
      stem: "Find the x-intercepts and the turning point of the graph of",
      tex: "y = x^2 - 6x - 27",
      solution: [
        { tex: "(x - 9)(x + 3) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
        { tex: "x = 9 \\;\\text{or}\\; x = -3", label: "x-intercepts", tags: [tag("functions.zeros.nfl"), tag("functions.zeros.zero-finding")] },
        { tex: "x = \\tfrac{9 + (-3)}{2} = 3", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features"), tag("algebra.number.fractions")] },
        { tex: "y = 9 - 18 - 27 = -36", label: "Height on the axis", tags: [tag("graphing.quadratics.features")] },
        { tex: "(3, -36)", label: "Turning point", tags: [tag("graphing.quadratics.features"), tag("graphing.quadratics.sketch")] },
      ],
      hints: [
        {
          text: "The graph meets the x-axis where y is 0. Factorise: look for two numbers that multiply to -27 and add to -6.",
          at: [0],
          terms: [
            { phrase: "-27", tex: ["- 27"] },
            { phrase: "-6", tex: ["- 6"] },
          ],
        },
        { text: "The product is zero, so one of the factors must be. Set each one to zero on its own.", at: [1], terms: [{ phrase: "factors", tex: ["(x - 9)", "(x + 3)"] }] },
        { text: "The axis of symmetry sits halfway between the two intercepts.", at: [2], terms: [{ phrase: "two intercepts", tex: ["9", "-3"] }] },
        {
          text: "The turning point sits on the axis of symmetry, so its height is the value of y there. Substitute this x into the rule.",
          at: [3],
          terms: [{ phrase: "this x", tex: [{ tex: "3", within: "= 3" }] }],
        },
        {
          text: "That height and the x on the axis are the turning point's two coordinates. Write it as a point, x first.",
          at: [4],
          terms: [{ phrase: "height", tex: [{ tex: "-36", within: "= -36" }] }],
        },
      ],
      approaches: [
        { name: "halfway between the intercepts", hint: "Factorise to find where the graph crosses the $x$-axis; the axis of symmetry is halfway between, and the turning point sits on it." },
        { name: "the formula for the axis", hint: "The axis of symmetry is at $x = -\\frac{b}{2a}$; substitute that $x$ back in for the height." },
      ],
    },
  },
  {
    problemId: "q6",
    worked: {
      id: "q6-star",
      label: "Q6*",
      difficulty: "complex unfamiliar",
      stem: "For which value of k does the graph of the following touch the x-axis exactly once?",
      tex: "y = x^2 + 10x + k",
      solution: [
        { tex: "b^2 - 4ac = 100 - 4k", label: "Discriminant", tags: [tag("algebra.equations.discriminant")] },
        { tex: "100 - 4k = 0", label: "One root: discriminant zero", tags: [tag("algebra.equations.discriminant"), tag("functions.zeros.zero-finding")] },
        { tex: "k = 25", label: "Solved for k", tags: [tag("algebra.equations.linear")] },
      ],
    },
    completion: {
      id: "q6-star-star",
      label: "Q6**",
      difficulty: "complex unfamiliar",
      stem: "For which value of k does the graph of the following touch the x-axis exactly once?",
      tex: "y = x^2 + 12x + k",
      solution: [
        { tex: "b^2 - 4ac = 144 - 4k", label: "Discriminant", tags: [tag("algebra.equations.discriminant")] },
        { tex: "144 - 4k = 0", label: "One root: discriminant zero", tags: [tag("algebra.equations.discriminant"), tag("functions.zeros.zero-finding")] },
        { tex: "k = 36", label: "Solved for k", tags: [tag("algebra.equations.linear")] },
      ],
      hints: [
        {
          text: "How many times the graph meets the x-axis comes from the discriminant. Work out b² − 4ac, with k as the c.",
          at: [0],
          terms: [
            { phrase: "b", tex: ["12"] },
            { phrase: "c", within: "4ac", tex: ["k"] },
          ],
        },
        { text: "Exactly once means one repeated root, which is when the discriminant is zero. Set it equal to zero.", at: [1], terms: [{ phrase: "discriminant", tex: ["144 - 4k"] }] },
        { text: "What is left is a linear equation in k. Get the k term on its own side, then divide.", at: [2], terms: [{ phrase: "k term", tex: ["- 4k"] }] },
      ],
      approaches: [
        { name: "the discriminant", hint: "Touching the $x$-axis once means one root, so set $b^2 - 4ac = 0$ and solve for $k$." },
        { name: "complete the square", hint: "Write the right side as a perfect square plus a number in $k$; the graph touches the $x$-axis once when that number is zero." },
      ],
    },
  },
  {
    problemId: "q7",
    worked: {
      id: "q7-star",
      label: "Q7*",
      difficulty: "complex familiar",
      stem: "Factorise fully.",
      tex: "\\tfrac{1}{3}x^2 + 3x + \\tfrac{8}{3}",
      solution: [
        { tex: "\\tfrac{1}{3}(x^2 + 9x + 8)", label: "Took out the third", tags: [tag("algebra.number.fractions"), tag("algebra.expand-factor.nonmonic")] },
        { tex: "1 \\times 8 = 8,\\quad 1 + 8 = 9", label: "Found the pair", tags: [tag("algebra.expand-factor.nonmonic"), tag("algebra.expand-factor.monic")] },
        { tex: "\\tfrac{1}{3}(x + 1)(x + 8)", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic"), tag("algebra.expand-factor.binomial")] },
      ],
    },
    completion: {
      id: "q7-star-star",
      label: "Q7**",
      difficulty: "complex familiar",
      stem: "Factorise fully.",
      tex: "\\tfrac{1}{3}x^2 + 4x + \\tfrac{35}{3}",
      solution: [
        { tex: "\\tfrac{1}{3}(x^2 + 12x + 35)", label: "Took out the third", tags: [tag("algebra.number.fractions"), tag("algebra.expand-factor.nonmonic")] },
        { tex: "5 \\times 7 = 35,\\quad 5 + 7 = 12", label: "Found the pair", tags: [tag("algebra.expand-factor.nonmonic"), tag("algebra.expand-factor.monic")] },
        { tex: "\\tfrac{1}{3}(x + 5)(x + 7)", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic"), tag("algebra.expand-factor.binomial")] },
      ],
      hints: [
        {
          text: "Take a third out of every term first: ask what each term is a third of.",
          at: [0],
          terms: [{ phrase: "every term", tex: ["\\tfrac{1}{3}x^2", "4x", "\\tfrac{35}{3}"] }],
        },
        {
          text: "Inside the bracket is a monic quadratic. Look for two numbers that multiply to 35 and add to 12.",
          at: [1],
          terms: [
            { phrase: "35", tex: ["35"] },
            { phrase: "12", tex: ["12"] },
          ],
        },
        {
          text: "The pair checks out. Write the bracket as two factors from those two numbers, and keep the third out in front.",
          at: [2],
          terms: [{ phrase: "two numbers", tex: ["5", "7"] }],
        },
      ],
    },
  },
  {
    problemId: "q8",
    worked: {
      id: "q8-star",
      label: "Q8*",
      difficulty: "simple familiar",
      stem: "The graph of the following is shown. Read off its x-intercepts and check them.",
      tex: "y = x^2 - 5x + 4",
      figure: "q8-star-parabola",
      solution: [
        { tex: "x = 1 \\;\\text{or}\\; x = 4", label: "Read from the graph", tags: [tag("graphing.quadratics.features"), tag("functions.zeros.zero-finding")] },
        { tex: "1 - 5 + 4 = 0 \\;\\checkmark", label: "Checked by substitution", tags: [tag("functions.notation.evaluate"), tag("functions.zeros.zero-finding")] },
      ],
    },
    completion: {
      id: "q8-star-star",
      label: "Q8**",
      difficulty: "simple familiar",
      stem: "The graph of the following is shown. Read off its x-intercepts and check them.",
      tex: "y = x^2 - 8x + 15",
      figure: "q8-star-star-parabola",
      solution: [
        { tex: "x = 3 \\;\\text{or}\\; x = 5", label: "Read from the graph", tags: [tag("graphing.quadratics.features"), tag("functions.zeros.zero-finding")] },
        { tex: "9 - 24 + 15 = 0 \\;\\checkmark", label: "Checked by substitution", tags: [tag("functions.notation.evaluate"), tag("functions.zeros.zero-finding")] },
      ],
      hints: [
        { text: "The x-intercepts are where the curve crosses the x-axis. Read the two x values off the graph.", at: [0] },
        { text: "Check a value you read by substituting it into the rule: if the graph really crosses there, y comes out as 0.", at: [1], terms: [{ phrase: "value", tex: ["3"] }] },
      ],
    },
  },
  {
    problemId: "q9",
    worked: {
      id: "q9-star",
      label: "Q9*",
      difficulty: "complex unfamiliar",
      stem: "A ball's height after travelling x metres is given below. Where does it land, and what is its greatest height?",
      tex: "h = -x^2 + 10x",
      answerAs: "sentence",
      solution: [
        { tex: "-x(x - 10) = 0", label: "Height zero, factorised", tags: [tag("reasoning.interpret.worded"), tag("algebra.expand-factor.expand")] },
        { tex: "x = 0 \\;\\text{or}\\; x = 10", label: "Lands at x = 10", tags: [tag("functions.zeros.nfl"), tag("functions.zeros.zero-finding")] },
        { tex: "x = 5", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features"), tag("graphing.quadratics.sketch")] },
        { tex: "h = -25 + 50 = 25", label: "Greatest height 25 m", tags: [tag("graphing.quadratics.features")] },
      ],
    },
    completion: {
      id: "q9-star-star",
      label: "Q9**",
      difficulty: "complex unfamiliar",
      stem: "A ball's height after travelling x metres is given below. Where does it land, and what is its greatest height?",
      tex: "h = -x^2 + 12x",
      answerAs: "sentence",
      solution: [
        { tex: "-x(x - 12) = 0", label: "Height zero, factorised", tags: [tag("reasoning.interpret.worded"), tag("algebra.expand-factor.expand")] },
        { tex: "x = 0 \\;\\text{or}\\; x = 12", label: "Lands at x = 12", tags: [tag("functions.zeros.nfl"), tag("functions.zeros.zero-finding")] },
        { tex: "x = 6", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features"), tag("graphing.quadratics.sketch")] },
        { tex: "h = -36 + 72 = 36", label: "Greatest height 36 m", tags: [tag("graphing.quadratics.features")] },
      ],
      hints: [
        { text: "Landing means the height is zero. Set the rule equal to zero, then take out the common factor.", at: [0], terms: [{ phrase: "height", tex: ["h"] }] },
        { text: "The product is zero, so one of its factors must be. Set each one to zero on its own.", at: [1], terms: [{ phrase: "factors", tex: ["-x", "(x - 12)"] }] },
        {
          text: "The ball is thrown at one zero and lands at the other. Its greatest height is halfway between them.",
          at: [2],
          terms: [
            { phrase: "one zero", tex: ["0"] },
            { phrase: "the other", tex: ["12"] },
          ],
        },
        { text: "The greatest height is the value of h on the axis. Substitute this x into the rule, minding the minus in front.", at: [3], terms: [{ phrase: "this x", tex: [{ tex: "6", within: "= 6" }] }] },
      ],
      approaches: [
        { name: "factorise first", hint: "Landing means $h = 0$: take out the common factor $-x$ and use the null factor law; the greatest height is halfway between the two zeros." },
        { name: "the formula for the axis", hint: "Landing means $h = 0$; the highest point is on the axis $x = -\\frac{b}{2a}$, so substitute that $x$ into the rule for the height." },
      ],
    },
  },
  {
    problemId: "q10",
    worked: {
      id: "q10-star",
      label: "Q10*",
      difficulty: "complex unfamiliar",
      stem: "Show that the following has no real solutions, and say what that means for the graph of y = x² + 6x + 10.",
      tex: "x^2 + 6x + 10 = 0",
      answerAs: "sentence",
      solution: [
        { tex: "b^2 - 4ac = 36 - 40 = -4", label: "Discriminant", tags: [tag("algebra.equations.discriminant")] },
        { tex: "\\Delta < 0 \\Rightarrow \\text{no real solutions}", label: "Justified", tags: [tag("reasoning.justify.formal")] },
        { tex: "\\text{The graph never meets the x-axis}", label: "In context", tags: [tag("reasoning.justify.conclusions"), tag("graphing.quadratics.sketch")] },
      ],
    },
    completion: {
      id: "q10-star-star",
      label: "Q10**",
      difficulty: "complex unfamiliar",
      stem: "Show that the following has no real solutions, and say what that means for the graph of y = x² + 4x + 7.",
      tex: "x^2 + 4x + 7 = 0",
      answerAs: "sentence",
      solution: [
        { tex: "b^2 - 4ac = 16 - 28 = -12", label: "Discriminant", tags: [tag("algebra.equations.discriminant")] },
        { tex: "\\Delta < 0 \\Rightarrow \\text{no real solutions}", label: "Justified", tags: [tag("reasoning.justify.formal")] },
        { tex: "\\text{The graph never meets the x-axis}", label: "In context", tags: [tag("reasoning.justify.conclusions"), tag("graphing.quadratics.sketch")] },
      ],
      hints: [
        {
          text: "Whether there are real solutions comes from the discriminant. Work out b² − 4ac.",
          at: [0],
          terms: [
            { phrase: "b", tex: ["4"] },
            { phrase: "a", within: "4ac", tex: [], insert: { before: "x^2", tex: "1" } },
            { phrase: "c", within: "4ac", tex: ["7"] },
          ],
        },
        { text: "The discriminant is negative. Name that fact, then say what it forces about the real solutions.", at: [1], terms: [{ phrase: "discriminant", tex: ["-12"] }] },
        { text: "Now say what that means for the graph, in a sentence. Where on the graph would a real solution show up?", at: [2] },
      ],
      approaches: [
        { name: "the discriminant", hint: "Work out $b^2 - 4ac$; its sign says how many real solutions there are, and each one is a point where the graph meets the $x$-axis." },
        { name: "complete the square", hint: "Write the left side as a perfect square plus a number, and ask whether that sum can ever be zero." },
      ],
    },
  },
];

export const PAIR_MAP = Object.fromEntries(QUESTION_PAIRS.map((p) => [p.problemId, p])) as Record<string, QuestionPair>;

/** The completion problem for each practice skill, keyed exactly as `PRACTICES`. */
export const COMPLETIONS: Partial<Record<LeafId, PracticeProblem>> = {
  "algebra.expand-factor.monic": {
    id: "w-monic-completion",
    leaf: "algebra.expand-factor.monic",
    stem: "Factorise, then solve.",
    tex: "x^2 + 9x + 20 = 0",
    steps: [
      { tex: "4 \\times 5 = 20", label: "Multiply to the constant", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "4 + 5 = 9", label: "Add to the middle coefficient", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "(x + 4)(x + 5) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "x^2 + 5x + 4x + 20 \\;\\checkmark", label: "Expanded back to check", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "x = -4 \\;\\text{or}\\; x = -5", label: "Null factor law", tags: [tag("functions.zeros.nfl")] },
    ],
    why: "Same move as the example with new numbers: find the pair, then the factors.",
    hints: [
      {
        text: "Look for two numbers that multiply to the constant and add to the middle coefficient.",
        at: [0],
        terms: [
          { phrase: "constant", tex: ["20"] },
          { phrase: "middle coefficient", tex: ["9"] },
        ],
      },
      {
        text: "Once you have a pair that multiplies to 20, check it adds to 9 as well.",
        at: [1],
        terms: [
          { phrase: "pair", tex: ["4", "5"] },
          { phrase: "20", tex: ["20"] },
        ],
      },
      {
        text: "Once the pair checks out, those are your two numbers. Each factor is x plus one of them, and the whole thing still equals 0.",
        at: [2],
        terms: [{ phrase: "two numbers", tex: ["4", "5"] }],
      },
      {
        text: "The two factors multiply to give 0. A product is only zero when one of them is zero, so set each factor equal to zero on its own.",
        at: [3],
        terms: [
          { phrase: "factors", tex: ["(x + 4)", "(x + 5)"] },
          { phrase: "0", tex: ["0"] },
        ],
      },
      { text: "Each factor equal to zero is its own small equation: x + 4 = 0 and x + 5 = 0. Solve both, and mind the signs.", at: [4] },
    ],
    approaches: [
      { name: "factorise", hint: "Find two numbers that multiply to the constant and add to the middle coefficient, then write the two factors." },
      { name: "the quadratic formula", hint: "Read off $a$, $b$ and $c$ and put them straight into the formula; the discriminant tells you what the roots look like before you finish." },
    ],
  },
  "algebra.expand-factor.nonmonic": {
    id: "w-nonmonic-completion",
    leaf: "algebra.expand-factor.nonmonic",
    stem: "Factorise.",
    tex: "3x^2 + 11x + 6",
    steps: [
      { tex: "ac = 3 \\times 6 = 18", label: "Multiplied a by c", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "9 \\times 2 = 18", label: "Multiply to ac", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "9 + 2 = 11", label: "Add to b", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "3x^2 + 9x + 2x + 6", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "3x(x + 3) + 2(x + 3)", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(3x + 2)(x + 3)", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
    ],
    why: "Same split as the example with new numbers: ac, the pair, then group.",
    hints: [
      {
        text: "Multiply a by c, then split the middle term into two parts that add to b and multiply to ac.",
        at: [0],
        terms: [
          { phrase: "a", tex: ["3"] },
          { phrase: "b", tex: ["11"] },
          { phrase: "c", tex: ["6"] },
          { phrase: "ac", tex: ["3", "6"] },
          { phrase: "middle term", tex: ["11x"] },
        ],
      },
      { text: "Look for a pair of numbers that multiplies to 18 and adds to b, the 11 in the middle term.", at: [1], terms: [{ phrase: "18", tex: ["18"] }] },
      { text: "Once you have a pair that multiplies to 18, check it adds to 11 as well.", at: [2], terms: [{ phrase: "pair", tex: ["9", "2"] }] },
      {
        text: "The pair checks out. Split the middle term into two x terms using those two numbers; the first and last terms stay as they are.",
        at: [3],
        terms: [{ phrase: "two numbers", tex: ["9", "2"] }],
      },
      {
        text: "Take a common factor out of the first two terms, then out of the last two. The brackets left over should match.",
        at: [4],
        terms: [
          { phrase: "first two terms", tex: ["3x^2 + 9x"] },
          { phrase: "last two", tex: ["2x + 6"] },
        ],
      },
      {
        text: "Both parts share the same bracket. Take it out as a common factor, and what is left makes the other factor.",
        at: [5],
        terms: [{ phrase: "same bracket", tex: ["(x + 3)", { tex: "(x + 3)", within: "2(x + 3)" }] }],
      },
    ],
    approaches: [
      { name: "split the middle term", hint: "Multiply $a$ by $c$, find the pair that multiplies to that and adds to $b$, then split $11x$ into those two parts and group." },
      { name: "the cross method", hint: "Write the factor pairs of $3x^2$ down one side and of $6$ down the other, and cross-multiply until the two products add to $11x$." },
    ],
  },
  "algebra.expand-factor.expand": {
    id: "w-expand-completion",
    leaf: "algebra.expand-factor.expand",
    stem: "Expand and simplify.",
    tex: "(x - 3)(x + 7)",
    steps: [
      { tex: "x^2 + 7x - 3x - 21", label: "Four products", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "x^2 + 4x - 21", label: "Collected like terms", tags: [tag("algebra.equations.linear")] },
    ],
    why: "Same four products as the example; the two x terms have opposite signs.",
    hints: [
      {
        text: "Every term in the first bracket meets every term in the second: four products.",
        at: [0],
        terms: [
          { phrase: "first bracket", tex: ["(x - 3)"] },
          { phrase: "second", tex: ["(x + 7)"] },
        ],
      },
      { text: "Two of the four products are x terms. Collect them into one, minding their signs.", at: [1], terms: [{ phrase: "x terms", tex: ["7x", "- 3x"] }] },
    ],
    approaches: [
      { name: "four products", hint: "Every term in the first bracket meets every term in the second: write all four products, then collect." },
      { name: "the grid", hint: "Draw a two-by-two grid with one bracket's terms across the top and the other's down the side, fill each cell, then add the cells." },
    ],
  },
  "algebra.equations.linear": {
    id: "w-linear-completion",
    leaf: "algebra.equations.linear",
    stem: "Rearrange into standard form.",
    tex: "x(x + 5) = 6",
    steps: [
      { tex: "x^2 + 5x = 6", label: "Expanded the left side", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "x^2 + 5x - 6 = 0", label: "Everything to one side", tags: [tag("algebra.equations.linear")] },
    ],
    why: "Same habit as the example: expand, then the number crosses and changes sign.",
    hints: [
      {
        text: "Get everything onto one side first, so the other side is zero.",
        at: [0],
        terms: [
          { phrase: "one side", tex: ["x(x + 5)"] },
          { phrase: "other side", tex: ["6"] },
        ],
      },
      { text: "Now move the 6 across so the right side is zero. It changes sign as it goes.", at: [1], terms: [{ phrase: "6", tex: ["6"] }] },
    ],
    approaches: [
      { name: "expand first", hint: "Multiply out the left side first, then bring the $6$ across so the right side is zero." },
      { name: "move first", hint: "Bring the $6$ across first so the right side is zero, then expand the bracket and tidy up." },
    ],
  },
  "algebra.number.fractions": {
    id: "w-fractions-completion",
    leaf: "algebra.number.fractions",
    stem: "Solve.",
    tex: "\\dfrac{x}{8} + \\dfrac{x}{4} - 3 = \\dfrac{3}{2}",
    steps: [
      { tex: "\\dfrac{x}{8} + \\dfrac{x}{4} = \\dfrac{3}{2} + 3", label: "Moved the 3 across, so the x terms are together", tags: [tag("algebra.equations.linear")] },
      { tex: "\\dfrac{x}{8} + \\dfrac{x}{4} = \\dfrac{3}{2} + \\dfrac{6}{2}", label: "Wrote the 3 over 2, to match the other fraction", tags: [tag("algebra.number.fractions")] },
      { tex: "\\dfrac{x}{8} + \\dfrac{x}{4} = \\dfrac{9}{2}", label: "Combined the numbers", tags: [tag("algebra.number.fractions")] },
      { tex: "\\dfrac{x}{8} + \\dfrac{2x}{8} = \\dfrac{9}{2}", label: "A common denominator for the two x terms only", tags: [tag("algebra.number.fractions")] },
      { tex: "\\dfrac{3x}{8} = \\dfrac{9}{2}", label: "Combined like terms", tags: [tag("algebra.number.fractions")] },
      { tex: "3x = 36", label: "Multiplied both sides by 8", tags: [tag("algebra.number.fractions")] },
      { tex: "x = 12", label: "Divided by 3", tags: [tag("algebra.equations.linear")] },
    ],
    why: "Same order as the example: the number goes across first, and the x fractions only need a denominator the two of them share.",
    hints: [
      {
        text: "Get the like terms together: move the 3 across to the other side, away from the x terms.",
        at: [0],
        terms: [
          { phrase: "3", tex: ["3"] },
          { phrase: "other side", tex: ["\\dfrac{3}{2}"] },
          { phrase: "x terms", tex: ["\\dfrac{x}{8}", "\\dfrac{x}{4}"] },
        ],
      },
      {
        text: "Before adding the numbers, write the 3 as a fraction over 2, so it matches the other fraction.",
        at: [1],
        terms: [
          { phrase: "3", tex: [{ tex: "3", within: "+ 3" }] },
          { phrase: "other fraction", tex: ["\\dfrac{3}{2}"] },
        ],
      },
      {
        text: "The two numbers on the right have the same denominator now, so add them: the numerators add and the denominator stays.",
        at: [2],
        terms: [
          { phrase: "two numbers", tex: ["\\dfrac{3}{2}", "\\dfrac{6}{2}"] },
          {
            phrase: "same denominator",
            tex: [
              { tex: "2", within: "\\dfrac{3}{2}" },
              { tex: "2", within: "\\dfrac{6}{2}" },
            ],
          },
          {
            phrase: "numerators",
            tex: [
              { tex: "3", within: "\\dfrac{3}{2}" },
              { tex: "6", within: "\\dfrac{6}{2}" },
            ],
          },
        ],
      },
      {
        text: "To combine the x terms they need a common denominator, but only one those two share. It doesn't have to work for the whole line.",
        at: [3],
        terms: [
          { phrase: "x terms", tex: ["\\dfrac{x}{8}", "\\dfrac{x}{4}"] },
          {
            phrase: "common denominator",
            tex: [
              { tex: "8", within: "\\dfrac{x}{8}" },
              { tex: "4", within: "\\dfrac{x}{4}" },
            ],
          },
        ],
      },
      {
        text: "The x terms have the same denominator now, so they can be one fraction: the numerators combine and the denominator stays.",
        at: [4],
        terms: [
          { phrase: "x terms", tex: ["\\dfrac{x}{8}", "\\dfrac{2x}{8}"] },
          {
            phrase: "same denominator",
            tex: [
              { tex: "8", within: "\\dfrac{x}{8}" },
              { tex: "8", within: "\\dfrac{2x}{8}" },
            ],
          },
          {
            phrase: "numerators",
            tex: [
              { tex: "x", within: "\\dfrac{x}{8}" },
              { tex: "2x", within: "\\dfrac{2x}{8}" },
            ],
          },
        ],
      },
      {
        text: "One fraction on each side. Whatever you do to clear the 8 from under the x, the other side gets too.",
        at: [5],
        terms: [
          { phrase: "8", tex: [{ tex: "8", within: "\\dfrac{3x}{8}" }] },
          { phrase: "other side", tex: ["\\dfrac{9}{2}"] },
        ],
      },
      { text: "Only the 3 in front of x is left. Undo what it is doing to x.", at: [6], terms: [{ phrase: "3", tex: ["3"] }] },
    ],
  },
  "functions.zeros.nfl": {
    id: "w-nfl-completion",
    leaf: "functions.zeros.nfl",
    stem: "Solve.",
    tex: "(x - 6)(x + 1) = 0",
    steps: [
      { tex: "x - 6 = 0 \\;\\text{or}\\; x + 1 = 0", label: "Product is zero, so a factor is", tags: [tag("functions.zeros.nfl")] },
      { tex: "x = 6 \\;\\text{or}\\; x = -1", label: "Solved each", tags: [tag("algebra.equations.linear")] },
    ],
    why: "Same rule as the example: a product is zero only when a factor is.",
    hints: [
      { text: "A product is zero only when one of its factors is zero.", at: [0], terms: [{ phrase: "factors", tex: ["(x - 6)", "(x + 1)"] }] },
      { text: "Each of those is its own small equation. Solve both, and mind the signs.", at: [1], terms: [{ phrase: "both", tex: ["x - 6 = 0", "x + 1 = 0"] }] },
    ],
  },
  "algebra.equations.discriminant": {
    id: "w-discriminant-completion",
    leaf: "algebra.equations.discriminant",
    stem: "How many real roots?",
    tex: "x^2 + 4x + 9 = 0",
    steps: [
      { tex: "b^2 - 4ac = 16 - 36 = -20", label: "Discriminant", tags: [tag("algebra.equations.discriminant")] },
      { tex: "\\Delta < 0 \\Rightarrow \\text{none}", label: "Negative: no real roots", tags: [tag("algebra.equations.discriminant")] },
    ],
    why: "Same test as the example with new numbers: the sign of the discriminant decides it.",
    hints: [
      {
        text: "Work out b² − 4ac and look only at its sign.",
        at: [0],
        terms: [
          { phrase: "b", tex: ["4"] },
          { phrase: "a", within: "4ac", tex: [], insert: { before: "x^2", tex: "1" } },
          { phrase: "c", within: "4ac", tex: ["9"] },
        ],
      },
      {
        text: "Only the sign of the discriminant matters now. Think about what the quadratic formula would do with the square root of a negative number.",
        at: [1],
        terms: [{ phrase: "discriminant", tex: ["-20"] }],
      },
    ],
    approaches: [
      { name: "the discriminant", hint: "Work out $b^2 - 4ac$ and look only at its sign; no need to solve anything." },
      { name: "complete the square", hint: "Write the left side as a perfect square plus a number, and ask whether that sum can ever be zero." },
    ],
  },
  "graphing.quadratics.features": {
    id: "w-features-completion",
    leaf: "graphing.quadratics.features",
    stem: "Find the turning point of",
    tex: "y = x^2 - 2x - 24",
    steps: [
      { tex: "x^2 - 2x - 24 = 0", label: "Intercepts: y is 0", tags: [tag("functions.zeros.zero-finding")] },
      { tex: "(x - 6)(x + 4) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "x = 6 \\;\\text{or}\\; x = -4", label: "x-intercepts", tags: [tag("functions.zeros.nfl"), tag("functions.zeros.zero-finding")] },
      { tex: "x = \\tfrac{6 + (-4)}{2} = 1", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features")] },
      { tex: "y = 1 - 2 - 24 = -25", label: "Height on the axis", tags: [tag("graphing.quadratics.features")] },
      { tex: "(1, -25)", label: "Turning point", tags: [tag("graphing.quadratics.features")] },
    ],
    why: "Same route as the example: halfway between the intercepts, then the height there.",
    hints: [
      { text: "Start with where the graph crosses the x-axis: there, y is 0.", at: [0], terms: [{ phrase: "y", tex: ["y"] }] },
      {
        text: "Factorise: look for two numbers that multiply to -24 and add to -2.",
        at: [1],
        terms: [
          { phrase: "-24", tex: ["- 24"] },
          { phrase: "-2", tex: ["- 2"] },
        ],
      },
      { text: "The product is zero, so one of the factors must be. Set each one to zero on its own.", at: [2], terms: [{ phrase: "factors", tex: ["(x - 6)", "(x + 4)"] }] },
      { text: "The axis of symmetry sits halfway between the two intercepts.", at: [3], terms: [{ phrase: "two intercepts", tex: ["6", "-4"] }] },
      {
        text: "The turning point sits on the axis of symmetry, so its height is the value of y there. Substitute this x into the rule.",
        at: [4],
        terms: [{ phrase: "this x", tex: [{ tex: "1", within: "= 1" }] }],
      },
      {
        text: "That height and the x on the axis are the turning point's two coordinates. Write it as a point, x first.",
        at: [5],
        terms: [{ phrase: "height", tex: [{ tex: "-25", within: "= -25" }] }],
      },
    ],
    approaches: [
      { name: "halfway between the intercepts", hint: "Factorise to find where the graph crosses the $x$-axis; the axis of symmetry is halfway between, and the turning point sits on it." },
      { name: "the formula for the axis", hint: "The axis of symmetry is at $x = -\\frac{b}{2a}$; substitute that $x$ back in for the height." },
    ],
  },
  "reasoning.justify.formal": {
    id: "w-formal-completion",
    leaf: "reasoning.justify.formal",
    stem: "Show that this has exactly one real solution.",
    tex: "x^2 - 8x + 16 = 0",
    steps: [
      { tex: "b^2 - 4ac = 64 - 64 = 0", label: "Discriminant", tags: [tag("algebra.equations.discriminant")] },
      { tex: "\\Delta = 0 \\Rightarrow \\text{exactly one real solution}", label: "Justified", tags: [tag("reasoning.justify.formal")] },
    ],
    why: "Same fact to name as the example: the discriminant is zero, and that decides it.",
    hints: [
      {
        text: "How many real solutions there are comes from the discriminant. Work out b² − 4ac.",
        at: [0],
        terms: [
          { phrase: "b", tex: ["- 8"] },
          { phrase: "a", within: "4ac", tex: [], insert: { before: "x^2", tex: "1" } },
          { phrase: "c", within: "4ac", tex: ["16"] },
        ],
      },
      { text: "The discriminant is 0. Name that fact, then say what it forces about the number of real solutions.", at: [1], terms: [{ phrase: "0", tex: ["0"] }] },
    ],
    approaches: [
      { name: "the discriminant", hint: "Work out $b^2 - 4ac$; a particular value of it is exactly what \"one real solution\" means, so name that fact." },
      { name: "factorise", hint: "Try writing the left side as a perfect square; a squared bracket equal to zero has one solution, and say why." },
    ],
  },
  "reasoning.justify.conclusions": {
    id: "w-conclusions-completion",
    leaf: "reasoning.justify.conclusions",
    stem: "The discriminant of y = x² + x + 5 is −19. What does the graph do?",
    tex: "\\Delta = -19",
    steps: [
      { tex: "\\Delta < 0 \\Rightarrow \\text{no real roots}", label: "Justified", tags: [tag("reasoning.justify.formal")] },
      { tex: "\\text{The graph never meets the x-axis}", label: "In context", tags: [tag("reasoning.justify.conclusions")] },
    ],
    why: "Same sentence to finish as the example: say what the algebra means for the picture.",
    hints: [
      { text: "Start with the sign of the number: what does a negative discriminant say about the real roots?", at: [0], terms: [{ phrase: "number", tex: ["-19"] }] },
      { text: "Now say what that means for the picture, in a sentence. Where on the graph would a real root show up?", at: [1] },
    ],
  },
  "graphing.quadratics.sketch": {
    id: "w-sketch-completion",
    leaf: "graphing.quadratics.sketch",
    stem: "Sketch, marking every intercept and the turning point.",
    tex: "y = (x - 2)(x - 6)",
    steps: [
      { tex: "x = 2 \\;\\text{or}\\; x = 6", label: "x-intercepts", tags: [tag("functions.zeros.zero-finding")] },
      { tex: "y = (-2)(-6) = 12", label: "Height at x = 0", tags: [tag("graphing.quadratics.features")] },
      { tex: "(0, 12)", label: "y-intercept", tags: [tag("graphing.quadratics.features")] },
      { tex: "x = \\tfrac{2 + 6}{2} = 4", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features")] },
      { tex: "y = (2)(-2) = -4", label: "Height on the axis", tags: [tag("graphing.quadratics.features")] },
      { tex: "(4, -4)", label: "Turning point", tags: [tag("graphing.quadratics.features")] },
      { tex: "\\text{opens up, min at } (4, -4)", label: "Sketched", tags: [tag("graphing.quadratics.sketch")] },
    ],
    why: "Same four facts as the example, placed on the axes: two intercepts, the y-intercept and the turning point.",
    hints: [
      { text: "Intercepts first. The graph meets the x-axis where one of the factors is zero.", at: [0], terms: [{ phrase: "factors", tex: ["(x - 2)", "(x - 6)"] }] },
      { text: "Now the y-intercept: the graph meets the y-axis where x is 0, so put 0 in for x.", at: [1] },
      { text: "Write that height as a point on the y-axis, x first.", at: [2], terms: [{ phrase: "height", tex: [{ tex: "12", within: "= 12" }] }] },
      { text: "The turning point sits halfway between the two x-intercepts. Find that x first.", at: [3] },
      { text: "Its height is the value of y at that x: put it into the rule.", at: [4], terms: [{ phrase: "that x", tex: [{ tex: "4", within: "= 4" }] }] },
      { text: "That height and the x before it make the turning point. Write it as a point, x first.", at: [5], terms: [{ phrase: "height", tex: [{ tex: "-4", within: "= -4" }] }] },
      { text: "Now draw it: mark the intercepts and the turning point, then join them with a smooth curve. Does it open up or down?", at: [6], terms: [{ phrase: "turning point", tex: ["(4, -4)"] }] },
    ],
    approaches: [
      { name: "from the factors", hint: "The factors give the $x$-intercepts straight away; the turning point is halfway between them, and $x = 0$ gives the $y$-intercept." },
      { name: "expand first", hint: "Expand to $y = x^2 - 8x + 12$, read the $y$-intercept from the constant, and find the axis from $x = -\\frac{b}{2a}$." },
    ],
  },
  "functions.notation.evaluate": {
    id: "w-evaluate-completion",
    leaf: "functions.notation.evaluate",
    stem: "For f(x) = x² − 3x + 1, find",
    tex: "f(-4)",
    steps: [
      { tex: "f(-4) = (-4)^2 - 3(-4) + 1", label: "Substituted, brackets kept", tags: [tag("functions.notation.evaluate")] },
      { tex: "= 16 + 12 + 1 = 29", label: "Evaluated", tags: [tag("functions.notation.evaluate")] },
    ],
    why: "Same function as the example, a new input: the brackets around the negative are still the whole skill.",
    hints: [
      { text: "Put brackets around the value before you substitute, especially a negative one.", at: [0], terms: [{ phrase: "value", tex: ["-4"] }] },
      {
        text: "Work out each term on its own first. A negative squared is positive, and minus a negative is plus.",
        at: [1],
        terms: [
          { phrase: "negative squared", tex: ["(-4)^2"] },
          { phrase: "minus a negative", tex: ["- 3(-4)"] },
        ],
      },
    ],
  },
  "reasoning.interpret.worded": {
    id: "w-worded-completion",
    leaf: "reasoning.interpret.worded",
    stem: "A ball's height after t seconds is h = 25t − 5t². When does it land?",
    tex: "h = 25t - 5t^2",
    steps: [
      { tex: "25t - 5t^2 = 0", label: "Landing means height zero", tags: [tag("reasoning.interpret.worded")] },
      { tex: "5t(5 - t) = 0", label: "Common factor", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "t = 0 \\;\\text{or}\\; t = 5", label: "Null factor law", tags: [tag("functions.zeros.nfl")] },
      { tex: "\\text{lands at } t = 5 \\text{ s}", label: "In context", tags: [tag("reasoning.justify.conclusions")] },
    ],
    why: "Same three moves as the example: find the equation, solve it, then answer the question asked.",
    hints: [
      { text: "Landing means the height is zero. Write that as an equation before anything else.", at: [0], terms: [{ phrase: "height", tex: ["h"] }] },
      { text: "Both terms share a common factor. Take out the biggest one you can.", at: [1], terms: [{ phrase: "Both terms", tex: ["25t", "5t^2"] }] },
      { text: "The product is zero, so one of its factors must be. Set each one to zero on its own.", at: [2], terms: [{ phrase: "factors", tex: ["5t", "(5 - t)"] }] },
      { text: "Two times come out. Which one is the ball landing, and which is the moment it is thrown?", at: [3], terms: [{ phrase: "Two times", tex: ["0", "5"] }] },
    ],
    approaches: [
      { name: "common factor", hint: "Landing means $h = 0$; then both terms share a factor of $5t$, so take it out and use the null factor law." },
      { name: "divide through", hint: "Landing means $h = 0$; divide every term by $-5$ to get a plain monic quadratic, then factorise that." },
    ],
  },
  "functions.zeros.zero-finding": {
    id: "w-zeros-completion",
    leaf: "functions.zeros.zero-finding",
    stem: "Find the zeros of",
    tex: "f(x) = x^2 - 16",
    steps: [
      { tex: "x^2 - 16 = 0", label: "A zero is where the output is 0", tags: [tag("functions.zeros.zero-finding")] },
      { tex: "(x - 4)(x + 4) = 0", label: "Difference of two squares", tags: [tag("algebra.expand-factor.binomial")] },
      { tex: "x = 4 \\;\\text{or}\\; x = -4", label: "Null factor law", tags: [tag("functions.zeros.nfl")] },
      { tex: "\\text{the graph meets the x-axis at } \\pm 4", label: "What a zero means", tags: [tag("functions.zeros.zero-finding")] },
    ],
    why: "Same fact seen twice as in the example: the zeros are where the graph meets the x-axis.",
    hints: [
      { text: "A zero is where the output is 0, so set the rule equal to zero.", at: [0], terms: [{ phrase: "rule", tex: ["x^2 - 16"] }] },
      { text: "The 16 is a square number, so this is a difference of two squares. That factorises straight away.", at: [1], terms: [{ phrase: "difference of two squares", tex: ["x^2 - 16"] }] },
      { text: "The product is zero, so one of the factors must be. Set each one to zero on its own.", at: [2], terms: [{ phrase: "factors", tex: ["(x - 4)", "(x + 4)"] }] },
      { text: "Say what these answers mean for the graph: where does it meet the x-axis?", at: [3], terms: [{ phrase: "these answers", tex: ["4", "-4"] }] },
    ],
    approaches: [
      { name: "difference of two squares", hint: "Set the rule equal to zero; $x^2 - 16$ is a difference of two squares, so it factorises straight away." },
      { name: "rearrange and square root", hint: "Set the rule equal to zero, move the $16$ across, and take the square root of both sides, keeping both signs." },
    ],
  },
  "algebra.expand-factor.binomial": {
    id: "w-binomial-completion",
    leaf: "algebra.expand-factor.binomial",
    stem: "Expand using the identity.",
    tex: "(x + 7)^2",
    steps: [
      { tex: "(a + b)^2 = a^2 + 2ab + b^2", label: "The identity", tags: [tag("algebra.expand-factor.binomial")] },
      { tex: "x^2 + 14x + 49", label: "Applied", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.expand-factor.expand")] },
    ],
    why: "Same identity as the example: square the first, double the product, square the last.",
    hints: [
      { text: "Start from the identity for a squared bracket, written with a and b.", at: [0], terms: [{ phrase: "squared bracket", tex: ["(x + 7)^2"] }] },
      {
        text: "Here a is x and b is 7. Square the first, double the product of the two, square the last.",
        at: [1],
        terms: [
          { phrase: "a", tex: [{ tex: "a", within: "(a + b)" }] },
          { phrase: "b", tex: [{ tex: "b", within: "(a + b)" }] },
        ],
      },
    ],
    approaches: [
      { name: "the identity", hint: "Match $(x + 7)^2$ to $(a + b)^2 = a^2 + 2ab + b^2$: square the first, double the product, square the last." },
      { name: "write it out", hint: "Write it as $(x + 7)(x + 7)$ and expand the four products, then collect the two middle terms." },
    ],
  },
};
