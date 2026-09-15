import { ASSIGNMENT } from "@/data/assignment";
import { SLIPS } from "@/data/slips";
import { attemptsOn, beginRun, checkBoard, currentVisit, groupReducer, isClosed, LEAVE_AFTER_WRONG, LEAVE_PAUSE_MS, leaving, visitsOf, type BoardAction, type GroupRun } from "./groupReview";

/**
 * The groups that are not on the demo student's live whiteboard, played as fully as his (ticket 332): each question of a
 * group's union written try by try, pens dealt by the product's shuffle, wrong checks, the hint, left for now after the
 * third, one return visit, closed solved or unsolved. The board's own rules do it: every step is `groupReducer`, the same
 * reducer the classroom store applies to the live run, so a simulated run is a `GroupRun` like the live one and everything
 * that reads a run (progress, the stuck list, the pen, the timeline below) reads both alike. Pure: a function of the
 * group's board, its pace, the moment group review began and now, so every tab agrees and a reload lands on the same run.
 *
 * Which tries a table writes (`boardScripts`) follows the group rule (`lib/reviewUnion.ts`): a question a present member can
 * explain holds in the 1st or 2nd round; one nobody can explain takes three wrong checks, is left for now, and closes
 * unsolved on its return, save a named exception solved on the return. Authored tries (`data/group-scripts.ts`) are used
 * where they have that shape for the table in the room; anywhere else (the teacher moved someone, a student is away) the
 * rule's own shape is written from the members' real slips.
 */
export type Tries = readonly (readonly string[])[];

const solution = (problem: string): string[] => ASSIGNMENT.problems.find((p) => p.id === problem)?.solution.map((s) => s.tex) ?? [];
const correct = (problem: string, lines: readonly string[]) => checkBoard(problem, [...lines]).correct;

/**
 * Whether tries have the shape the rule gives a table: with someone who can explain, one or two tries, only the last
 * holding; with nobody, three wrong checks and a return that stays wrong (or holds, for the set's named exception).
 */
export function triesFitRule(problem: string, tries: Tries, explainable: boolean, exception = false): boolean {
  if (tries.length === 0) return false;
  const marks = tries.map((lines) => correct(problem, lines));
  if (explainable) return tries.length <= 2 && marks.slice(0, -1).every((m) => !m) && marks.at(-1) === true;
  return tries.length === LEAVE_AFTER_WRONG + 1 && marks.slice(0, LEAVE_AFTER_WRONG).every((m) => !m) && (exception || marks.at(-1) === false);
}

/** The rule's own tries for a question, from the table's real wrong working on it (the class's known slip when nobody at the table wrote one). */
export function ruleTries(problem: string, explainable: boolean, slips: Tries): string[][] {
  const wrong = slips.filter((lines) => lines.length > 0 && !correct(problem, lines)).map((lines) => [...lines]);
  if (explainable) return wrong.length > 0 ? [wrong[0], solution(problem)] : [solution(problem)];
  const pool = wrong.length > 0 ? wrong : [SLIPS[problem] ?? []];
  return Array.from({ length: LEAVE_AFTER_WRONG + 1 }, (_, i) => pool[i % pool.length]);
}

/**
 * Every question's tries for a table: the authored ones where they fit the rule for who is there, else the rule's own.
 * `explainable` names the questions someone present can explain; `slips` each question's wrong first submissions at the
 * table; `exception` the one question (if any) the set lets a table solve on its return with nobody able to explain it.
 */
export function boardScripts(problems: readonly string[], authored: Readonly<Record<string, Tries>> | undefined, explainable: (problem: string) => boolean, slips: (problem: string) => Tries, exception: string | null = null): Record<string, string[][]> {
  return Object.fromEntries(
    problems.map((p) => {
      const mine = authored?.[p];
      const can = explainable(p);
      return [p, mine && triesFitRule(p, mine, can, !can && exception === p) ? mine.map((lines) => [...lines]) : ruleTries(p, can, slips(p))];
    }),
  );
}

/** How fast a simulated group works, in seconds: from the start of a try to its check, and from a close to the next visit. */
export interface Pace {
  tryS: number;
  nextS: number;
}

/** A simulated group's board: who, which questions (the union, in set order), what each try writes, and the shuffle's seed. */
export interface SimulatedBoard {
  members: string[];
  problems: string[];
  scripts: Record<string, string[][]>;
  seed: number;
  /** Simulation only: fixed pens by problem (the demo group's `DEMO_PENS`, ticket 228). The simulated groups use the shuffle. */
  pens?: Record<string, string>;
}

interface TimedAction {
  at: number;
  action: BoardAction;
}

/** The whole run as timed board actions, from the moment the board opens: each try written and checked, each leave, each move on. */
export function playBoard(board: SimulatedBoard, pace: Pace, startedAt: number): TimedAction[] {
  let run = beginRun(board.members, board.problems, startedAt, board.seed, board.pens, board.scripts);
  const out: TimedAction[] = [];
  const apply = (at: number, action: BoardAction) => {
    run = groupReducer(run, action);
    out.push({ at, action });
  };
  let t = startedAt;
  // Every visit ends in a close or a leave; a board of n questions has at most 2n visits of at most LEAVE_AFTER_WRONG + 1 tries.
  for (let step = 0; step < board.problems.length * 2 * (LEAVE_AFTER_WRONG + 2) && !run.done; step++) {
    const visit = currentVisit(run);
    if (!visit) break;
    const tries = board.scripts[visit.problem] ?? [];
    const lines = tries[Math.min(attemptsOn(run, visit.problem).length, tries.length - 1)] ?? [];
    if (lines.length === 0) break;
    t += pace.tryS * 1000;
    for (const tex of lines) apply(t, { type: "group/line", tex });
    apply(t, { type: "group/check", at: t });
    if (isClosed(run, visit.problem)) {
      t += pace.nextS * 1000;
      apply(t, { type: "group/next", at: t });
    } else if (leaving(run)) {
      t += LEAVE_PAUSE_MS;
      apply(t, { type: "group/leave", index: run.index, at: t });
    }
  }
  return out;
}

/** A simulated group's run as it stands at `now`: everything its board has done by then. Before the board opens, the run as begun. */
export function simulatedRunAt(board: SimulatedBoard, pace: Pace, startedAt: number, now: number): GroupRun {
  let run = beginRun(board.members, board.problems, startedAt, board.seed, board.pens, board.scripts);
  for (const { at, action } of playBoard(board, pace, startedAt)) {
    if (at > now) break;
    run = groupReducer(run, action);
  }
  return run;
}

/** One visit to a question on a board: who wrote, whether it was the return, each check, and when the visit ended. */
export interface VisitTimeline {
  pen: string;
  returning: boolean;
  checks: { at: number; correct: boolean; lines: string[] }[];
  /** When the board left the question for now (the visit's third wrong check, then the pause); null otherwise. */
  leftAt: number | null;
  /** When the question closed on this visit: its correct check, or the wrong check on its return. */
  closedAt: number | null;
}

/** One question's story on a board so far. */
export interface QuestionTimeline {
  problem: string;
  visits: VisitTimeline[];
  /** Where it stands: not reached yet, being worked, left for now (its return still to come), solved (first visit or return), or unsolved. */
  status: "ahead" | "working" | "left" | "solved" | "unsolved";
  /** Solved on the return visit after being left for now. */
  solvedOnReturn: boolean;
}

/**
 * Every question of a run, in the board's order, as far as the run has got (ticket 332): each visit's checks with their
 * moments, when it was left for now, when it closed. Reads any run, the live one included (a live run records when it left
 * a question as its third wrong check plus `LEAVE_PAUSE_MS`, the moment the whiteboard leaves it).
 */
export function runTimeline(run: GroupRun): QuestionTimeline[] {
  const visits = visitsOf(run);
  return run.problems.map((problem) => {
    const attempts = attemptsOn(run, problem);
    const left = (run.left ?? []).includes(problem);
    const first = left ? attempts.slice(0, LEAVE_AFTER_WRONG) : attempts;
    const back = left ? attempts.slice(LEAVE_AFTER_WRONG) : [];
    const mine = visits.map((v, i) => ({ ...v, i })).filter((v) => v.problem === problem && v.i <= run.index);
    const closedAt = run.resolvedAt?.[problem] ?? run.unsolvedAt?.[problem] ?? null;
    const timeline: VisitTimeline[] = mine.map((v) => {
      const checks = (v.returning ? back : first).map((a) => ({ at: a.at ?? 0, correct: a.correct, lines: [...a.lines] }));
      const leftAt = !v.returning && left ? (checks.at(-1)?.at ?? 0) + LEAVE_PAUSE_MS : null;
      const closes = isClosed(run, problem) && (v.returning || !left);
      return { pen: v.pen, returning: v.returning, checks, leftAt, closedAt: closes ? closedAt : null };
    });
    const current = !run.done && currentVisit(run)?.problem === problem;
    const status: QuestionTimeline["status"] = run.resolved.includes(problem) ? "solved" : (run.unsolved ?? []).includes(problem) ? "unsolved" : current ? "working" : left ? "left" : "ahead";
    return { problem, visits: timeline, status, solvedOnReturn: left && run.resolved.includes(problem) };
  });
}
