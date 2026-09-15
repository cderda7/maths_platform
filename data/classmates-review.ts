import { ASSIGNMENT } from "./assignment";
import { RECOGNITION_REWORK } from "./recognition";
import type { ClassReviewPicks, GroupVersion, SetReview } from "./recordReview";

/**
 * What review made of the classmates' Problem Set 6 problems (tickets 244, 281, 332): the second submissions written in
 * individual review and each seating group's version of every question it worked, in the shape of a finished set's
 * `data/psetN/review.ts`. Since ticket 332 a group works only its union after individual review: the questions a present
 * member still had wrong, left incomplete or did not attempt once corrections were in (`lib/reviewUnion.ts`; Chloe is away).
 * A question every member had right after their corrections has no group version. Which problem ends where, and why, is the
 * class story sheet's Set 6 review part (`STORY_REVIEW` in `data/story.ts`). On the live set a classmate's outcome shows only
 * once the class has reached that stage (`recordReviews`, `lib/report.ts`).
 *
 * The second submissions: every one-off slip is rewritten (ticket 281). Most hold. Seven do not (ticket 332, for the demo
 * outcomes Carson asked for): Q7, the class's hardest fraction question, slipped again a different way for Jordan and Zara
 * (sky), Isla and Lucas (mint), and Oliver and Ruby (violet), as Sam's own rework of it does; and Zara gave the axis as
 * the height again on Q9. So nobody at sky, mint or violet can explain Q7, and nobody at sky can explain Q9.
 *
 * Every group's versions are its simulated board's last tries (`SIMULATED_BOARDS` and, for sky, the demo student's
 * scripted board, `GROUP_SCRIPTS`, both in `data/group-scripts.ts`): the rework that checks, or the last try on a question
 * closed unsolved (`data/story.test.ts` holds them equal). Sky's Q9 is the set's one exception: nobody at the table could
 * explain it, Zara's first submission went wrong on one line, the hint after the group's second wrong check names exactly
 * that slip, and the group, having left it for now, gets it on its return.
 */

const solution = (id: string): string[] => ASSIGNMENT.problems.find((p) => p.id === id)!.solution.map((s) => s.tex);
/** The group's rework that checked: the model solution's working. */
const rework = (id: string): GroupVersion => ({ solved: true, lines: solution(id) });
/** The group's last try on a problem it closed unsolved: its own working, still wrong, never a member's first submission. */
const lastTry = (lines: readonly string[]): GroupVersion => ({ solved: false, lines });

/** Mint's last try on Q7: Isla's scaling of two terms, then Lucas's pair that adds to nine. */
export const MINT_Q7_LAST = ["x^2 + 6x + \\tfrac{8}{3}", "1 \\times 8 = 8,\\quad 1 + 8 = 9", "\\tfrac{1}{3}(x + 1)(x + 8)"];
/** Mint's last try on Q10: the discriminant right, then Lucas's two real solutions and Isla's sentence that the graph crosses twice. */
export const MINT_Q10_LAST = ["b^2 - 4ac = 16 - 20 = -4", "\\Delta < 0 \\Rightarrow \\text{two real solutions}", "\\text{The graph crosses the x-axis twice}"];
/** Violet's last try on Q7: Finn's tripling, never taken back out, then Ruby's pair that adds to nine. */
export const VIOLET_Q7_LAST = ["x^2 + 6x + 8", "1 \\times 8 = 8,\\quad 1 + 8 = 9", "\\tfrac{1}{3}(x + 1)(x + 8)"];
/** Sky's last try on Q7 (the demo student's scripted return): the third taken out and the pair right, the brackets' signs flipped. */
export const SKY_Q7_LAST = ["\\tfrac{1}{3}(x^2 + 6x + 8)", "2 \\times 4 = 8,\\quad 2 + 4 = 6", "\\tfrac{1}{3}(x - 2)(x - 4)"];

/** Q7 rewritten in individual review and wrong again (ticket 332): tripled throughout and the third never put back. */
const Q7_AGAIN_LOST_THIRD = ["x^2 + 6x + 8", "2 \\times 4 = 8,\\quad 2 + 4 = 6", "(x + 2)(x + 4)"];
/** Q7 rewritten and wrong again: the third taken out properly, then a pair that multiplies to 8 but adds to 9. */
const Q7_AGAIN_PAIR = ["\\tfrac{1}{3}(x^2 + 6x + 8)", "1 \\times 8 = 8,\\quad 1 + 8 = 9", "\\tfrac{1}{3}(x + 1)(x + 8)"];
/** Q7 rewritten and wrong again: only the terms with x scaled. */
const Q7_AGAIN_TWO_TERMS = ["x^2 + 6x + \\tfrac{8}{3}", "2 \\times 4 = 8,\\quad 2 + 4 = 6", "(x + 2)(x + 4)"];
/** Zara's Q9 rewritten (ticket 332): her working again, the height still read off the axis. */
const Q9_AGAIN_AXIS = ["-x(x - 6) = 0", "x = 0 \\;\\text{or}\\; x = 6", "\\text{turning point at } x = 3", "h = 6"];

export const SET6_REVIEW: SetReview = {
  second: {
    jordan: { q2: solution("q2"), q7: Q7_AGAIN_LOST_THIRD },
    amelia: { q6: solution("q6"), q7: solution("q7") },
    tomas: { q3: solution("q3") },
    zara: { q3: solution("q3"), q7: Q7_AGAIN_PAIR, q9: Q9_AGAIN_AXIS },
    aiden: { q7: solution("q7") },
    noah: { q3: solution("q3") },
    ethan: { q1: solution("q1"), q4: solution("q4"), q7: solution("q7"), q9: solution("q9") },
    isla: { q4: solution("q4"), q7: Q7_AGAIN_PAIR },
    lucas: { q7: Q7_AGAIN_TWO_TERMS },
    oliver: { q3: solution("q3"), q7: Q7_AGAIN_PAIR },
    ruby: { q5: solution("q5"), q7: Q7_AGAIN_LOST_THIRD, q9: solution("q9") },
    finn: { q5: solution("q5") },
  },
  groups: {
    coral: { q4: rework("q4"), q5: rework("q5"), q7: rework("q7"), q8: rework("q8"), q9: rework("q9"), q10: rework("q10") },
    amber: { q2: rework("q2"), q7: rework("q7"), q9: rework("q9"), q10: rework("q10") },
    mint: { q3: rework("q3"), q5: rework("q5"), q6: rework("q6"), q7: lastTry(MINT_Q7_LAST), q8: rework("q8"), q9: rework("q9"), q10: lastTry(MINT_Q10_LAST) },
    sky: {
      q1: { solved: true, lines: RECOGNITION_REWORK.q1 },
      q2: { solved: true, lines: RECOGNITION_REWORK.q2 },
      q3: { solved: true, lines: RECOGNITION_REWORK.q3 },
      q5: rework("q5"),
      q6: rework("q6"),
      q7: lastTry(SKY_Q7_LAST),
      q8: rework("q8"),
      q9: rework("q9"),
      q10: { solved: true, lines: RECOGNITION_REWORK.q10 },
    },
    violet: { q1: rework("q1"), q2: rework("q2"), q4: rework("q4"), q7: lastTry(VIOLET_Q7_LAST), q8: rework("q8"), q9: rework("q9"), q10: rework("q10") },
  },
  exception: { colour: "sky", problem: "q9", member: "zara" },
};

/**
 * What class review covered among the classmates (ticket 281): every problem a group left unsolved (Q7 at mint, sky and
 * violet; Q10 at mint), each with the students whose real wrong first submission went on the board, unnamed: the class's
 * most common slip on it first, from a table that left it unsolved. `data/classmates.ts` reads their working off the
 * records. On the live lesson, what the teacher actually projects is the classroom's own (ticket 282 reads both).
 */
export const SET6_CLASS_REVIEW_PICKS: ClassReviewPicks = { q7: ["isla", "zara"], q10: ["isla", "lucas"] };
