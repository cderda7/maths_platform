import type { ClassReviewPicks, GroupVersion, SetReview } from "../recordReview";
import { PS3_PROBLEMS } from "./assignment";

/**
 * What review made of Problem Set 3's problems (tickets 244, 281): the second submissions written in individual review
 * and each seating group's version of every problem it took on, which since ticket 278 is every problem a member did not
 * get right first time (a mistake, a problem left incomplete, one not attempted). Which problem ends where, and why, is
 * the class story sheet's review part for the set (`STORY_REVIEW` in `data/story.ts`, checked against
 * `lib/reviewRule.ts`): a one-off slip is rewritten right on the student's own (the model solution's working, line by
 * line); everything else is the group's, which solves it with the model working when a member at the table had it right
 * first time, and otherwise closes it unsolved on its own last try, still wrong.
 */

const solution = (k: number): string[] => PS3_PROBLEMS[k - 1].solution.map((s) => s.tex);
const q = (k: number) => `ps3-q${k}`;
/** The group's rework that checked: the model solution's working. */
const rework = (k: number): GroupVersion => ({ solved: true, lines: solution(k) });
/** The group's last try on a problem it closed unsolved: its own working, still wrong, never a member's first submission. */
const lastTry = (lines: readonly string[]): GroupVersion => ({ solved: false, lines });

/** Mint's last try on Q10: every term taken away inside a bracket and collected to 12x, then Isla's last line solving for x. */
const MINT_Q10: GroupVersion = lastTry(["(x + 3)^2 = x^2 + 6x + 9", "(x - 3)^2 = x^2 - 6x + 9", "(x^2 + 6x + 9) - (x^2 - 6x + 9)", "= x^2 + 6x + 9 - x^2 + 6x - 9", "= 12x", "\\text{so } x = 12"]);

export const PS3_REVIEW: SetReview = {
  second: {
    sam: { [q(8)]: solution(8) },
    jordan: { [q(6)]: solution(6) },
    amelia: { [q(7)]: solution(7), [q(10)]: solution(10) },
    zara: { [q(4)]: solution(4) },
    liam: { [q(2)]: solution(2) },
    aiden: { [q(3)]: solution(3) },
    mia: { [q(4)]: solution(4), [q(9)]: solution(9) },
    chloe: { [q(8)]: solution(8) },
    ethan: { [q(6)]: solution(6), [q(8)]: solution(8) },
    isla: { [q(1)]: solution(1), [q(7)]: solution(7), [q(10)]: solution(10) },
    lucas: { [q(8)]: solution(8), [q(10)]: solution(10) },
    harper: { [q(2)]: solution(2), [q(7)]: solution(7) },
    oliver: { [q(2)]: solution(2), [q(6)]: solution(6) },
    sofia: { [q(9)]: solution(9) },
  },
  groups: {
    coral: { [q(1)]: rework(1), [q(2)]: rework(2), [q(3)]: rework(3), [q(4)]: rework(4), [q(6)]: rework(6), [q(7)]: rework(7), [q(10)]: rework(10) },
    amber: { [q(2)]: rework(2), [q(4)]: rework(4), [q(6)]: rework(6), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
    mint: { [q(1)]: rework(1), [q(2)]: rework(2), [q(7)]: rework(7), [q(8)]: rework(8), [q(10)]: MINT_Q10 },
    sky: { [q(2)]: rework(2), [q(4)]: rework(4), [q(5)]: rework(5), [q(6)]: rework(6), [q(7)]: rework(7), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
    violet: { [q(2)]: rework(2), [q(5)]: rework(5), [q(6)]: rework(6), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
  },
};

/**
 * What class review covered (ticket 281): every problem a group left unsolved (mint's Q10), each
 * with one or two students whose real wrong first submission went on the board, unnamed: the class's most common slip on
 * it first, from a table that left it unsolved when one made it. `index.ts` reads their working off the records.
 */
export const PS3_CLASS_REVIEW_PICKS: ClassReviewPicks = { [q(10)]: ["isla", "lucas"] };
