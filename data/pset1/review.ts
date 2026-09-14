import type { ClassReviewPicks, GroupVersion, SetReview } from "../recordReview";
import { PS1_PROBLEMS } from "./assignment";

/**
 * What review made of Problem Set 1's problems (tickets 244, 281): the second submissions written in individual review
 * and each seating group's version of every problem it took on, which since ticket 278 is every problem a member did not
 * get right first time (a mistake, a problem left incomplete, one not attempted). Which problem ends where, and why, is
 * the class story sheet's review part for the set (`STORY_REVIEW` in `data/story.ts`, checked against
 * `lib/reviewRule.ts`): a one-off slip is rewritten right on the student's own (the model solution's working, line by
 * line); everything else is the group's, which solves it with the model working when a member at the table had it right
 * first time, and otherwise closes it unsolved on its own last try, still wrong.
 */

const solution = (k: number): string[] => PS1_PROBLEMS[k - 1].solution.map((s) => s.tex);
const q = (k: number) => `ps1-q${k}`;
/** The group's rework that checked: the model solution's working. */
const rework = (k: number): GroupVersion => ({ solved: true, lines: solution(k) });
/** The group's last try on a problem it closed unsolved: its own working, still wrong, never a member's first submission. */
const lastTry = (lines: readonly string[]): GroupVersion => ({ solved: false, lines });

/** Violet's last try on Q10: Finn and Sofia's division is set aside once the table agrees the diagonal is the longer side, and the group writes Oliver's root of a sum split. */
const VIOLET_Q10: GroupVersion = lastTry(["s = \\sqrt{72} = \\sqrt{36 \\times 2} = 6\\sqrt{2}", "d = \\sqrt{s^2 + s^2} = \\sqrt{72 + 72}", "\\sqrt{72 + 72} = \\sqrt{72} + \\sqrt{72} = 12\\sqrt{2}", "\\text{Side } 6\\sqrt{2}\\text{ cm, diagonal } 12\\sqrt{2}\\text{ cm}"]);

export const PS1_REVIEW: SetReview = {
  second: {
    amelia: { [q(3)]: solution(3), [q(7)]: solution(7) },
    tomas: { [q(4)]: solution(4), [q(7)]: solution(7) },
    liam: { [q(2)]: solution(2), [q(3)]: solution(3), [q(4)]: solution(4) },
    aiden: { [q(8)]: solution(8) },
    chloe: { [q(1)]: solution(1), [q(5)]: solution(5) },
    isla: { [q(4)]: solution(4) },
    oliver: { [q(4)]: solution(4), [q(10)]: solution(10) },
    sofia: { [q(7)]: solution(7), [q(10)]: solution(10) },
  },
  groups: {
    coral: { [q(3)]: rework(3), [q(4)]: rework(4), [q(7)]: rework(7), [q(8)]: rework(8), [q(10)]: rework(10) },
    amber: { [q(1)]: rework(1), [q(5)]: rework(5) },
    mint: { [q(4)]: rework(4), [q(9)]: rework(9), [q(10)]: rework(10) },
    sky: { [q(2)]: rework(2), [q(3)]: rework(3), [q(4)]: rework(4), [q(6)]: rework(6), [q(7)]: rework(7), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
    violet: { [q(1)]: rework(1), [q(4)]: rework(4), [q(6)]: rework(6), [q(7)]: rework(7), [q(9)]: rework(9), [q(10)]: VIOLET_Q10 },
  },
};

/**
 * What class review covered (ticket 281): every problem a group left unsolved (violet's Q10), each
 * with one or two students whose real wrong first submission went on the board, unnamed: the class's most common slip on
 * it first, from a table that left it unsolved when one made it. `index.ts` reads their working off the records.
 */
export const PS1_CLASS_REVIEW_PICKS: ClassReviewPicks = { [q(10)]: ["finn", "oliver"] };
