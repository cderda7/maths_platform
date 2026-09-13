import { DEMO_STUDENT } from "../assignment";
import type { Classmate } from "../classmates";
import { PS5_PROBLEMS } from "./assignment";

/**
 * Every student's Problem Set 5 (ticket 187): Sam's record and the nineteen classmates', in the
 * shape Problem Set 6's classmates use (`Classmate`), in the same order, every one authored in full:
 * a confidence answer, how far they got, what they got wrong, the working for each wrong problem,
 * the platform's notes, what they wrote back, and a line from group review.
 *
 * The set came before Problem Set 6, and the habits in it are the ones Problem Set 6 catches:
 * - Guessed non-monic pairs, never expanded back (Q4, Q8): Jordan, Mia, Oliver, Sofia, Chloe,
 *   Ethan. Mia and Jordan guess the pair again on Problem Set 6's Q2.
 * - A turning point's sign read off the bracket (Q2, Q3, Q6): Tomas, Lucas, Finn, and Sam.
 * - The axis given where the height was asked (Q10): Zara, Ethan, Ruby and Harper, as on Problem Set
 *   6's Q9. A graph feature, as there (ticket 210), so with the sign readers it is the set's top gap.
 * - A sentence that does not follow from the working (Q10): Amelia, Isla and Lucas give the landing as the
 *   nozzle's zero, as Amelia, Isla and Lucas each misread their result on Problem Set 6's Q10.
 * - Something added or cleared and not taken back (Q6, Q8): Amelia and Zara, as with the third on
 *   Problem Set 6's Q7.
 * - Fractions and signs (Q1, Q4, Q5): Tomas, whose confidence answer names fractions on both sets.
 * - Scaling part of an expression (Q7): Aiden, the same slip as his Problem Set 6 Q7, and Harper.
 * - A pair that multiplies but does not add (Q9): Ruby, as on Problem Set 6's Q7.
 * Priya gets everything right; Grace gets everything she reached right in one jump a line;
 * Liam O'Connell handed nothing in (on Problem Set 6 he hands in two problems); Chloe, missing on
 * Problem Set 6, handed this one in.
 *
 * Every student's category results equal the class story sheet's Set 5 row (`data/story.ts`), one step
 * from Problem Set 6 at most. Ticket 210 changed Amelia, Tomas, Zara, Ethan, Isla, Lucas, Harper, Oliver
 * and Ruby's work to get there (before it, twenty results jumped two or three steps to Problem Set 6).
 */

const solution = (n: number): string[] => PS5_PROBLEMS[n - 1].solution.map((s) => s.tex);

/* ---------- the class's workings on the problems they got wrong, one per distinct way ---------- */

/** Q1: the intercepts read off the factors with their signs as printed. */
const Q1_SIGNS = ["x = 0:\\; y = (-2)(6) = -12", "x + 2 = 0 \\;\\text{or}\\; x - 6 = 0", "x = -2 \\;\\text{or}\\; x = 6"];
/** Q2: h read as +3 from (x + 3). */
const Q2_SIGN = ["h = 3,\\; k = -8", "\\text{turning point } (3, -8)", "\\text{axis of symmetry } x = 3"];
/** Q3: the turning point's x with its sign flipped; the y-intercept still right. */
const Q3_TP_SIGN = ["\\text{turning point } (-4, 9)", "y = -(0 - 4)^2 + 9", "y = -16 + 9 = -7"];
/** Q4: a pair that multiplies to −24 but gives +2x. */
const Q4_GUESSED = ["3x^2 - 10x - 8 = 0", "(3x - 4)(x + 2) = 0", "x = \\tfrac{4}{3} \\;\\text{or}\\; x = -2"];
/** Q4: the right split, the signs in the wrong brackets. */
const Q4_SWAPPED = ["ac = -24,\\quad -12 + 2 = -10", "(3x - 2)(x + 4) = 0", "x = \\tfrac{2}{3} \\;\\text{or}\\; x = -4"];
/** Q4: the right factors, 3x + 2 = 0 solved upside down. */
const Q4_UPSIDE_DOWN = ["ac = -24,\\quad -12 + 2 = -10", "3x^2 - 12x + 2x - 8 = 0", "3x(x - 4) + 2(x - 4) = 0", "(3x + 2)(x - 4) = 0", "x = -\\tfrac{3}{2} \\;\\text{or}\\; x = 4"];
/** Q5: −b/2a without its minus. */
const Q5_NO_MINUS = ["x = \\dfrac{6}{2} = 3", "y = 3^2 + 6(3) + 5 = 32", "\\text{turning point } (3, 32)"];
/** Q5 rushed: the axis not written, (−3)² as −9 straight into the height. */
const Q5_SQUARE_RUSHED = ["y = -9 - 18 + 5 = -22", "\\text{turning point } (-3, -22)"];
/** Q5: (−3)² as −9. */
const Q5_SQUARE = ["x = -\\dfrac{b}{2a} = -\\dfrac{6}{2} = -3", "y = -9 - 18 + 5 = -22", "\\text{turning point } (-3, -22)"];
/** Q6: 16 added to complete the square and never taken away. */
const Q6_NOT_TAKEN_AWAY = ["y = (x^2 - 8x + 16) + 10", "y = (x - 4)^2 + 10", "\\text{turning point } (4, 10)"];
/** Q6: the right form, the turning point's sign flipped. */
const Q6_TP_SIGN = ["y = (x^2 - 8x + 16) - 16 + 10", "y = (x - 4)^2 - 6", "\\text{turning point } (-4, -6)"];
/** Q7: (x − 3)² as x² + 9. */
const Q7_SQUARED_APART = ["y = 2(x^2 + 9) - 5", "y = 2x^2 + 18 - 5", "y = 2x^2 + 13", "y\\text{-intercept } (0, 13)"];
/** Q7: the 2 on x² only. */
const Q7_FIRST_TERM = ["y = 2(x^2 - 6x + 9) - 5", "y = 2x^2 - 6x + 9 - 5", "y = 2x^2 - 6x + 4", "y\\text{-intercept } (0, 4)"];
/** Q8: two guessed pairs that multiply to −3. */
const Q8_GUESSED = ["y = (2x + 1)(x - 3)", "x = -\\tfrac{1}{2} \\;\\text{or}\\; x = 3", "x = \\dfrac{-\\tfrac{1}{2} + 3}{2} = \\tfrac{5}{4}"];
const Q8_GUESSED_OTHER = ["y = (2x + 3)(x - 1)", "x = -\\tfrac{3}{2} \\;\\text{or}\\; x = 1", "x = \\dfrac{-\\tfrac{3}{2} + 1}{2} = -\\tfrac{1}{4}"];
/** Q8: the right intercepts, their sum never halved. */
const Q8_NOT_HALVED = ["ac = -6,\\quad 6 + (-1) = 5", "y = (2x - 1)(x + 3)", "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -3", "x = \\dfrac{\\tfrac{1}{2} + (-3)}{2} = -\\tfrac{5}{2}"];
/** Q9: a negative a read as opening upwards. */
const Q9_UPWARDS = ["a = -1 < 0 \\Rightarrow \\text{concave up}", "y\\text{-intercept } (0, 8)", "-(x^2 - 2x - 8) = -(x - 4)(x + 2) = 0", "x = 4 \\;\\text{or}\\; x = -2", "x = 1,\\; y = -1 + 2 + 8 = 9", "\\text{minimum turning point } (1, 9)"];
/** Q9: −1 taken out with the signs inside left behind. */
const Q9_SIGN_LEFT = ["a = -1 < 0 \\Rightarrow \\text{concave down}", "y\\text{-intercept } (0, 8)", "-(x^2 + 2x - 8) = -(x + 4)(x - 2) = 0", "x = -4 \\;\\text{or}\\; x = 2", "x = -1,\\; y = -1 - 2 + 8 = 5", "\\text{maximum turning point } (-1, 5)"];
/** Q9: a pair that multiplies to −8 but does not add to −2, never expanded back; the turning point still found from the rule. */
const Q9_MONIC_PAIR = ["a = -1 < 0 \\Rightarrow \\text{concave down}", "y\\text{-intercept } (0, 8)", "-(x^2 - 2x - 8) = -(x - 8)(x + 1) = 0", "x = 8 \\;\\text{or}\\; x = -1", "x = 1,\\; y = -1 + 2 + 8 = 9", "\\text{maximum turning point } (1, 9)"];
/** Q10: the working right, the landing given as the nozzle's own zero. */
const Q10_NOZZLE = [...solution(10).slice(0, 5), "\\text{The water reaches 1 m and lands 0 m from the nozzle}"];
/** Q10: the turning point's x given as the height. */
const Q10_AXIS_HEIGHT = [...solution(10).slice(0, 5), "\\text{The water reaches 2 m and lands 4 m from the nozzle}"];
const Q10_AXIS_HEIGHT_RUSHED = ["\\text{turning point } (2, 1)", "x = 4", "\\text{The water reaches 2 m and lands 4 m from the nozzle}"];

/* ---------- right, but in one jump each: Grace ---------- */
const Q1_JUMP = ["y = -12,\\; x = 2, -6"];
const Q2_JUMP = ["(-3, -8),\\; x = -3"];
const Q4_JUMP = ["3x^2 - 10x - 8 = (3x + 2)(x - 4)", "x = -\\tfrac{2}{3} \\;\\text{or}\\; x = 4"];
const Q6_JUMP = ["x^2 - 8x + 10 = (x - 4)^2 - 6", "\\text{turning point } (4, -6)"];

/** The problem ids, by number, so the records read like the set. */
const q = (n: number) => `ps5-q${n}`;

/**
 * Sam's Problem Set 5: confident going in, quick and mostly right, three careless slips (a right
 * split put into the wrong brackets, a turning point's sign, a negative a read as opening upwards).
 * On Problem Set 6 he names factorising as the skill he is unsure of.
 */
export const PS5_SAM: Classmate = {
  id: DEMO_STUDENT.id,
  name: DEMO_STUDENT.name,
  initials: DEMO_STUDENT.initials,
  confidence: "confident",
  done: 10,
  wrong: [q(4), q(6), q(9)],
  notes: [
    { text: "right split, signs in the wrong brackets", problems: [q(4)] },
    { text: "turning point read with the sign flipped", problems: [q(6)] },
    { text: "negative a read as concave up", problems: [q(9)] },
  ],
  attempts: { [q(4)]: Q4_SWAPPED, [q(6)]: Q6_TP_SIGN, [q(9)]: Q9_UPWARDS },
  clarification: "I had the right numbers in Q4 and put the minus in the wrong bracket. I didn't expand it back because I was sure. Q6 and Q9 were the same thing, going too fast and not looking at the sign.",
  groupStatus: "Group review done · checked Q4 by expanding",
};

export const PS5_CLASSMATES: Classmate[] = [
  {
    id: "priya",
    name: "Priya Raman",
    initials: "PR",
    confidence: "confident",
    done: 10,
    wrong: [],
    notes: [],
    attempts: {},
    groupStatus: "Group review done · explained the split on Q4",
  },
  {
    id: "jordan",
    name: "Jordan Whitlock",
    initials: "JW",
    confidence: "confident",
    done: 8,
    wrong: [q(4), q(8)],
    notes: [{ text: "non-monic pairs guessed, never expanded back", problems: [q(4), q(8)] }],
    attempts: { [q(4)]: Q4_GUESSED, [q(8)]: Q8_GUESSED },
    clarification: "I found numbers that multiplied to the end number and wrote the brackets. I didn't multiply them back out so I didn't see the middle was wrong. I ran out of time for Q9 and Q10.",
    groupStatus: "Group review done · expanded Q4 back",
  },
  {
    id: "amelia",
    name: "Amelia Chen",
    initials: "AC",
    confidence: "low",
    done: 10,
    wrong: [q(6), q(8), q(10)],
    notes: [
      { text: "added 16 to complete the square, never took it away", problems: [q(6)] },
      { text: "sum of the intercepts never halved", problems: [q(8)] },
      { text: "the landing given as the nozzle's zero", problems: [q(10)] },
    ],
    attempts: { [q(6)]: Q6_NOT_TAKEN_AWAY, [q(8)]: Q8_NOT_HALVED, [q(10)]: Q10_NOZZLE },
    clarification: "In Q6 I added the 16 and didn't take it back off, and in Q8 I added the intercepts and forgot the halving. In Q10 I had x = 0 and x = 4 and wrote the first one because it came first.",
    groupStatus: "Group review done · what each answer means in Q10",
  },
  {
    id: "tomas",
    name: "Tomas Reyes",
    initials: "TR",
    confidence: "low: fractions",
    done: 7,
    wrong: [q(1), q(2), q(4), q(5)],
    notes: [
      { text: "intercepts read off the factors with the signs flipped", problems: [q(1)] },
      { text: "h read as +3 from (x + 3)", problems: [q(2)] },
      { text: "solved 3x + 2 = 0 as −3/2", problems: [q(4)] },
      { text: "axis of symmetry without the minus", problems: [q(5)] },
    ],
    attempts: { [q(1)]: Q1_SIGNS, [q(2)]: Q2_SIGN, [q(4)]: Q4_UPSIDE_DOWN, [q(5)]: Q5_NO_MINUS },
    clarification: "I keep copying the sign that's in the bracket. In Q4 I had the right brackets and flipped the fraction. I didn't get to Q8, Q9 or Q10.",
    groupStatus: "Group review done · the sign in the bracket",
  },
  {
    id: "zara",
    name: "Zara Haddad",
    initials: "ZH",
    confidence: "confident",
    done: 10,
    wrong: [q(4), q(6), q(10)],
    notes: [
      { text: "solved 3x + 2 = 0 as −3/2", problems: [q(4)] },
      { text: "added 16 to complete the square, never took it away", problems: [q(6)] },
      { text: "axis given as the height", problems: [q(10)] },
    ],
    attempts: { [q(4)]: Q4_UPSIDE_DOWN, [q(6)]: Q6_NOT_TAKEN_AWAY, [q(10)]: Q10_AXIS_HEIGHT },
    clarification: "In Q4 my brackets were right and I turned the fraction over solving 3x + 2 = 0. In Q6 I added the 16 to make the square and forgot I had to take it off again. In Q10 I wrote the first number of the turning point as the height.",
    groupStatus: "Group review done · Q10, which number is the height",
  },
  {
    // Handed nothing in (ticket 187): the class view shows his row as missing.
    id: "liam",
    name: "Liam O'Connell",
    initials: "LO",
    confidence: "confident",
    done: 0,
    wrong: [],
    notes: [],
    attempts: {},
    groupStatus: "Nothing submitted",
  },
  {
    id: "aiden",
    name: "Aiden Park",
    initials: "AP",
    confidence: "confident",
    done: 10,
    wrong: [q(7)],
    notes: [{ text: "the 2 multiplied x² and nothing else", problems: [q(7)] }],
    attempts: { [q(7)]: Q7_FIRST_TERM },
    clarification: "I multiplied the 2 onto the x squared and left the rest of the bracket alone.",
    groupStatus: "Group review done · Q7 term by term",
  },
  {
    id: "mia",
    name: "Mia Nguyen",
    initials: "MN",
    confidence: "low: factorising",
    done: 10,
    wrong: [q(4), q(8), q(9)],
    notes: [
      { text: "non-monic pairs guessed, never expanded back", problems: [q(4), q(8)] },
      { text: "took −1 out and left the signs inside behind", problems: [q(9)] },
    ],
    attempts: { [q(4)]: Q4_GUESSED, [q(8)]: Q8_GUESSED_OTHER, [q(9)]: Q9_SIGN_LEFT },
    clarification: "When there's a number in front of x squared I don't know where to start, so I try brackets until something looks close. In Q9 I took the minus out and didn't change the signs inside.",
    groupStatus: "Group review done · learning the split",
  },
  {
    id: "noah",
    name: "Noah Fitzgerald",
    initials: "NF",
    confidence: "confident",
    done: 10,
    wrong: [q(7)],
    notes: [{ text: "(x − 3)² squared term by term", problems: [q(7)] }],
    attempts: { [q(7)]: Q7_SQUARED_APART },
    clarification: "I thought (x − 3) squared was x squared plus 9. I forgot the middle bit.",
    groupStatus: "Group review done · Q7 the middle term",
  },
  {
    id: "chloe",
    name: "Chloe Abara",
    initials: "CA",
    confidence: "confident",
    done: 10,
    wrong: [q(4), q(5), q(8)],
    notes: [
      { text: "non-monic pair guessed, never expanded back", problems: [q(4)] },
      { text: "(−3)² taken as −9", problems: [q(5)] },
      { text: "sum of the intercepts never halved", problems: [q(8)] },
    ],
    attempts: { [q(4)]: Q4_GUESSED, [q(5)]: Q5_SQUARE, [q(8)]: Q8_NOT_HALVED },
    clarification: "I did −3 squared in my head and got −9. In Q8 I added the intercepts and forgot to halve. Q4 I guessed.",
    groupStatus: "Group review done · Q5 with brackets",
  },
  {
    id: "ethan",
    name: "Ethan Kowalski",
    initials: "EK",
    confidence: "low",
    done: 10,
    wrong: [q(5), q(8), q(10)],
    notes: [
      { text: "(−3)² taken as −9, the axis not shown", problems: [q(5)] },
      { text: "non-monic pair guessed, never expanded back", problems: [q(8)] },
      { text: "axis given as the height, jumped straight to it", problems: [q(10)] },
    ],
    attempts: { [q(5)]: Q5_SQUARE_RUSHED, [q(8)]: Q8_GUESSED, [q(10)]: Q10_AXIS_HEIGHT_RUSHED },
    clarification: "I rushed the end. In Q10 I saw the turning point and wrote it down as the answer. On Q5 I squared −3 and got −9, and in Q8 I wrote brackets that looked right.",
    groupStatus: "Group review done · slowing down on Q10",
  },
  {
    id: "isla",
    name: "Isla Moretti",
    initials: "IM",
    confidence: "confident",
    done: 10,
    wrong: [q(5), q(9), q(10)],
    notes: [
      { text: "axis of symmetry without the minus", problems: [q(5)] },
      { text: "took −1 out and left the signs inside behind", problems: [q(9)] },
      { text: "the landing given as the nozzle's zero", problems: [q(10)] },
    ],
    attempts: { [q(5)]: Q5_NO_MINUS, [q(9)]: Q9_SIGN_LEFT, [q(10)]: Q10_NOZZLE },
    clarification: "I had all the working for Q10 right and wrote the wrong number in the sentence. In Q5 I left the minus off −b, and in Q9 I took the minus out without changing the signs inside.",
    groupStatus: "Group review done · reading the sentence back",
  },
  {
    id: "lucas",
    name: "Lucas Tanaka",
    initials: "LT",
    confidence: "low: graph features",
    done: 10,
    wrong: [q(2), q(3), q(9), q(10)],
    notes: [
      { text: "turning point read with the sign flipped", problems: [q(2), q(3)] },
      { text: "took −1 out and left the signs inside behind", problems: [q(9)] },
      { text: "the landing given as the nozzle's zero", problems: [q(10)] },
    ],
    attempts: { [q(2)]: Q2_SIGN, [q(3)]: Q3_TP_SIGN, [q(9)]: Q9_SIGN_LEFT, [q(10)]: Q10_NOZZLE },
    clarification: "I don't really get which way the turning point moves. I thought x + 3 meant right 3. In Q9 I didn't change the signs when I took the minus out, and in Q10 I wrote down the first x I got as where the water lands.",
    groupStatus: "Group review done · moving the graph left and right",
  },
  {
    id: "grace",
    name: "Grace Okoye",
    initials: "GO",
    confidence: "confident",
    done: 7,
    wrong: [],
    notes: [{ text: "right every time, but jumps steps a reader can't follow", problems: [q(1), q(2), q(4), q(6)] }],
    attempts: { [q(1)]: Q1_JUMP, [q(2)]: Q2_JUMP, [q(4)]: Q4_JUMP, [q(6)]: Q6_JUMP },
    clarification: "I did most of it in my head. I didn't finish Q8 to Q10 because I started late.",
    groupStatus: "Group review done · writing out Q4's split",
  },
  {
    id: "harper",
    name: "Harper Singh",
    initials: "HS",
    confidence: "confident",
    done: 10,
    wrong: [q(7), q(9), q(10)],
    notes: [
      { text: "the 2 multiplied x² and nothing else", problems: [q(7)] },
      { text: "negative a read as concave up", problems: [q(9)] },
      { text: "axis given as the height, jumped straight to it", problems: [q(10)] },
    ],
    attempts: { [q(7)]: Q7_FIRST_TERM, [q(9)]: Q9_UPWARDS, [q(10)]: Q10_AXIS_HEIGHT_RUSHED },
    clarification: "Every one of mine was done too fast. In Q7 I only multiplied the first term, in Q9 I wrote concave up without looking at the minus, and in Q10 I jumped to the turning point and called it the height.",
    groupStatus: "Group review done · Q7 term by term",
  },
  {
    id: "oliver",
    name: "Oliver Brennan",
    initials: "OB",
    confidence: "low: factorising",
    done: 9,
    wrong: [q(4), q(7), q(8)],
    notes: [
      { text: "non-monic pairs guessed, never expanded back", problems: [q(4), q(8)] },
      { text: "(x − 3)² squared term by term", problems: [q(7)] },
    ],
    attempts: { [q(4)]: Q4_GUESSED, [q(7)]: Q7_SQUARED_APART, [q(8)]: Q8_GUESSED },
    clarification: "Factorising is the part I guess. I didn't check any of them, and I squared the bracket in Q7 without writing it out. I didn't have time for Q10.",
    groupStatus: "Group review done · checking pairs by expanding",
  },
  {
    id: "ruby",
    name: "Ruby Castellanos",
    initials: "RC",
    confidence: "confident",
    done: 10,
    wrong: [q(5), q(9), q(10)],
    notes: [
      { text: "(−3)² taken as −9", problems: [q(5)] },
      { text: "a pair that multiplies to −8 but doesn't add to −2", problems: [q(9)] },
      { text: "axis given as the height", problems: [q(10)] },
    ],
    attempts: { [q(5)]: Q5_SQUARE, [q(9)]: Q9_MONIC_PAIR, [q(10)]: Q10_AXIS_HEIGHT },
    clarification: "I read the height off the wrong part of the turning point in Q10. In Q5 I did −3 squared without brackets. In Q9 I took 8 and 1 because they multiply to 8 and didn't check the middle.",
    groupStatus: "Group review done · Q10, which number is the height",
  },
  {
    id: "finn",
    name: "Finn Dlamini",
    initials: "FD",
    confidence: "confident",
    done: 10,
    wrong: [q(4), q(6), q(8)],
    notes: [
      { text: "solved 3x + 2 = 0 as −3/2", problems: [q(4)] },
      { text: "turning point read with the sign flipped", problems: [q(6)] },
      { text: "sum of the intercepts never halved", problems: [q(8)] },
    ],
    attempts: { [q(4)]: Q4_UPSIDE_DOWN, [q(6)]: Q6_TP_SIGN, [q(8)]: Q8_NOT_HALVED },
    clarification: "My factors were right in Q4 and I flipped the fraction solving it. In Q6 I wrote −4 because the bracket had a minus. In Q8 I never divided by 2.",
    groupStatus: "Group review done · Q4 one step at a time",
  },
  {
    id: "sofia",
    name: "Sofia Petrov",
    initials: "SP",
    confidence: "low: fractions",
    done: 10,
    wrong: [q(4), q(8)],
    notes: [{ text: "non-monic pairs guessed, never expanded back", problems: [q(4), q(8)] }],
    attempts: { [q(4)]: Q4_GUESSED, [q(8)]: Q8_GUESSED },
    clarification: "I guessed the brackets in Q4 and Q8. The numbers in front of x squared made the halves messy, so I tried pairs until one looked right.",
    groupStatus: "Group review done · the split on Q4 and Q8",
  },
];
