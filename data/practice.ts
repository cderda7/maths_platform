import type { LeafId } from "./taxonomy";
import { tag, type PracticeProblem } from "./types";

/**
 * One short, isolated practice problem per leaf that can be a detected mistake in this set
 * (a test enforces the coverage), plus a couple of extras the help picker can offer. Hand-checked.
 */
export const PRACTICES: Partial<Record<LeafId, PracticeProblem>> = {
  "algebra.expand-factor.monic": {
    id: "w-monic",
    leaf: "algebra.expand-factor.monic",
    stem: "Factorise, then solve.",
    tex: "x^2 + 7x + 12 = 0",
    steps: [
      { tex: "3 \\times 4 = 12", label: "Multiply to the constant", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "3 + 4 = 7", label: "Add to the middle coefficient", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "(x + 3)(x + 4) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "x^2 + 4x + 3x + 12 \\;\\checkmark", label: "Expanded back to check", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "x = -3 \\;\\text{or}\\; x = -4", label: "Null factor law", tags: [tag("unit.u1.nfl")] },
    ],
    why: "Most of this set leans on factorising. Two minutes here makes it quicker.",
    // One hint per point in the working (`at` counts lines of the steps above); from the second on, the linked words point at the student's own line.
    hints: [
      {
        text: "Look for two numbers that multiply to the constant and add to the middle coefficient.",
        at: [0],
        terms: [
          { phrase: "constant", tex: ["12"] },
          { phrase: "middle coefficient", tex: ["7"] },
        ],
      },
      {
        text: "Once you have a pair that multiplies to 12, check it adds to 7 as well.",
        at: [1],
        terms: [
          { phrase: "pair", tex: ["3", "4"] },
          { phrase: "12", tex: ["12"] },
        ],
      },
      {
        text: "Once the pair checks out, those are your two numbers. Each factor is x plus one of them, and the whole thing still equals 0.",
        at: [2],
        terms: [{ phrase: "two numbers", tex: ["3", "4"] }],
      },
      {
        text: "The two factors multiply to give 0. A product is only zero when one of them is zero, so set each factor equal to zero on its own.",
        at: [3],
        terms: [
          { phrase: "factors", tex: ["(x + 3)", "(x + 4)"] },
          { phrase: "0", tex: ["0"] },
        ],
      },
      {
        text: "Each factor equal to zero is its own small equation: x + 3 = 0 and x + 4 = 0. Solve both, and mind the signs.",
        at: [4],
      },
    ],
    approaches: [
      { name: "factorise", hint: "Find two numbers that multiply to the constant and add to the middle coefficient, then write the two factors." },
      { name: "the quadratic formula", hint: "Read off $a$, $b$ and $c$ and put them straight into the formula; the discriminant tells you what the roots look like before you finish." },
    ],
    followUp: {
      id: "w-monic-2",
      leaf: "algebra.expand-factor.monic",
      stem: "Factorise, then solve.",
      tex: "x^2 - 7x + 10 = 0",
      steps: [
        { tex: "(-2) \\times (-5) = 10", label: "Multiply to the constant", tags: [tag("algebra.expand-factor.monic")] },
        { tex: "(-2) + (-5) = -7", label: "Add to the middle coefficient", tags: [tag("algebra.expand-factor.monic")] },
        { tex: "(x - 2)(x - 5) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
        { tex: "x = 2 \\;\\text{or}\\; x = 5", label: "Null factor law", tags: [tag("unit.u1.nfl")] },
      ],
      why: "Same move, negative pair: both numbers negative when the constant is positive and the middle term negative.",
      hints: [
        {
          text: "The constant is positive and the middle term negative, so both numbers are negative.",
          at: [0],
          terms: [
            { phrase: "constant", tex: ["10"] },
            { phrase: "middle term", tex: ["- 7x"] },
          ],
        },
        {
          text: "Once you have a pair that multiplies to 10, check it adds to -7 as well. Two negatives multiply to a positive and add to a negative, which is what you need.",
          at: [1],
          terms: [
            { phrase: "pair", tex: ["(-2)", "(-5)"] },
            { phrase: "positive", tex: ["10"] },
          ],
        },
        {
          text: "Once the pair checks out, those are your two numbers. Each factor is x with one of them, so both factors are x minus something.",
          at: [2],
          terms: [{ phrase: "two numbers", tex: ["(-2)", "(-5)"] }],
        },
        {
          text: "The two factors multiply to give 0, so one of them must be zero. Set each factor equal to zero on its own; this time the answers come out positive.",
          at: [3],
          terms: [
            { phrase: "factors", tex: ["(x - 2)", "(x - 5)"] },
            { phrase: "0", tex: ["0"] },
          ],
        },
      ],
      approaches: [
        { name: "factorise", hint: "Two numbers that multiply to $10$ and add to $-7$: with a positive constant and a negative middle term, both are negative." },
        { name: "the quadratic formula", hint: "Read off $a$, $b$ and $c$, watching the sign of $b$, and put them into the formula." },
      ],
    },
  },
  "algebra.expand-factor.nonmonic": {
    id: "w-nonmonic",
    leaf: "algebra.expand-factor.nonmonic",
    stem: "Factorise.",
    tex: "3x^2 + 10x + 8",
    steps: [
      { tex: "ac = 3 \\times 8 = 24", label: "Multiplied a by c", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "6 \\times 4 = 24", label: "Multiply to ac", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "6 + 4 = 10", label: "Add to b", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "3x^2 + 6x + 4x + 8", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "3x(x + 2) + 4(x + 2)", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(3x + 4)(x + 2)", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
    ],
    why: "When the x² term has a coefficient, the split is the move that replaces guessing.",
    hints: [
      {
        text: "Multiply a by c, then split the middle term into two parts that add to b and multiply to ac.",
        at: [0],
        terms: [
          { phrase: "a", tex: ["3"] },
          { phrase: "b", tex: ["10"] },
          { phrase: "c", tex: ["8"] },
          { phrase: "ac", tex: ["3", "8"] },
          { phrase: "middle term", tex: ["10x"] },
        ],
      },
      {
        text: "Look for a pair of numbers that multiplies to 24 and adds to b, the 10 in the middle term.",
        at: [1],
        terms: [{ phrase: "24", tex: ["24"] }],
      },
      {
        text: "Once you have a pair that multiplies to 24, check it adds to 10 as well.",
        at: [2],
        terms: [{ phrase: "pair", tex: ["6", "4"] }],
      },
      {
        text: "The pair checks out. Split the middle term into two x terms using those two numbers; the first and last terms stay as they are.",
        at: [3],
        terms: [{ phrase: "two numbers", tex: ["6", "4"] }],
      },
      {
        text: "Take a common factor out of the first two terms, then out of the last two. The brackets left over should match.",
        at: [4],
        terms: [
          { phrase: "first two terms", tex: ["3x^2 + 6x"] },
          { phrase: "last two", tex: ["4x + 8"] },
        ],
      },
      {
        text: "Both parts share the same bracket. Take it out as a common factor, and what is left makes the other factor.",
        at: [5],
        terms: [{ phrase: "same bracket", tex: ["(x + 2)", { tex: "(x + 2)", within: "4(x + 2)" }] }],
      },
    ],
    approaches: [
      { name: "split the middle term", hint: "Multiply $a$ by $c$, find the pair that multiplies to that and adds to $b$, then split $10x$ into those two parts and group." },
      { name: "the cross method", hint: "Write the factor pairs of $3x^2$ down one side and of $8$ down the other, and cross-multiply until the two products add to $10x$." },
    ],
  },
  "algebra.expand-factor.expand": {
    id: "w-expand",
    leaf: "algebra.expand-factor.expand",
    stem: "Expand and simplify.",
    tex: "(x - 4)(x + 1)",
    steps: [
      { tex: "x^2 + x - 4x - 4", label: "Four products", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "x^2 - 3x - 4", label: "Collected like terms", tags: [tag("algebra.equations.linear")] },
    ],
    why: "Expanding back is the quickest check on a factorisation. It takes one line.",
    hints: [
      {
        text: "Every term in the first bracket meets every term in the second: four products.",
        at: [0],
        terms: [
          { phrase: "first bracket", tex: ["(x - 4)"] },
          { phrase: "second", tex: ["(x + 1)"] },
        ],
      },
      {
        text: "Two of the four products are x terms. Collect them into one.",
        at: [1],
        terms: [{ phrase: "x terms", tex: [{ tex: "x", within: "+ x" }, "- 4x"] }],
      },
    ],
    approaches: [
      { name: "four products", hint: "Every term in the first bracket meets every term in the second: write all four products, then collect." },
      { name: "the grid", hint: "Draw a two-by-two grid with one bracket's terms across the top and the other's down the side, fill each cell, then add the cells." },
    ],
  },
  "algebra.equations.linear": {
    id: "w-linear",
    leaf: "algebra.equations.linear",
    stem: "Rearrange into standard form.",
    tex: "x(x + 3) = 10",
    steps: [
      { tex: "x^2 + 3x = 10", label: "Expanded the left side", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "x^2 + 3x - 10 = 0", label: "Everything to one side", tags: [tag("algebra.equations.linear")] },
    ],
    why: "A product only tells you about its factors when it equals zero. Getting to standard form first is the habit.",
    hints: [
      {
        text: "Get everything onto one side first, so the other side is zero.",
        at: [0],
        terms: [
          { phrase: "one side", tex: ["x(x + 3)"] },
          { phrase: "other side", tex: ["10"] },
        ],
      },
      {
        text: "Now move the 10 across so the right side is zero. It changes sign as it goes.",
        at: [1],
        terms: [{ phrase: "10", tex: ["10"] }],
      },
    ],
    approaches: [
      { name: "expand first", hint: "Multiply out the left side first, then bring the $10$ across so the right side is zero." },
      { name: "move first", hint: "Bring the $10$ across first so the right side is zero, then expand the bracket and tidy up." },
    ],
  },
  "algebra.number.fractions": {
    id: "w-fractions",
    leaf: "algebra.number.fractions",
    stem: "Solve.",
    tex: "\\dfrac{x}{4} + \\dfrac{x}{2} - 6 = \\dfrac{9}{2}",
    steps: [
      { tex: "\\dfrac{x}{4} + \\dfrac{x}{2} = \\dfrac{9}{2} + 6", label: "Moved the 6 across, so the x terms are together", tags: [tag("algebra.equations.linear")] },
      { tex: "\\dfrac{x}{4} + \\dfrac{x}{2} = \\dfrac{9}{2} + \\dfrac{12}{2}", label: "Wrote the 6 over 2, to match the other fraction", tags: [tag("algebra.number.fractions")] },
      { tex: "\\dfrac{x}{4} + \\dfrac{x}{2} = \\dfrac{21}{2}", label: "Combined the numbers", tags: [tag("algebra.number.fractions")] },
      { tex: "\\dfrac{x}{4} + \\dfrac{2x}{4} = \\dfrac{21}{2}", label: "A common denominator for the two x terms only", tags: [tag("algebra.number.fractions")] },
      { tex: "\\dfrac{3x}{4} = \\dfrac{21}{2}", label: "Combined like terms", tags: [tag("algebra.number.fractions")] },
      { tex: "3x = 42", label: "Multiplied both sides by 4", tags: [tag("algebra.number.fractions")] },
      { tex: "x = 14", label: "Divided by 3", tags: [tag("algebra.equations.linear")] },
    ],
    why: "Like terms first: the number goes across, and the two x fractions only need a denominator they share, not one for the whole line.",
    // One hint per point in the working, picked by where the student's lines have got (`at` counts lines of the steps above).
    hints: [
      {
        text: "Get the like terms together: move the 6 across to the other side, away from the x terms.",
        at: [0],
        terms: [
          { phrase: "6", tex: ["6"] },
          { phrase: "other side", tex: ["\\dfrac{9}{2}"] },
          { phrase: "x terms", tex: ["\\dfrac{x}{4}", "\\dfrac{x}{2}"] },
        ],
      },
      // From here the linked words point at the student's own line in the read-as column (hintAnchor), so the fragments are written against that line.
      {
        text: "Before adding the numbers, write the 6 as a fraction over 2, so it matches the other fraction.",
        at: [1],
        terms: [
          { phrase: "6", tex: ["6"] },
          { phrase: "other fraction", tex: ["\\dfrac{9}{2}"] },
        ],
      },
      {
        text: "The two numbers on the right have the same denominator now, so add them: the numerators add and the denominator stays.",
        at: [2],
        terms: [
          { phrase: "two numbers", tex: ["\\dfrac{9}{2}", "\\dfrac{12}{2}"] },
          {
            phrase: "same denominator",
            tex: [
              { tex: "2", within: "\\dfrac{9}{2}" },
              { tex: "2", within: "\\dfrac{12}{2}" },
            ],
          },
          {
            phrase: "numerators",
            tex: [
              { tex: "9", within: "\\dfrac{9}{2}" },
              { tex: "12", within: "\\dfrac{12}{2}" },
            ],
          },
        ],
      },
      {
        text: "To combine the x terms they need a common denominator, but only one those two share. It doesn't have to work for the whole line.",
        at: [3],
        terms: [
          { phrase: "x terms", tex: ["\\dfrac{x}{4}", "\\dfrac{x}{2}"] },
          {
            phrase: "common denominator",
            tex: [
              { tex: "4", within: "\\dfrac{x}{4}" },
              { tex: "2", within: "\\dfrac{x}{2}" },
            ],
          },
        ],
      },
      {
        text: "The x terms have the same denominator now, so they can be one fraction: the numerators combine and the denominator stays.",
        at: [4],
        terms: [
          { phrase: "x terms", tex: ["\\dfrac{x}{4}", "\\dfrac{2x}{4}"] },
          {
            phrase: "same denominator",
            tex: [
              { tex: "4", within: "\\dfrac{x}{4}" },
              { tex: "4", within: "\\dfrac{2x}{4}" },
            ],
          },
          {
            phrase: "numerators",
            tex: [
              { tex: "x", within: "\\dfrac{x}{4}" },
              { tex: "2x", within: "\\dfrac{2x}{4}" },
            ],
          },
        ],
      },
      {
        text: "One fraction on each side. Whatever you do to clear the 4 from under the x, the other side gets too.",
        at: [5],
        terms: [
          { phrase: "4", tex: [{ tex: "4", within: "\\dfrac{3x}{4}" }] },
          { phrase: "other side", tex: ["\\dfrac{21}{2}"] },
        ],
      },
      {
        text: "Only the 3 in front of x is left. Undo what it is doing to x.",
        at: [6],
        terms: [{ phrase: "3", tex: ["3"] }],
      },
    ],
  },
  "unit.u1.nfl": {
    id: "w-nfl",
    leaf: "unit.u1.nfl",
    stem: "Solve.",
    tex: "(x - 2)(x + 5) = 0",
    steps: [
      { tex: "x - 2 = 0 \\;\\text{or}\\; x + 5 = 0", label: "Product is zero, so a factor is", tags: [tag("unit.u1.nfl")] },
      { tex: "x = 2 \\;\\text{or}\\; x = -5", label: "Solved each", tags: [tag("algebra.equations.linear")] },
    ],
    why: "The null factor law only works when the product equals zero. That is the whole rule.",
    hints: [
      { text: "A product is zero only when one of its factors is zero.", at: [0], terms: [{ phrase: "factors", tex: ["(x - 2)", "(x + 5)"] }] },
      {
        text: "Each of those is its own small equation. Solve both, and mind the signs.",
        at: [1],
        terms: [{ phrase: "both", tex: ["x - 2 = 0", "x + 5 = 0"] }],
      },
    ],
  },
  "unit.u1.discriminant": {
    id: "w-discriminant",
    leaf: "unit.u1.discriminant",
    stem: "How many real roots?",
    tex: "x^2 + 2x + 5 = 0",
    steps: [
      { tex: "b^2 - 4ac = 4 - 20 = -16", label: "Discriminant", tags: [tag("unit.u1.discriminant")] },
      { tex: "\\Delta < 0 \\Rightarrow \\text{none}", label: "Negative: no real roots", tags: [tag("unit.u1.discriminant")] },
    ],
    why: "Positive: two roots. Zero: one. Negative: none. The sign is the whole story.",
    hints: [
      {
        text: "Work out b² − 4ac and look only at its sign.",
        at: [0],
        terms: [
          { phrase: "b", tex: ["2"] },
          { phrase: "a", within: "4ac", tex: [], insert: { before: "x^2", tex: "1" } },
          { phrase: "c", within: "4ac", tex: ["5"] },
        ],
      },
      {
        text: "Only the sign of the discriminant matters now. Think about what the quadratic formula would do with the square root of a negative number.",
        at: [1],
        terms: [{ phrase: "discriminant", tex: ["-16"] }],
      },
    ],
    approaches: [
      { name: "the discriminant", hint: "Work out $b^2 - 4ac$ and look only at its sign; no need to solve anything." },
      { name: "complete the square", hint: "Write the left side as a perfect square plus a number, and ask whether that sum can ever be zero." },
    ],
  },
  "graphing.quadratics.features": {
    id: "w-features",
    leaf: "graphing.quadratics.features",
    stem: "Find the turning point of",
    tex: "y = x^2 - 2x - 8",
    steps: [
      { tex: "x^2 - 2x - 8 = 0", label: "Intercepts: y is 0", tags: [tag("functions.zeros.zero-finding")] },
      { tex: "(x - 4)(x + 2) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "x = 4 \\;\\text{or}\\; x = -2", label: "x-intercepts", tags: [tag("unit.u1.nfl"), tag("functions.zeros.zero-finding")] },
      { tex: "x = \\tfrac{4 + (-2)}{2} = 1", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features")] },
      { tex: "y = 1 - 2 - 8 = -9", label: "Height on the axis", tags: [tag("graphing.quadratics.features")] },
      { tex: "(1, -9)", label: "Turning point", tags: [tag("graphing.quadratics.features")] },
    ],
    why: "The axis of symmetry is halfway between the intercepts; the turning point's height is the function there.",
    hints: [
      { text: "Start with where the graph crosses the x-axis: there, y is 0.", at: [0], terms: [{ phrase: "y", tex: ["y"] }] },
      {
        text: "Factorise: look for two numbers that multiply to -8 and add to -2.",
        at: [1],
        terms: [
          { phrase: "-8", tex: ["- 8"] },
          { phrase: "-2", tex: ["- 2"] },
        ],
      },
      {
        text: "The product is zero, so one of the factors must be. Set each one to zero on its own.",
        at: [2],
        terms: [{ phrase: "factors", tex: ["(x - 4)", "(x + 2)"] }],
      },
      {
        text: "The axis of symmetry sits halfway between the two intercepts.",
        at: [3],
        terms: [{ phrase: "two intercepts", tex: ["4", "-2"] }],
      },
      {
        text: "The turning point sits on the axis of symmetry, so its height is the value of y there. Substitute this x into the rule.",
        at: [4],
        terms: [{ phrase: "this x", tex: ["1"] }],
      },
      {
        text: "You have both coordinates of the turning point now. Write it as a point, x first.",
        at: [5],
        terms: [{ phrase: "both coordinates", tex: ["1", "-9"] }],
      },
    ],
    approaches: [
      { name: "halfway between the intercepts", hint: "Factorise to find where the graph crosses the $x$-axis; the axis of symmetry is halfway between, and the turning point sits on it." },
      { name: "the formula for the axis", hint: "The axis of symmetry is at $x = -\\frac{b}{2a}$; substitute that $x$ back in for the height." },
    ],
  },
  "reasoning.justify.formal": {
    id: "w-formal",
    leaf: "reasoning.justify.formal",
    stem: "Show that this has exactly one real solution.",
    tex: "x^2 - 6x + 9 = 0",
    steps: [
      { tex: "b^2 - 4ac = 36 - 36 = 0", label: "Discriminant", tags: [tag("unit.u1.discriminant")] },
      { tex: "\\Delta = 0 \\Rightarrow \\text{exactly one real solution}", label: "Justified", tags: [tag("reasoning.justify.formal")] },
    ],
    why: "A justification names the fact and draws the one conclusion it allows.",
    hints: [
      {
        text: "How many real solutions there are comes from the discriminant. Work out b² − 4ac.",
        at: [0],
        terms: [
          { phrase: "b", tex: ["- 6"] },
          { phrase: "a", within: "4ac", tex: [], insert: { before: "x^2", tex: "1" } },
          { phrase: "c", within: "4ac", tex: ["9"] },
        ],
      },
      {
        text: "The discriminant is 0. Name that fact, then say what it forces about the number of real solutions.",
        at: [1],
        terms: [{ phrase: "0", tex: ["0"] }],
      },
    ],
    approaches: [
      { name: "the discriminant", hint: "Work out $b^2 - 4ac$; a particular value of it is exactly what \"one real solution\" means, so name that fact." },
      { name: "factorise", hint: "Try writing the left side as a perfect square; a squared bracket equal to zero has one solution, and say why." },
    ],
  },
  "reasoning.justify.conclusions": {
    id: "w-conclusions",
    leaf: "reasoning.justify.conclusions",
    stem: "The discriminant of y = x² + x + 3 is −11. What does the graph do?",
    tex: "\\Delta = -11",
    steps: [
      { tex: "\\Delta < 0 \\Rightarrow \\text{no real roots}", label: "Justified", tags: [tag("reasoning.justify.formal")] },
      { tex: "\\text{The graph never meets the x-axis}", label: "In context", tags: [tag("reasoning.justify.conclusions")] },
    ],
    why: "Finish the sentence: say what the algebra means for the picture.",
    hints: [
      { text: "Start with the sign of the number: what does a negative discriminant say about the real roots?", at: [0], terms: [{ phrase: "number", tex: ["-11"] }] },
      { text: "Now say what that means for the picture, in a sentence. Where on the graph would a real root show up?", at: [1] },
    ],
  },
  "graphing.quadratics.sketch": {
    id: "w-sketch",
    leaf: "graphing.quadratics.sketch",
    stem: "Sketch, marking every intercept and the turning point.",
    tex: "y = (x - 1)(x - 3)",
    steps: [
      { tex: "x = 1 \\;\\text{or}\\; x = 3", label: "x-intercepts", tags: [tag("functions.zeros.zero-finding")] },
      { tex: "y = (-1)(-3) = 3", label: "Height at x = 0", tags: [tag("graphing.quadratics.features")] },
      { tex: "(0, 3)", label: "y-intercept", tags: [tag("graphing.quadratics.features")] },
      { tex: "x = \\tfrac{1 + 3}{2} = 2", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features")] },
      { tex: "y = (1)(-1) = -1", label: "Height on the axis", tags: [tag("graphing.quadratics.features")] },
      { tex: "(2, -1)", label: "Turning point", tags: [tag("graphing.quadratics.features")] },
      { tex: "\\text{opens up through } (1,0),\\ (3,0),\\ (0,3),\\ \\text{min } (2,-1)", label: "Sketched", tags: [tag("graphing.quadratics.sketch")] },
    ],
    why: "A sketch is four facts placed on the axes: two intercepts, the y-intercept and the turning point.",
    hints: [
      { text: "Intercepts first. The graph meets the x-axis where one of the factors is zero.", at: [0], terms: [{ phrase: "factors", tex: ["(x - 1)", "(x - 3)"] }] },
      { text: "Now the y-intercept: the graph meets the y-axis where x is 0, so put 0 in for x.", at: [1] },
      { text: "Write that height as a point on the y-axis, x first.", at: [2], terms: [{ phrase: "height", tex: [{ tex: "3", within: "= 3" }] }] },
      { text: "The turning point sits halfway between the two x-intercepts. Find that x first.", at: [3] },
      { text: "Its height is the value of y at that x: put it into the rule.", at: [4], terms: [{ phrase: "that x", tex: [{ tex: "2", within: "= 2" }] }] },
      { text: "That height and the x before it make the turning point. Write it as a point, x first.", at: [5], terms: [{ phrase: "height", tex: [{ tex: "-1", within: "= -1" }] }] },
      { text: "Now draw it: mark the intercepts and the turning point, then join them with a smooth curve. Does it open up or down?", at: [6], terms: [{ phrase: "turning point", tex: ["(2, -1)"] }] },
    ],
    approaches: [
      { name: "from the factors", hint: "The factors give the $x$-intercepts straight away; the turning point is halfway between them, and $x = 0$ gives the $y$-intercept." },
      { name: "expand first", hint: "Expand to $y = x^2 - 4x + 3$, read the $y$-intercept from the constant, and find the axis from $x = -\\frac{b}{2a}$." },
    ],
  },
  "functions.notation.evaluate": {
    id: "w-evaluate",
    leaf: "functions.notation.evaluate",
    stem: "For f(x) = x² − 3x + 1, find",
    tex: "f(-2)",
    steps: [
      { tex: "f(-2) = (-2)^2 - 3(-2) + 1", label: "Substituted, brackets kept", tags: [tag("functions.notation.evaluate")] },
      { tex: "= 4 + 6 + 1 = 11", label: "Evaluated", tags: [tag("functions.notation.evaluate")] },
    ],
    why: "The brackets around a negative input are the whole skill.",
    hints: [
      { text: "Put brackets around the value before you substitute, especially a negative one.", at: [0], terms: [{ phrase: "value", tex: ["-2"] }] },
      {
        text: "Work out each term on its own first. A negative squared is positive, and minus a negative is plus.",
        at: [1],
        terms: [
          { phrase: "negative squared", tex: ["(-2)^2"] },
          { phrase: "minus a negative", tex: ["- 3(-2)"] },
        ],
      },
    ],
  },
  "reasoning.interpret.worded": {
    id: "w-worded",
    leaf: "reasoning.interpret.worded",
    stem: "A ball's height after t seconds is h = 20t − 5t². When does it land?",
    tex: "h = 20t - 5t^2",
    steps: [
      { tex: "20t - 5t^2 = 0", label: "Landing means height zero", tags: [tag("reasoning.interpret.worded")] },
      { tex: "5t(4 - t) = 0", label: "Common factor", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "t = 0 \\;\\text{or}\\; t = 4", label: "Null factor law", tags: [tag("unit.u1.nfl")] },
      { tex: "\\text{lands at } t = 4 \\text{ s}", label: "In context", tags: [tag("reasoning.justify.conclusions")] },
    ],
    why: "The words hide an equation. Find it, solve it, then answer the question that was asked.",
    hints: [
      { text: "Landing means the height is zero. Write that as an equation before anything else.", at: [0], terms: [{ phrase: "height", tex: ["h"] }] },
      { text: "Both terms share a common factor. Take out the biggest one you can.", at: [1], terms: [{ phrase: "Both terms", tex: ["20t", "5t^2"] }] },
      { text: "The product is zero, so one of its factors must be. Set each one to zero on its own.", at: [2], terms: [{ phrase: "factors", tex: ["5t", "(4 - t)"] }] },
      { text: "Two times come out. Which one is the ball landing, and which is the moment it is thrown?", at: [3], terms: [{ phrase: "Two times", tex: ["0", "4"] }] },
    ],
    approaches: [
      { name: "common factor", hint: "Landing means $h = 0$; then both terms share a factor of $5t$, so take it out and use the null factor law." },
      { name: "divide through", hint: "Landing means $h = 0$; divide every term by $-5$ to get a plain monic quadratic, then factorise that." },
    ],
  },
  "functions.zeros.zero-finding": {
    id: "w-zeros",
    leaf: "functions.zeros.zero-finding",
    stem: "Find the zeros of",
    tex: "f(x) = x^2 - 9",
    steps: [
      { tex: "x^2 - 9 = 0", label: "A zero is where the output is 0", tags: [tag("functions.zeros.zero-finding")] },
      { tex: "(x - 3)(x + 3) = 0", label: "Difference of two squares", tags: [tag("unit.u1.binomial")] },
      { tex: "x = 3 \\;\\text{or}\\; x = -3", label: "Null factor law", tags: [tag("unit.u1.nfl")] },
      { tex: "\\text{the graph meets the x-axis at } \\pm 3", label: "What a zero means", tags: [tag("functions.zeros.zero-finding")] },
    ],
    why: "A zero of a function and an x-intercept of its graph are the same fact, seen twice.",
    hints: [
      { text: "A zero is where the output is 0, so set the rule equal to zero.", at: [0], terms: [{ phrase: "rule", tex: ["x^2 - 9"] }] },
      { text: "The 9 is a square number, so this is a difference of two squares. That factorises straight away.", at: [1], terms: [{ phrase: "difference of two squares", tex: ["x^2 - 9"] }] },
      { text: "The product is zero, so one of the factors must be. Set each one to zero on its own.", at: [2], terms: [{ phrase: "factors", tex: ["(x - 3)", "(x + 3)"] }] },
      { text: "Say what these answers mean for the graph: where does it meet the x-axis?", at: [3], terms: [{ phrase: "these answers", tex: ["3", "-3"] }] },
    ],
    approaches: [
      { name: "difference of two squares", hint: "Set the rule equal to zero; $x^2 - 9$ is a difference of two squares, so it factorises straight away." },
      { name: "rearrange and square root", hint: "Set the rule equal to zero, move the $9$ across, and take the square root of both sides, keeping both signs." },
    ],
  },
  "unit.u1.binomial": {
    id: "w-binomial",
    leaf: "unit.u1.binomial",
    stem: "Expand using the identity.",
    tex: "(x + 5)^2",
    steps: [
      { tex: "(a + b)^2 = a^2 + 2ab + b^2", label: "The identity", tags: [tag("unit.u1.binomial")] },
      { tex: "x^2 + 10x + 25", label: "Applied", tags: [tag("unit.u1.binomial"), tag("algebra.expand-factor.expand")] },
    ],
    why: "Square the first, double the product, square the last.",
    hints: [
      { text: "Start from the identity for a squared bracket, written with a and b.", at: [0], terms: [{ phrase: "squared bracket", tex: ["(x + 5)^2"] }] },
      {
        text: "Here a is x and b is 5. Square the first, double the product of the two, square the last.",
        at: [1],
        terms: [
          { phrase: "a", tex: [{ tex: "a", within: "(a + b)" }] },
          { phrase: "b", tex: [{ tex: "b", within: "(a + b)" }] },
        ],
      },
    ],
    approaches: [
      { name: "the identity", hint: "Match $(x + 5)^2$ to $(a + b)^2 = a^2 + 2ab + b^2$: square the first, double the product, square the last." },
      { name: "write it out", hint: "Write it as $(x + 5)(x + 5)$ and expand the four products, then collect the two middle terms." },
    ],
  },
};

/** The default warm-up: what the chooser falls back to when nothing was selected or said. */
export const PRACTICE: PracticeProblem = PRACTICES["algebra.expand-factor.monic"]!;

/**
 * Leaves practice is never offered on: they name the whole task rather than one move, so a problem
 * "on just that" is as hard as the set. Practice is offered on moves only, never at this level.
 */
export const NOT_ISOLATED: readonly LeafId[] = ["algebra.equations.quadratic"];
export const isolatable = (leaf: LeafId) => !NOT_ISOLATED.includes(leaf) && !leaf.startsWith("communication.");

/** Everything the warm-up can serve: one short problem per leaf. */
export const WARMUP_BANK: PracticeProblem[] = Object.values(PRACTICES) as PracticeProblem[];
