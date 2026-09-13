import { DEMO_STUDENT } from "../assignment";
import type { Classmate } from "../classmates";
import { PS1_PROBLEMS } from "./assignment";

/**
 * Every student's Problem Set 1 (ticket 211): Sam's record and the nineteen classmates', in the shape Problem
 * Set 6's classmates use (`Classmate`), in the same order, every one authored in full: a confidence answer,
 * how far they got, what they got wrong, the working for each wrong problem, the platform's notes, what they
 * wrote back, and a line from group review.
 *
 * The first set of the unit, and the habits in it are the ones later sets catch:
 * - A surd slip, the set's top gap (seven students): a square factor left under the root (Q1, Q6: Chloe,
 *   Ruby); the square taken out without its root (Q2, Q4, Q5: Liam, Oliver, Chloe); surds added under one
 *   root before simplifying (Q3: Amelia); a sign lost or changed collecting like surds (Q4: Tomas, Isla);
 *   the root of a sum split into a sum of roots (Q10: Oliver, who squares brackets term by term from Set 2 on).
 * - A fraction the wrong way up dividing surds (Q7): Tomas and Sofia, who turn fractions over again
 *   rationalising on Set 2; Amelia drops the bottom's surd instead.
 * - Scaling part of an expression (Q8): Aiden, √2 into the first term only, his slip on every set.
 * - Divided the wrong way round solving for x (Q9): Finn, whose sign and fraction slips solving start here.
 * - Steps jumped (Q1, Q2, Q9): Grace simplifies in one jump a line; Ethan solves Q9 in one line.
 * Sam, Priya, Jordan, Zara, Mia, Noah, Lucas and Harper get everything right. Tomas stops after Q9, Grace
 * after Q8 (she started late), and Liam hands in Q1 and Q2 only; nobody is missing.
 *
 * Every student's category results equal the class story sheet's Set 1 row (`data/story.ts`), one step
 * from Set 2 at most; `data/finishedSets.test.ts` checks it.
 */

const solution = (n: number): string[] => PS1_PROBLEMS[n - 1].solution.map((s) => s.tex);

/* ---------- the class's workings on the problems they got wrong, one per distinct way ---------- */

/** Q1: a square factor taken out, but not the largest, and left there. */
const Q1_PART_WAY = ["\\sqrt{48} = \\sqrt{4 \\times 12}", "\\sqrt{4 \\times 12} = 2\\sqrt{12}"];
/** Q1: split into 8 × 6, and multiplied back into a root with a square factor still in it. */
const Q1_OTHER_ROUTE = ["\\sqrt{48} = \\sqrt{8 \\times 6}", "\\sqrt{8 \\times 6} = 2\\sqrt{2} \\times \\sqrt{6}", "2\\sqrt{2} \\times \\sqrt{6} = 2\\sqrt{12}"];
/** Q2: 25 taken out of the root as 25. */
const Q2_SQUARE_OUT = ["3\\sqrt{50} = 3 \\times 25\\sqrt{2}", "3\\sqrt{50} = 75\\sqrt{2}"];
/** Q3: the two roots added under one. */
const Q3_UNDER_ONE = ["\\sqrt{12} + \\sqrt{27} = \\sqrt{39}"];
/** Q4: each surd simplified, the subtraction collected as an addition. */
const Q4_SIGN_COLLECTING = [...solution(4).slice(0, 3), "6\\sqrt{2} - 2\\sqrt{2} = 8\\sqrt{2}"];
/** Q4: each surd simplified, the minus between them rewritten as a plus. */
const Q4_SIGN_REWRITING = [...solution(4).slice(0, 2), "2\\sqrt{18} - \\sqrt{8} = 6\\sqrt{2} + 2\\sqrt{2}", "6\\sqrt{2} + 2\\sqrt{2} = 8\\sqrt{2}"];
/** Q4: √8 as 4√2, the 4 not rooted. */
const Q4_SQUARE_OUT = [solution(4)[0], "\\sqrt{8} = 4\\sqrt{2}", "2\\sqrt{18} - \\sqrt{8} = 6\\sqrt{2} - 4\\sqrt{2}", "6\\sqrt{2} - 4\\sqrt{2} = 2\\sqrt{2}"];
/** Q5: √60 as 4√15, the 4 not rooted. */
const Q5_SQUARE_OUT = [...solution(5).slice(0, 2), "\\sqrt{4 \\times 15} = 4\\sqrt{15}"];
/** Q6: multiplied right, 10√18 left as the answer. */
const Q6_LEFT = [solution(6)[0], "2\\sqrt{3} \\times 5\\sqrt{6} = 10\\sqrt{18}"];
/** Q7: 6 ÷ 2 done, the √5 on the bottom dropped. */
const Q7_SURD_DROPPED = [solution(7)[0], "\\dfrac{6\\sqrt{10}}{2\\sqrt{5}} = 3\\sqrt{10}"];
/** Q7: the division written as a fraction upside down, then simplified faithfully. */
const Q7_UPSIDE_DOWN = ["6\\sqrt{10} \\div 2\\sqrt{5} = \\dfrac{2\\sqrt{5}}{6\\sqrt{10}}", "\\dfrac{2\\sqrt{5}}{6\\sqrt{10}} = \\dfrac{1}{3\\sqrt{2}}"];
/** Q8: √2 multiplied into the 3 and not the √8. */
const Q8_FIRST_TERM = ["\\sqrt{2}(3 + \\sqrt{8}) = \\sqrt{2} \\times 3 + \\sqrt{8}", "\\sqrt{2} \\times 3 + \\sqrt{8} = 3\\sqrt{2} + 2\\sqrt{2}", "3\\sqrt{2} + 2\\sqrt{2} = 5\\sqrt{2}"];
/** Q9: the surds right, then √3 divided by 3√3. */
const Q9_WRONG_WAY = [...solution(9).slice(0, 3), "x = \\dfrac{\\sqrt{3}}{3\\sqrt{3}}", "x = \\dfrac{1}{3}"];
/** Q10: the side right, the diagonal's root split over the sum. */
const Q10_SUM_SPLIT = [...solution(10).slice(0, 2), "d = \\sqrt{s^2 + s^2} = \\sqrt{72 + 72}", "\\sqrt{72 + 72} = \\sqrt{72} + \\sqrt{72} = 12\\sqrt{2}", "\\text{Side } 6\\sqrt{2}\\text{ cm, diagonal } 12\\sqrt{2}\\text{ cm}"];

/* ---------- right, but in one jump each: Grace on Q1 and Q2, Ethan on Q9 ---------- */
const Q1_JUMP = ["\\sqrt{48} = 4\\sqrt{3}"];
const Q2_JUMP = ["3\\sqrt{50} = 15\\sqrt{2}"];
const Q9_JUMP = ["x\\sqrt{3} = \\sqrt{75} - \\sqrt{12} \\Rightarrow x = 3"];

/** The problem ids, by number, so the records read like the set. */
const q = (n: number) => `ps1-q${n}`;

/**
 * Sam's Problem Set 1: confident and quick, and on the first set of the unit nothing slips. Every line written
 * out, all ten right.
 */
export const PS1_SAM: Classmate = {
  id: DEMO_STUDENT.id,
  name: DEMO_STUDENT.name,
  initials: DEMO_STUDENT.initials,
  confidence: "confident",
  done: 10,
  wrong: [],
  notes: [],
  attempts: {},
  groupStatus: "Group review done · explained Q3's like surds",
};

export const PS1_CLASSMATES: Classmate[] = [
  {
    id: "priya",
    name: "Priya Raman",
    initials: "PR",
    confidence: "confident",
    done: 10,
    wrong: [],
    notes: [],
    attempts: {},
    groupStatus: "Group review done · explained Q10's diagonal",
  },
  {
    id: "jordan",
    name: "Jordan Whitlock",
    initials: "JW",
    confidence: "confident",
    done: 10,
    wrong: [],
    notes: [],
    attempts: {},
    groupStatus: "Group review done · checked Q5 by squaring",
  },
  {
    id: "amelia",
    name: "Amelia Chen",
    initials: "AC",
    confidence: "low",
    done: 10,
    wrong: [q(3), q(7)],
    notes: [
      { text: "√12 + √27 collected before simplifying", problems: [q(3)] },
      { text: "cancelled the numbers but not the surds when dividing", problems: [q(7)] },
    ],
    attempts: { [q(3)]: Q3_UNDER_ONE, [q(7)]: Q7_SURD_DROPPED },
    clarification: "In Q3 I thought you could put the two roots together like you can when you multiply. In Q7 I divided the 6 by the 2 and forgot the root on the bottom was dividing too.",
    groupStatus: "Group review done · simplifying before collecting",
  },
  {
    id: "tomas",
    name: "Tomas Reyes",
    initials: "TR",
    confidence: "low: fractions",
    done: 9,
    wrong: [q(4), q(7)],
    notes: [
      { text: "a sign lost collecting 2√18 − √8", problems: [q(4)] },
      { text: "the fraction turned over dividing surds", problems: [q(7)] },
    ],
    attempts: { [q(4)]: Q4_SIGN_COLLECTING, [q(7)]: Q7_UPSIDE_DOWN },
    clarification: "I had 6√2 and 2√2 right and then added them. In Q7 I wrote the fraction the wrong way up, I always mix up which one goes on the bottom. I didn't get to Q10.",
    groupStatus: "Group review done · which number goes on the bottom",
  },
  {
    id: "zara",
    name: "Zara Haddad",
    initials: "ZH",
    confidence: "confident",
    done: 10,
    wrong: [],
    notes: [],
    attempts: {},
    groupStatus: "Group review done · Q9 with the surds simplified first",
  },
  {
    id: "liam",
    name: "Liam O'Connell",
    initials: "LO",
    confidence: "confident",
    done: 2,
    wrong: [q(2)],
    notes: [{ text: "√50 written as 25√2", problems: [q(2)] }],
    attempts: { [q(2)]: Q2_SQUARE_OUT },
    clarification: "I took the 25 out because it's the square one. I only did two because I didn't get started.",
    groupStatus: "Group review done · listening on Q2",
  },
  {
    id: "aiden",
    name: "Aiden Park",
    initials: "AP",
    confidence: "confident",
    done: 10,
    wrong: [q(8)],
    notes: [{ text: "√2 multiplied into the first term only", problems: [q(8)] }],
    attempts: { [q(8)]: Q8_FIRST_TERM },
    clarification: "I did √2 times 3 and then just copied the √8 across. I didn't multiply it by the √2.",
    groupStatus: "Group review done · Q8 term by term",
  },
  {
    id: "mia",
    name: "Mia Nguyen",
    initials: "MN",
    confidence: "confident",
    done: 10,
    wrong: [],
    notes: [],
    attempts: {},
    groupStatus: "Group review done · explained Q7",
  },
  {
    id: "noah",
    name: "Noah Fitzgerald",
    initials: "NF",
    confidence: "confident",
    done: 10,
    wrong: [],
    notes: [],
    attempts: {},
    groupStatus: "Group review done · checked Q6 another way",
  },
  {
    id: "chloe",
    name: "Chloe Abara",
    initials: "CA",
    confidence: "confident",
    done: 10,
    wrong: [q(1), q(5)],
    notes: [
      { text: "√48 simplified to 2√12 and left there", problems: [q(1)] },
      { text: "√60 taken as 4√15, the 4 not rooted", problems: [q(5)] },
    ],
    attempts: { [q(1)]: Q1_PART_WAY, [q(5)]: Q5_SQUARE_OUT },
    clarification: "In Q1 I found a 4 and stopped, I didn't look for a bigger square. In Q5 I did it in my head and brought the 4 out instead of 2.",
    groupStatus: "Group review done · the largest square factor",
  },
  {
    id: "ethan",
    name: "Ethan Kowalski",
    initials: "EK",
    confidence: "confident",
    done: 10,
    wrong: [],
    notes: [{ text: "steps jumped on the exact answer", problems: [q(9)] }],
    attempts: { [q(9)]: Q9_JUMP },
    clarification: "I could see x = 3 straight away so I just wrote it. I get that nobody can check it like that.",
    groupStatus: "Group review done · writing Q9 out in steps",
  },
  {
    id: "isla",
    name: "Isla Moretti",
    initials: "IM",
    confidence: "confident",
    done: 10,
    wrong: [q(4)],
    notes: [{ text: "a sign copied subtracting like surds", problems: [q(4)] }],
    attempts: { [q(4)]: Q4_SIGN_REWRITING },
    clarification: "I simplified both surds right and wrote a plus between them without looking back at the question.",
    groupStatus: "Group review done · reading Q4 back",
  },
  {
    id: "lucas",
    name: "Lucas Tanaka",
    initials: "LT",
    confidence: "low: surds",
    done: 10,
    wrong: [],
    notes: [],
    attempts: {},
    groupStatus: "Group review done · Q10, which length is which",
  },
  {
    id: "grace",
    name: "Grace Okoye",
    initials: "GO",
    confidence: "confident",
    done: 8,
    wrong: [],
    notes: [{ text: "simplified in one jump, the square factor not shown", problems: [q(1), q(2)] }],
    attempts: { [q(1)]: Q1_JUMP, [q(2)]: Q2_JUMP },
    clarification: "I know my squares so I did the first two in my head. I started late and didn't get to Q9 or Q10.",
    groupStatus: "Group review done · writing out Q2's square factor",
  },
  {
    id: "harper",
    name: "Harper Singh",
    initials: "HS",
    confidence: "confident",
    done: 10,
    wrong: [],
    notes: [],
    attempts: {},
    groupStatus: "Group review done · explained Q8",
  },
  {
    id: "oliver",
    name: "Oliver Brennan",
    initials: "OB",
    confidence: "low: surds",
    done: 10,
    wrong: [q(4), q(10)],
    notes: [
      { text: "√8 simplified as 4√2", problems: [q(4)] },
      { text: "√(72 + 72) split into √72 + √72", problems: [q(10)] },
    ],
    attempts: { [q(4)]: Q4_SQUARE_OUT, [q(10)]: Q10_SUM_SPLIT },
    clarification: "In Q4 I took the 4 out of √8 as a 4. In Q10 I thought the root of 72 + 72 was root 72 plus root 72, the same as I'd do with a bracket.",
    groupStatus: "Group review done · Q10, adding before the root",
  },
  {
    id: "ruby",
    name: "Ruby Castellanos",
    initials: "RC",
    confidence: "confident",
    done: 10,
    wrong: [q(1), q(6)],
    notes: [{ text: "a square factor left under the root", problems: [q(1), q(6)] }],
    attempts: { [q(1)]: Q1_OTHER_ROUTE, [q(6)]: Q6_LEFT },
    clarification: "I stopped as soon as the answer had a root in it. I didn't check if 12 or 18 had a square number in them.",
    groupStatus: "Group review done · checking for a square factor",
  },
  {
    id: "finn",
    name: "Finn Dlamini",
    initials: "FD",
    confidence: "confident",
    done: 10,
    wrong: [q(9)],
    notes: [{ text: "divided the wrong way round solving for x", problems: [q(9)] }],
    attempts: { [q(9)]: Q9_WRONG_WAY },
    clarification: "I had x√3 = 3√3 and put the √3 on top. I should have checked x = 1/3 in the equation.",
    groupStatus: "Group review done · Q9 by substituting back",
  },
  {
    id: "sofia",
    name: "Sofia Petrov",
    initials: "SP",
    confidence: "low: fractions",
    done: 10,
    wrong: [q(7)],
    notes: [{ text: "the fraction left upside down dividing surds", problems: [q(7)] }],
    attempts: { [q(7)]: Q7_UPSIDE_DOWN },
    clarification: "I wrote 2√5 on top because it came second and then did all the simplifying on the wrong fraction.",
    groupStatus: "Group review done · Q7, which way the division goes",
  },
];
