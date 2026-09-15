import type { ClassReviewPicks, GroupVersion, SetReview } from "../recordReview";
import { PS1_PROBLEMS } from "./assignment";

/**
 * What review made of Problem Set 1's problems (tickets 244, 281, 338): the second submissions written in individual review
 * and each seating group's version of every question it worked. Which problem ends where, and why, is
 * the class story sheet's review part for the set (`STORY_REVIEW` in `data/story.ts`, checked against
 * `lib/reviewRule.ts`): a one-off slip is rewritten on the student's own in individual review, and most rewrites are the
 * model solution's working, line by line. Since ticket 338 the group works only its union after individual review (ticket
 * 332, `lib/reviewUnion.ts`): the questions a present member still had wrong, left incomplete or did not attempt once
 * corrections were in, so a question every member had right after their corrections has no group version, and a group with
 * nothing left sat out. The group solves a question with the model working when a member at the table could explain it
 * (right first time, or fixed in individual review), and otherwise closes it unsolved on its own last try, still wrong.
 *
 * Amber (Mia, Noah, Chloe, Ethan) sat out: Chloe fixed both her slips (Q1, Q5) on her own and nobody else had anything
 * left. Oliver's Q10 rewrite slipped again (ticket 338): the diagonal right this time, the side left as 2√18, so nobody at
 * violet could explain Q10 and it stays the set's question nobody at a table could do.
 */

const solution = (k: number): string[] => PS1_PROBLEMS[k - 1].solution.map((s) => s.tex);
const q = (k: number) => `ps1-q${k}`;
/** The group's rework that checked: the model solution's working. */
const rework = (k: number): GroupVersion => ({ solved: true, lines: solution(k) });
/** The group's last try on a problem it closed unsolved: its own working, still wrong, never a member's first submission. */
const lastTry = (lines: readonly string[]): GroupVersion => ({ solved: false, lines });

/** Oliver's Q10 rewritten in individual review and wrong again (ticket 338): the diagonal found from 72 + 72 this time, the side's surd left with a square factor under the root. */
const OLIVER_Q10_AGAIN = ["s^2 = 72", "s = \\sqrt{72} = \\sqrt{4 \\times 18} = 2\\sqrt{18}", "d = \\sqrt{s^2 + s^2} = \\sqrt{72 + 72}", "d = \\sqrt{144} = 12", "\\text{Side } 2\\sqrt{18}\\text{ cm, diagonal } 12\\text{ cm}"];

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
    oliver: { [q(4)]: solution(4), [q(10)]: OLIVER_Q10_AGAIN },
  },
  groups: {
    coral: { [q(10)]: rework(10) },
    mint: { [q(9)]: rework(9), [q(10)]: rework(10) },
    sky: { [q(6)]: rework(6), [q(7)]: rework(7), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
    violet: { [q(1)]: rework(1), [q(6)]: rework(6), [q(7)]: rework(7), [q(9)]: rework(9), [q(10)]: VIOLET_Q10 },
  },
};

/**
 * What class review covered (ticket 281): every problem a group left unsolved (violet's Q10), each
 * with one or two students whose real wrong first submission went on the board, unnamed: the class's most common slip on
 * it first, from a table that left it unsolved when one made it. `index.ts` reads their working off the records.
 */
export const PS1_CLASS_REVIEW_PICKS: ClassReviewPicks = { [q(10)]: ["finn", "oliver"] };
