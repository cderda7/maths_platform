import type { GroupVersion, SetReview } from "../recordReview";
import { PS3_PROBLEMS } from "./assignment";

/**
 * What review made of Problem Set 3's mistakes (ticket 244): the second submissions written in individual review
 * and each seating group's version of every problem it took on. Which problem ends where, and why, is the class story
 * sheet's review part for the set (`STORY_REVIEW` in `data/story.ts`, checked against `lib/reviewRule.ts`):
 * a one-off slip is rewritten right on the student's own (the model solution's working, line by line); a repeated
 * slip is put right by the group's rework; a pattern stays wrong, and the group's last try is the first pattern-holder's
 * own working in seating order.
 */

const solution = (k: number): string[] => PS3_PROBLEMS[k - 1].solution.map((s) => s.tex);
const q = (k: number) => `ps3-q${k}`;
/** The group's rework that checked: the model solution's working. */
const rework = (k: number): GroupVersion => ({ solved: true, lines: solution(k) });
/** The group's last try on a problem it closed unsolved: that member's first submission, line for line. */
const lastTry = (student: string): GroupVersion => ({ solved: false, firstOf: student });

export const PS3_REVIEW: SetReview = {
  second: {
    sam: { [q(8)]: solution(8) },
    jordan: { [q(6)]: solution(6) },
    amelia: { [q(2)]: solution(2), [q(4)]: solution(4), [q(7)]: solution(7), [q(10)]: solution(10) },
    tomas: { [q(2)]: solution(2), [q(6)]: solution(6), [q(10)]: solution(10) },
    zara: { [q(4)]: solution(4) },
    aiden: { [q(1)]: solution(1), [q(3)]: solution(3), [q(7)]: solution(7) },
    mia: { [q(4)]: solution(4), [q(9)]: solution(9) },
    chloe: { [q(8)]: solution(8) },
    ethan: { [q(6)]: solution(6), [q(8)]: solution(8) },
    isla: { [q(1)]: solution(1), [q(7)]: solution(7), [q(10)]: solution(10) },
    lucas: { [q(8)]: solution(8), [q(10)]: solution(10) },
    harper: { [q(1)]: solution(1), [q(2)]: solution(2), [q(7)]: solution(7) },
    oliver: { [q(2)]: solution(2), [q(6)]: solution(6) },
    sofia: { [q(9)]: solution(9) },
  },
  groups: {
    coral: { [q(1)]: lastTry("tomas"), [q(2)]: rework(2), [q(3)]: rework(3), [q(4)]: rework(4), [q(6)]: rework(6), [q(7)]: lastTry("tomas"), [q(10)]: rework(10) },
    amber: { [q(2)]: rework(2), [q(4)]: rework(4), [q(6)]: rework(6), [q(8)]: rework(8), [q(9)]: rework(9), [q(10)]: rework(10) },
    mint: { [q(1)]: rework(1), [q(2)]: rework(2), [q(7)]: rework(7), [q(8)]: rework(8), [q(10)]: rework(10) },
    sky: { [q(4)]: rework(4), [q(6)]: rework(6), [q(8)]: rework(8), [q(9)]: rework(9) },
    violet: { [q(2)]: rework(2), [q(5)]: rework(5), [q(6)]: rework(6), [q(8)]: rework(8), [q(9)]: rework(9) },
  },
};
