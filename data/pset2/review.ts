import type { GroupVersion, SetReview } from "../recordReview";
import { PS2_PROBLEMS } from "./assignment";

/**
 * What review made of Problem Set 2's problems (tickets 244, 281, 338): the second submissions written in individual review
 * and each seating group's version of every question it worked. Which problem ends where, and why, is
 * the class story sheet's review part for the set (`STORY_REVIEW` in `data/story.ts`, checked against
 * `lib/reviewRule.ts`): a one-off slip is rewritten on the student's own in individual review, and most rewrites are the
 * model solution's working, line by line. Since ticket 338 the group works only its union after individual review (ticket
 * 332, `lib/reviewUnion.ts`): the questions a present member still had wrong, left incomplete or did not attempt once
 * corrections were in, so a question every member had right after their corrections has no group version, and a group with
 * nothing left sat out. The group solves a question with the model working when a member at the table could explain it
 * (right first time, or fixed in individual review), and otherwise closes it unsolved on its own last try, still wrong.
 *
 * Amber (Mia, Noah, Chloe, Ethan) sat out: every slip at the table was a one-off its writer fixed. Isla's and Lucas's Q10
 * rewrites slipped again (ticket 338), so nobody at mint could explain Q10 and it stays the set's question nobody at a
 * table could do.
 */

const solution = (k: number): string[] => PS2_PROBLEMS[k - 1].solution.map((s) => s.tex);
const q = (k: number) => `ps2-q${k}`;
/** The group's rework that checked: the model solution's working. */
const rework = (k: number): GroupVersion => ({ solved: true, lines: solution(k) });
/** The group's last try on a problem it closed unsolved: its own working, still wrong, never a member's first submission. */
const lastTry = (lines: readonly string[]): GroupVersion => ({ solved: false, lines });

/** Isla's Q10 rewritten and wrong again (ticket 338): the working right to √22, the first square written out, and a sentence that answers only the area. */
const ISLA_Q10_AGAIN = ["A = (3 + \\sqrt{2})(3 - \\sqrt{2}) = 9 - 2 = 7", "(3 + \\sqrt{2})^2 = 9 + 6\\sqrt{2} + 2", "d^2 = (3 + \\sqrt{2})^2 + (3 - \\sqrt{2})^2", "d^2 = (11 + 6\\sqrt{2}) + (11 - 6\\sqrt{2}) = 22", "d = \\sqrt{22}", "\\text{Area } 7 \\text{ cm}^2"];
/** Lucas's Q10 rewritten and wrong again (ticket 338): both squares written out this time, the second one's middle term not doubled. */
const LUCAS_Q10_AGAIN = ["A = (3 + \\sqrt{2})(3 - \\sqrt{2}) = 9 - 2 = 7", "d^2 = (3 + \\sqrt{2})^2 + (3 - \\sqrt{2})^2", "(3 + \\sqrt{2})^2 = 9 + 6\\sqrt{2} + 2", "(3 - \\sqrt{2})^2 = 9 - 3\\sqrt{2} + 2", "d^2 = (11 + 6\\sqrt{2}) + (11 - 3\\sqrt{2}) = 22 + 3\\sqrt{2}", "d = \\sqrt{22 + 3\\sqrt{2}}", "\\text{Area } 7 \\text{ cm}^2 \\text{, diagonal } \\sqrt{22 + 3\\sqrt{2}} \\text{ cm}"];

/** Mint's last try on Q10: Harper's first square, written out, and the rest right to √22, then Isla's sentence with the area and the diagonal swapped. */
const MINT_Q10: GroupVersion = lastTry(["A = (3 + \\sqrt{2})(3 - \\sqrt{2}) = 9 - 2 = 7", "(3 + \\sqrt{2})^2 = 9 + 6\\sqrt{2} + 2", "d^2 = (11 + 6\\sqrt{2}) + (11 - 6\\sqrt{2}) = 22", "d = \\sqrt{22}", "\\text{Area } \\sqrt{22} \\text{ cm}^2 \\text{, diagonal } 7 \\text{ cm}"]);

export const PS2_REVIEW: SetReview = {
  second: {
    sam: { [q(2)]: solution(2), [q(7)]: solution(7) },
    jordan: { [q(2)]: solution(2) },
    amelia: { [q(9)]: solution(9), [q(10)]: solution(10) },
    tomas: { [q(7)]: solution(7) },
    zara: { [q(3)]: solution(3), [q(9)]: solution(9) },
    liam: { [q(2)]: solution(2) },
    aiden: { [q(1)]: solution(1) },
    mia: { [q(9)]: solution(9) },
    noah: { [q(3)]: solution(3) },
    chloe: { [q(8)]: solution(8), [q(9)]: solution(9) },
    ethan: { [q(8)]: solution(8) },
    isla: { [q(2)]: solution(2), [q(10)]: ISLA_Q10_AGAIN },
    lucas: { [q(2)]: solution(2), [q(10)]: LUCAS_Q10_AGAIN },
    harper: { [q(1)]: solution(1) },
    oliver: { [q(2)]: solution(2), [q(4)]: solution(4) },
    ruby: { [q(9)]: solution(9) },
    finn: { [q(6)]: solution(6) },
    sofia: { [q(7)]: solution(7) },
  },
  groups: {
    coral: { [q(5)]: rework(5), [q(6)]: rework(6), [q(7)]: rework(7), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
    mint: { [q(3)]: rework(3), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: MINT_Q10 },
    sky: { [q(3)]: rework(3), [q(4)]: rework(4), [q(6)]: rework(6), [q(7)]: rework(7), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
    violet: { [q(5)]: rework(5), [q(6)]: rework(6) },
  },
};
