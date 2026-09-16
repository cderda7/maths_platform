import { ASSIGNMENT } from "./assignment";
import { CORAL_Q8_LAST, MINT_Q10_LAST, MINT_Q7_LAST, SKY_Q7_LAST, VIOLET_Q7_LAST } from "./classmates-review";
import type { GroupColour } from "./groups";
import { RECOGNITION, RECOGNITION_REWORK } from "./recognition";
import { Q10_FORMAL, Q10_TWICE, Q1_PAIR, Q2_GUESSED, Q2_SIGN, Q3_EXPAND, Q4_OVER_A, Q5_ROOTS_FLIPPED, Q5_SIGNS, Q7_LOST_THIRD, Q7_PAIR, Q7_TWO_TERMS, Q9_RUSHED, Q9_SIGN, SLIPS } from "./slips";

/**
 * What gets written on the shared whiteboard for each problem of the demo group's union, attempt
 * by attempt, keyed by problem so the union can be pruned or extended one entry at a time. A visit plays the attempts
 * from where the last one stopped (`turnScript`); for the demo student's own turns these are what the pad reads per
 * burst, for a peer's they draw as synthetic ink and are read on a timer. Every line is in the evaluation table.
 *
 * The outcomes follow the group rules (tickets 278, 281, 332): the group solves a question in the 1st or 2nd round when a
 * present member can explain it (right first time, or fixed in individual review), showing a member's real slip before the
 * try that holds; a question nobody can explain is left for now after three wrong checks and closes unsolved on its return
 * (tickets 221, 222), save the set's one exception. A board chosen at the start of the run (`boardScripts`,
 * `lib/groupSim.ts`) falls back to a script of the rule's shape wherever the table in the room differs from this one.
 *
 * The union after individual review (ticket 332) is the same nine questions as before: Sam's Q7 (his rework slipped again)
 * and his unfinished Q9; Jordan's Q7 (his second submission slipped again) and the Q8–Q10 he never reached; Zara's Q7 and Q9
 * (both second submissions still wrong); Liam's Q1–Q3, his unfinished Q5 and the Q6–Q10 he never reached. Sam's, Jordan's
 * and Zara's fixes (Sam's Q1, Q2, Q3, Q10; Jordan's Q2; Zara's Q3) make them helpers there. Q4 all four had right.
 *
 * - Q1, Q2, Q3, Q10: a member can explain each (Jordan and Zara had Q1 right, Zara Q2, Jordan Q3, Zara Q10; Sam fixed all
 *   four). Q3's first go is the null factor law on a product that isn't zero, which Sam, Zara and Liam all wrote; the rest
 *   hold first time, as ticket 278 scripted them.
 * - Q5 (ticket 281): Liam started it and read the roots off the factors with their signs flipped, so his pen writes that
 *   first; Sam, Jordan and Zara had it right, and the second go holds.
 * - Q6, Q8 (ticket 278): on the board only because Liam (and Jordan, on Q8) never reached them; nobody at the table
 *   slipped on them, so the group's first go is the right working and holds.
 * - Q7: nobody can explain it (Sam's, Jordan's and Zara's rewrites all slipped again). The first go is the class's common
 *   slip, the fraction cleared from two terms; the second multiplies through by 3 and never takes it back out, which puts
 *   the hint on the board (ticket 221); the third takes the third out and picks the wrong pair, which leaves Q7 for now; on
 *   the return the third and the pair are right and the brackets' signs flipped, which closes it unsolved and leaves it to
 *   class review.
 * - Q9: nobody can explain it either (Sam stopped before the height, Zara's rewrite gave the axis as the height again,
 *   Jordan and Liam never reached it). Zara's slip is one line, so the group writes it (twice: the second go builds on Sam's
 *   working and still gives the axis as the height), the hint after the second wrong check names exactly that step, the
 *   third go starts again and loses the sign taking −x out, which leaves Q9 for now; on the return the height is
 *   substituted and it holds: the set's one exception (tickets 281, 332).
 */
export interface TurnScript {
  attempts: string[][];
}

const solution = (id: string) => ASSIGNMENT.problems.find((p) => p.id === id)!.solution.map((s) => s.tex);

/**
 * Who writes each problem in the demo (ticket 228): Sam, the presenter, writes Q1 and Q7 (both its
 * visits), so the ladder goes at the pace they write it. The others go to members who brought the problem without having
 * it right: Liam his own Q5 (ticket 281; Q4 and its pen left the board) and Q9 (both its visits since ticket 332), Jordan
 * Q3 and Q8, Zara Q2, Q6 and Q10, so across the eleven visits Sam, Zara and Liam hold the pen three times each and Jordan
 * twice. An exception to the shuffle for the simulation only: a real run deals the pens equitably and at random
 * (`dealPens`), as the four simulated groups' boards do.
 */
export const DEMO_PENS: Record<string, string> = { q1: "sam", q2: "zara", q3: "jordan", q5: "liam", q6: "zara", q7: "sam", q8: "jordan", q9: "liam", q10: "zara" };

/** Q9's second go (ticket 278): Sam's working to the axis, then the height still read off the axis, Zara's slip. */
const Q9_AXIS_AGAIN = ["-x(x - 6) = 0", "x = 0 \\;\\text{or}\\; x = 6", "\\text{turning point at } x = 3", "h = 6"];
/** Q9's third go (ticket 332): started again after the hint, and −x taken out with the sign left behind. */
const Q9_SIGN_AGAIN = ["-x(x + 6) = 0", "x = 0 \\;\\text{or}\\; x = -6", "x = -3", "h = 9"];

export const GROUP_SCRIPTS: Record<string, TurnScript> = {
  q1: { attempts: [RECOGNITION_REWORK.q1] },
  q2: { attempts: [RECOGNITION_REWORK.q2] },
  q3: { attempts: [RECOGNITION.q3, RECOGNITION_REWORK.q3] },
  q5: { attempts: [Q5_ROOTS_FLIPPED, solution("q5")] },
  q6: { attempts: [solution("q6")] },
  q7: { attempts: [SLIPS.q7, Q7_LOST_THIRD, Q7_PAIR, SKY_Q7_LAST] },
  q8: { attempts: [solution("q8")] },
  q9: { attempts: [SLIPS.q9, Q9_AXIS_AGAIN, Q9_SIGN_AGAIN, solution("q9")] },
  q10: { attempts: [RECOGNITION_REWORK.q10] },
};

/**
 * The other four groups' boards on Problem Set 6 (ticket 332): simulation only, every try each group writes on every
 * question of its union after individual review, in the order written, so their runs play as fully as sky's live one
 * (pens by the product's shuffle, wrong checks, the hint, left for now, the return) and a per-group view can show them.
 * `lib/groupSim.ts` plays them on the classroom's clock. Every group version in `SET6_REVIEW` is its board's last try.
 *
 * - Coral (Priya, Amelia, Tomas, Aiden; Q4, Q5, Q7–Q10): Q8 nobody can explain (ticket 347: Priya's, Amelia's and Aiden's
 *   rewrites all slipped again, the class's only recognised slip on it); it takes three wrong checks, is left for now, and
 *   closes unsolved on its return. The rest hold in one or two tries, the first wrong go a slip Tomas, Aiden or Amelia
 *   really wrote.
 * - Amber (Mia, Noah, Ethan, Chloe away; Q2, Q7, Q9, Q10): Noah can explain Q2, Q7 and Q9, Mia Q10. Nothing is left for now.
 * - Mint (Isla, Lucas, Grace, Harper; Q3, Q5–Q10): Q7 and Q10 nobody can explain (Isla's and Lucas's Q7 rewrites slipped
 *   again; nobody had Q10 right). Each takes three wrong checks, is left for now, and closes unsolved on its return with
 *   the group's own last try. The rest Isla or Lucas can explain.
 * - Violet (Oliver, Ruby, Finn, Sofia; Q1, Q2, Q4, Q7–Q10): Q7 nobody can explain (Oliver's and Ruby's rewrites slipped
 *   again, Finn and Sofia never rewrote it); left for now, then unsolved. The rest Ruby, Finn or Sofia can explain.
 */
export const SIMULATED_BOARDS: Partial<Record<GroupColour, Readonly<Record<string, readonly (readonly string[])[]>>>> = {
  coral: {
    q4: [Q4_OVER_A, solution("q4")],
    q5: [Q5_SIGNS, solution("q5")],
    q7: [Q7_TWO_TERMS, solution("q7")],
    q8: [SLIPS.q8, SLIPS.q8, SLIPS.q8, CORAL_Q8_LAST],
    q9: [solution("q9")],
    q10: [Q10_TWICE, solution("q10")],
  },
  amber: {
    q2: [Q2_GUESSED, solution("q2")],
    q7: [Q7_TWO_TERMS, solution("q7")],
    q9: [Q9_SIGN, solution("q9")],
    q10: [solution("q10")],
  },
  mint: {
    q3: [Q3_EXPAND, solution("q3")],
    q5: [solution("q5")],
    q6: [solution("q6")],
    q7: [Q7_TWO_TERMS, Q7_LOST_THIRD, Q7_PAIR, MINT_Q7_LAST],
    q8: [solution("q8")],
    q9: [Q9_RUSHED, solution("q9")],
    q10: [Q10_TWICE, Q10_FORMAL, ["b^2 - 4ac = 16 - 20 = -4", "\\Delta < 0 \\Rightarrow \\text{two real solutions}"], MINT_Q10_LAST],
  },
  violet: {
    q1: [Q1_PAIR, solution("q1")],
    q2: [Q2_SIGN, solution("q2")],
    q4: [Q4_OVER_A, solution("q4")],
    q7: [Q7_LOST_THIRD, Q7_TWO_TERMS, Q7_PAIR, VIOLET_Q7_LAST],
    q8: [solution("q8")],
    q9: [solution("q9")],
    q10: [solution("q10")],
  },
};

/**
 * How fast each simulated group works (ticket 332, simulation only), in seconds: `tryS` from the start of a try to its check
 * (writing, talking it through, checking), `nextS` from a close to the next visit (reading the marks). Set so amber finishes
 * before the demo group's quickest board and mint and violet a good while after it, all inside twelve minutes, and no bar
 * jumps: every close at least half a minute after the one before. Coral was the other group home before the demo group's
 * board until ticket 347 gave it an unsolved question of its own (Q8): the three wrong checks, the pause and the return
 * push it just past the demo group's quickest board instead, still well inside the twelve minutes.
 */
export const SIMULATED_PACE: Partial<Record<GroupColour, { tryS: number; nextS: number }>> = {
  amber: { tryS: 26, nextS: 16 },
  coral: { tryS: 22, nextS: 12 },
  mint: { tryS: 34, nextS: 14 },
  violet: { tryS: 42, nextS: 18 },
};
