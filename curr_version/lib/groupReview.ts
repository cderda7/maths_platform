import { DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP } from "@/data/classmates";
import { GROUP_SCRIPTS } from "@/data/group-scripts";
import type { Stroke } from "@/data/types";
import { evaluateLine } from "./evaluate";
import type { LineMark } from "./examples";
import { scribble } from "./synthetic-ink";

/**
 * Group review on one shared whiteboard. The group works the union of its members' mistakes,
 * one problem at a time; one member holds the pen per problem, drawn by a shuffle that
 * reshuffles when it runs out; only the pen-holder checks. A wrong check is shown up to the
 * first mistake, the rest hidden as a count; "we're stuck" reveals everyone's earlier work the
 * same way. Pure rules over the run the classroom keeps.
 */
export interface Attempt {
  lines: string[];
  correct: boolean;
}

export interface GroupRun {
  members: string[];
  /** The union of the members' mistakes, in set order. */
  problems: string[];
  /** Who holds the pen for each problem. */
  pen: Record<string, string>;
  index: number;
  /** The live board and its (hidden) transcription for the current attempt. */
  strokes: Stroke[];
  lines: string[];
  attempts: Record<string, Attempt[]>;
  /** Problems where "we're stuck" was pressed. */
  stuck: string[];
  /** Problems whose rework has checked correct, in order. */
  resolved: string[];
  turnStartedAt: number;
  /** How many scripted events of a peer's turn have been applied (idempotent replay). */
  scriptDone: number;
  done: boolean;
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

/** Pen per problem: a shuffle of the members, reshuffled each time it runs out, so nobody writes twice before everyone has once. */
export function penOrder(problems: string[], members: string[], seed: number): Record<string, string> {
  const pen: Record<string, string> = {};
  let queue: string[] = [];
  let round = 0;
  for (const p of problems) {
    if (queue.length === 0) queue = shuffle(members, seed + round++ * 7919);
    pen[p] = queue.shift()!;
  }
  return pen;
}

/** The seed that deals the demo's agreed order (Sam, Zara, Jordan, Liam, then Sam, Zara). */
export const DEMO_SEED = 1368;

export function beginRun(members: string[], problems: string[], at: number, seed = DEMO_SEED): GroupRun {
  return { members, problems, pen: penOrder(problems, members, seed), index: 0, strokes: [], lines: [], attempts: {}, stuck: [], resolved: [], turnStartedAt: at, scriptDone: 0, done: false };
}

export const currentProblem = (run: GroupRun): string | undefined => run.problems[run.index];
export const penHolder = (run: GroupRun): string | undefined => run.pen[currentProblem(run) ?? ""];
export const attemptsOn = (run: GroupRun, problem = currentProblem(run) ?? ""): Attempt[] => run.attempts[problem] ?? [];
export const lastAttempt = (run: GroupRun): Attempt | undefined => attemptsOn(run).at(-1);
export const resolvedCurrent = (run: GroupRun): boolean => run.resolved.includes(currentProblem(run) ?? "");

/** Every known line judged; the final line decides. A line the table does not know is neither right nor wrong. */
export function checkBoard(problem: string, lines: string[]): { correct: boolean; cut: number } {
  const verdicts = lines.map((tex) => evaluateLine(problem, tex).verdict);
  const cut = verdicts.indexOf("wrong");
  const last = verdicts.at(-1);
  return { correct: lines.length > 0 && cut < 0 && last === "ok", cut };
}

export interface CutView {
  /** Lines up to and including the first mistake, marked. */
  shown: { tex: string; mark: LineMark }[];
  /** Lines after it, not shown. */
  hidden: number;
}

/** The first-mistake rule: everything up to the first wrong line, that line red, the rest a count. A clean attempt shows whole, unmarked. */
export function cutAtFirstMistake(problem: string, lines: string[]): CutView {
  const cut = lines.findIndex((tex) => evaluateLine(problem, tex).verdict === "wrong");
  if (cut < 0) return { shown: lines.map((tex) => ({ tex, mark: null })), hidden: 0 };
  return { shown: lines.slice(0, cut + 1).map((tex, i) => ({ tex, mark: i === cut ? "wrong" : null })), hidden: lines.length - cut - 1 };
}

/** A member's earlier versions of a problem: the demo student's from the session, a classmate's from the fixture (their slip, or the model solution). */
export interface EarlierVersions {
  id: string;
  name: string;
  versions: { label: string; view: CutView }[];
}

export function earlierVersions(run: GroupRun, problem: string, own: { lines: string[]; rework: string[] }, solution: string[]): EarlierVersions[] {
  return run.members.map((id) => {
    if (id === DEMO_STUDENT.id) {
      const versions = [{ label: "Handed in", view: cutAtFirstMistake(problem, own.lines) }];
      if (own.rework.length > 0) versions.push({ label: "Reworked", view: cutAtFirstMistake(problem, own.rework) });
      return { id, name: "You", versions };
    }
    const c = CLASSMATE_MAP[id];
    const lines = c.attempts[problem] ?? (c.wrong.includes(problem) ? [] : solution);
    return { id, name: c.name.split(" ")[0], versions: [{ label: "Handed in", view: cutAtFirstMistake(problem, lines) }] };
  });
}

/** Progress toward resolving the union: members' original mistakes on resolved problems over all of them. */
export function groupProgress(run: GroupRun, wrongSets: Record<string, string[]>): { resolved: number; total: number; percent: number } {
  const count = (problems: string[]) => run.members.reduce((n, id) => n + (wrongSets[id] ?? []).filter((p) => problems.includes(p)).length, 0);
  const total = count(run.problems);
  const resolved = count(run.resolved);
  return { resolved, total, percent: total === 0 ? 100 : Math.round((resolved / total) * 100) };
}

/* ---------- a peer's scripted turn ---------- */

export type TurnEvent = { at: number; kind: "stroke"; stroke: Stroke } | { at: number; kind: "line"; tex: string } | { at: number; kind: "check" } | { at: number; kind: "stuck" };

/**
 * What happens, and when (ms after the turn starts), while a peer holds the pen: each line of
 * an attempt scribbles itself over a couple of seconds and is read at the end of it, then the
 * peer checks; after a wrong check a pause, "we're stuck" if the script says so, another pause,
 * then the next attempt. The demo student's own turns have no script.
 */
export function turnScript(problem: string): TurnEvent[] {
  const script = GROUP_SCRIPTS[problem];
  if (!script) return [];
  const events: TurnEvent[] = [];
  let t = 1200;
  script.attempts.forEach((lines, a) => {
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
    if (a < script.attempts.length - 1) {
      t += 3500;
      if (script.stuckAfter === a) {
        events.push({ at: t, kind: "stuck" });
        t += 7000;
      }
    }
  });
  return events;
}

/** The pad's recognition script for the demo student's own turn: the lines of attempt `n`. */
export function ownAttemptScript(problem: string, n: number): string[] {
  return GROUP_SCRIPTS[problem]?.attempts[Math.min(n, (GROUP_SCRIPTS[problem]?.attempts.length ?? 1) - 1)] ?? [];
}
