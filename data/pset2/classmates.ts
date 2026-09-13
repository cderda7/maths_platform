import { DEMO_STUDENT } from "../assignment";
import type { Classmate } from "../classmates";
import { PS2_PROBLEMS } from "./assignment";

/**
 * Every student's Problem Set 2 (ticket 212): Sam's record and the nineteen classmates', in the shape
 * Problem Set 6's classmates use (`Classmate`), in the same order, every one authored in full: a
 * confidence answer, how far they got, what they got wrong, the working for each wrong problem, the
 * platform's notes, what they wrote back, and a line from group review.
 *
 * The habits, as the class story sheet (`data/story.ts`, Set 2's column) has them:
 * - The binomial identity, the set's top gap (nine students): (√7 + 2)² squared term by term (Q3: Liam,
 *   Noah) or with its middle term not doubled (Q3: Zara, Harper); (3 − √2)(3 + √2) added (Q4: Oliver); the
 *   same bracket used for the conjugate and then squared as a difference (Q7: Sam, Tomas); the conjugate
 *   multiplied on the bottom only (Q7 and Q8: Amelia; Q8: Chloe).
 * - Expanding a surd bracket (eight students): √3 on the first term only (Q1: Aiden), the minus not
 *   multiplied through (Q1: Harper), the middle terms guessed (Q2: Jordan, Oliver), a product's sign taken
 *   from the bracket (Q2: Isla, Lucas), two of the four products (Q2: Liam), a term dropped from (√3 + 1)²
 *   in a rush (Q8: Ethan). Sam's Q2 slip is the surd product's sign, √5 × (−√5) as +5.
 * - Fractions: a fraction turned over rationalising (Q5, Q6: Tomas; Q6: Finn), the root put on the top
 *   instead of cleared from the bottom (Q5, Q6: Sofia, whose Q7 answer is also left uncancelled), a
 *   denominator dropped adding Q9's fractions (Amelia, Mia, Chloe) or a numerator not scaled (Zara, Ruby).
 * - The rectangle's sentence (Q10): Amelia leaves the diagonal out, Isla swaps area and diagonal, Lucas
 *   does not say which length √22 cm is.
 * - Rationalised in one line (Q5, Q6, Q7): Grace, right every time.
 * Priya gets everything right. Tomas reaches eight problems, Liam three, Grace seven; nobody is missing.
 *
 * Every student's category results equal the sheet's Set 2 row, one step from Sets 1 and 3 at most.
 */

const solution = (n: number): string[] => PS2_PROBLEMS[n - 1].solution.map((s) => s.tex);

/* ---------- the class's workings on the problems they got wrong, one per distinct way ---------- */

/** Q1: √3 multiplied into 2√3 and not into the −1. */
const Q1_FIRST_TERM = ["\\sqrt{3} \\times 2\\sqrt{3} - 1", "6 - 1 = 5"];
/** Q1: √3 × (−1) written as +√3. */
const Q1_MINUS = ["\\sqrt{3} \\times 2\\sqrt{3} + \\sqrt{3} \\times 1", "6 + \\sqrt{3}"];
/** Q2: √5 × (−√5) taken as +5. */
const Q2_ROOT_SIGN = ["6 - 2\\sqrt{5} + 3\\sqrt{5} + 5", "11 + \\sqrt{5}"];
/** Q2: 2 × (−√5) given the bracket's plus. */
const Q2_BRACKET_SIGN = ["6 + 2\\sqrt{5} + 3\\sqrt{5} - 5", "1 + 5\\sqrt{5}"];
/** Q2: first and last products written, the middle guessed as −√5. */
const Q2_MIDDLE_GUESSED = ["6 - \\sqrt{5} - 5", "1 - \\sqrt{5}"];
/** Q2: only the first and last products. */
const Q2_TWO_TERMS = ["6 - 5", "1"];
/** Q3: 2ab written as ab. */
const Q3_NOT_DOUBLED = ["7 + 2\\sqrt{7} + 4", "11 + 2\\sqrt{7}"];
/** Q3: each term squared on its own. */
const Q3_TERM_BY_TERM = ["(\\sqrt{7})^2 + 2^2", "7 + 4 = 11"];
/** Q4: the difference of two squares added. */
const Q4_ADDED = ["3^2 + (\\sqrt{2})^2", "9 + 2 = 11"];
/** Q5: the right multiplier, then 6 ÷ 3 cancelled upside down. */
const Q5_TURNED_OVER = [...solution(5).slice(0, 2), "\\dfrac{\\sqrt{3}}{2}"];
/** Q5: √3 put on the top only. */
const Q5_TOP = ["\\dfrac{6\\sqrt{3}}{\\sqrt{3}}", "6"];
/** Q6: the fraction copied upside down, then rationalised. */
const Q6_TURNED_OVER = ["\\dfrac{2\\sqrt{5}}{\\sqrt{2}} \\times \\dfrac{\\sqrt{2}}{\\sqrt{2}}", "\\dfrac{2\\sqrt{10}}{2}", "\\sqrt{10}"];
/** Q6: the numerator's root cleared, the denominator's left. */
const Q6_TOP = ["\\dfrac{\\sqrt{2}}{2\\sqrt{5}} \\times \\dfrac{\\sqrt{2}}{\\sqrt{2}}", "\\dfrac{2}{2\\sqrt{10}}", "\\dfrac{1}{\\sqrt{10}}"];
/** Q7: multiplied by (√5 − 1) over itself, then (√5 − 1)² taken as 5 − 1. */
const Q7_SAME_BRACKET = ["\\dfrac{4}{\\sqrt{5} - 1} \\times \\dfrac{\\sqrt{5} - 1}{\\sqrt{5} - 1}", "\\dfrac{4(\\sqrt{5} - 1)}{5 - 1}", "\\sqrt{5} - 1"];
/** Q7: the conjugate multiplied into the bottom only. */
const Q7_BOTTOM_ONLY = ["\\dfrac{4}{(\\sqrt{5} - 1)(\\sqrt{5} + 1)}", "\\dfrac{4}{4} = 1"];
/** Q7: right to the last line, the 4 never cancelled. */
const Q7_NOT_CANCELLED = [...solution(7).slice(0, 2), "\\dfrac{4\\sqrt{5} + 4}{4}"];
/** Q8: the conjugate multiplied into the bottom only. */
const Q8_BOTTOM_ONLY = ["\\dfrac{\\sqrt{3} + 1}{(\\sqrt{3} - 1)(\\sqrt{3} + 1)}", "\\dfrac{\\sqrt{3} + 1}{2}"];
/** Q8 rushed: the conjugate and the bottom in one line, one √3 dropped from the top. */
const Q8_RUSHED = ["\\dfrac{(\\sqrt{3} + 1)^2}{3 - 1}", "\\dfrac{3 + \\sqrt{3} + 1}{2}", "\\dfrac{4 + \\sqrt{3}}{2}"];
/** Q9: both tops scaled, only one bottom kept, then rationalised. */
const Q9_DENOMINATOR_DROPPED = ["\\dfrac{(2 - \\sqrt{3}) + (2 + \\sqrt{3})}{2 + \\sqrt{3}}", "\\dfrac{4}{2 + \\sqrt{3}}", "\\dfrac{4(2 - \\sqrt{3})}{4 - 3}", "8 - 4\\sqrt{3}"];
/** Q9: the right denominator, the first top left as 1. */
const Q9_NOT_SCALED = ["\\dfrac{1 + (2 + \\sqrt{3})}{(2 + \\sqrt{3})(2 - \\sqrt{3})}", "\\dfrac{3 + \\sqrt{3}}{4 - 3}", "3 + \\sqrt{3}"];
/** Q10: the working right, the sentence gives the area alone. */
const Q10_NO_DIAGONAL = [...solution(10).slice(0, 4), "\\text{Area } 7 \\text{ cm}^2"];
/** Q10: the working right, the two results swapped in the sentence. */
const Q10_SWAPPED = [...solution(10).slice(0, 4), "\\text{Area } \\sqrt{22} \\text{ cm}^2 \\text{, diagonal } 7 \\text{ cm}"];
/** Q10: the working right, √22 cm not named. */
const Q10_UNNAMED = [...solution(10).slice(0, 4), "\\text{Area } 7 \\text{ cm}^2 \\text{ and } \\sqrt{22} \\text{ cm}"];

/* ---------- right, but in one line each: Grace ---------- */
const Q5_JUMP = ["\\dfrac{6}{\\sqrt{3}} = 2\\sqrt{3}"];
const Q6_JUMP = ["\\dfrac{\\sqrt{2}}{2\\sqrt{5}} = \\dfrac{\\sqrt{10}}{10}"];
const Q7_JUMP = ["\\dfrac{4}{\\sqrt{5} - 1} = \\sqrt{5} + 1"];

/** The problem ids, by number, so the records read like the set. */
const q = (n: number) => `ps2-q${n}`;

/**
 * Sam's Problem Set 2: confident, quick and mostly right; two careless signs. √5 × (−√5) came out
 * positive in Q2, and in Q7 he copied the denominator's minus into the conjugate, then took (√5 − 1)² as
 * 5 − 1 because that was the answer he expected.
 */
export const PS2_SAM: Classmate = {
  id: DEMO_STUDENT.id,
  name: DEMO_STUDENT.name,
  initials: DEMO_STUDENT.initials,
  confidence: "confident",
  done: 10,
  wrong: [q(2), q(7)],
  notes: [
    { text: "√5 × (−√5) taken as +5", problems: [q(2)] },
    { text: "the conjugate's sign copied from the denominator, then squared as a difference", problems: [q(7)] },
  ],
  attempts: { [q(2)]: Q2_ROOT_SIGN, [q(7)]: Q7_SAME_BRACKET },
  clarification: "Q2 was a sign, root 5 times minus root 5 is minus 5. In Q7 I wrote the bottom again with the same minus, and then I wrote 5 − 1 because that's what it always comes to. It only does with the plus.",
  groupStatus: "Group review done · why Q7 needs the plus",
};

export const PS2_CLASSMATES: Classmate[] = [
  {
    id: "priya",
    name: "Priya Raman",
    initials: "PR",
    confidence: "confident",
    done: 10,
    wrong: [],
    notes: [],
    attempts: {},
    groupStatus: "Group review done · explained the conjugate on Q7",
  },
  {
    id: "jordan",
    name: "Jordan Whitlock",
    initials: "JW",
    confidence: "confident",
    done: 10,
    wrong: [q(2)],
    notes: [{ text: "first and last terms multiplied, the middle terms guessed", problems: [q(2)] }],
    attempts: { [q(2)]: Q2_MIDDLE_GUESSED },
    clarification: "I did 2 × 3 and root 5 × minus root 5 and then just put minus root 5 in the middle because there was a minus. I didn't write the other two out.",
    groupStatus: "Group review done · four products on Q2",
  },
  {
    id: "amelia",
    name: "Amelia Chen",
    initials: "AC",
    confidence: "low",
    done: 10,
    wrong: [q(7), q(8), q(9), q(10)],
    notes: [
      { text: "the conjugate multiplied into the denominator only", problems: [q(7), q(8)] },
      { text: "one denominator dropped adding the two fractions", problems: [q(9)] },
      { text: "the area found, the diagonal left out of the sentence", problems: [q(10)] },
    ],
    attempts: { [q(7)]: Q7_BOTTOM_ONLY, [q(8)]: Q8_BOTTOM_ONLY, [q(9)]: Q9_DENOMINATOR_DROPPED, [q(10)]: Q10_NO_DIAGONAL },
    clarification: "I thought rationalising meant fixing the bottom, so in Q7 and Q8 I only multiplied the bottom. In Q9 I put both tops together over one of the bottoms. In Q10 I worked out the diagonal and then only wrote the area.",
    groupStatus: "Group review done · multiplying by one on Q7",
  },
  {
    id: "tomas",
    name: "Tomas Reyes",
    initials: "TR",
    confidence: "low: fractions",
    done: 8,
    wrong: [q(5), q(6), q(7)],
    notes: [
      { text: "a fraction turned over rationalising", problems: [q(5), q(6)] },
      { text: "multiplied by the same bracket, not its conjugate", problems: [q(7)] },
    ],
    attempts: { [q(5)]: Q5_TURNED_OVER, [q(6)]: Q6_TURNED_OVER, [q(7)]: Q7_SAME_BRACKET },
    clarification: "Fractions with roots in them get mixed up for me. In Q5 I did 3 over 6 instead of 6 over 3, and in Q6 I wrote it upside down. In Q7 I multiplied by the bottom again. I didn't get to Q9 or Q10.",
    groupStatus: "Group review done · which way up in Q6",
  },
  {
    id: "zara",
    name: "Zara Haddad",
    initials: "ZH",
    confidence: "confident",
    done: 10,
    wrong: [q(3), q(9)],
    notes: [
      { text: "(√7 + 2)² with 2√7 for the middle term", problems: [q(3)] },
      { text: "a common denominator found, one numerator not scaled", problems: [q(9)] },
    ],
    attempts: { [q(3)]: Q3_NOT_DOUBLED, [q(9)]: Q9_NOT_SCALED },
    clarification: "In Q3 I wrote root 7 times 2 for the middle and forgot to double it. In Q9 I got the bottom right and left the first top as 1.",
    groupStatus: "Group review done · 2ab on Q3",
  },
  {
    id: "liam",
    name: "Liam O'Connell",
    initials: "LO",
    confidence: "confident",
    done: 3,
    wrong: [q(2), q(3)],
    notes: [
      { text: "only two of the four products expanded", problems: [q(2)] },
      { text: "(√7 + 2)² squared term by term", problems: [q(3)] },
    ],
    attempts: { [q(2)]: Q2_TWO_TERMS, [q(3)]: Q3_TERM_BY_TERM },
    clarification: "I did the first ones fast. I squared both bits in Q3. I stopped after that.",
    groupStatus: "Group review done · Q3 written out twice",
  },
  {
    id: "aiden",
    name: "Aiden Park",
    initials: "AP",
    confidence: "confident",
    done: 10,
    wrong: [q(1)],
    notes: [{ text: "√3 multiplied into the first term only", problems: [q(1)] }],
    attempts: { [q(1)]: Q1_FIRST_TERM },
    clarification: "I multiplied root 3 by the 2 root 3 and left the minus 1 alone.",
    groupStatus: "Group review done · Q1 term by term",
  },
  {
    id: "mia",
    name: "Mia Nguyen",
    initials: "MN",
    confidence: "confident",
    done: 10,
    wrong: [q(9)],
    notes: [{ text: "one denominator dropped adding the two fractions", problems: [q(9)] }],
    attempts: { [q(9)]: Q9_DENOMINATOR_DROPPED },
    clarification: "I multiplied both tops properly but only kept one bracket on the bottom, then rationalised that.",
    groupStatus: "Group review done · the common denominator on Q9",
  },
  {
    id: "noah",
    name: "Noah Fitzgerald",
    initials: "NF",
    confidence: "confident",
    done: 10,
    wrong: [q(3)],
    notes: [{ text: "(√7 + 2)² squared term by term", problems: [q(3)] }],
    attempts: { [q(3)]: Q3_TERM_BY_TERM },
    clarification: "I squared the root 7 and squared the 2. I forgot there's a middle bit.",
    groupStatus: "Group review done · Q3 the middle term",
  },
  {
    id: "chloe",
    name: "Chloe Abara",
    initials: "CA",
    confidence: "confident",
    done: 10,
    wrong: [q(8), q(9)],
    notes: [
      { text: "the conjugate multiplied on the bottom only", problems: [q(8)] },
      { text: "one denominator dropped adding the two fractions", problems: [q(9)] },
    ],
    attempts: { [q(8)]: Q8_BOTTOM_ONLY, [q(9)]: Q9_DENOMINATOR_DROPPED },
    clarification: "In Q8 I did the bottom in my head and forgot the top. Q9 I only kept one of the brackets on the bottom.",
    groupStatus: "Group review done · top and bottom on Q8",
  },
  {
    id: "ethan",
    name: "Ethan Kowalski",
    initials: "EK",
    confidence: "confident",
    done: 10,
    wrong: [q(8)],
    notes: [{ text: "rationalised in one line, one √3 dropped expanding the top", problems: [q(8)] }],
    attempts: { [q(8)]: Q8_RUSHED },
    clarification: "I wrote the top as root 3 plus 1 squared and did it in my head. I only got one root 3.",
    groupStatus: "Group review done · writing out Q8's top",
  },
  {
    id: "isla",
    name: "Isla Moretti",
    initials: "IM",
    confidence: "confident",
    done: 10,
    wrong: [q(2), q(10)],
    notes: [
      { text: "the product's sign copied from the bracket", problems: [q(2)] },
      { text: "the sentence gives the area where the diagonal was asked", problems: [q(10)] },
    ],
    attempts: { [q(2)]: Q2_BRACKET_SIGN, [q(10)]: Q10_SWAPPED },
    clarification: "In Q2 I gave 2 root 5 a plus because the 2 was plus. In Q10 my working was right and I wrote the numbers the wrong way round.",
    groupStatus: "Group review done · reading the sentence back",
  },
  {
    id: "lucas",
    name: "Lucas Tanaka",
    initials: "LT",
    confidence: "confident",
    done: 10,
    wrong: [q(2), q(10)],
    notes: [
      { text: "a sign lost expanding (2 + √5)(3 − √5)", problems: [q(2)] },
      { text: "the diagonal stated without saying which length it is", problems: [q(10)] },
    ],
    attempts: { [q(2)]: Q2_BRACKET_SIGN, [q(10)]: Q10_UNNAMED },
    clarification: "I lost the minus on 2 root 5 in Q2. In Q10 I thought writing the two numbers was enough.",
    groupStatus: "Group review done · saying what √22 is",
  },
  {
    id: "grace",
    name: "Grace Okoye",
    initials: "GO",
    confidence: "confident",
    done: 7,
    wrong: [],
    notes: [{ text: "right every time, but rationalised in one line a reader can't follow", problems: [q(5), q(6), q(7)] }],
    attempts: { [q(5)]: Q5_JUMP, [q(6)]: Q6_JUMP, [q(7)]: Q7_JUMP },
    clarification: "I can see what they come to so I just wrote the answer. I started late and didn't get to Q8.",
    groupStatus: "Group review done · writing out the conjugate on Q7",
  },
  {
    id: "harper",
    name: "Harper Singh",
    initials: "HS",
    confidence: "confident",
    done: 10,
    wrong: [q(1), q(3)],
    notes: [
      { text: "the minus not multiplied through the bracket", problems: [q(1)] },
      { text: "(√7 + 2)² with the middle term's 2 lost", problems: [q(3)] },
    ],
    attempts: { [q(1)]: Q1_MINUS, [q(3)]: Q3_NOT_DOUBLED },
    clarification: "Both too fast. In Q1 the minus turned into a plus, and in Q3 I didn't double the middle.",
    groupStatus: "Group review done · signs on Q1",
  },
  {
    id: "oliver",
    name: "Oliver Brennan",
    initials: "OB",
    confidence: "confident",
    done: 10,
    wrong: [q(2), q(4)],
    notes: [
      { text: "brackets expanded by guessing the middle term", problems: [q(2)] },
      { text: "(3 − √2)(3 + √2) taken as 9 + 2", problems: [q(4)] },
    ],
    attempts: { [q(2)]: Q2_MIDDLE_GUESSED, [q(4)]: Q4_ADDED },
    clarification: "I guessed the middle in Q2. In Q4 I squared both and added, I didn't think about the minus.",
    groupStatus: "Group review done · the difference of two squares",
  },
  {
    id: "ruby",
    name: "Ruby Castellanos",
    initials: "RC",
    confidence: "confident",
    done: 10,
    wrong: [q(9)],
    notes: [{ text: "a common denominator's numerator not scaled", problems: [q(9)] }],
    attempts: { [q(9)]: Q9_NOT_SCALED },
    clarification: "I multiplied the second top and forgot the first one.",
    groupStatus: "Group review done · both tops on Q9",
  },
  {
    id: "finn",
    name: "Finn Dlamini",
    initials: "FD",
    confidence: "confident",
    done: 10,
    wrong: [q(6)],
    notes: [{ text: "the fraction turned over rationalising", problems: [q(6)] }],
    attempts: { [q(6)]: Q6_TURNED_OVER },
    clarification: "I copied Q6 down upside down and rationalised that.",
    groupStatus: "Group review done · checking the copy on Q6",
  },
  {
    id: "sofia",
    name: "Sofia Petrov",
    initials: "SP",
    confidence: "low: fractions",
    done: 10,
    wrong: [q(5), q(6), q(7)],
    notes: [
      { text: "rationalised the top instead of the bottom", problems: [q(5), q(6)] },
      { text: "the conjugate's fraction left unsimplified", problems: [q(7)] },
    ],
    attempts: { [q(5)]: Q5_TOP, [q(6)]: Q6_TOP, [q(7)]: Q7_NOT_CANCELLED },
    clarification: "I wasn't sure which root to get rid of, so I moved it to the top. In Q7 I forgot to cancel the 4.",
    groupStatus: "Group review done · clearing the bottom on Q5",
  },
];
