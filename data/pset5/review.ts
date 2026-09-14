import type { GroupVersion, SetReview } from "../recordReview";
import { PS5_PROBLEMS } from "./assignment";

/**
 * What review made of Problem Set 5's problems (tickets 244, 281): the second submissions written in individual review
 * and each seating group's version of every problem it took on, which since ticket 278 is every problem a member did not
 * get right first time (a mistake, a problem left incomplete, one not attempted). Which problem ends where, and why, is
 * the class story sheet's review part for the set (`STORY_REVIEW` in `data/story.ts`, checked against
 * `lib/reviewRule.ts`): a one-off slip is rewritten right on the student's own (the model solution's working, line by
 * line); everything else is the group's, which solves it with the model working when a member at the table had it right
 * first time, and otherwise closes it unsolved on its own last try, still wrong.
 */

const solution = (k: number): string[] => PS5_PROBLEMS[k - 1].solution.map((s) => s.tex);
const q = (k: number) => `ps5-q${k}`;
/** The group's rework that checked: the model solution's working. */
const rework = (k: number): GroupVersion => ({ solved: true, lines: solution(k) });
/** The group's last try on a problem it closed unsolved: its own working, still wrong, never a member's first submission. */
const lastTry = (lines: readonly string[]): GroupVersion => ({ solved: false, lines });

/** Mint's last try on Q9: the shape and the y-intercept right, then Isla and Lucas's −1 taken out with the signs inside left behind, the turning point read from it. */
const MINT_Q9: GroupVersion = lastTry(["a = -1 < 0 \\Rightarrow \\text{concave down}", "y\\text{-intercept } (0, 8)", "-(x^2 + 2x - 8) = -(x + 4)(x - 2) = 0", "x = -4 \\;\\text{or}\\; x = 2", "\\text{maximum turning point } (-1, 5)"]);
/** Mint's last try on Q10: the landing points solved straight from the square, then Isla and Lucas's sentence landing the water at the nozzle. */
const MINT_Q10: GroupVersion = lastTry(["\\text{turning point } (2, 1)", "-\\tfrac{1}{4}(x - 2)^2 + 1 = 0", "(x - 2)^2 = 4", "x = 0 \\;\\text{or}\\; x = 4", "\\text{The water reaches 1 m and lands 0 m from the nozzle}"]);
/** Sky's last try on Q4: Sam's split, the brackets straight from it, and Zara's 3x + 2 = 0 solved upside down. */
const SKY_Q4: GroupVersion = lastTry(["3x^2 - 10x - 8 = 0", "ac = -24,\\quad -12 + 2 = -10", "(3x + 2)(x - 4) = 0", "x = -\\tfrac{3}{2} \\;\\text{or}\\; x = 4"]);

export const PS5_REVIEW: SetReview = {
  second: {
    sam: { [q(4)]: solution(4), [q(6)]: solution(6), [q(9)]: solution(9) },
    amelia: { [q(6)]: solution(6), [q(8)]: solution(8) },
    tomas: { [q(2)]: solution(2), [q(5)]: solution(5) },
    zara: { [q(4)]: solution(4), [q(6)]: solution(6), [q(10)]: solution(10) },
    aiden: { [q(7)]: solution(7) },
    noah: { [q(7)]: solution(7) },
    chloe: { [q(4)]: solution(4), [q(5)]: solution(5), [q(8)]: solution(8) },
    ethan: { [q(5)]: solution(5), [q(8)]: solution(8), [q(10)]: solution(10) },
    isla: { [q(5)]: solution(5), [q(9)]: solution(9) },
    lucas: { [q(9)]: solution(9) },
    harper: { [q(7)]: solution(7), [q(9)]: solution(9), [q(10)]: solution(10) },
    oliver: { [q(7)]: solution(7) },
    ruby: { [q(5)]: solution(5), [q(10)]: solution(10) },
    finn: { [q(4)]: solution(4), [q(6)]: solution(6), [q(8)]: solution(8) },
  },
  groups: {
    coral: { [q(1)]: rework(1), [q(2)]: rework(2), [q(4)]: rework(4), [q(5)]: rework(5), [q(6)]: rework(6), [q(7)]: rework(7), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
    amber: { [q(4)]: rework(4), [q(5)]: rework(5), [q(7)]: rework(7), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
    mint: { [q(2)]: rework(2), [q(3)]: rework(3), [q(5)]: rework(5), [q(7)]: rework(7), [q(8)]: rework(8), [q(9)]: MINT_Q9, [q(10)]: MINT_Q10 },
    sky: { [q(1)]: rework(1), [q(4)]: SKY_Q4, [q(6)]: rework(6), [q(7)]: rework(7), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
    violet: { [q(4)]: rework(4), [q(5)]: rework(5), [q(6)]: rework(6), [q(7)]: rework(7), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
  },
};
