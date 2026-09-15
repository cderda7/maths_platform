import type { Approach, Hint } from "./types";

/**
 * The help on a set question itself once the student is back on it after practice (ticket 312: Q* worked, Q** finished,
 * then back on Q with "see the example again", hint and chat). One hint per point of Q's own working (`at` counts lines of
 * `solution`, as a practice problem's hints do), each naming a move and never the line, and the help chat's ways in where
 * Q has a real choice. Written from Q**'s hints (`data/pairs.ts`) with Q's own numbers, so the hints back on Q read like
 * the ones the student has just used. Held by `lib/pairs.test.ts` with the Q** hints (every phrase and fragment found,
 * lighting moves nothing, the walk line by line, no line given away, KaTeX).
 */
export interface QuestionHelp {
  hints: Hint[];
  approaches?: Approach[];
}

export const QUESTION_HELP: Record<string, QuestionHelp> = {
  q1: {
    hints: [
      { text: "It is already in standard form, with zero on one side. Write the equation down as your first line.", at: [0], terms: [{ phrase: "zero", tex: ["0"] }] },
      {
        text: "Look for two numbers that multiply to the constant and add to the middle coefficient. The constant is positive and the middle term negative, so both numbers are negative.",
        at: [1],
        terms: [
          { phrase: "constant", tex: ["6"] },
          { phrase: "middle term", tex: ["- 5x"] },
        ],
      },
      {
        text: "The two factors multiply to give 0, so one of them must be zero. Set each factor equal to zero on its own.",
        at: [2],
        terms: [
          { phrase: "factors", tex: ["(x-2)", "(x-3)"] },
          { phrase: "0", tex: ["0"] },
        ],
      },
    ],
    approaches: [
      { name: "factorise", hint: "Find two numbers that multiply to $6$ and add to $-5$, then write the two factors and use the null factor law." },
      { name: "the quadratic formula", hint: "Read off $a$, $b$ and $c$, watching the sign of $b$, and put them straight into the formula." },
    ],
  },
  q2: {
    hints: [
      { text: "Everything is already on one side, with zero on the other. Write the equation down as your first line.", at: [0], terms: [{ phrase: "zero", tex: ["0"] }] },
      {
        text: "Multiply a by c, then look for two numbers that multiply to ac and add to b.",
        at: [1],
        terms: [
          { phrase: "a", tex: ["2"] },
          { phrase: "b", tex: ["7"] },
          { phrase: "c", tex: ["- 4"] },
          { phrase: "ac", tex: ["2", "- 4"] },
        ],
      },
      {
        text: "The pair checks out. Split the middle term into two x terms using those two numbers; the first and last terms stay as they are.",
        at: [2],
        terms: [{ phrase: "two numbers", tex: [{ tex: "8", within: "8 + (-1)" }, "(-1)"] }],
      },
      {
        text: "Take a common factor out of the first two terms, then out of the last two. Take the minus out with the 1, so the brackets match.",
        at: [3],
        terms: [
          { phrase: "first two terms", tex: ["2x^2 + 8x"] },
          { phrase: "last two", tex: ["- x - 4"] },
        ],
      },
      {
        text: "Both parts share the same bracket. Take it out as a common factor, and what is left makes the other factor.",
        at: [4],
        terms: [{ phrase: "same bracket", tex: ["(x+4)", { tex: "(x+4)", within: "1(x+4)" }] }],
      },
      {
        text: "The two factors multiply to give 0, so one of them must be zero. Set each factor equal to zero and solve; one answer is a fraction.",
        at: [5],
        terms: [{ phrase: "factors", tex: ["(2x - 1)", "(x + 4)"] }],
      },
    ],
    approaches: [
      { name: "split the middle term", hint: "Multiply $a$ by $c$, find the pair that multiplies to that and adds to $b$, then split $7x$ into those two parts and group." },
      { name: "the cross method", hint: "Write the factor pairs of $2x^2$ down one side and of $-4$ down the other, and cross-multiply until the two products add to $7x$." },
    ],
  },
  q3: {
    hints: [
      { text: "Copy the equation down as your first line. The right side is 6, not 0, so nothing can be said about each bracket on its own yet.", at: [0], terms: [{ phrase: "right side", tex: [{ tex: "6", within: "= 6" }] }] },
      {
        text: "The null factor law needs a zero on one side. Expand the brackets first: every term in one meets every term in the other.",
        at: [1],
        terms: [{ phrase: "brackets", tex: ["(x - 3)", "(x + 2)"] }],
      },
      { text: "Now move the 6 across so the right side is zero. It changes sign as it goes.", at: [2], terms: [{ phrase: "6", tex: [{ tex: "6", within: "= 6" }] }] },
      {
        text: "Look for two numbers that multiply to -12 and add to -1, the coefficient of the middle term.",
        at: [3],
        terms: [
          { phrase: "-12", tex: ["- 12"] },
          { phrase: "middle term", tex: ["- x"] },
        ],
      },
      {
        text: "The two factors multiply to give 0, so one of them must be zero. Set each factor equal to zero on its own, and mind the signs.",
        at: [4],
        terms: [{ phrase: "factors", tex: ["(x - 4)", "(x + 3)"] }],
      },
    ],
    approaches: [
      { name: "expand, then factorise", hint: "Expand the left side, bring the $6$ across so one side is zero, then find two numbers for the factors." },
      { name: "expand, then the formula", hint: "Expand the left side, bring the $6$ across so one side is zero, then read off $a$, $b$ and $c$ for the quadratic formula." },
    ],
  },
  q4: {
    hints: [
      {
        text: "This does not factorise with whole numbers, so read off a, b and c, signs included.",
        at: [0],
        terms: [
          { phrase: "a", tex: ["3"] },
          { phrase: "b", tex: ["- 5"] },
          { phrase: "c", tex: ["- 1"] },
        ],
      },
      {
        text: "Work out the discriminant, b² − 4ac, first. Mind the signs: b is negative, and so is c.",
        at: [1],
        terms: [
          { phrase: "b", tex: ["-5"] },
          { phrase: "c", tex: ["-1"] },
        ],
      },
      { text: "Put b and the discriminant into the quadratic formula. The ± gives both solutions, and the whole top is over 2a.", at: [2], terms: [{ phrase: "discriminant", tex: ["37"] }] },
    ],
    approaches: [
      { name: "the quadratic formula", hint: "Read off $a$, $b$ and $c$, work out $b^2 - 4ac$, then put them into $x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$." },
      { name: "complete the square", hint: "Divide every term by $3$, move the constant across, and add the square of half the $x$ coefficient to both sides." },
    ],
  },
  q5: {
    hints: [
      {
        text: "The graph meets the x-axis where y is 0. Factorise: look for two numbers that multiply to -5 and add to -4.",
        at: [0],
        terms: [
          { phrase: "-5", tex: ["- 5"] },
          { phrase: "-4", tex: ["- 4"] },
        ],
      },
      { text: "The product is zero, so one of the factors must be. Set each one to zero on its own.", at: [1], terms: [{ phrase: "factors", tex: ["(x - 5)", "(x + 1)"] }] },
      { text: "The axis of symmetry sits halfway between the two intercepts.", at: [2], terms: [{ phrase: "two intercepts", tex: ["5", "-1"] }] },
      {
        text: "The turning point sits on the axis of symmetry, so its height is the value of y there. Substitute this x into the rule.",
        at: [3],
        terms: [{ phrase: "this x", tex: [{ tex: "2", within: "= 2" }] }],
      },
      {
        text: "That height and the x on the axis are the turning point's two coordinates. Write it as a point, x first.",
        at: [4],
        terms: [{ phrase: "height", tex: [{ tex: "-9", within: "= -9" }] }],
      },
    ],
    approaches: [
      { name: "halfway between the intercepts", hint: "Factorise to find where the graph crosses the $x$-axis; the axis of symmetry is halfway between, and the turning point sits on it." },
      { name: "the formula for the axis", hint: "The axis of symmetry is at $x = -\\frac{b}{2a}$; substitute that $x$ back in for the height." },
    ],
  },
  q6: {
    hints: [
      {
        text: "How many times the graph meets the x-axis comes from the discriminant. Work out b² − 4ac, with k as the c.",
        at: [0],
        terms: [
          { phrase: "b", tex: ["6"] },
          { phrase: "c", within: "4ac", tex: ["k"] },
        ],
      },
      { text: "Exactly once means one repeated root, which is when the discriminant is zero. Set it equal to zero.", at: [1], terms: [{ phrase: "discriminant", tex: ["36 - 4k"] }] },
      { text: "What is left is a linear equation in k. Get the k term on its own side, then divide.", at: [2], terms: [{ phrase: "k term", tex: ["- 4k"] }] },
    ],
    approaches: [
      { name: "the discriminant", hint: "Touching the $x$-axis once means one root, so set $b^2 - 4ac = 0$ and solve for $k$." },
      { name: "complete the square", hint: "Write the right side as a perfect square plus a number in $k$; the graph touches the $x$-axis once when that number is zero." },
    ],
  },
  q7: {
    hints: [
      {
        text: "Take a third out of every term first: ask what each term is a third of.",
        at: [0],
        terms: [{ phrase: "every term", tex: ["\\tfrac{1}{3}x^2", "2x", "\\tfrac{8}{3}"] }],
      },
      {
        text: "Inside the bracket is a monic quadratic. Look for two numbers that multiply to 8 and add to 6.",
        at: [1],
        terms: [
          { phrase: "8", tex: ["8"] },
          { phrase: "6", tex: ["6"] },
        ],
      },
      {
        text: "The pair checks out. Write the bracket as two factors from those two numbers, and keep the third out in front.",
        at: [2],
        terms: [{ phrase: "two numbers", tex: ["2", "4"] }],
      },
    ],
  },
  q8: {
    hints: [
      { text: "The x-intercepts are where the curve crosses the x-axis. Read the two x values off the graph.", at: [0] },
      { text: "Check a value you read by substituting it into the rule: if the graph really crosses there, y comes out as 0.", at: [1], terms: [{ phrase: "value", tex: ["1"] }] },
    ],
  },
  q9: {
    hints: [
      { text: "Landing means the height is zero. Set the rule equal to zero, then take out the common factor.", at: [0], terms: [{ phrase: "height", tex: ["h"] }] },
      { text: "The product is zero, so one of its factors must be. Set each one to zero on its own.", at: [1], terms: [{ phrase: "factors", tex: ["-x", "(x - 6)"] }] },
      {
        text: "The ball is thrown at one zero and lands at the other. Its greatest height is halfway between them.",
        at: [2],
        terms: [
          { phrase: "one zero", tex: ["0"] },
          { phrase: "the other", tex: ["6"] },
        ],
      },
      { text: "The greatest height is the value of h on the axis. Substitute this x into the rule, minding the minus in front.", at: [3], terms: [{ phrase: "this x", tex: [{ tex: "3", within: "= 3" }] }] },
    ],
    approaches: [
      { name: "factorise first", hint: "Landing means $h = 0$: take out the common factor $-x$ and use the null factor law; the greatest height is halfway between the two zeros." },
      { name: "the formula for the axis", hint: "Landing means $h = 0$; the highest point is on the axis $x = -\\frac{b}{2a}$, so substitute that $x$ into the rule for the height." },
    ],
  },
  q10: {
    hints: [
      {
        text: "Whether there are real solutions comes from the discriminant. Work out b² − 4ac.",
        at: [0],
        terms: [
          { phrase: "b", tex: ["4"] },
          { phrase: "a", within: "4ac", tex: [], insert: { before: "x^2", tex: "1" } },
          { phrase: "c", within: "4ac", tex: ["5"] },
        ],
      },
      { text: "The discriminant is negative. Name that fact, then say what it forces about the real solutions.", at: [1], terms: [{ phrase: "discriminant", tex: [{ tex: "-4", within: "= -4" }] }] },
      { text: "Now say what that means for the graph, in a sentence. Where on the graph would a real solution show up?", at: [2] },
    ],
    approaches: [
      { name: "the discriminant", hint: "Work out $b^2 - 4ac$; its sign says how many real solutions there are, and each one is a point where the graph meets the $x$-axis." },
      { name: "complete the square", hint: "Write the left side as a perfect square plus a number, and ask whether that sum can ever be zero." },
    ],
  },
};
