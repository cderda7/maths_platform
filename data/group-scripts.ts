import { ASSIGNMENT } from "./assignment";
import { Q5_ROOTS_FLIPPED, Q7_LOST_THIRD, Q7_PAIR, SLIPS } from "./classmates";
import { RECOGNITION, RECOGNITION_REWORK } from "./recognition";

/**
 * What gets written on the shared whiteboard for each problem of the demo group's union, attempt
 * by attempt, keyed by problem so the union can be pruned or extended one entry at a time. A visit plays the attempts
 * from where the last one stopped (`turnScript`); for the demo student's own turns these are what the pad reads per
 * burst, for a peer's they draw as synthetic ink and are read on a timer. Every line is in the evaluation table.
 *
 * The outcomes follow the group rules (tickets 278, 281): the group solves a problem when at least one present member had
 * it right first time, showing a member's real slip before the try that holds; a problem nobody had right stays unsolved
 * and closes on its return (tickets 221, 222), save the set's one exception.
 *
 * The union (ticket 281): Sam's Q1, Q2, Q3, Q7, Q10 and unfinished Q9; Jordan's Q2, Q7 and the Q8–Q10 he never reached;
 * Zara's Q3, Q7, Q9; Liam's Q1–Q3, his unfinished Q5 and the Q6–Q10 he never reached. Q4 left the board once Liam
 * handed in the formula right (ticket 281); everyone had it right.
 *
 * - Q1, Q2, Q3, Q10: a member had each right (Jordan and Zara Q1, Zara Q2, Jordan Q3, Zara Q10). Q3's first go is
 *   the null factor law on a product that isn't zero, which Sam, Zara and Liam all wrote; the rest hold first time, as
 *   ticket 278 scripted them.
 * - Q5 (ticket 281): Liam started it and read the roots off the factors with their signs flipped, so his pen writes that
 *   first; Sam, Jordan and Zara had it right, and the second go holds.
 * - Q6, Q8 (ticket 278): on the board only because Liam (and Jordan, on Q8) never reached them; nobody at the table
 *   slipped on them, so the group's first go is the right working and holds.
 * - Q7: nobody had it right. The first go is the class's common slip, the fraction cleared from two terms; the
 *   second multiplies through by 3 and never takes it back out, which puts the hint on the board (ticket 221); the
 *   third takes the third out and picks the wrong pair, which leaves Q7 for now; on the return the third and the
 *   pair are right and the brackets' signs flipped, which closes it unsolved and leaves it to class review.
 * - Q9: nobody had it right either (Sam stopped before the height, Zara gave the axis as the height, Jordan and
 *   Liam never reached it). Zara's slip is one line, so the group writes it (twice: the second go builds on Sam's
 *   working and still gives the axis as the height), the hint after the second wrong check names exactly that
 *   step, and the third go holds: the set's one exception (ticket 281's rule, re-derived there and kept).
 */
export interface TurnScript {
  attempts: string[][];
}

const solution = (id: string) => ASSIGNMENT.problems.find((p) => p.id === id)!.solution.map((s) => s.tex);

/**
 * Who writes each problem in the demo (ticket 228): Sam, the presenter, writes Q1 and Q7 (both its
 * visits), so the ladder goes at the pace they write it. The others go to members who brought the problem without having
 * it right: Liam his own Q5 (ticket 281; Q4 and its pen left the board) and Q9, Jordan Q3 and Q8, Zara Q2, Q6 and Q10, so
 * Sam, Zara and Jordan hold the pen three, three and two times across the ten visits and Liam twice. An exception to the
 * shuffle for the simulation only: a real run deals the pens equitably and at random (`dealPens`).
 */
export const DEMO_PENS: Record<string, string> = { q1: "sam", q2: "zara", q3: "jordan", q5: "liam", q6: "zara", q7: "sam", q8: "jordan", q9: "liam", q10: "zara" };

/** Q9's second go (ticket 278): Sam's working to the axis, then the height still read off the axis, Zara's slip. */
const Q9_AXIS_AGAIN = ["-x(x - 6) = 0", "x = 0 \\;\\text{or}\\; x = 6", "\\text{turning point at } x = 3", "h = 6"];

export const GROUP_SCRIPTS: Record<string, TurnScript> = {
  q1: { attempts: [RECOGNITION_REWORK.q1] },
  q2: { attempts: [RECOGNITION_REWORK.q2] },
  q3: { attempts: [RECOGNITION.q3, RECOGNITION_REWORK.q3] },
  q5: { attempts: [Q5_ROOTS_FLIPPED, solution("q5")] },
  q6: { attempts: [solution("q6")] },
  q7: { attempts: [SLIPS.q7, Q7_LOST_THIRD, Q7_PAIR, ["\\tfrac{1}{3}(x^2 + 6x + 8)", "2 \\times 4 = 8,\\quad 2 + 4 = 6", "\\tfrac{1}{3}(x - 2)(x - 4)"]] },
  q8: { attempts: [solution("q8")] },
  q9: { attempts: [SLIPS.q9, Q9_AXIS_AGAIN, solution("q9")] },
  q10: { attempts: [RECOGNITION_REWORK.q10] },
};
