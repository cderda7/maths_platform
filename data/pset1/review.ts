import type { GroupVersion, SetReview } from "../recordReview";
import { PS1_PROBLEMS } from "./assignment";

/**
 * What review made of Problem Set 1's mistakes (ticket 244): the second submissions written in individual review
 * and each seating group's version of every problem it took on. Which problem ends where, and why, is the class story
 * sheet's review part for the set (`STORY_REVIEW` in `data/story.ts`, checked against `lib/reviewRule.ts`):
 * a one-off slip is rewritten right on the student's own (the model solution's working, line by line); a repeated
 * slip is put right by the group's rework; a pattern would stay wrong on the group's last try, but no slip on Set 1
 * is a gap, so every group's rework checks.
 */

const solution = (k: number): string[] => PS1_PROBLEMS[k - 1].solution.map((s) => s.tex);
const q = (k: number) => `ps1-q${k}`;
/** The group's rework that checked: the model solution's working. */
const rework = (k: number): GroupVersion => ({ solved: true, lines: solution(k) });

export const PS1_REVIEW: SetReview = {
  second: {
    amelia: { [q(3)]: solution(3), [q(7)]: solution(7) },
    tomas: { [q(4)]: solution(4), [q(7)]: solution(7) },
    liam: { [q(2)]: solution(2) },
    aiden: { [q(8)]: solution(8) },
    chloe: { [q(1)]: solution(1), [q(5)]: solution(5) },
    isla: { [q(4)]: solution(4) },
    oliver: { [q(4)]: solution(4), [q(10)]: solution(10) },
    finn: { [q(9)]: solution(9) },
    sofia: { [q(7)]: solution(7) },
  },
  groups: {
    coral: { [q(3)]: rework(3), [q(4)]: rework(4), [q(7)]: rework(7), [q(8)]: rework(8) },
    amber: { [q(1)]: rework(1), [q(5)]: rework(5) },
    mint: { [q(4)]: rework(4) },
    sky: { [q(2)]: rework(2) },
    violet: { [q(1)]: rework(1), [q(4)]: rework(4), [q(6)]: rework(6), [q(7)]: rework(7), [q(9)]: rework(9), [q(10)]: rework(10) },
  },
};
