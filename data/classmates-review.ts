import { ASSIGNMENT } from "./assignment";
import { RECOGNITION_REWORK } from "./recognition";
import type { ClassReviewPicks, GroupVersion, SetReview } from "./recordReview";

/**
 * What review made of the classmates' Problem Set 6 problems (tickets 244, 281): the second submissions written in
 * individual review and each seating group's version of every problem it took on (every problem a present member did not
 * get right first time, ticket 278; Chloe is away), in the shape of a finished set's `data/psetN/review.ts`. Which problem
 * ends where, and why, is the class story sheet's Set 6 review part (`STORY_REVIEW` in `data/story.ts`). On the live set a
 * classmate's outcome shows only once the class has reached that stage (`recordReviews`, `lib/report.ts`).
 *
 * Sky is the demo student's group, whose group review is scripted (`data/group-scripts.ts`): its versions are the
 * script's last attempts, the rework that checks on every problem of its board but Q7 and the last try that closes Q7
 * unsolved, so Jordan, Zara and Liam carry what Sam's own run shows (`data/story.test.ts` holds them equal). Its Q9 is
 * the set's one exception: nobody at the table had it right, Zara's first submission went wrong on one line, and the hint
 * after the group's second wrong check names exactly that slip.
 */

const solution = (id: string): string[] => ASSIGNMENT.problems.find((p) => p.id === id)!.solution.map((s) => s.tex);
/** The group's rework that checked: the model solution's working. */
const rework = (id: string): GroupVersion => ({ solved: true, lines: solution(id) });
/** The group's last try on a problem it closed unsolved: its own working, still wrong, never a member's first submission. */
const lastTry = (lines: readonly string[]): GroupVersion => ({ solved: false, lines });

/** Mint's last try on Q7: Isla's scaling of two terms, then Lucas's pair that adds to nine. */
const MINT_Q7: GroupVersion = lastTry(["x^2 + 6x + \\tfrac{8}{3}", "1 \\times 8 = 8,\\quad 1 + 8 = 9", "\\tfrac{1}{3}(x + 1)(x + 8)"]);
/** Mint's last try on Q10: the discriminant right, then Lucas's two real solutions and Isla's sentence that the graph crosses twice. */
const MINT_Q10: GroupVersion = lastTry(["b^2 - 4ac = 16 - 20 = -4", "\\Delta < 0 \\Rightarrow \\text{two real solutions}", "\\text{The graph crosses the x-axis twice}"]);
/** Violet's last try on Q7: Finn's tripling, never taken back out, then Ruby's pair that adds to nine. */
const VIOLET_Q7: GroupVersion = lastTry(["x^2 + 6x + 8", "1 \\times 8 = 8,\\quad 1 + 8 = 9", "\\tfrac{1}{3}(x + 1)(x + 8)"]);

export const SET6_REVIEW: SetReview = {
  second: {
    jordan: { q2: solution("q2"), q7: solution("q7") },
    amelia: { q6: solution("q6"), q7: solution("q7") },
    tomas: { q3: solution("q3") },
    zara: { q3: solution("q3"), q7: solution("q7"), q9: solution("q9") },
    aiden: { q7: solution("q7") },
    noah: { q3: solution("q3") },
    ethan: { q1: solution("q1"), q4: solution("q4"), q7: solution("q7"), q9: solution("q9") },
    isla: { q4: solution("q4"), q7: solution("q7") },
    lucas: { q7: solution("q7") },
    oliver: { q3: solution("q3"), q7: solution("q7") },
    ruby: { q5: solution("q5"), q7: solution("q7"), q9: solution("q9") },
    finn: { q5: solution("q5") },
  },
  groups: {
    coral: { q3: rework("q3"), q4: rework("q4"), q5: rework("q5"), q6: rework("q6"), q7: rework("q7"), q8: rework("q8"), q9: rework("q9"), q10: rework("q10") },
    amber: { q1: rework("q1"), q2: rework("q2"), q3: rework("q3"), q4: rework("q4"), q7: rework("q7"), q9: rework("q9"), q10: rework("q10") },
    mint: { q3: rework("q3"), q4: rework("q4"), q5: rework("q5"), q6: rework("q6"), q7: MINT_Q7, q8: rework("q8"), q9: rework("q9"), q10: MINT_Q10 },
    sky: {
      q1: { solved: true, lines: RECOGNITION_REWORK.q1 },
      q2: { solved: true, lines: RECOGNITION_REWORK.q2 },
      q3: { solved: true, lines: RECOGNITION_REWORK.q3 },
      q5: rework("q5"),
      q6: rework("q6"),
      q7: { solved: false, lines: ["\\tfrac{1}{3}(x^2 + 6x + 8)", "2 \\times 4 = 8,\\quad 2 + 4 = 6", "\\tfrac{1}{3}(x - 2)(x - 4)"] },
      q8: rework("q8"),
      q9: rework("q9"),
      q10: { solved: true, lines: RECOGNITION_REWORK.q10 },
    },
    violet: { q1: rework("q1"), q2: rework("q2"), q3: rework("q3"), q4: rework("q4"), q5: rework("q5"), q7: VIOLET_Q7, q8: rework("q8"), q9: rework("q9"), q10: rework("q10") },
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
