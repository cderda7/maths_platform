import type { GroupVersion, SetReview } from "../recordReview";
import { PS5_PROBLEMS } from "./assignment";

/**
 * What review made of Problem Set 5's problems (tickets 244, 281, 338): the second submissions written in individual review
 * and each seating group's version of every question it worked. Which problem ends where, and why, is
 * the class story sheet's review part for the set (`STORY_REVIEW` in `data/story.ts`, checked against
 * `lib/reviewRule.ts`): a one-off slip is rewritten on the student's own in individual review, and most rewrites are the
 * model solution's working, line by line. Since ticket 338 the group works only its union after individual review (ticket
 * 332, `lib/reviewUnion.ts`): the questions a present member still had wrong, left incomplete or did not attempt once
 * corrections were in, so a question every member had right after their corrections has no group version, and a group with
 * nothing left sat out. The group solves a question with the model working when a member at the table could explain it
 * (right first time, or fixed in individual review), and otherwise closes it unsolved on its own last try, still wrong.
 *
 * Under ticket 332's rule two questions nobody at a table had right first time were solved (ticket 338): mint's Q9, which
 * Isla, Lucas and Harper had fixed in individual review, and sky's Q4, which Sam and Zara had fixed. Harper's Q10 rewrite
 * slipped again (ticket 338), so nobody at mint could explain Q10 and it stays the set's question nobody at a table could do.
 */

const solution = (k: number): string[] => PS5_PROBLEMS[k - 1].solution.map((s) => s.tex);
const q = (k: number) => `ps5-q${k}`;
/** The group's rework that checked: the model solution's working. */
const rework = (k: number): GroupVersion => ({ solved: true, lines: solution(k) });
/** The group's last try on a problem it closed unsolved: its own working, still wrong, never a member's first submission. */
const lastTry = (lines: readonly string[]): GroupVersion => ({ solved: false, lines });

/** Harper's Q10 rewritten and wrong again (ticket 338): the working written out this time, the turning point's two numbers still swapped in the sentence. */
const HARPER_Q10_AGAIN = ["\\text{turning point } (2, 1)", "-\\tfrac{1}{4}(x - 2)^2 + 1 = 0", "(x - 2)^2 = 4", "x - 2 = \\pm 2", "x = 4", "\\text{The water reaches 2 m and lands 4 m from the nozzle}"];

/** Mint's last try on Q10: the landing points solved straight from the square, then Isla and Lucas's sentence landing the water at the nozzle. */
const MINT_Q10: GroupVersion = lastTry(["\\text{turning point } (2, 1)", "-\\tfrac{1}{4}(x - 2)^2 + 1 = 0", "(x - 2)^2 = 4", "x = 0 \\;\\text{or}\\; x = 4", "\\text{The water reaches 1 m and lands 0 m from the nozzle}"]);

export const PS5_REVIEW: SetReview = {
  second: {
    sam: { [q(4)]: solution(4), [q(6)]: solution(6), [q(9)]: solution(9) },
    amelia: { [q(6)]: solution(6), [q(8)]: solution(8) },
    tomas: { [q(5)]: solution(5) },
    zara: { [q(4)]: solution(4), [q(6)]: solution(6), [q(10)]: solution(10) },
    aiden: { [q(7)]: solution(7) },
    noah: { [q(7)]: solution(7) },
    chloe: { [q(4)]: solution(4), [q(5)]: solution(5), [q(8)]: solution(8) },
    ethan: { [q(5)]: solution(5), [q(8)]: solution(8), [q(10)]: solution(10) },
    isla: { [q(5)]: solution(5), [q(9)]: solution(9) },
    lucas: { [q(9)]: solution(9) },
    harper: { [q(7)]: solution(7), [q(9)]: solution(9), [q(10)]: HARPER_Q10_AGAIN },
    oliver: { [q(7)]: solution(7) },
    ruby: { [q(5)]: solution(5), [q(10)]: solution(10) },
    finn: { [q(4)]: solution(4), [q(6)]: solution(6), [q(8)]: solution(8) },
  },
  groups: {
    coral: { [q(1)]: rework(1), [q(2)]: rework(2), [q(4)]: rework(4), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
    amber: { [q(4)]: rework(4), [q(8)]: rework(8), [q(9)]: rework(9) },
    mint: { [q(2)]: rework(2), [q(3)]: rework(3), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: MINT_Q10 },
    sky: { [q(1)]: rework(1), [q(4)]: rework(4), [q(6)]: rework(6), [q(7)]: rework(7), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
    violet: { [q(4)]: rework(4), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
  },
};
