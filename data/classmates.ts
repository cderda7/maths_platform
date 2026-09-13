/**
 * Static classmates so the demo student's live row sits in a believable class of twenty. Their
 * skill statuses are derived from the same evidence path as the demo student's: the scripted
 * attempt where they slipped, the model solution where they got a problem right, nothing where
 * they never reached it (`done` problems, in assignment order). Six are authored in full; the
 * other thirteen are lightweight (a name, a confidence answer, how far they got, a wrong list)
 * and borrow the known slip for each wrong problem from `SLIPS`, so every line of theirs is
 * still one the evaluator can follow. Three of the full six (`GROUPMATE_IDS`) are the demo
 * student's group, with wrong sets chosen so the all-correct intersection and the union of
 * wrongs are both non-empty and different.
 *
 * The shape of the wrongs (ticket 130; Jordan's Q7 since ticket 189): 46 wrong student-problem entries. Q7 has thirteen
 * classmates wrong across three strategies (six cleared the fraction from two terms, four
 * multiplied through and lost the third, three took the third out and then the wrong pair);
 * Q6 has Amelia alone; nobody slips on Q8. Q1 and Q4 each hold two different slips under one
 * skill; Q2, Q3, Q9 and Q10 each hold two slips under different skills. Priya (all right),
 * Chloe (nothing handed in) and Grace (right, steps skipped) are untouched. Every slip has a
 * teacher note, and the student's clarification covers it.
 */
export interface Classmate {
  id: string;
  name: string;
  initials: string;
  confidence: "confident" | "low" | `low: ${string}`;
  /** Problems finished, in assignment order, out of ten. */
  done: number;
  /** Problem ids this classmate got wrong. */
  wrong: string[];
  /** The platform's commentary for the teacher: each idea tied to the problems it is about (clicking one lights only those skills). */
  notes: { text: string; problems: string[] }[];
  /** What the student wrote back about that commentary, in their own words; absent until they send it. */
  clarification?: string;
  /** Their recognised working on the problems they got wrong, for the teacher's mistake view. */
  attempts: Record<string, string[]>;
  /** One line for the teacher's "during review groups" view. Static; the demo student's is live. */
  groupStatus: string;
}

const Q2_GUESSED = ["2x^2 + 7x - 4 = 0", "(2x + 4)(x - 1) = 0", "x = -2 \\;\\text{or}\\; x = 1"];
const Q3_NFL = ["(x - 3)(x + 2) = 6", "x - 3 = 6 \\;\\text{or}\\; x + 2 = 6", "x = 9 \\;\\text{or}\\; x = 4"];
const Q4_OVER_A = ["a = 3,\\; b = -5,\\; c = -1", "b^2 - 4ac = 25 + 12 = 37", "x = \\dfrac{5 \\pm \\sqrt{37}}{3}"];
const Q5_SIGNS = ["(x - 5)(x + 1) = 0", "x = -5 \\;\\text{or}\\; x = 1", "x = \\tfrac{-5 + 1}{2} = -2"];
const Q6_TWICE = ["b^2 - 4ac = 36 - 4k", "36 - 4k > 0", "k < 9"];
const Q7_TWO_TERMS = ["x^2 + 6x + \\tfrac{8}{3}", "2 \\times 4 = 8,\\quad 2 + 4 = 6", "(x + 2)(x + 4)"];
const Q8_MIRROR = ["x = -1 \\;\\text{or}\\; x = -3"];
const Q9_HEIGHT = ["-x(x - 6) = 0", "x = 0 \\;\\text{or}\\; x = 6", "x = 3", "h = 6"];
const Q10_TWICE = ["b^2 - 4ac = 16 - 20 = -4", "\\Delta < 0 \\Rightarrow \\text{no real solutions}", "\\text{The graph crosses the x-axis twice}"];
/** Q5 with the turning point's height read off the wrong line, and Q9 rushed: the axis given as the height, a step skipped on the way. */
const Q5_HEIGHT = ["(x - 5)(x + 1) = 0", "x = 5 \\;\\text{or}\\; x = -1", "x = \\tfrac{5 + (-1)}{2} = 2", "(2, -5)"];
const Q9_RUSHED = ["-x(x - 6) = 0", "\\text{turning point at } x = 3", "h = 6"];
/** Right, but in one jump each: what a student who skips steps hands in. */
const Q1_JUMP = ["x^2 - 5x + 6 = 0", "x = 2, 3"];
const Q2_JUMP = ["2x^2 + 7x - 4 = (2x - 1)(x + 4)", "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4"];
const Q3_JUMP = ["x^2 - x - 12 = 0 \\Rightarrow x = 4, -3"];
const Q1_SIGNS = ["x^2 - 5x + 6 = 0", "(x + 2)(x + 3) = 0", "x = -2 \\;\\text{or}\\; x = -3"];
/**
 * The second way to go wrong on each of Q1, Q2, Q3, Q4, Q7 and Q9, and Q10's slip one line earlier (ticket 130):
 * a pair that multiplies to 6 but adds to 7; the right factors and a sign lost solving one; a sign lost in the
 * expansion; −b written as −5; the third taken out and then the wrong pair; −x taken out of −x² + 6x with the
 * sign left behind; a negative discriminant read as two solutions with the sentence following from it.
 */
const Q1_PAIR = ["x^2 - 5x + 6 = 0", "(x - 1)(x - 6) = 0", "x = 1 \\;\\text{or}\\; x = 6"];
const Q2_SIGN = ["2x^2 + 7x - 4 = 0", "ac = -8,\\quad 8 + (-1) = 7", "(2x - 1)(x + 4) = 0", "x = -\\tfrac{1}{2} \\;\\text{or}\\; x = -4"];
const Q3_EXPAND = ["(x - 3)(x + 2) = 6", "x^2 + x - 6 = 6", "x^2 + x - 12 = 0", "(x + 4)(x - 3) = 0", "x = -4 \\;\\text{or}\\; x = 3"];
const Q4_B_SIGN = ["a = 3,\\; b = -5,\\; c = -1", "b^2 - 4ac = 25 + 12 = 37", "x = \\dfrac{-5 \\pm \\sqrt{37}}{6}"];
export const Q7_LOST_THIRD = ["x^2 + 6x + 8", "2 \\times 4 = 8,\\quad 2 + 4 = 6", "(x + 2)(x + 4)"];
const Q7_PAIR = ["\\tfrac{1}{3}(x^2 + 6x + 8)", "1 \\times 8 = 8,\\quad 1 + 8 = 9", "\\tfrac{1}{3}(x + 1)(x + 8)"];
const Q9_SIGN = ["-x(x + 6) = 0", "x = 0 \\;\\text{or}\\; x = -6", "x = -3", "h = 9"];
const Q10_FORMAL = ["b^2 - 4ac = 16 - 20 = -4", "\\Delta < 0 \\Rightarrow \\text{two real solutions}", "\\text{So the graph crosses the x-axis at two points}"];

/** One known slip per problem, every line in the evaluation table: what a lightweight classmate wrote when they got it wrong. */
export const SLIPS: Record<string, string[]> = { q1: Q1_SIGNS, q2: Q2_GUESSED, q3: Q3_NFL, q4: Q4_OVER_A, q5: Q5_SIGNS, q6: Q6_TWICE, q7: Q7_TWO_TERMS, q8: Q8_MIRROR, q9: Q9_HEIGHT, q10: Q10_TWICE };

/** A lightweight classmate: the slip for each wrong problem comes from `SLIPS` unless overridden; one teacher note per slip. */
function light(id: string, name: string, initials: string, confidence: Classmate["confidence"], done: number, wrong: string[], notes: { text: string; problems: string[] }[] = [], attempts: Record<string, string[]> = {}, clarification?: string, groupStatus = "Quick pass done"): Classmate {
  return { id, name, initials, confidence, done, wrong, notes, attempts: { ...Object.fromEntries(wrong.map((pid) => [pid, SLIPS[pid]])), ...attempts }, clarification, groupStatus };
}

export const CLASSMATES: Classmate[] = [
  { id: "priya", name: "Priya Raman", initials: "PR", confidence: "confident", done: 10, wrong: [], notes: [], attempts: {}, groupStatus: "Quick pass done · nothing to discuss" },
  // Ticket 189: low on non-monic factorising, answers Q1–Q7 in the live stream and stalls on Q8 (never hands in on his own); Q4–Q6 right (the model solution), Q7 the same unchecked pair as Q2.
  { id: "jordan", name: "Jordan Whitlock", initials: "JW", confidence: "low: non-monic factorising", done: 7, wrong: ["q2", "q7"], notes: [{ text: "non-monic factors not checked by expanding", problems: ["q2"] }, { text: "a pair that multiplies to 8 but adds to 9, not checked either", problems: ["q7"] }], attempts: { q2: Q2_GUESSED, q7: Q7_PAIR }, clarification: "I had the factor pair from the constant and didn't check the middle term. In Q7 I did the same thing: 1 and 8 multiply to 8 so I wrote them down. I'll expand back next time before I write the roots.", groupStatus: "Discussing Q2 · expanding back" },
  { id: "amelia", name: "Amelia Chen", initials: "AC", confidence: "low", done: 10, wrong: ["q6", "q7", "q10"], notes: [{ text: "read “touches once” as discriminant > 0", problems: ["q6"] }, { text: "multiplied through by 3 and never took it back out", problems: ["q7"] }, { text: "said the graph crosses twice", problems: ["q10"] }], attempts: { q6: Q6_TWICE, q7: Q7_LOST_THIRD, q10: Q10_TWICE }, clarification: "I mixed up which sign of the discriminant means one solution. I think I was picturing the graph the wrong way round. In Q7 I cleared the fractions and forgot the third had to come back at the end.", groupStatus: "Quick pass done · comparing Q4 methods" },
  { id: "tomas", name: "Tomas Reyes", initials: "TR", confidence: "low: fractions", done: 7, wrong: ["q3", "q4", "q5", "q7"], notes: [{ text: "null factor law on a product that isn’t 0", problems: ["q3"] }, { text: "divided by a, not 2a", problems: ["q4"] }, { text: "roots read off the factors with the signs flipped", problems: ["q5"] }, { text: "scaled two of three terms", problems: ["q7"] }], attempts: { q3: Q3_NFL, q4: Q4_OVER_A, q5: Q5_SIGNS, q7: Q7_TWO_TERMS }, clarification: "The formula I remembered had a on the bottom, not 2a. In Q7 I thought I only had to scale the terms with x.", groupStatus: "Discussing Q4 · the 2a" },
  { id: "zara", name: "Zara Haddad", initials: "ZH", confidence: "confident", done: 10, wrong: ["q3", "q7", "q9"], notes: [{ text: "null factor law on a product that isn’t 0", problems: ["q3"] }, { text: "multiplied through by 3 and never took it back out", problems: ["q7"] }, { text: "axis given as the height", problems: ["q9"] }], attempts: { q3: Q3_NFL, q7: Q7_LOST_THIRD, q9: Q9_HEIGHT }, clarification: "I set each bracket equal to 6 because that's what was on the other side. In Q7 I multiplied by 3 to get rid of the fractions and then factorised that. And in Q9 I wrote the axis down and thought that was the height.", groupStatus: "Discussing Q3 · when the null factor law applies" },
  { id: "liam", name: "Liam O'Connell", initials: "LO", confidence: "confident", done: 2, wrong: ["q1", "q2", "q3"], notes: [{ text: "guessed a factor pair without expanding back", problems: ["q1", "q2", "q3"] }], attempts: { q1: Q1_PAIR, q2: Q2_GUESSED, q3: Q3_NFL }, clarification: "I ran out of time so I guessed the brackets. I know expanding back would have shown me.", groupStatus: "Discussing Q2 · listening" },
  // The lightweight thirteen (ticket 36). A full version of each is a candidate for a later run; see FUTURE_FEATURES.
  light("aiden", "Aiden Park", "AP", "confident", 10, ["q7"], [{ text: "scaled two of three terms", problems: ["q7"] }], {}, "I divided the x terms by 3 and forgot the constant was part of it too."),
  light("mia", "Mia Nguyen", "MN", "low: fractions, non-monic factorising", 10, ["q2", "q7", "q9"], [{ text: "guessed a factor pair, never expanded back", problems: ["q2"] }, { text: "the third off by a third", problems: ["q7"] }, { text: "took −x out and left the sign behind", problems: ["q9"] }], { q9: Q9_SIGN }, "I keep guessing the brackets instead of checking. With the fractions I lost track of which terms I had scaled. In Q9 I took the x out and didn't notice the sign inside the bracket had to change."),
  light("noah", "Noah Fitzgerald", "NF", "confident", 9, ["q3"], [{ text: "null factor law on a product that isn't 0", problems: ["q3"] }], {}, "I didn't move the 6 across first. I treated it like it was already equal to zero."),
  // Nothing handed in: the class view shows her row as missing (ticket 46).
  light("chloe", "Chloe Abara", "CA", "confident", 0, [], [], {}, undefined, "Nothing submitted"),
  light("ethan", "Ethan Kowalski", "EK", "confident", 8, ["q1", "q4", "q7", "q9"], [{ text: "signs flipped in the factors", problems: ["q1"] }, { text: "divided by a, not 2a", problems: ["q4"] }, { text: "multiplied through by 3 and never took it back out", problems: ["q7"] }, { text: "axis given as the height, a step skipped", problems: ["q9"] }], { q7: Q7_LOST_THIRD, q9: Q9_RUSHED }, "I was rushing on Q9 and went straight to the height. On Q4 I always forget the 2 under the line. In Q7 I got rid of the fractions and never put the third back."),
  light("isla", "Isla Moretti", "IM", "confident", 10, ["q4", "q7", "q10"], [{ text: "−b written as −5", problems: ["q4"] }, { text: "scaled two of three terms", problems: ["q7"] }, { text: "said the graph crosses twice", problems: ["q10"] }], { q4: Q4_B_SIGN }, "I worked out there were no real solutions and then wrote the opposite in the sentence. I didn't read my own answer back. In Q4 I copied b straight into the formula, and in Q7 I only tripled the terms with x in them."),
  light("lucas", "Lucas Tanaka", "LT", "confident", 10, ["q7", "q10"], [{ text: "a pair that multiplies to 8 but adds to 9", problems: ["q7"] }, { text: "negative discriminant, two solutions", problems: ["q10"] }], { q7: Q7_PAIR, q10: Q10_FORMAL }, "I think I have the discriminant signs backwards. A negative one felt like it should mean more solutions, not none. In Q7 I found a pair that multiplied to 8 and stopped checking."),
  light("grace", "Grace Okoye", "GO", "confident", 4, [], [{ text: "right every time, but jumps steps a reader can't follow", problems: ["q1", "q2", "q3"] }], { q1: Q1_JUMP, q2: Q2_JUMP, q3: Q3_JUMP }, "I can see the answer so I write it. I didn't realise the working was the part being marked."),
  light("harper", "Harper Singh", "HS", "confident", 6, ["q3", "q5", "q9"], [{ text: "a sign lost in the expansion", problems: ["q3"] }, { text: "turning point's height from the wrong line", problems: ["q5"] }, { text: "axis given as the height, jumped straight to it", problems: ["q9"] }], { q3: Q3_EXPAND, q5: Q5_HEIGHT, q9: Q9_RUSHED }, "In Q3 I expanded and got +x in the middle; I didn't check it. I substituted into the factorised line instead of the original. On Q9 I thought x = 3 was the answer."),
  light("oliver", "Oliver Brennan", "OB", "low: factorising", 7, ["q1", "q2", "q3", "q7"], [{ text: "guesses factor pairs without expanding back", problems: ["q1", "q2"] }, { text: "null factor law on a product that isn't 0", problems: ["q3"] }, { text: "scaled two of three terms", problems: ["q7"] }], { q1: Q1_PAIR }, "Factorising is the bit I'm not sure of, so I guess and hope. I didn't know the null factor law only works for zero. In Q7 I multiplied the x terms by 3 and left the 8 over 3 as it was."),
  light("ruby", "Ruby Castellanos", "RC", "confident", 10, ["q5", "q7", "q9"], [{ text: "turning point's height from the wrong line", problems: ["q5"] }, { text: "a pair that multiplies to 8 but adds to 9", problems: ["q7"] }, { text: "axis given as the height", problems: ["q9"] }], { q5: Q5_HEIGHT, q7: Q7_PAIR }, "I found the axis of symmetry and then read the height off the wrong line both times. In Q7 I took 1 and 8 because they multiply to 8 and didn't add them."),
  light("finn", "Finn Dlamini", "FD", "confident", 10, ["q2", "q4", "q5", "q7"], [{ text: "sign lost solving 2x − 1 = 0", problems: ["q2"] }, { text: "divided by a, not 2a", problems: ["q4"] }, { text: "turning point's height from the wrong line", problems: ["q5"] }, { text: "multiplied through by 3 and never took it back out", problems: ["q7"] }], { q2: Q2_SIGN, q5: Q5_HEIGHT, q7: Q7_LOST_THIRD }, "For the formula I divided by a. For the turning point I substituted into the wrong equation. In Q2 my brackets were right and I still wrote the root with the wrong sign, and in Q7 I tripled everything and forgot to divide back."),
  light("sofia", "Sofia Petrov", "SP", "confident", 10, ["q2", "q4", "q7"], [{ text: "guessed a factor pair", problems: ["q2"] }, { text: "denominator a, not 2a", problems: ["q4"] }, { text: "scaled two of three terms", problems: ["q7"] }], {}, "The fractions in Q4 threw me and I lost the 2, and in Q7 I only cleared the ones in front of x. In Q2 I guessed the pair and moved on."),
];

export const CLASSMATE_MAP = Object.fromEntries(CLASSMATES.map((c) => [c.id, c])) as Record<string, Classmate>;

/** The demo student's mock review group (ticket 08). */
export const GROUPMATE_IDS = ["jordan", "zara", "liam"];

/** The other platform-suggested review groups (ticket 14), static, kept for reporting beside the teacher's seating groups. */
export const OTHER_GROUPS: string[][] = [
  ["priya", "amelia", "tomas"],
  ["aiden", "mia", "sofia", "oliver"],
  ["noah", "chloe", "ethan", "finn"],
  ["isla", "lucas", "grace", "harper", "ruby"],
];

/** Q8's mirrored read, kept for the evaluation table (no classmate makes it in the fixture). */
export const Q8_MIRROR_LINES = Q8_MIRROR;
