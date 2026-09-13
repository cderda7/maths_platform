import type { Classmate } from "@/data/classmates";
import { DIFFICULTY_WEIGHT, STREAM_PACES, SUBMIT_AFTER_MS, type StreamPace } from "@/data/stream";
import { BEFORE_HAND_IN_STAGES, type Problem } from "@/data/types";
import { classmateProgress, type StudentProgress } from "./progress";
import type { StudentSession } from "./session";

/**
 * The live stream (ticket 189): Problem Set 6's classmates work through the set from the moment it
 * went live, one problem submission at a time, on the script in `data/stream.ts`. Everything here
 * is a pure function of the classmates' records, the set's problems, the start time and `now`, so a
 * reload continues where the stream was, every tab agrees, and a start an hour back (a presenter
 * skip) is the end state. See DECISION_LOG.md, 2026-09-13 (the live stream).
 *
 * A classmate's record (`data/classmates.ts`) is what they have handed in at the end; at a moment
 * before that the teacher sees the part of it they have answered (`recordAt`): the first `answered`
 * problems in assignment order, their wrong answers among them, and nothing of the rest.
 *
 * The stream runs while the class is on individual working. Once the live student has handed the
 * set in (on his own or through the teacher's force submit) the class is past working, and every
 * classmate who started has handed in what the script gives them (Jordan his Q1–Q7): the records
 * every later stage reads (group review, readiness, standings, class review) are the full ones.
 */

/** One classmate's timeline, in milliseconds after the set went live. */
export interface Schedule {
  id: string;
  /** False for a student who never starts (Chloe): no events at all. */
  starts: boolean;
  /** When the warm-up ends and the first problem begins; null without a warm-up. */
  warmUpEnd: number | null;
  /** When each answered problem was submitted, in assignment order: `answeredAt[i]` is problem i. */
  answeredAt: number[];
  /** When the set is handed in; null for a student who never does (Jordan) or never starts. */
  submitAt: number | null;
}

/** A student with no authored pace works at the class's average. */
const DEFAULT_PACE: StreamPace = { paceMs: 28_000 };

/**
 * A small, fixed nudge per student and problem in [0.85, 1.15], so no two students' events fall in step.
 * Deterministic: an FNV-1a hash of the id and index.
 */
export function jitter(id: string, index: number): number {
  let h = 0x811c9dc5;
  for (const ch of `${id}#${index}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return 0.85 + ((h % 1000) / 999) * 0.3;
}

export function scheduleFor(m: Pick<Classmate, "id" | "done">, problems: readonly Problem[], paces: Record<string, StreamPace> = STREAM_PACES): Schedule {
  const answers = Math.min(m.done, problems.length);
  if (answers <= 0) return { id: m.id, starts: false, warmUpEnd: null, answeredAt: [], submitAt: null };
  const pace = paces[m.id] ?? DEFAULT_PACE;
  let t = pace.warmUpMs ?? 0;
  const answeredAt = problems.slice(0, answers).map((p, i) => (t += i === 0 && pace.firstMs !== undefined ? pace.firstMs : Math.round(pace.paceMs * DIFFICULTY_WEIGHT[p.difficulty] * jitter(m.id, i))));
  const last = answeredAt[answeredAt.length - 1];
  const submitAt = pace.submitAtMs === null ? null : Math.max(pace.submitAtMs ?? 0, last + SUBMIT_AFTER_MS);
  return { id: m.id, starts: true, warmUpEnd: pace.warmUpMs ?? null, answeredAt, submitAt };
}

/** Where a classmate is at a moment: the shape `classmateProgress` names the row from. */
export interface StreamState {
  started: boolean;
  warmingUp: boolean;
  /** Problems submitted so far, in assignment order. */
  answered: number;
  submitted: boolean;
}

/** A schedule's state `elapsed` ms after the set went live (a negative elapsed is the start). */
export function stateAt(s: Schedule, elapsed: number): StreamState {
  if (!s.starts) return { started: false, warmingUp: false, answered: 0, submitted: false };
  const e = Math.max(0, elapsed);
  return {
    started: true,
    warmingUp: s.warmUpEnd !== null && e < s.warmUpEnd,
    answered: s.answeredAt.filter((t) => t <= e).length,
    submitted: s.submitAt !== null && e >= s.submitAt,
  };
}

/** The end of the stream: every student who hands in has, and the rest sit where they stop. */
export function finalState(s: Schedule): StreamState {
  return { started: s.starts, warmingUp: false, answered: s.answeredAt.length, submitted: s.submitAt !== null };
}

export type StreamEvent = { at: number; student: string } & ({ kind: "warmed-up" } | { kind: "answered"; problem: string; index: number } | { kind: "submitted" });

/** Every event of the stream in time order (ties in roster order): warm-ups ending, problems submitted, sets handed in. */
export function streamEvents(classmates: readonly Pick<Classmate, "id" | "done">[], problems: readonly Problem[]): StreamEvent[] {
  const events: StreamEvent[] = [];
  for (const m of classmates) {
    const s = scheduleFor(m, problems);
    if (s.warmUpEnd !== null) events.push({ at: s.warmUpEnd, student: m.id, kind: "warmed-up" });
    s.answeredAt.forEach((at, index) => events.push({ at, student: m.id, kind: "answered", problem: problems[index].id, index }));
    if (s.submitAt !== null) events.push({ at: s.submitAt, student: m.id, kind: "submitted" });
  }
  return events.sort((a, b) => a.at - b.at);
}

/** Milliseconds after going live at which the last event lands; from then on nothing changes until the class hands in. */
export const streamEndMs = (classmates: readonly Pick<Classmate, "id" | "done">[], problems: readonly Problem[]): number => Math.max(0, ...streamEvents(classmates, problems).map((e) => e.at));

/**
 * What the teacher sees of a classmate's record at a moment: all of it once handed in; before that
 * the answered problems only (`done`, their wrong answers, their working and the notes about them),
 * and no clarification (they write it after handing in).
 */
export function recordAt(m: Classmate, problems: readonly Problem[], st: StreamState): Classmate {
  if (st.submitted) return m;
  const reached = new Set(problems.slice(0, st.answered).map((p) => p.id));
  return {
    ...m,
    done: st.answered,
    wrong: m.wrong.filter((id) => reached.has(id)),
    attempts: Object.fromEntries(Object.entries(m.attempts).filter(([id]) => reached.has(id))),
    notes: m.notes.filter((n) => n.problems.some((id) => reached.has(id))),
    clarification: undefined,
  };
}

/** Whether the live student has handed the set in: the class is past individual working and the stream is over. */
export const streamOver = (session: StudentSession | null): boolean => !!session && !BEFORE_HAND_IN_STAGES.includes(session.stage);

/** A set as the stream reads it: its problems, its classmates, and when it went live (null or absent: a fixed set, no stream). */
export interface StreamSet {
  problems: readonly Problem[];
  classmates: readonly Classmate[];
  startedAt?: number | null;
}

export interface ClassmateNow {
  /** The part of the record the teacher sees now (`recordAt`); the whole record on a fixed set. */
  record: Classmate;
  progress: StudentProgress;
  state: StreamState;
  /**
   * When each problem's work reached the teacher, absolute ms by problem id; empty on a fixed set. An answered
   * problem at its submission; unfinished work handed in with the set (Liam's Q3, Ethan's and Harper's Q9: wrong,
   * past their answered count) at the hand-in.
   */
  answeredAt: Record<string, number>;
}

/**
 * Every classmate at `now`, in roster order. A fixed set (no `startedAt`) is its records as they are:
 * anyone with a problem done handed in. A live set runs the stream from `startedAt`, or is at its
 * end with everyone who started handed in once the live student has handed in.
 */
export function classmatesAt(set: StreamSet, session: StudentSession | null, now: number): ClassmateNow[] {
  const start = set.startedAt;
  if (start === null || start === undefined) {
    return set.classmates.map((m) => {
      const progress = classmateProgress(m, set.problems);
      const started = m.done > 0;
      return { record: m, progress, state: { started, warmingUp: false, answered: Math.min(m.done, set.problems.length), submitted: started }, answeredAt: {} };
    });
  }
  const over = streamOver(session);
  return set.classmates.map((m) => {
    const s = scheduleFor(m, set.problems);
    const final = finalState(s);
    const state = over ? { ...final, submitted: s.starts } : stateAt(s, now - start);
    const answeredAt: Record<string, number> = Object.fromEntries(s.answeredAt.map((t, i) => [set.problems[i].id, start + t]));
    const handIn = start + (s.submitAt ?? s.answeredAt[s.answeredAt.length - 1] ?? 0);
    for (const id of m.wrong) if (!(id in answeredAt)) answeredAt[id] = handIn;
    return { record: recordAt(m, set.problems, state), progress: classmateProgress(m, set.problems, state), state, answeredAt };
  });
}
