import { ASSIGNMENT } from "./assignment";
import { RECOGNITION_REWORK } from "./recognition";
import type { GroupVersion, SetReview } from "./recordReview";

/**
 * What review made of the classmates' Problem Set 6 mistakes (ticket 244): the second submissions written in
 * individual review and each seating group's version of every problem it took on, in the shape of a finished set's
 * `data/psetN/review.ts`. Which problem ends where, and why, is the class story sheet's Set 6 review part
 * (`STORY_REVIEW` in `data/story.ts`). On the live set a classmate's outcome shows only once the class has
 * reached that stage (`recordReviews`, `lib/report.ts`).
 *
 * Sky is the demo student's group, whose group review is scripted (`data/group-scripts.ts`): its versions are the
 * script's, the rework that checks on Q1, Q2, Q3, Q9 and Q10 and the last try that closes Q7 unsolved, so Jordan,
 * Zara and Liam carry what Sam's own run shows (`data/story.test.ts` holds them equal).
 */

const solution = (id: string): string[] => ASSIGNMENT.problems.find((p) => p.id === id)!.solution.map((s) => s.tex);
/** The group's rework that checked: the model solution's working. */
const rework = (id: string): GroupVersion => ({ solved: true, lines: solution(id) });
/** The group's last try on a problem it closed unsolved: that member's first submission, line for line. */
const lastTry = (student: string): GroupVersion => ({ solved: false, firstOf: student });
const fixed = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, solution(id)]));

export const SET6_REVIEW: SetReview = {
  second: {
    jordan: fixed("q2", "q7"),
    amelia: fixed("q6", "q7"),
    tomas: fixed("q3"),
    zara: fixed("q3", "q7", "q9"),
    aiden: fixed("q7"),
    noah: fixed("q3"),
    ethan: fixed("q1", "q4", "q7", "q9"),
    isla: fixed("q4", "q7"),
    lucas: fixed("q7"),
    oliver: fixed("q3", "q7"),
    ruby: fixed("q5", "q7", "q9"),
    finn: fixed("q5"),
  },
  groups: {
    coral: { q3: rework("q3"), q4: lastTry("tomas"), q5: lastTry("tomas"), q6: rework("q6"), q7: lastTry("tomas"), q10: lastTry("amelia") },
    amber: { q1: rework("q1"), q2: lastTry("mia"), q3: rework("q3"), q4: rework("q4"), q7: lastTry("mia"), q9: lastTry("mia") },
    mint: { q3: lastTry("harper"), q4: rework("q4"), q5: lastTry("harper"), q7: rework("q7"), q9: lastTry("harper"), q10: lastTry("isla") },
    sky: {
      q1: { solved: true, lines: RECOGNITION_REWORK.q1 },
      q2: { solved: true, lines: RECOGNITION_REWORK.q2 },
      q3: { solved: true, lines: RECOGNITION_REWORK.q3 },
      q7: { solved: false, lines: ["\\tfrac{1}{3}(x^2 + 6x + 8)", "2 \\times 4 = 8,\\quad 2 + 4 = 6", "\\tfrac{1}{3}(x - 2)(x - 4)"] },
      q9: { solved: true, lines: solution("q9") },
      q10: { solved: true, lines: RECOGNITION_REWORK.q10 },
    },
    violet: { q1: rework("q1"), q2: rework("q2"), q3: rework("q3"), q4: lastTry("finn"), q5: rework("q5"), q7: lastTry("finn"), q9: rework("q9") },
  },
};
