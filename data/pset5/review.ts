import type { GroupVersion, SetReview } from "../recordReview";
import { PS5_PROBLEMS } from "./assignment";

/**
 * What review made of Problem Set 5's mistakes (ticket 244): the second submissions written in individual review
 * and each seating group's version of every problem it took on. Which problem ends where, and why, is the class story
 * sheet's review part for the set (`STORY_REVIEW` in `data/story.ts`, checked against `lib/reviewRule.ts`):
 * a one-off slip is rewritten right on the student's own (the model solution's working, line by line); a repeated
 * slip is put right by the group's rework; a habit stays wrong, and the group's last try is the first habit-holder's
 * own working in seating order.
 */

const solution = (k: number): string[] => PS5_PROBLEMS[k - 1].solution.map((s) => s.tex);
const q = (k: number) => `ps5-q${k}`;
/** The group's rework that checked: the model solution's working. */
const rework = (k: number): GroupVersion => ({ solved: true, lines: solution(k) });
/** The group's last try on a problem it closed unsolved: that member's first submission, line for line. */
const lastTry = (student: string): GroupVersion => ({ solved: false, firstOf: student });

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
    coral: { [q(1)]: lastTry("tomas"), [q(2)]: rework(2), [q(4)]: lastTry("tomas"), [q(5)]: rework(5), [q(6)]: rework(6), [q(7)]: rework(7), [q(8)]: rework(8), [q(10)]: lastTry("amelia") },
    amber: { [q(4)]: lastTry("mia"), [q(5)]: rework(5), [q(7)]: rework(7), [q(8)]: lastTry("mia"), [q(9)]: lastTry("mia"), [q(10)]: rework(10) },
    mint: { [q(2)]: rework(2), [q(3)]: rework(3), [q(5)]: rework(5), [q(7)]: rework(7), [q(9)]: rework(9), [q(10)]: lastTry("isla") },
    sky: { [q(4)]: lastTry("jordan"), [q(6)]: rework(6), [q(8)]: lastTry("jordan"), [q(9)]: rework(9), [q(10)]: rework(10) },
    violet: { [q(4)]: lastTry("oliver"), [q(5)]: rework(5), [q(6)]: rework(6), [q(7)]: rework(7), [q(8)]: lastTry("oliver"), [q(9)]: lastTry("ruby"), [q(10)]: rework(10) },
  },
};
