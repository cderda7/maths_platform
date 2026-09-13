import { DEMO_STUDENT } from "../assignment";
import type { Classmate } from "../classmates";
import { PS4_PROBLEMS } from "./assignment";

/**
 * Every student's Problem Set 4 (ticket 214): Sam's record and the nineteen classmates', in the shape the
 * other sets use (`Classmate`), in the class order, every one authored in full: a confidence answer, how far
 * they got, what they got wrong, the working for each wrong problem, the platform's notes, what they wrote
 * back, and a line from group review. Each student's results equal the class story sheet's PS4 column
 * (`data/story.ts`, checked by `data/finishedSets.test.ts`).
 *
 * The habits on the set, most of which Problem Sets 5 and 6 catch again:
 * - Guessed non-monic pairs, never expanded back (Q1, Q2, Q4): Jordan, Liam, Mia, Oliver, Chloe, Ethan,
 *   Sofia and Ruby (a pair that multiplies but doesn't add, as on her monic Q5); Sam finds the right split and
 *   puts its signs in the wrong brackets. The set's top gap, on nine students.
 * - A square added to complete it and never taken away (Q6, Q8, Q9): Amelia, Zara (on all three) and Noah;
 *   Mia takes the 9 away with the wrong sign.
 * - Half of b with the wrong sign, or halved wrongly (Q6, Q7): Sam, Tomas, Ethan, Sofia; Chloe and Tomas never
 *   halve b, Amelia and Zara square 5/2 as 25/2.
 * - A turning point's sign read off the bracket (Q8, Q9): Sam, Isla, Lucas, Finn, Tomas.
 * - The x of the turning point given as the minimum value (Q9): Zara, Ruby and Ethan; Harper reads the value
 *   off the question's line. Where Problem Sets 5 and 6's "axis given as the height" starts.
 * - The null factor law: Oliver on x(x − 3) = 10, a product that isn't 0 (Q5); Tomas sets a factor to zero
 *   with its sign flipped (Q3). Solving a factor: Tomas and Finn turn the fraction over, Mia, Ethan, Chloe and
 *   Tomas lose a root's sign (Q3, Q4, Q5).
 * - Rearranging x² − 3x = 10 (Q5): Isla keeps the 10's sign, Lucas and Harper lose the 3x's; Ethan factorises
 *   before making one side zero and finds one root by trying.
 * - The sentence (Q10): Amelia keeps the negative width, Isla gives it, Lucas swaps width and length.
 * - Steps jumped: Grace (right every time, one line a problem), Ethan (Q1, Q6, Q8, Q10), Harper (Q8).
 * Priya gets everything right; Aiden takes the 2 out of 2x² only (Q8), his one slip. Nobody is missing:
 * Liam hands in two problems, Grace six, Jordan and Oliver eight, Tomas nine.
 *
 * A right problem with an attempt is a student's own shorter, still right working (Sam's and Oliver's Q4,
 * Mia's Q2 and Q10, Grace's and Ethan's one-line problems): the class view reads their lines, not the model's.
 */

const solution = (n: number): string[] => PS4_PROBLEMS[n - 1].solution.map((s) => s.tex);

/* ---------- the class's workings on the problems they got wrong, one per distinct way ---------- */

/** Q1: the right split, its signs in the wrong brackets. */
const Q1_SWAPPED = ["ac = -4,\\quad 4 + (-1) = 3", "(2x + 1)(x - 2)"];
/** Q1: a pair that multiplies to −2, never expanded back. */
const Q1_GUESSED = ["(2x + 2)(x - 1)"];
/** Q2: the right split, its signs in the wrong brackets. */
const Q2_SWAPPED = ["ac = -30,\\quad 6 + (-5) = 1", "(3x + 5)(x - 2)"];
/** Q2: two guessed pairs that multiply to −10. */
const Q2_GUESSED = ["(3x + 2)(x - 5)"];
const Q2_GUESSED_OTHER = ["(3x - 2)(x + 5)"];
/** Q3: (x − 4)'s sign flipped, then 2x + 1 = 0 solved as x = −2. */
const Q3_FLIPPED = ["x + 4 = 0 \\;\\text{or}\\; 2x + 1 = 0", "x = -4 \\;\\text{or}\\; 2x = -1", "x = -4 \\;\\text{or}\\; x = -2"];
/** Q3: the right factors, 2x = −1 solved upside down. */
const Q3_UPSIDE_DOWN = [...solution(3).slice(0, 2), "x = 4 \\;\\text{or}\\; x = -2"];
/** Q4: a pair that multiplies to 3 but gives −5x, never expanded back. */
const Q4_GUESSED = ["(2x - 3)(x - 1) = 0", "2x - 3 = 0 \\;\\text{or}\\; x - 1 = 0", "x = \\tfrac{3}{2} \\;\\text{or}\\; x = 1"];
/** Q4: a guessed pair's signs, then 2x − 1 = 0 solved with the sign lost. */
const Q4_GUESSED_SIGN = ["(2x - 1)(x + 3) = 0", "2x - 1 = 0 \\;\\text{or}\\; x + 3 = 0", "x = -\\tfrac{1}{2} \\;\\text{or}\\; x = -3"];
/** Q4 rushed: the right factors, a root's sign lost. */
const Q4_ROOT_SIGN = ["(2x - 1)(x - 3) = 0", "2x - 1 = 0 \\;\\text{or}\\; x - 3 = 0", "x = -\\tfrac{1}{2} \\;\\text{or}\\; x = 3"];
/** Q4: the right factors, 2x − 1 = 0 solved upside down. */
const Q4_UPSIDE_DOWN = [...solution(4).slice(0, 5), "x = 2 \\;\\text{or}\\; x = 3"];
/** Q5: the 10 moved across with its sign kept; the pair still found for −3x. */
const Q5_TEN_SIGN = ["x^2 - 3x + 10 = 0", "(x - 5)(x + 2) = 0", "x - 5 = 0 \\;\\text{or}\\; x + 2 = 0", "x = 5 \\;\\text{or}\\; x = -2"];
/** Q5: the 3x's sign lost rearranging, the rest built on it. */
const Q5_SIGN_LOST = ["x^2 + 3x - 10 = 0", "(x + 5)(x - 2) = 0", "x + 5 = 0 \\;\\text{or}\\; x - 2 = 0", "x = -5 \\;\\text{or}\\; x = 2"];
/** Q5: factorised while it equals 10, one root found by trying. */
const Q5_BEFORE_ZERO = ["x(x - 3) = 10", "x = 5"];
/** Q5: the null factor law on a product that equals 10. */
const Q5_NFL_TEN = ["x(x - 3) = 10", "x = 10 \\;\\text{or}\\; x - 3 = 10", "x = 10 \\;\\text{or}\\; x = 13"];
/** Q5: a root's sign copied from its bracket. */
const Q5_ROOT_SIGN = ["x^2 - 3x - 10 = 0", "(x - 5)(x + 2) = 0", "x = 5 \\;\\text{or}\\; x = 2"];
/** Q5: a pair that multiplies to −10 but doesn't add to −3. */
const Q5_PAIR = ["x^2 - 3x - 10 = 0", "(x - 10)(x + 1) = 0", "x - 10 = 0 \\;\\text{or}\\; x + 1 = 0", "x = 10 \\;\\text{or}\\; x = -1"];
/** Q6: 9 added to make the square and never taken away. */
const Q6_NOT_TAKEN_AWAY = ["x^2 + 6x + 9 + 2", "(x + 3)^2 + 2"];
/** Q6: the same, written as equations that no longer hold. */
const Q6_NOT_TAKEN_AWAY_EQ = ["x^2 + 6x + 2 = x^2 + 6x + 9 + 2", "x^2 + 6x + 2 = (x + 3)^2 + 2"];
/** Q6: the 9 taken away with its sign lost. */
const Q6_NINE_SIGN = ["x^2 + 6x + 9 - 9 + 2", "(x + 3)^2 + 9 + 2", "(x + 3)^2 + 11"];
/** Q6: half of b with the wrong sign. */
const Q6_HALF_B_SIGN = ["x^2 + 6x + 9 - 9 + 2", "(x - 3)^2 - 9 + 2", "(x - 3)^2 - 7"];
/** Q7: (5/2)² squared as 25/2. */
const Q7_OVER_TWO = ["x^2 - 5x + \\tfrac{25}{2} - \\tfrac{25}{2} + 1", "\\left(x - \\tfrac{5}{2}\\right)^2 - \\tfrac{25}{2} + 1", "\\left(x - \\tfrac{5}{2}\\right)^2 - \\tfrac{23}{2}"];
/** Q7: half of b with the wrong sign. */
const Q7_HALF_B_SIGN = [solution(7)[0], "\\left(x + \\tfrac{5}{2}\\right)^2 - \\tfrac{25}{4} + 1", "\\left(x + \\tfrac{5}{2}\\right)^2 - \\tfrac{21}{4}"];
/** Q7: b never halved. */
const Q7_NOT_HALVED = ["(x - 5)^2 - 25 + 1", "(x - 5)^2 - 24"];
/** Q7 rushed: half of −5 as −5/4. */
const Q7_QUARTER = ["\\left(x - \\tfrac{5}{4}\\right)^2 - \\tfrac{25}{16} + 1", "\\left(x - \\tfrac{5}{4}\\right)^2 - \\tfrac{9}{16}"];
/** Q7: (5/2)² as 5/4, then half of b halved again. */
const Q7_HALVES = ["x^2 - 5x + \\tfrac{5}{4} - \\tfrac{5}{4} + 1", "\\left(x - \\tfrac{5}{4}\\right)^2 - \\tfrac{1}{4}"];
/** Q8: the right form, h read with its sign flipped. */
const Q8_TP_SIGN = [...solution(8).slice(0, 3), "h = 2,\\; k = -11", "\\text{turning point } (2, -11)"];
/** Q8: the 2 taken out of 2x² only, the rest built on it. */
const Q8_FIRST_TERM = ["2(x^2 + 8x) - 3", "2(x^2 + 8x + 16) - 32 - 3", "2(x + 4)^2 - 35", "h = -4,\\; k = -35", "\\text{turning point } (-4, -35)"];
/** Q8: 4 added inside the bracket and never taken away. */
const Q8_NOT_TAKEN_AWAY = ["2(x^2 + 4x) - 3", "2(x^2 + 4x + 4) - 3", "2(x + 2)^2 - 3", "h = -2,\\; k = -3", "\\text{turning point } (-2, -3)"];
/** Q9: the right form, the turning point's sign flipped. */
const Q9_TP_SIGN = [...solution(9).slice(0, 2), "\\text{turning point } (-2, 3)", "\\text{minimum value } 3 \\text{ when } x = -2"];
/** Q9: the turning point's x given as the minimum value. */
const Q9_X_AS_MIN = [...solution(9).slice(0, 3), "\\text{minimum value } 2"];
/** Q9: the value read off the question's line. */
const Q9_WRONG_LINE = [...solution(9).slice(0, 3), "\\text{minimum value } 7 \\text{ when } x = 2"];
/** Q9: 4 added and never taken away, then the x given as the minimum. */
const Q9_NOT_TAKEN_AWAY = ["y = (x^2 - 4x + 4) + 7", "y = (x - 2)^2 + 7", "\\text{turning point } (2, 7)", "\\text{minimum value } 2"];
/** Q10: both solutions checked against the area, the negative width kept. */
const Q10_KEPT = [...solution(10).slice(0, 6), solution(10)[7], "\\text{length } 2(-5) + 3 = -7,\\; (-5)(-7) = 35", "\\text{The width is 3.5 cm or } -5 \\text{ cm}"];
/** Q10: the negative width given. */
const Q10_NEGATIVE = [...solution(10).slice(0, 6), "\\text{The width is } -5 \\text{ cm}"];
/** Q10: the working right, the length given as the width. */
const Q10_SWAPPED = [...solution(10).slice(0, 8), "\\text{The width is 10 cm}"];

/* ---------- right, but shorter or in one jump ---------- */
const Q1_JUMP = ["2x^2 + 3x - 2 = (2x - 1)(x + 2)"];
const Q2_JUMP = ["3x^2 + x - 10 = (3x - 5)(x + 2)"];
const Q3_JUMP = ["(x - 4)(2x + 1) = 0 \\Rightarrow x = 4, -\\tfrac{1}{2}"];
const Q4_JUMP = ["2x^2 - 7x + 3 = (2x - 1)(x - 3)", "x = \\tfrac{1}{2} \\;\\text{or}\\; x = 3"];
const Q6_JUMP = ["x^2 + 6x + 2 = (x + 3)^2 - 7"];
const Q8_JUMP = ["2x^2 + 8x - 3 = 2(x + 2)^2 - 11", "\\text{turning point } (-2, -11)"];
const Q8_JUMP_HK = ["2x^2 + 8x - 3 = 2(x + 2)^2 - 11", "h = -2,\\; k = -11", "\\text{turning point } (-2, -11)"];
const Q10_JUMP = ["w(2w + 3) = 35", "2w^2 + 3w - 35 = (2w - 7)(w + 5) = 0", "w = \\tfrac{7}{2}", "\\text{The width is 3.5 cm}"];
/** A checked pair: the split, then the brackets, then the solutions. */
const Q4_SPLIT_ONLY = ["ac = 6,\\quad -6 + (-1) = -7", "(2x - 1)(x - 3) = 0", "x = \\tfrac{1}{2} \\;\\text{or}\\; x = 3"];
/** The brackets tried and right this time, then the null factor law. */
const Q4_BRACKETS = ["(2x - 1)(x - 3) = 0", "2x - 1 = 0 \\;\\text{or}\\; x - 3 = 0", "x = \\tfrac{1}{2} \\;\\text{or}\\; x = 3"];
const Q2_BRACKETS = ["(3x - 5)(x + 2)"];
const Q10_NO_SPLIT = solution(10).filter((tex) => !tex.startsWith("ac ="));

/** The problem ids, by number, so the records read like the set. */
const q = (n: number) => `ps4-q${n}`;

/**
 * Sam's Problem Set 4: confident, quick and mostly right, four careless slips: the right split with its signs
 * in the wrong brackets twice, half of b with the wrong sign, a turning point's sign. On Problem Set 5 he
 * swaps the brackets' signs again.
 */
export const PS4_SAM: Classmate = {
  id: DEMO_STUDENT.id,
  name: DEMO_STUDENT.name,
  initials: DEMO_STUDENT.initials,
  confidence: "confident",
  done: 10,
  wrong: [q(1), q(2), q(7), q(8)],
  notes: [
    { text: "right split, the signs put into the wrong brackets", problems: [q(1), q(2)] },
    { text: "half of b taken with the wrong sign completing the square", problems: [q(7)] },
    { text: "turning point read with the sign flipped", problems: [q(8)] },
  ],
  attempts: { [q(1)]: Q1_SWAPPED, [q(2)]: Q2_SWAPPED, [q(4)]: Q4_SPLIT_ONLY, [q(7)]: Q7_HALF_B_SIGN, [q(8)]: Q8_TP_SIGN },
  clarification: "I found the right numbers for the split in Q1 and Q2 and then put the minus in the wrong bracket both times. I didn't expand back because I was sure. In Q7 I wrote x + 5/2 without thinking about the minus, and in Q8 I read h straight off the bracket.",
  groupStatus: "Group review done · expanding Q1 back",
};

export const PS4_CLASSMATES: Classmate[] = [
  {
    id: "priya",
    name: "Priya Raman",
    initials: "PR",
    confidence: "confident",
    done: 10,
    wrong: [],
    notes: [],
    attempts: {},
    groupStatus: "Group review done · explained the split on Q2",
  },
  {
    id: "jordan",
    name: "Jordan Whitlock",
    initials: "JW",
    confidence: "confident",
    done: 8,
    wrong: [q(1), q(2), q(4)],
    notes: [{ text: "non-monic pairs guessed, never expanded back", problems: [q(1), q(2), q(4)] }],
    attempts: { [q(1)]: Q1_GUESSED, [q(2)]: Q2_GUESSED, [q(4)]: Q4_GUESSED },
    clarification: "I looked for two numbers that multiply to the last number and wrote the brackets. I didn't multiply them out again, so I never saw the middle was wrong. I didn't get to Q9 or Q10.",
    groupStatus: "Group review done · the split on Q2",
  },
  {
    id: "amelia",
    name: "Amelia Chen",
    initials: "AC",
    confidence: "low",
    done: 10,
    wrong: [q(6), q(7), q(10)],
    notes: [
      { text: "added 9 to complete the square, never took it away", problems: [q(6)] },
      { text: "half of b squared as a whole number over 2", problems: [q(7)] },
      { text: "the negative width kept in the answer sentence", problems: [q(10)] },
    ],
    attempts: { [q(6)]: Q6_NOT_TAKEN_AWAY_EQ, [q(7)]: Q7_OVER_TWO, [q(10)]: Q10_KEPT },
    clarification: "In Q6 I added the 9 to make the square and forgot I had to take it away. In Q7 I squared the 5 and left the 2. In Q10 both answers gave 35 when I checked, so I wrote both.",
    groupStatus: "Group review done · which answer can be a width",
  },
  {
    id: "tomas",
    name: "Tomas Reyes",
    initials: "TR",
    confidence: "low: fractions",
    done: 9,
    wrong: [q(3), q(5), q(6), q(7), q(9)],
    notes: [
      { text: "factors set to zero with their signs flipped", problems: [q(3)] },
      { text: "solved 2x + 1 = 0 as x = −2", problems: [q(3)] },
      { text: "a root's sign copied from its bracket", problems: [q(5)] },
      { text: "half of b taken with the wrong sign", problems: [q(6)] },
      { text: "fractions lost in half of b", problems: [q(7)] },
      { text: "the minimum's x read with the sign flipped", problems: [q(9)] },
    ],
    attempts: { [q(3)]: Q3_FLIPPED, [q(5)]: Q5_ROOT_SIGN, [q(6)]: Q6_HALF_B_SIGN, [q(7)]: Q7_NOT_HALVED, [q(9)]: Q9_TP_SIGN },
    clarification: "I copy the sign that's in the bracket, in Q3, Q5, Q6 and Q9. In Q3 I also got 2x + 1 = 0 wrong because I divided the wrong way. Q7 had a fraction in half of b so I just used 5. I didn't get to Q10.",
    groupStatus: "Group review done · the sign in the bracket",
  },
  {
    id: "zara",
    name: "Zara Haddad",
    initials: "ZH",
    confidence: "confident",
    done: 10,
    wrong: [q(6), q(7), q(8), q(9)],
    notes: [
      { text: "added the square to complete it, never took it away", problems: [q(6), q(8), q(9)] },
      { text: "half of −5 squared as 25/2", problems: [q(7)] },
      { text: "the minimum value given as the x of the turning point", problems: [q(9)] },
    ],
    attempts: { [q(6)]: Q6_NOT_TAKEN_AWAY, [q(7)]: Q7_OVER_TWO, [q(8)]: Q8_NOT_TAKEN_AWAY, [q(9)]: Q9_NOT_TAKEN_AWAY },
    clarification: "I kept adding the number to make the square and not taking it off again: Q6, Q8 and Q9. In Q7 I only squared the top of 5/2. In Q9 I wrote the first number of the turning point as the minimum.",
    groupStatus: "Group review done · Q9, which number is the value",
  },
  {
    id: "liam",
    name: "Liam O'Connell",
    initials: "LO",
    confidence: "confident",
    done: 2,
    wrong: [q(1), q(2)],
    notes: [{ text: "non-monic pairs guessed, never expanded back", problems: [q(1), q(2)] }],
    attempts: { [q(1)]: Q1_GUESSED, [q(2)]: Q2_GUESSED },
    clarification: "I only had time for two. I guessed the brackets from the numbers at the end.",
    groupStatus: "Group review done · listening on Q2",
  },
  {
    id: "aiden",
    name: "Aiden Park",
    initials: "AP",
    confidence: "confident",
    done: 10,
    wrong: [q(8)],
    notes: [{ text: "the 2 taken out of 2x² only", problems: [q(8)] }],
    attempts: { [q(8)]: Q8_FIRST_TERM },
    clarification: "I took the 2 out of the x squared and left 8x as it was. Everything after that was right for the wrong bracket.",
    groupStatus: "Group review done · Q8 term by term",
  },
  {
    id: "mia",
    name: "Mia Nguyen",
    initials: "MN",
    confidence: "low: factorising",
    done: 10,
    wrong: [q(1), q(4), q(6)],
    notes: [
      { text: "non-monic pairs guessed, never expanded back", problems: [q(1), q(4)] },
      { text: "solved 2x − 1 = 0 as x = −1/2", problems: [q(4)] },
      { text: "half of b squared without its sign", problems: [q(6)] },
    ],
    attempts: { [q(1)]: Q1_GUESSED, [q(2)]: Q2_BRACKETS, [q(4)]: Q4_GUESSED_SIGN, [q(6)]: Q6_NINE_SIGN, [q(10)]: Q10_NO_SPLIT },
    clarification: "With a number in front of x squared I try brackets until one looks close. Q2 and Q10 worked, Q1 and Q4 didn't. In Q4 I also lost the minus solving 2x − 1 = 0, and in Q6 I added the 9 back instead of taking it away.",
    groupStatus: "Group review done · learning the split",
  },
  {
    id: "noah",
    name: "Noah Fitzgerald",
    initials: "NF",
    confidence: "confident",
    done: 10,
    wrong: [q(6)],
    notes: [{ text: "the square completed, its constant not taken away", problems: [q(6)] }],
    attempts: { [q(6)]: Q6_NOT_TAKEN_AWAY },
    clarification: "I made the perfect square and forgot the 9 wasn't there to start with.",
    groupStatus: "Group review done · Q6 expanding back",
  },
  {
    id: "chloe",
    name: "Chloe Abara",
    initials: "CA",
    confidence: "confident",
    done: 10,
    wrong: [q(2), q(5), q(7)],
    notes: [
      { text: "a non-monic pair guessed, never expanded back", problems: [q(2)] },
      { text: "a root's sign lost rearranging", problems: [q(5)] },
      { text: "halves lost completing the square", problems: [q(7)] },
    ],
    attempts: { [q(2)]: Q2_GUESSED_OTHER, [q(5)]: Q5_ROOT_SIGN, [q(7)]: Q7_NOT_HALVED },
    clarification: "I did Q5's roots in my head and dropped a minus. Q2 I guessed. In Q7 I forgot to halve the 5.",
    groupStatus: "Group review done · Q5 one step at a time",
  },
  {
    id: "ethan",
    name: "Ethan Kowalski",
    initials: "EK",
    confidence: "confident",
    done: 10,
    wrong: [q(2), q(4), q(5), q(7), q(9)],
    notes: [
      { text: "a non-monic pair guessed, never expanded back", problems: [q(2)] },
      { text: "a root's sign lost in the rush", problems: [q(4)] },
      { text: "factorised before making the equation equal zero", problems: [q(5)] },
      { text: "half of −5 rushed as −5/4", problems: [q(7)] },
      { text: "the minimum value given as the x, jumped straight to it", problems: [q(9)] },
      { text: "steps jumped completing the square and in the worded problem", problems: [q(8), q(10)] },
    ],
    attempts: { [q(1)]: Q1_JUMP, [q(2)]: Q2_GUESSED_OTHER, [q(4)]: Q4_ROOT_SIGN, [q(5)]: Q5_BEFORE_ZERO, [q(6)]: Q6_JUMP, [q(7)]: Q7_QUARTER, [q(8)]: Q8_JUMP, [q(9)]: Q9_X_AS_MIN, [q(10)]: Q10_JUMP },
    clarification: "I went fast and wrote a lot in one line. In Q5 I took the x out and tried numbers until 5 worked. In Q9 I wrote the 2 from the turning point as the minimum. Q7 I halved twice.",
    groupStatus: "Group review done · writing Q8 out in steps",
  },
  {
    id: "isla",
    name: "Isla Moretti",
    initials: "IM",
    confidence: "confident",
    done: 10,
    wrong: [q(5), q(8), q(10)],
    notes: [
      { text: "x² − 3x = 10 rearranged with the 10's sign copied", problems: [q(5)] },
      { text: "the turning point's sign copied from the bracket", problems: [q(8)] },
      { text: "the negative width given in the sentence", problems: [q(10)] },
    ],
    attempts: { [q(5)]: Q5_TEN_SIGN, [q(8)]: Q8_TP_SIGN, [q(10)]: Q10_NEGATIVE },
    clarification: "In Q5 I moved the 10 over and kept it as plus. In Q8 I copied the 2 from the bracket. In Q10 I wrote −5 without reading it back.",
    groupStatus: "Group review done · reading the sentence back",
  },
  {
    id: "lucas",
    name: "Lucas Tanaka",
    initials: "LT",
    confidence: "low: graph features",
    done: 10,
    wrong: [q(5), q(8), q(9), q(10)],
    notes: [
      { text: "x² − 3x = 10 rearranged with a sign lost", problems: [q(5)] },
      { text: "the turning point read with the sign flipped", problems: [q(8), q(9)] },
      { text: "width and length swapped in the sentence", problems: [q(10)] },
    ],
    attempts: { [q(5)]: Q5_SIGN_LOST, [q(8)]: Q8_TP_SIGN, [q(9)]: Q9_TP_SIGN, [q(10)]: Q10_SWAPPED },
    clarification: "I'm not sure which way the sign goes for the turning point, so I copied it from the bracket in Q8 and Q9. In Q5 I lost the minus on 3x. In Q10 I had 3.5 and 10 and wrote the wrong one.",
    groupStatus: "Group review done · h and the bracket's sign",
  },
  {
    id: "grace",
    name: "Grace Okoye",
    initials: "GO",
    confidence: "confident",
    done: 6,
    wrong: [],
    notes: [{ text: "solved in one jump", problems: [q(1), q(2), q(3), q(4)] }],
    attempts: { [q(1)]: Q1_JUMP, [q(2)]: Q2_JUMP, [q(3)]: Q3_JUMP, [q(4)]: Q4_JUMP },
    clarification: "I could see the brackets so I wrote them. I started late and stopped at Q6.",
    groupStatus: "Group review done · writing out Q4's split",
  },
  {
    id: "harper",
    name: "Harper Singh",
    initials: "HS",
    confidence: "confident",
    done: 10,
    wrong: [q(5), q(9)],
    notes: [
      { text: "a sign lost rearranging x² − 3x = 10", problems: [q(5)] },
      { text: "the minimum value read off the wrong line", problems: [q(9)] },
      { text: "the square completed in one line", problems: [q(8)] },
    ],
    attempts: { [q(5)]: Q5_SIGN_LOST, [q(8)]: Q8_JUMP_HK, [q(9)]: Q9_WRONG_LINE },
    clarification: "Too fast again. In Q5 the 3x changed sign when I moved the 10, and in Q9 I took the 7 from the question instead of my own line.",
    groupStatus: "Group review done · Q9, where the value comes from",
  },
  {
    id: "oliver",
    name: "Oliver Brennan",
    initials: "OB",
    confidence: "low: factorising",
    done: 8,
    wrong: [q(1), q(2), q(5)],
    notes: [
      { text: "non-monic pairs guessed, never expanded back", problems: [q(1), q(2)] },
      { text: "null factor law on x(x − 3) = 10, a product that isn't 0", problems: [q(5)] },
    ],
    attempts: { [q(1)]: Q1_GUESSED, [q(2)]: Q2_GUESSED, [q(4)]: Q4_BRACKETS, [q(5)]: Q5_NFL_TEN },
    clarification: "I guess the brackets and hope; Q4 came out right. In Q5 I set each part equal to 10 because that's what it equalled. I didn't have time for Q9 and Q10.",
    groupStatus: "Group review done · checking pairs by expanding",
  },
  {
    id: "ruby",
    name: "Ruby Castellanos",
    initials: "RC",
    confidence: "confident",
    done: 10,
    wrong: [q(4), q(5), q(9)],
    notes: [
      { text: "a pair that multiplies but doesn't add, never expanded back", problems: [q(4), q(5)] },
      { text: "the minimum value given as the x of the turning point", problems: [q(9)] },
    ],
    attempts: { [q(4)]: Q4_GUESSED, [q(5)]: Q5_PAIR, [q(9)]: Q9_X_AS_MIN },
    clarification: "In Q4 and Q5 I took the first pair that multiplied and didn't check they added. In Q9 I read the wrong number off the turning point.",
    groupStatus: "Group review done · pairs that add as well",
  },
  {
    id: "finn",
    name: "Finn Dlamini",
    initials: "FD",
    confidence: "confident",
    done: 10,
    wrong: [q(3), q(4), q(8)],
    notes: [
      { text: "solved 2x + 1 = 0 as x = −2", problems: [q(3), q(4)] },
      { text: "turning point read with the sign flipped", problems: [q(8)] },
    ],
    attempts: { [q(3)]: Q3_UPSIDE_DOWN, [q(4)]: Q4_UPSIDE_DOWN, [q(8)]: Q8_TP_SIGN },
    clarification: "My factors were right in Q3 and Q4 and I divided the wrong way at the end both times. In Q8 I wrote h = 2 because the bracket said + 2.",
    groupStatus: "Group review done · Q3 one step at a time",
  },
  {
    id: "sofia",
    name: "Sofia Petrov",
    initials: "SP",
    confidence: "low: fractions",
    done: 10,
    wrong: [q(2), q(7)],
    notes: [
      { text: "halves lost completing the square", problems: [q(7)] },
      { text: "(5/2)² taken as 5/4 completing the square", problems: [q(7)] },
      { text: "a non-monic pair guessed", problems: [q(2)] },
    ],
    attempts: { [q(2)]: Q2_GUESSED, [q(7)]: Q7_HALVES },
    clarification: "The halves in Q7 got away from me: I squared 5/2 wrong and then halved again. Q2 I guessed the pair and moved on.",
    groupStatus: "Group review done · Q7's halves",
  },
];
