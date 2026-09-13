import { ASSIGNMENT } from "./assignment";
import { Q7_LOST_THIRD, Q7_PAIR, SLIPS } from "./classmates";
import { RECOGNITION, RECOGNITION_REWORK } from "./recognition";

/**
 * What gets written on the shared whiteboard for each problem of the demo group's union, attempt
 * by attempt: the pen-holder's first attempt, and more when it checks wrong (Q3 and Q9 once, then
 * right). The group never solves Q7 (ticket 222): Liam's first go is the class's common slip, the
 * fraction cleared from two terms; his second multiplies through by 3 and never takes it back out,
 * which puts the hint on the board (ticket 221); his third takes the third out and picks the wrong
 * pair, which leaves Q7 for now; on the return Jordan gets the third and the pair and flips the
 * brackets' signs, which closes it unsolved and leaves it to class review. A visit plays the attempts
 * from where the last one stopped (`turnScript`). For the
 * demo student's own turns these are what the pad reads per burst; for a peer's turn they draw as
 * synthetic ink and are read on a timer. Every line is in the evaluation table.
 */
export interface TurnScript {
  attempts: string[][];
}

const solution = (id: string) => ASSIGNMENT.problems.find((p) => p.id === id)!.solution.map((s) => s.tex);

export const GROUP_SCRIPTS: Record<string, TurnScript> = {
  q1: { attempts: [RECOGNITION_REWORK.q1] },
  q2: { attempts: [RECOGNITION_REWORK.q2] },
  q3: { attempts: [RECOGNITION.q3, RECOGNITION_REWORK.q3] },
  q7: { attempts: [SLIPS.q7, Q7_LOST_THIRD, Q7_PAIR, ["\\tfrac{1}{3}(x^2 + 6x + 8)", "2 \\times 4 = 8,\\quad 2 + 4 = 6", "\\tfrac{1}{3}(x - 2)(x - 4)"]] },
  q9: { attempts: [SLIPS.q9, solution("q9")] },
  q10: { attempts: [RECOGNITION_REWORK.q10] },
};
