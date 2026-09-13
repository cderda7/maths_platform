import { GROUP_SCRIPTS } from "@/data/group-scripts";
import type { Hint, Stroke } from "@/data/types";
import { evaluateLine } from "./evaluate";
import type { LineMark } from "./examples";
import { scribble } from "./synthetic-ink";

/**
 * Group review on one shared whiteboard. The group works the union of its members' mistakes,
 * one problem at a time; one member holds the pen per visit, drawn by a shuffle that
 * reshuffles when it runs out; only the pen-holder checks. A wrong check is shown whole with its
 * first mistake red, and wipes the board (ticket 235). A problem that will not come climbs a ladder
 * (tickets 221, 222): a hint from the second wrong check, left for now at the third, and one
 * more visit with the next pen after the rest of the union; wrong again there, it closes unsolved.
 * Pure rules over the run the classroom keeps.
 */
export interface Attempt {
  lines: string[];
  correct: boolean;
  /** When it was checked (ms since epoch); a run stored before the ladder has none. */
  at?: number;
}

export interface GroupRun {
  members: string[];
  /** The union of the members' mistakes, in set order. */
  problems: string[];
  /** Who holds the pen for each problem's first visit. */
  pen: Record<string, string>;
  /** The current visit: the union in order, then a return to each problem left for now (`visitsOf`). */
  index: number;
  /** The live board and its (hidden) transcription for the current attempt. */
  strokes: Stroke[];
  lines: string[];
  attempts: Record<string, Attempt[]>;
  /** Problems whose rework has checked correct, in order. */
  resolved: string[];
  /** Problems left for now after `LEAVE_AFTER_WRONG` wrong checks, in the order left: each gets one return visit after the union (ticket 222). */
  left?: string[];
  /** Problems closed without a correct check: still wrong on their return visit (ticket 222). */
  unsolved?: string[];
  /** When each unsolved problem closed (ms since epoch). */
  unsolvedAt?: Record<string, number>;
  /** How many attempts the current problem had when this visit began: where a peer's script picks up. */
  turnFrom?: number;
  /** The shuffle's seed, which also deals the pen for return visits; a run stored without one used the demo's. */
  seed?: number;
  /**
   * Simulation only (ticket 228): fixed pens by problem, for its first visit and its return alike,
   * so the presenter writes the problems they want to pace. The rule is the shuffle (`dealPens`):
   * equitable and random, nobody writing twice before everyone has once. A real run never sets this.
   */
  pens?: Record<string, string>;
  /** When each resolved problem checked correct (ms since epoch): the standings' tie-break. */
  resolvedAt?: Record<string, number>;
  /** When group review began for this group (ms since epoch); the other groups' race runs from here. */
  startedAt?: number;
  turnStartedAt: number;
  /** How many scripted events of a peer's turn have been applied (idempotent replay). */
  scriptDone: number;
  done: boolean;
  /** When the teacher ended group review with problems still open (ms since epoch): the scripted race holds here. */
  endedAt?: number;
}

/** A seeded Fisher–Yates, so the demo's pen order is stable. */
export function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed >>> 0 || 1;
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The first `n` pens dealt: a shuffle of the members, reshuffled each time it runs out, so nobody writes twice before everyone has once. */
export function dealPens(n: number, members: string[], seed: number): string[] {
  const out: string[] = [];
  let queue: string[] = [];
  let round = 0;
  for (let i = 0; i < n; i++) {
    if (queue.length === 0) queue = shuffle(members, seed + round++ * 7919);
    out.push(queue.shift()!);
  }
  return out;
}

/** Pen per problem for the first pass through the union. */
export function penOrder(problems: string[], members: string[], seed: number): Record<string, string> {
  const deal = dealPens(problems.length, members, seed);
  return Object.fromEntries(problems.map((p, i) => [p, deal[i]]));
}

/** The seed that deals the demo's agreed order (Sam, Zara, Jordan, Liam, then Sam, Zara, and Jordan for a return). */
export const DEMO_SEED = 1368;

export function beginRun(members: string[], problems: string[], at: number, seed = DEMO_SEED, pens?: Record<string, string>): GroupRun {
  // The simulation's fixed pens, only for problems on the board and members of the group.
  const pinned = pens ? Object.fromEntries(Object.entries(pens).filter(([p, m]) => problems.includes(p) && members.includes(m))) : undefined;
  const dealt = penOrder(problems, members, seed);
  return { members, problems, pen: { ...dealt, ...pinned }, index: 0, strokes: [], lines: [], attempts: {}, resolved: [], resolvedAt: {}, startedAt: at, turnStartedAt: at, scriptDone: 0, done: false, seed, ...(pinned ? { pens: pinned } : {}) };
}

/** When the run began; a run stored before `startedAt` existed began with its first turn. */
export const runStartedAt = (run: GroupRun): number => run.startedAt ?? run.turnStartedAt;
/** When a resolved problem checked correct; a run stored before the moments were kept counts from its start. */
export const resolvedMoment = (run: GroupRun, problem: string): number => run.resolvedAt?.[problem] ?? runStartedAt(run);

/** One turn on the board: a problem, who holds the pen, and whether it is the return to a problem left for now. */
export interface Visit {
  problem: string;
  pen: string;
  returning: boolean;
}

/** The board's itinerary: the union once in order, then one return to each problem left for now, with the pens the deal gives next. */
export function visitsOf(run: GroupRun): Visit[] {
  const first = run.problems.map((problem) => ({ problem, pen: run.pen[problem], returning: false }));
  const left = run.left ?? [];
  if (left.length === 0) return first;
  const deal = dealPens(run.problems.length + left.length, run.members, run.seed ?? DEMO_SEED);
  return [...first, ...left.map((problem, i) => ({ problem, pen: run.pens?.[problem] ?? deal[run.problems.length + i], returning: true }))];
}

export const currentVisit = (run: GroupRun): Visit | undefined => visitsOf(run)[run.index];
export const currentProblem = (run: GroupRun): string | undefined => currentVisit(run)?.problem;
export const penHolder = (run: GroupRun): string | undefined => currentVisit(run)?.pen;
export const attemptsOn = (run: GroupRun, problem = currentProblem(run) ?? ""): Attempt[] => run.attempts[problem] ?? [];
export const lastAttempt = (run: GroupRun): Attempt | undefined => attemptsOn(run).at(-1);
export const resolvedCurrent = (run: GroupRun): boolean => run.resolved.includes(currentProblem(run) ?? "");

/** A problem is closed once it checks correct or closes unsolved; the board has finished with it either way. */
export const isUnsolved = (run: GroupRun, problem: string): boolean => (run.unsolved ?? []).includes(problem);
export const isClosed = (run: GroupRun, problem: string): boolean => run.resolved.includes(problem) || isUnsolved(run, problem);
export const closedCurrent = (run: GroupRun): boolean => isClosed(run, currentProblem(run) ?? "");
/** When a closed problem closed: its correct check, or the wrong check on its return. */
export const closedMoment = (run: GroupRun, problem: string): number => run.resolvedAt?.[problem] ?? run.unsolvedAt?.[problem] ?? runStartedAt(run);
/** Every closed problem, in the order it closed. */
export const closedInOrder = (run: GroupRun): string[] =>
  [...run.resolved, ...(run.unsolved ?? [])].map((p, i) => ({ p, i, at: closedMoment(run, p) })).sort((a, b) => a.at - b.at || a.i - b.i).map((x) => x.p);
/** Who wrote a problem's last visit: the correct check's pen, or the return's for an unsolved one. */
export const writerOf = (run: GroupRun, problem: string): string | undefined => visitsOf(run).filter((v) => v.problem === problem).at(-1)?.pen;
/**
 * The problems the group could not get, for the teacher (ticket 223): each left for now (its return
 * still to come) or closed unsolved, with how many times it has been checked. In the order they were left.
 */
export function stuckProblems(run: GroupRun): { problem: string; tries: number; status: "left" | "unsolved" }[] {
  return (run.left ?? [])
    .filter((p) => !run.resolved.includes(p))
    .map((problem) => ({ problem, tries: attemptsOn(run, problem).length, status: isUnsolved(run, problem) ? ("unsolved" as const) : ("left" as const) }));
}

/** Problems left for now whose return is still ahead of the board. */
export const comingBack = (run: GroupRun): string[] => visitsOf(run).slice(run.index + 1).filter((v) => v.returning).map((v) => v.problem);

/** Every known line judged; the final line decides. A line the table does not know is neither right nor wrong. */
export function checkBoard(problem: string, lines: string[]): { correct: boolean; cut: number } {
  const verdicts = lines.map((tex) => evaluateLine(problem, tex).verdict);
  const cut = verdicts.indexOf("wrong");
  const last = verdicts.at(-1);
  return { correct: lines.length > 0 && cut < 0 && last === "ok", cut };
}

export interface MarkedLine {
  tex: string;
  mark: LineMark;
}

/** The first-mistake rule: every line of the attempt, the first wrong one red (ticket 235: none hidden). A clean attempt shows unmarked. */
export function markFirstMistake(problem: string, lines: string[]): MarkedLine[] {
  const cut = lines.findIndex((tex) => evaluateLine(problem, tex).verdict === "wrong");
  return lines.map((tex, i) => ({ tex, mark: i === cut ? "wrong" : null }));
}

/** How many times the group's check on a problem has come back wrong. */
export const wrongChecks = (run: GroupRun, problem: string): number => attemptsOn(run, problem).filter((a) => !a.correct).length;

/** A problem that has checked wrong this many times shows the group a hint (ticket 221). */
export const HINT_AFTER_WRONG = 2;
/** At this many wrong checks on its first visit a problem is left for now (ticket 222). */
export const LEAVE_AFTER_WRONG = 3;
/** How long the board holds the last wrong check before it moves on, so the group reads it. */
export const LEAVE_PAUSE_MS = 6_000;

/** How long the "Try again" pill lives: it pops in mid-screen, pulses once and fades (ticket 238). */
export const TRY_AGAIN_MS = 1_600;
/** The hint's one purple ring, which starts as the second check's pill fades (ticket 238). */
export const HINT_RING_MS = 900;

/**
 * The moment of a wrong check the board goes on from, which pops "Try again" on every member's iPad
 * (ticket 238): a first visit's first or second wrong check. Not the third (the board leaves the
 * problem for now) nor a wrong return (it closes unsolved). Null otherwise, and for a run stored without the moment.
 */
export function tryAgainAt(run: GroupRun): number | null {
  const visit = currentVisit(run);
  if (!visit || visit.returning || isClosed(run, visit.problem)) return null;
  const last = attemptsOn(run, visit.problem).at(-1);
  if (!last || last.correct || last.at === undefined) return null;
  return wrongChecks(run, visit.problem) < LEAVE_AFTER_WRONG ? last.at : null;
}
/** The pill is still up: within `TRY_AGAIN_MS` of its check, so a reload later never pops it again. */
export function tryAgainShowing(run: GroupRun, now: number): boolean {
  const at = tryAgainAt(run);
  return at !== null && now < at + TRY_AGAIN_MS;
}
/** When the hint's ring starts: the second wrong check's pill gone, the hint that check brought in. Null on any other check. */
export function hintRingAt(run: GroupRun): number | null {
  const at = tryAgainAt(run);
  return at !== null && wrongChecks(run, currentProblem(run) ?? "") === HINT_AFTER_WRONG ? at + TRY_AGAIN_MS : null;
}

/** The board is holding a third wrong check before leaving the problem for now: nothing more is written on this visit. */
export function leaving(run: GroupRun): boolean {
  const visit = currentVisit(run);
  if (!visit || visit.returning || isClosed(run, visit.problem)) return false;
  const last = attemptsOn(run, visit.problem).at(-1);
  return !!last && !last.correct && wrongChecks(run, visit.problem) >= LEAVE_AFTER_WRONG;
}
/** When the board leaves: the pause after the wrong check. */
export const leaveAt = (run: GroupRun): number => (lastAttempt(run)?.at ?? run.turnStartedAt) + LEAVE_PAUSE_MS;

/**
 * The hint on the board: once the current problem, still unresolved, has checked wrong
 * `HINT_AFTER_WRONG` times, the evaluation table's clue for the first wrong line of the latest
 * attempt, a sentence that names the move without carrying it out. Null otherwise.
 */
export function boardHint(run: GroupRun): Hint | null {
  const problem = currentProblem(run);
  if (!problem || closedCurrent(run) || wrongChecks(run, problem) < HINT_AFTER_WRONG) return null;
  for (const tex of lastAttempt(run)?.lines ?? []) {
    const v = evaluateLine(problem, tex);
    if (v.verdict === "wrong") return v.clue ? { text: v.clue } : null;
  }
  return null;
}

/** Progress through the union: members' original mistakes on closed problems (resolved, or unsolved after the return: ticket 222) over all of them. */
export function groupProgress(run: GroupRun, wrongSets: Record<string, string[]>): { resolved: number; total: number; percent: number } {
  const count = (problems: string[]) => run.members.reduce((n, id) => n + (wrongSets[id] ?? []).filter((p) => problems.includes(p)).length, 0);
  const total = count(run.problems);
  const resolved = count([...run.resolved, ...(run.unsolved ?? [])]);
  return { resolved, total, percent: total === 0 ? 100 : Math.round((resolved / total) * 100) };
}

/* ---------- a peer's scripted turn ---------- */

export type TurnEvent = { at: number; kind: "stroke"; stroke: Stroke } | { at: number; kind: "line"; tex: string } | { at: number; kind: "check" } | { at: number; kind: "clear" };

/**
 * What happens, and when (ms after the turn starts), while a peer holds the pen: each line of
 * an attempt scribbles itself over a couple of seconds and is read at the end of it, then the
 * peer checks; after a wrong check a pause, then the peer clears the board and writes the next
 * attempt on it (so a second try never scribbles over the first). A visit's script starts at
 * attempt `from` (the attempts made on earlier visits) and stops after the check that ends the
 * visit: a correct one, the one that leaves the problem for now, or any on a return. The demo
 * student's own turns have no script.
 */
export function turnScript(problem: string, from = 0, returning = false): TurnEvent[] {
  const script = GROUP_SCRIPTS[problem];
  if (!script) return [];
  const events: TurnEvent[] = [];
  let t = 1200;
  let wrong = script.attempts.slice(0, from).filter((lines) => !checkBoard(problem, lines).correct).length;
  for (let a = from; a < script.attempts.length; a++) {
    const lines = script.attempts[a];
    if (a > from) events.push({ at: t, kind: "clear" });
    lines.forEach((tex, row) => {
      const strokes = scribble(tex, row);
      const per = Math.max(350, Math.round(2200 / strokes.length));
      for (const stroke of strokes) {
        t += per;
        events.push({ at: t, kind: "stroke", stroke });
      }
      t += 300;
      events.push({ at: t, kind: "line", tex });
    });
    t += 1500;
    events.push({ at: t, kind: "check" });
    const correct = checkBoard(problem, lines).correct;
    if (!correct) wrong++;
    if (correct || returning || wrong >= LEAVE_AFTER_WRONG) break;
    t += 3500;
  }
  return events;
}

/** The pad's recognition script for the demo student's own turn: the lines of attempt `n`. */
export function ownAttemptScript(problem: string, n: number): string[] {
  return GROUP_SCRIPTS[problem]?.attempts[Math.min(n, (GROUP_SCRIPTS[problem]?.attempts.length ?? 1) - 1)] ?? [];
}
