import { ASSIGNMENT } from "./assignment";
import { SLIPS } from "./classmates";
import { RECOGNITION, RECOGNITION_REWORK } from "./recognition";

/**
 * What gets written on the shared whiteboard for each problem of the demo group's union, attempt
 * by attempt: the pen-holder's first attempt, and a second when the first checks wrong (Q3, Q7 and
 * Q9: Liam's first go at Q7 is the class's common slip, the fraction cleared from two terms, and his
 * second is the model solution, since the demo student's own rework of Q7 is still wrong). For the
 * demo student's own turns these are what the pad reads per burst; for a peer's turn they draw as
 * synthetic ink and are read on a timer. Every line is in the evaluation table.
 */
export interface TurnScript {
  attempts: string[][];
  /** After this attempt (0-based) checks wrong, a peer presses "we're stuck" before the next attempt. */
  stuckAfter?: number;
}

const solution = (id: string) => ASSIGNMENT.problems.find((p) => p.id === id)!.solution.map((s) => s.tex);

export const GROUP_SCRIPTS: Record<string, TurnScript> = {
  q1: { attempts: [RECOGNITION_REWORK.q1] },
  q2: { attempts: [RECOGNITION_REWORK.q2] },
  q3: { attempts: [RECOGNITION.q3, RECOGNITION_REWORK.q3], stuckAfter: 0 },
  q7: { attempts: [SLIPS.q7, solution("q7")] },
  q9: { attempts: [SLIPS.q9, solution("q9")] },
  q10: { attempts: [RECOGNITION_REWORK.q10] },
};
