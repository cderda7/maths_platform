import type { GroupVersion, SetReview } from "../recordReview";
import { PS4_PROBLEMS } from "./assignment";

/**
 * What review made of Problem Set 4's problems (tickets 244, 281, 338): the second submissions written in individual review
 * and each seating group's version of every question it worked. Which problem ends where, and why, is
 * the class story sheet's review part for the set (`STORY_REVIEW` in `data/story.ts`, checked against
 * `lib/reviewRule.ts`): a one-off slip is rewritten on the student's own in individual review, and most rewrites are the
 * model solution's working, line by line. Since ticket 338 the group works only its union after individual review (ticket
 * 332, `lib/reviewUnion.ts`): the questions a present member still had wrong, left incomplete or did not attempt once
 * corrections were in, so a question every member had right after their corrections has no group version, and a group with
 * nothing left sat out. The group solves a question with the model working when a member at the table could explain it
 * (right first time, or fixed in individual review), and otherwise closes it unsolved on its own last try, still wrong.
 *
 * Lucas's Q10 rewrite slipped again (ticket 338), so nobody at mint could explain Q10 and it stays the set's question
 * nobody at a table could do.
 */

const solution = (k: number): string[] => PS4_PROBLEMS[k - 1].solution.map((s) => s.tex);
const q = (k: number) => `ps4-q${k}`;
/** The group's rework that checked: the model solution's working. */
const rework = (k: number): GroupVersion => ({ solved: true, lines: solution(k) });
/** The group's last try on a problem it closed unsolved: its own working, still wrong, never a member's first submission. */
const lastTry = (lines: readonly string[]): GroupVersion => ({ solved: false, lines });

/** Lucas's Q10 rewritten and wrong again (ticket 338): the width named right this time, and the negative solution kept beside it. */
const LUCAS_Q10_AGAIN = ["\\text{width } w,\\; \\text{length } 2w + 3", "w(2w + 3) = 35", "2w^2 + 3w - 35 = 0", "ac = -70,\\quad 10 + (-7) = 3", "(2w - 7)(w + 5) = 0", "w = \\tfrac{7}{2} \\;\\text{or}\\; w = -5", "\\text{length } 2(3.5) + 3 = 10,\\; 3.5 \\times 10 = 35", "\\text{The width is 3.5 cm or } -5 \\text{ cm}"];

/** Mint's last try on Q10: the working right to both widths and Lucas's check, then his sentence giving the length as the width. */
const MINT_Q10: GroupVersion = lastTry(["\\text{width } w,\\; \\text{length } 2w + 3", "w(2w + 3) = 35", "2w^2 + 3w - 35 = 0", "ac = -70,\\quad 10 + (-7) = 3", "(2w - 7)(w + 5) = 0", "w = \\tfrac{7}{2} \\;\\text{or}\\; w = -5", "\\text{length } 2(3.5) + 3 = 10,\\; 3.5 \\times 10 = 35", "\\text{The width is 10 cm}"]);

export const PS4_REVIEW: SetReview = {
  second: {
    sam: { [q(7)]: solution(7), [q(8)]: solution(8) },
    amelia: { [q(6)]: solution(6), [q(7)]: solution(7), [q(10)]: solution(10) },
    zara: { [q(7)]: solution(7) },
    aiden: { [q(8)]: solution(8) },
    mia: { [q(6)]: solution(6) },
    noah: { [q(6)]: solution(6) },
    chloe: { [q(2)]: solution(2), [q(5)]: solution(5), [q(7)]: solution(7) },
    ethan: { [q(2)]: solution(2), [q(4)]: solution(4), [q(5)]: solution(5), [q(7)]: solution(7), [q(9)]: solution(9) },
    isla: { [q(5)]: solution(5), [q(8)]: solution(8) },
    lucas: { [q(5)]: solution(5), [q(10)]: LUCAS_Q10_AGAIN },
    harper: { [q(9)]: solution(9) },
    oliver: { [q(5)]: solution(5) },
    ruby: { [q(9)]: solution(9) },
    finn: { [q(8)]: solution(8) },
  },
  groups: {
    coral: { [q(3)]: rework(3), [q(5)]: rework(5), [q(6)]: rework(6), [q(7)]: rework(7), [q(9)]: rework(9), [q(10)]: rework(10) },
    amber: { [q(1)]: rework(1), [q(4)]: rework(4) },
    mint: { [q(5)]: rework(5), [q(7)]: rework(7), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: MINT_Q10 },
    sky: { [q(1)]: rework(1), [q(2)]: rework(2), [q(3)]: rework(3), [q(4)]: rework(4), [q(5)]: rework(5), [q(6)]: rework(6), [q(7)]: rework(7), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
    violet: { [q(1)]: rework(1), [q(2)]: rework(2), [q(3)]: rework(3), [q(4)]: rework(4), [q(5)]: rework(5), [q(7)]: rework(7), [q(9)]: rework(9), [q(10)]: rework(10) },
  },
};
