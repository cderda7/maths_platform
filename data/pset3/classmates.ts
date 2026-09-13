import { DEMO_STUDENT } from "../assignment";
import type { Classmate } from "../classmates";
import { PS3_PROBLEMS } from "./assignment";

/**
 * Every student's Problem Set 3 (ticket 213): Sam's record and the nineteen classmates', in the shape every
 * set's classmates use (`Classmate`), in the class order, every one authored in full: a confidence answer,
 * how far they got, what they got wrong, the working for each wrong problem, the platform's notes, what they
 * wrote back, and a line from group review.
 *
 * The habits, as the class story sheet's Set 3 column has them (`data/story.ts`):
 * - The binomial identity, the set's top gap (nine students): (2x − 3)² squared term by term (Noah, Oliver;
 *   Noah again on Q10 until the show-that would not come out), taken as a² − b² (Amelia), its middle term's
 *   sign lost (Tomas, Harper); x² − 49 written as (x − 7)² (Zara, Mia, Amelia); x² − 10x + 25 taken for a
 *   difference of squares and not checked (Jordan, Oliver), or its square's sign flipped (Tomas, Ethan in one line).
 * - Monic pairs not expanded back (Q5, Q8): Jordan's unchecked pairs start here (Q8, and the non-monic Q9),
 *   with Chloe, Ethan and Oliver; Lucas and Ruby take a pair that multiplies but does not add; Sam swaps the
 *   pair's signs; Finn flips a sign writing the pair and "checks" by copying the question back.
 * - Mia tries brackets until one looks close (Q9); Sofia guesses the non-monic pair (Q9).
 * - Expansion and the common factor (Q1, Q7): Aiden multiplies or squares part and leaves the rest (Q1, Q3, Q7), Tomas and Isla copy a
 *   sign instead of multiplying and take out −3 with the signs inside kept, Harper loses a sign, Amelia takes the
 *   3 out and never puts it back.
 * - The show-that (Q10): Tomas and Lucas claim 12x from a line that doesn't give it; Amelia and Isla do the
 *   working and end by solving for x, so the last line doesn't say what was shown.
 * - Steps jumped: Grace factorises in one line (Q5, Q7–Q9); Harper and Ethan write the perfect square in one.
 * Priya gets everything right. Liam O'Connell handed nothing in. Jordan, Grace and Oliver stop at nine.
 */

const solution = (n: number): string[] => PS3_PROBLEMS[n - 1].solution.map((s) => s.tex);

/* ---------- the class's workings on the problems they got wrong, one per distinct way ---------- */

/** Q1: 4 × (−7) given the sign of the bracket's term rather than multiplied. */
const Q1_SIGN_COPIED = ["x^2 - 7x + 4x + 28", "x^2 - 3x + 28"];
/** Q1: the four terms right, −7x + 4x collected as +3x. */
const Q1_COLLECTED = ["x^2 - 7x + 4x - 28", "x^2 + 3x - 28"];
/** Q1: the 4 multiplied into x and not into −7. */
const Q1_FIRST_ONLY = ["x^2 - 7x + 4x - 7", "x^2 - 3x - 7"];
/** Q3: (3x)² as 3x², the 3 left unsquared. */
const Q3_THREE_UNSQUARED = ["(3x)^2 - 5^2", "3x^2 - 25"];
/** Q2: squared term by term. */
const Q2_TERM_BY_TERM = ["(2x)^2 + (-3)^2", "4x^2 + 9"];
/** Q2: the perfect square taken as a² − b². */
const Q2_AS_DIFFERENCE = ["(2x)^2 - 3^2", "4x^2 - 9"];
/** Q2: −3 put in for b, so the identity's minus is used twice. */
const Q2_MINUS_TWICE = ["(2x)^2 - 2(2x)(-3) + 3^2", "4x^2 + 12x + 9"];
/** Q2: (a + b)² used for a difference. */
const Q2_PLUS_IDENTITY = ["(2x)^2 + 2(2x)(3) + 3^2", "4x^2 + 12x + 9"];
/** Q4: x² − 49 as (x − 7)². */
const Q4_SQUARE = ["x^2 - 7^2", "(x - 7)^2"];
/** Q5: −15 × 1, never added. */
const Q5_NOT_ADDING = ["-15 \\times 1 = -15", "(x - 15)(x + 1)"];
/** Q5: a pair written straight down. */
const Q5_GUESSED = ["(x + 15)(x - 1)"];
/** Q5: the right pair, the signs swapped into the brackets, the check copied from the question. */
const Q5_FLIPPED = ["5 \\times (-3) = -15,\\; 5 + (-3) = 2", "(x - 5)(x + 3)", "(x - 5)(x + 3) = x^2 + 2x - 15"];
/** Q6: 25 spotted as a square, the whole taken for a difference of squares. */
const Q6_AS_DIFFERENCE = ["25 = 5^2", "(x - 5)(x + 5)"];
/** Q6: the perfect square seen, the bracket's sign flipped. */
const Q6_SIGN = ["x^2 - 2(5)x + 5^2", "(x + 5)^2"];
/** Q6 in one rushed line. */
const Q6_RUSHED = ["x^2 - 10x + 25 = (x + 5)^2"];
/** Q7: −3 taken out, the signs inside kept. */
const Q7_NEGATIVE = ["-3(x^2 - 4x - 12)", "(-6) \\times 2 = -12,\\; -6 + 2 = -4", "-3(x - 6)(x + 2)"];
/** Q7: −12x ÷ 3 as +4x. */
const Q7_SIGN_LOST = ["3(x^2 + 4x - 12)", "6 \\times (-2) = -12,\\; 6 + (-2) = 4", "3(x + 6)(x - 2)"];
/** Q7: the 3 taken out and left off the answer. */
const Q7_LEFT_OFF = ["3(x^2 - 4x - 12)", "(-6) \\times 2 = -12,\\; -6 + 2 = -4", "(x - 6)(x + 2)"];
/** Q7: the 3 out of two terms only. */
const Q7_TWO_TERMS = ["3(x^2 - 4x) - 36"];
/** Q8: 3 and 8 for −11. */
const Q8_SIGNS_SWAPPED = ["3 \\times 8 = 24,\\; 3 + 8 = 11", "(x + 3)(x + 8)"];
/** Q8: 2 × 12, never expanded back. */
const Q8_GUESSED = ["2 \\times 12 = 24", "(x - 2)(x - 12)"];
/** Q8: −4 and −6, which add to −10. */
const Q8_NOT_ADDING = ["-4 \\times (-6) = 24", "(x - 4)(x - 6)"];
/** Q8: the right pair, a sign flipped writing it, the check copied from the question. */
const Q8_FLIPPED = ["(-3) \\times (-8) = 24,\\; -3 + (-8) = -11", "(x - 3)(x + 8)", "(x - 3)(x + 8) = x^2 - 11x + 24"];
/** Q9: first and last terms matched, the middle never checked. */
const Q9_GUESSED = ["2x \\times x = 2x^2", "3 \\times 1 = 3", "(2x + 3)(x + 1)"];
/** Q9: brackets tried until one looked close. */
const Q9_CLOSE = ["(2x + 1)(x + 1) = 2x^2 + 3x + 1", "(2x + 2)(x + 1) = 2x^2 + 4x + 2", "(2x + 3)(x + 1) = 2x^2 + 5x + 3", "2x^2 + 7x + 3 = (2x + 3)(x + 1)"];
/** Q10: the minus not carried through, 12x claimed anyway. */
const Q10_CLAIMED = ["(x + 3)^2 = x^2 + 6x + 9", "(x - 3)^2 = x^2 - 6x + 9", "(x^2 + 6x + 9) - (x^2 - 6x + 9)", "x^2 + 6x + 9 - x^2 - 6x + 9 = 12x", "\\text{so } (x + 3)^2 - (x - 3)^2 = 12x"];
/** Q10: one sign left unchanged, the conclusion written anyway. */
const Q10_ONE_SIGN = ["(x + 3)^2 = x^2 + 6x + 9", "(x - 3)^2 = x^2 - 6x + 9", "(x^2 + 6x + 9) - (x^2 - 6x + 9)", "= x^2 + 6x + 9 - x^2 + 6x + 9", "\\text{so } (x + 3)^2 - (x - 3)^2 = 12x"];
/** Q10: the working right, the last line solving for x. */
const Q10_SOLVED = ["(x + 3)^2 = x^2 + 6x + 9", "(x - 3)^2 = x^2 - 6x + 9", "= x^2 + 6x + 9 - x^2 + 6x - 9", "= 12x", "\\text{so } x = 12"];
/** Q10: the first square term by term, caught when it would not come out, then the working right. */
const Q10_CAUGHT = ["(x + 3)^2 = x^2 + 9", ...solution(10)];

/* ---------- right, but in one line ---------- */
const Q5_JUMP = ["x^2 + 2x - 15 = (x + 5)(x - 3)"];
const Q6_JUMP = ["x^2 - 10x + 25 = (x - 5)^2"];
const Q7_JUMP = ["3x^2 - 12x - 36 = 3(x - 6)(x + 2)"];
const Q8_JUMP = ["x^2 - 11x + 24 = (x - 3)(x - 8)"];
const Q9_JUMP = ["2x^2 + 7x + 3 = (2x + 1)(x + 3)"];
/** Q8 right, the check not written. */
const Q8_NO_CHECK = solution(8).slice(0, 2);

/** The problem ids, by number, so the records read like the set. */
const q = (n: number) => `ps3-q${n}`;

/**
 * Sam's Problem Set 3: confident and quick, everything right but Q8, where he took 3 and 8 for a pair that has
 * to add to −11 and did not do the expansion back the question asked for.
 */
export const PS3_SAM: Classmate = {
  id: DEMO_STUDENT.id,
  name: DEMO_STUDENT.name,
  initials: DEMO_STUDENT.initials,
  confidence: "confident",
  done: 10,
  wrong: [q(8)],
  notes: [{ text: "the pair's signs swapped, not expanded back", problems: [q(8)] }],
  attempts: { [q(8)]: Q8_SIGNS_SWAPPED },
  clarification: "I saw 3 and 8 and wrote them without looking at the minus on the 11. The question said to expand back and I skipped it because I was sure.",
  groupStatus: "Group review done · expanded Q8 back",
};

export const PS3_CLASSMATES: Classmate[] = [
  {
    id: "priya",
    name: "Priya Raman",
    initials: "PR",
    confidence: "confident",
    done: 10,
    wrong: [],
    notes: [],
    attempts: {},
    groupStatus: "Group review done · explained the split on Q9",
  },
  {
    id: "jordan",
    name: "Jordan Whitlock",
    initials: "JW",
    confidence: "confident",
    done: 9,
    wrong: [q(6), q(8), q(9)],
    notes: [
      { text: "a factor pair that multiplies to the constant, not checked by expanding", problems: [q(8), q(9)] },
      { text: "a perfect square factorised as a difference of squares, not checked", problems: [q(6)] },
    ],
    attempts: { [q(6)]: Q6_AS_DIFFERENCE, [q(8)]: Q8_GUESSED, [q(9)]: Q9_GUESSED },
    clarification: "I looked for numbers that multiply to the last number and wrote the brackets. I didn't expand any of them back, even in Q8 where it said to. In Q6 I saw 25 and thought of x² − 25. I didn't get to Q10.",
    groupStatus: "Group review done · expanded Q8 and Q9 back",
  },
  {
    id: "amelia",
    name: "Amelia Chen",
    initials: "AC",
    confidence: "low",
    done: 10,
    wrong: [q(2), q(4), q(7), q(10)],
    notes: [
      { text: "(2x − 3)² expanded without the middle term", problems: [q(2)] },
      { text: "x² − 49 written as (x − 7)²", problems: [q(4)] },
      { text: "a common factor taken out and not put back in the answer", problems: [q(7)] },
      { text: "the last line doesn't say what was shown", problems: [q(10)] },
    ],
    attempts: { [q(2)]: Q2_AS_DIFFERENCE, [q(4)]: Q4_SQUARE, [q(7)]: Q7_LEFT_OFF, [q(10)]: Q10_SOLVED },
    clarification: "I thought squaring a bracket was just squaring both bits, so Q2 and Q4 were the same mistake the other way round. In Q7 I took the 3 out to make it easier and forgot it was still there. In Q10 I got 12x and thought I had to find x.",
    groupStatus: "Group review done · (a − b)² written out as two brackets",
  },
  {
    id: "tomas",
    name: "Tomas Reyes",
    initials: "TR",
    confidence: "low: fractions",
    done: 10,
    wrong: [q(1), q(2), q(6), q(7), q(10)],
    notes: [
      { text: "signs in the second bracket copied, not multiplied", problems: [q(1)] },
      { text: "the middle term's sign copied from the bracket", problems: [q(2), q(6)] },
      { text: "a negative common factor's sign lost", problems: [q(7)] },
      { text: "both squares expanded, the subtraction's signs not shown", problems: [q(10)] },
    ],
    attempts: { [q(1)]: Q1_SIGN_COPIED, [q(2)]: Q2_MINUS_TWICE, [q(6)]: Q6_SIGN, [q(7)]: Q7_NEGATIVE, [q(8)]: Q8_NO_CHECK, [q(10)]: Q10_CLAIMED },
    clarification: "I keep writing the sign that's already there instead of working out what it should be. In Q7 I took out −3 because the question had minuses and didn't change anything inside. In Q10 I knew the answer was 12x so I wrote it.",
    groupStatus: "Group review done · signs, one product at a time",
  },
  {
    id: "zara",
    name: "Zara Haddad",
    initials: "ZH",
    confidence: "confident",
    done: 10,
    wrong: [q(4)],
    notes: [{ text: "x² − 49 factorised as (x − 7)²", problems: [q(4)] }],
    attempts: { [q(4)]: Q4_SQUARE },
    clarification: "I saw 49 and 7 and wrote the square without thinking. If I'd expanded it I would have got a middle term.",
    groupStatus: "Group review done · square or difference of squares",
  },
  {
    // Handed nothing in (ticket 213): the class view shows his row as missing.
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
    wrong: [q(1), q(3), q(7)],
    notes: [
      { text: "the common factor divided out of the first two terms only", problems: [q(7)] },
      { text: "the 4 multiplied into x and not the −7", problems: [q(1)] },
      { text: "(3x)² squared the x and not the 3", problems: [q(3)] },
    ],
    attempts: { [q(1)]: Q1_FIRST_ONLY, [q(3)]: Q3_THREE_UNSQUARED, [q(7)]: Q7_TWO_TERMS },
    clarification: "In Q7 I took the 3 out of the x terms and left the 36 outside. In Q1 I multiplied the 4 by x and forgot the −7, and in Q3 I squared the x and not the 3. Every time I did the first bit and stopped.",
    groupStatus: "Group review done · Q7 every term",
  },
  {
    id: "mia",
    name: "Mia Nguyen",
    initials: "MN",
    confidence: "low: factorising",
    done: 10,
    wrong: [q(4), q(9)],
    notes: [
      { text: "tried brackets until one looked close", problems: [q(9)] },
      { text: "x² − 49 written as (x − 7)²", problems: [q(4)] },
    ],
    attempts: { [q(4)]: Q4_SQUARE, [q(9)]: Q9_CLOSE },
    clarification: "When there's a 2 in front I don't know where to start, so I tried brackets. The last one had the 3 at the end right so I went with it. In Q4 I mixed up the square and the difference of squares.",
    groupStatus: "Group review done · learning the split on Q9",
  },
  {
    id: "noah",
    name: "Noah Fitzgerald",
    initials: "NF",
    confidence: "confident",
    done: 10,
    wrong: [q(2), q(10)],
    notes: [{ text: "(2x − 3)² squared term by term", problems: [q(2), q(10)] }],
    attempts: { [q(2)]: Q2_TERM_BY_TERM, [q(10)]: Q10_CAUGHT },
    clarification: "I squared the 2x and the 3 and added them. Q10 didn't come out when I did the same thing, so I wrote (x + 3)² out properly there, but I didn't go back to Q2.",
    groupStatus: "Group review done · Q2 as two brackets",
  },
  {
    id: "chloe",
    name: "Chloe Abara",
    initials: "CA",
    confidence: "confident",
    done: 10,
    wrong: [q(8)],
    notes: [{ text: "a factor pair guessed without checking", problems: [q(8)] }],
    attempts: { [q(8)]: Q8_GUESSED },
    clarification: "2 and 12 was the first pair I thought of. I didn't add them and I skipped the checking part.",
    groupStatus: "Group review done · Q8 add as well as multiply",
  },
  {
    id: "ethan",
    name: "Ethan Kowalski",
    initials: "EK",
    confidence: "confident",
    done: 10,
    wrong: [q(6), q(8)],
    notes: [
      { text: "a perfect square's middle term rushed, written in one line", problems: [q(6)] },
      { text: "a factor pair written without checking the middle", problems: [q(8)] },
    ],
    attempts: { [q(6)]: Q6_RUSHED, [q(8)]: Q8_GUESSED },
    clarification: "I could see Q6 was a square so I wrote it straight down and got the sign wrong. In Q8 I rushed the pair and didn't do the check.",
    groupStatus: "Group review done · slowing down on Q6",
  },
  {
    id: "isla",
    name: "Isla Moretti",
    initials: "IM",
    confidence: "confident",
    done: 10,
    wrong: [q(1), q(7), q(10)],
    notes: [
      { text: "signs in the second bracket copied, not multiplied", problems: [q(1)] },
      { text: "the common factor's sign left behind", problems: [q(7)] },
      { text: "the working shown, the last line doesn't say what it shows", problems: [q(10)] },
    ],
    attempts: { [q(1)]: Q1_SIGN_COPIED, [q(7)]: Q7_NEGATIVE, [q(10)]: Q10_SOLVED },
    clarification: "In Q10 I had 12x and wrote x = 12 without reading what the question wanted. In Q1 I copied the plus, and in Q7 I took out −3 and didn't change the signs inside.",
    groupStatus: "Group review done · what a show-that ends with",
  },
  {
    id: "lucas",
    name: "Lucas Tanaka",
    initials: "LT",
    confidence: "confident",
    done: 10,
    wrong: [q(8), q(10)],
    notes: [
      { text: "a pair that multiplies to 24 but adds to −10", problems: [q(8)] },
      { text: "the identity shown, one line's sign not justified", problems: [q(10)] },
    ],
    attempts: { [q(8)]: Q8_NOT_ADDING, [q(10)]: Q10_ONE_SIGN },
    clarification: "In Q8 −4 and −6 multiply to 24 and I stopped there. In Q10 I changed the 6x's sign and not the 9's, and I wrote the last line because I knew what it had to be.",
    groupStatus: "Group review done · the minus in front of a bracket",
  },
  {
    id: "grace",
    name: "Grace Okoye",
    initials: "GO",
    confidence: "confident",
    done: 9,
    wrong: [],
    notes: [{ text: "factorised in one line, the pair not shown", problems: [q(5), q(7), q(8), q(9)] }],
    attempts: { [q(5)]: Q5_JUMP, [q(7)]: Q7_JUMP, [q(8)]: Q8_JUMP, [q(9)]: Q9_JUMP },
    clarification: "I can see the pairs so I write the brackets. I checked Q8 in my head. I started late and didn't get to Q10.",
    groupStatus: "Group review done · writing out the pair on Q5",
  },
  {
    id: "harper",
    name: "Harper Singh",
    initials: "HS",
    confidence: "confident",
    done: 10,
    wrong: [q(1), q(2), q(7)],
    notes: [
      { text: "a sign lost in the expansion", problems: [q(1)] },
      { text: "(2x − 3)²'s middle term sign lost", problems: [q(2)] },
      { text: "the common factor's sign lost", problems: [q(7)] },
      { text: "the perfect square written in one line", problems: [q(6)] },
    ],
    attempts: { [q(1)]: Q1_COLLECTED, [q(2)]: Q2_PLUS_IDENTITY, [q(6)]: Q6_JUMP, [q(7)]: Q7_SIGN_LOST },
    clarification: "Every one was a sign. I did −7x + 4x as 3x, used the plus square in Q2, and divided −12x by 3 and got 4x. Q6 I just wrote down.",
    groupStatus: "Group review done · signs in Q1 and Q7",
  },
  {
    id: "oliver",
    name: "Oliver Brennan",
    initials: "OB",
    confidence: "low: factorising",
    done: 9,
    wrong: [q(2), q(5), q(6), q(8)],
    notes: [
      { text: "factor pairs guessed without expanding back", problems: [q(5), q(8)] },
      { text: "(2x − 3)² squared term by term", problems: [q(2)] },
      { text: "a perfect square taken for a difference of squares", problems: [q(6)] },
    ],
    attempts: { [q(2)]: Q2_TERM_BY_TERM, [q(5)]: Q5_GUESSED, [q(6)]: Q6_AS_DIFFERENCE, [q(8)]: Q8_GUESSED },
    clarification: "Factorising is the bit I guess. I wrote brackets that had the right number at the end and didn't check. I squared the bracket in Q2 without writing it out. I ran out of time for Q10.",
    groupStatus: "Group review done · checking pairs by expanding",
  },
  {
    id: "ruby",
    name: "Ruby Castellanos",
    initials: "RC",
    confidence: "confident",
    done: 10,
    wrong: [q(5), q(8)],
    notes: [{ text: "a pair that multiplies to the constant but doesn't add to the middle", problems: [q(5), q(8)] }],
    attempts: { [q(5)]: Q5_NOT_ADDING, [q(8)]: Q8_NOT_ADDING },
    clarification: "Both times I found numbers that multiply to the end number and didn't add them. I thought the multiplying was the hard part.",
    groupStatus: "Group review done · multiply and add",
  },
  {
    id: "finn",
    name: "Finn Dlamini",
    initials: "FD",
    confidence: "confident",
    done: 10,
    wrong: [q(5), q(8)],
    notes: [{ text: "a factor's sign flipped writing the pair, the check copied from the question", problems: [q(5), q(8)] }],
    attempts: { [q(5)]: Q5_FLIPPED, [q(8)]: Q8_FLIPPED },
    clarification: "My pairs were right and I put a sign in the wrong place writing the brackets. When I checked I wrote down the question instead of actually multiplying out.",
    groupStatus: "Group review done · a real expansion back",
  },
  {
    id: "sofia",
    name: "Sofia Petrov",
    initials: "SP",
    confidence: "confident",
    done: 10,
    wrong: [q(9)],
    notes: [{ text: "a non-monic pair guessed", problems: [q(9)] }],
    attempts: { [q(9)]: Q9_GUESSED },
    clarification: "I got the 2x² and the 3 right and didn't look at the middle. I didn't know how to do it with the 2 in front.",
    groupStatus: "Group review done · the split on Q9",
  },
];
