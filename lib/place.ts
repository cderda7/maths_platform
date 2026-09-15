import { DEMO_STUDENT } from "@/data/assignment";
import type { Classmate } from "@/data/classmates";
import { CHAT_TURN_MS, CONFIDENCE_CHECK_MS, CONFIDENCE_SHARE, HELP_STEP_AT, HINT_AT, STREAM_PACES, WARM_UP_STEP_SHARES, type StreamPace } from "@/data/stream";
import type { LeafId } from "@/data/taxonomy";
import { BEFORE_HAND_IN_STAGES, type Problem } from "@/data/types";
import { warmupStep, type StudentSession } from "./session";
import { scheduleFor, streamElapsed, streamOver, wallAt, type StreamSet } from "./stream";

/**
 * Where each student is in the lesson right now (ticket 314): the place (not started, confidence check, warm-up chat,
 * warm-up, a question, handed in, absent), the detail (the warm-up's skill; a hint or practice on a question), the step
 * of three for warm-up and practice, and when that step began. Ticket 315's "Where students are" column reads it, one
 * row per place in lesson order (`placeRows`).
 *
 * Sam's place comes from his session (`sessionPlace`); each classmate's from their stream script (`data/stream.ts`) as a
 * timeline of places (`classmateTimeline`) read at the stream's own clock, so like the stream it is a pure function of the
 * records, the start time and `now`: a reload continues, every tab agrees, a diagnostic chain stops the clock, and a
 * presenter skip lands on the end state. The places never move an answer or a hand-in: a classmate is on question i from
 * the moment their answer to question i − 1 lands (`scheduleFor`) until their answer to i, and hints and help fall
 * inside that time. No React. See DECISION_LOG.md, 2026-09-15 (where each student is, moment to moment).
 */

/** A step of three: warm-up (worked example, finishing the steps, on their own) and practice from a question (worked example, finishing the steps, back on the question). */
export type PlaceStep = 1 | 2 | 3;

/** What a student on a question is doing beyond working on it: a hint showing (the latest, 1 or 2), or practice on a skill at a step. */
export type QuestionDetail = { kind: "hint"; hint: 1 | 2 } | { kind: "practice"; leaf: LeafId; step: PlaceStep } | null;

export type Place =
  | { kind: "not-started" }
  | { kind: "confidence" }
  | { kind: "warmup-chat" }
  | { kind: "warmup"; leaf: LeafId; step: PlaceStep }
  | { kind: "question"; problem: string; label: string; detail: QuestionDetail }
  | { kind: "handed-in" }
  | { kind: "absent" };

export interface StudentPlace {
  id: string;
  place: Place;
  /** When the student reached this place and step (absolute ms), or null when it is not known (Sam's, until tickets 312 and 313 record step times). */
  since: number | null;
}

/** The steps' names, as the mockup's table has them. */
export const WARM_UP_STEP_NAMES = ["worked example", "finishing the steps", "on their own"] as const;
export const PRACTICE_STEP_NAMES = ["worked example", "finishing the steps", "back on the question"] as const;

/** The step of three a place is at: warm-up and practice have one, every other place none. */
export function placeStep(p: Place): PlaceStep | null {
  if (p.kind === "warmup") return p.step;
  if (p.kind === "question" && p.detail?.kind === "practice") return p.detail.step;
  return null;
}

/** A place as one string, equal exactly when the place, its detail and its step are: what "moved" means. */
export function placeKey(p: Place): string {
  switch (p.kind) {
    case "warmup":
      return `warmup:${p.leaf}:${p.step}`;
    case "question":
      return `question:${p.problem}${p.detail?.kind === "hint" ? `:hint:${p.detail.hint}` : p.detail?.kind === "practice" ? `:practice:${p.detail.leaf}:${p.detail.step}` : ""}`;
    default:
      return p.kind;
  }
}

// ── Sam, from his session ───────────────────────────────────────────────────────────────────────────────────────────

/**
 * Sam's place from his session, as the session stands today: before the set (overview, goal) not started; the confidence
 * check (with the warm-up offer); the warm-up chat; the warm-up pad on the current skill; the question on screen, with the
 * practice overlay's skill while it is open and "back on the question" after it until he moves to another question; handed
 * in once past working. The steps today: the warm-up's first problem is step 1 and its follow-up step 3; the overlay's first
 * problem step 1, its follow-up step 2. `since` is null except on the hand-in (the session keeps no step times yet).
 *
 * Tickets 312 (help from a question: Q*, Q**, back on Q) and 313 (the warm-up: example, completion, alone) change this
 * function: they record each step and when it began in the session and read them here.
 */
export function sessionPlace(session: StudentSession | null, problems: readonly Problem[]): { place: Place; since: number | null } {
  if (!session) return { place: { kind: "not-started" }, since: null };
  if (!BEFORE_HAND_IN_STAGES.includes(session.stage)) return { place: { kind: "handed-in" }, since: session.handedInAt || null };
  switch (session.stage) {
    case "overview":
    case "goal":
      return { place: { kind: "not-started" }, since: null };
    case "confidence":
      return { place: { kind: "confidence" }, since: null };
    case "warmup-chat":
      return { place: { kind: "warmup-chat" }, since: null };
    case "practice":
      return { place: { kind: "warmup", leaf: warmupStep(session).leaf, step: session.warmup.problem === "second" ? 3 : 1 }, since: null };
  }
  const index = Math.max(0, Math.min(session.problemIndex, problems.length - 1));
  const problem = problems[index];
  if (!problem) return { place: { kind: "not-started" }, since: null };
  const on = (detail: QuestionDetail): { place: Place; since: null } => ({ place: { kind: "question", problem: problem.id, label: problem.label, detail }, since: null });
  if (session.overlay) return on({ kind: "practice", leaf: session.overlay, step: session.overlayRun.problem === "second" ? 2 : 1 });
  const last = [...session.practices].reverse().find((p) => p.accepted);
  if (last && last.problem === problem.id) return on({ kind: "practice", leaf: last.leaf, step: 3 });
  return on(null);
}

/**
 * A place's `since` carried across reads, for a place that does not know its own (Sam's today): the same place as before
 * keeps the time it was first seen, a new place starts at `now`. A place that knows its time keeps it. Pure; the screen
 * holds the previous read.
 */
export function carrySince(prev: StudentPlace | undefined, next: StudentPlace, now: number): StudentPlace {
  if (next.since !== null) return next;
  if (prev && prev.id === next.id && placeKey(prev.place) === placeKey(next.place)) return { ...next, since: prev.since ?? now };
  return { ...next, since: now };
}

// ── A classmate, from the stream script ─────────────────────────────────────────────────────────────────────────────

/** A place from a moment on, in ms after the set went live on the stream's clock. */
export interface PlaceSegment {
  at: number;
  place: Place;
}

/**
 * A classmate's places in time order, from their record and stream script: the confidence check at 0; for a warm-up, the
 * chat (one turn per skill named, one for a student who named none) and each skill's three steps, all before `warmUpMs`;
 * each question from the answer before it to its own answer, with the script's hints and help at fixed fractions of that
 * time; the question after the last answer (Liam's Q5, Jordan's Q8) or the last question until the hand-in; handed in at
 * the hand-in. A student who never starts is not started throughout.
 */
export function classmateTimeline(m: Pick<Classmate, "id" | "done" | "confidence">, problems: readonly Problem[], paces: Record<string, StreamPace> = STREAM_PACES): PlaceSegment[] {
  const s = scheduleFor(m, problems, paces);
  if (!s.starts) return [{ at: 0, place: { kind: "not-started" } }];
  const pace = paces[m.id] ?? { paceMs: 0 };
  const out: PlaceSegment[] = [{ at: 0, place: { kind: "confidence" } }];
  const firstMove = s.warmUpEnd ?? s.answeredAt[0];
  let t = Math.min(CONFIDENCE_CHECK_MS, CONFIDENCE_SHARE * firstMove);
  const skills = s.warmUpEnd !== null ? (pace.warmUpSkills ?? []) : [];
  if (s.warmUpEnd !== null) {
    out.push({ at: t, place: { kind: "warmup-chat" } });
    const turns = m.confidence === "low" ? 1 : Math.max(1, skills.length);
    t += turns * CHAT_TURN_MS;
    const perSkill = skills.length ? (s.warmUpEnd - t) / skills.length : 0;
    skills.forEach((leaf, k) => {
      let at = t + k * perSkill;
      WARM_UP_STEP_SHARES.forEach((share, i) => {
        out.push({ at: Math.round(at), place: { kind: "warmup", leaf, step: (i + 1) as PlaceStep } });
        at += share * perSkill;
      });
    });
    t = s.warmUpEnd;
  }
  const question = (i: number, detail: QuestionDetail): Place => ({ kind: "question", problem: problems[i].id, label: problems[i].label, detail });
  s.answeredAt.forEach((end, i) => {
    const start = i === 0 ? t : s.answeredAt[i - 1];
    const span = end - start;
    const at = (f: number) => Math.round(start + f * span);
    out.push({ at: start, place: question(i, null) });
    const hints = pace.hints?.find((h) => h.problem === problems[i].id);
    if (hints) for (let h = 0; h < hints.count; h++) out.push({ at: at(HINT_AT[h]), place: question(i, { kind: "hint", hint: (h + 1) as 1 | 2 }) });
    const help = pace.help?.find((h) => h.problem === problems[i].id);
    if (help) HELP_STEP_AT.forEach((f, k) => out.push({ at: at(f), place: question(i, { kind: "practice", leaf: help.leaf, step: (k + 1) as PlaceStep }) }));
  });
  const answered = s.answeredAt.length;
  const last = s.answeredAt[answered - 1];
  // The next question once the last answer lands, until the hand-in; with every question answered the student stays on the last one (the look back).
  if (answered < problems.length) out.push({ at: last, place: question(answered, null) });
  if (s.submitAt !== null) out.push({ at: s.submitAt, place: { kind: "handed-in" } });
  return out.sort((a, b) => a.at - b.at);
}

/** The segment a timeline is in `elapsed` ms after the set went live (a negative elapsed is the start); the later of two at one moment. */
export function segmentAt(timeline: readonly PlaceSegment[], elapsed: number): PlaceSegment {
  const e = Math.max(0, elapsed);
  let cur = timeline[0];
  for (const seg of timeline) if (seg.at <= e) cur = seg;
  return cur;
}

// ── The class ───────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Every student's place at `now`, Sam first then the classmates in roster order (`rosterProgress`'s order). A set with no
 * start (a finished set) is its records: Sam and every classmate with a problem done handed in, the rest not started. A
 * live set reads Sam's session and runs the classmates' timelines on the stream's clock (diagnostic chains left out); once
 * Sam has handed in the class is past working and every classmate who started has handed in, no later than Sam did. An
 * absent student's place is absent, whatever else is known.
 */
export function classPlaces(set: StreamSet, session: StudentSession | null, now: number, absent: readonly string[] = []): StudentPlace[] {
  const start = set.startedAt;
  const away = (p: StudentPlace): StudentPlace => (absent.includes(p.id) ? { id: p.id, place: { kind: "absent" }, since: null } : p);
  if (start === null || start === undefined) {
    return [
      { id: DEMO_STUDENT.id, place: { kind: "handed-in" as const }, since: null },
      ...set.classmates.map((m): StudentPlace => ({ id: m.id, place: m.done > 0 ? { kind: "handed-in" } : { kind: "not-started" }, since: null })),
    ].map(away);
  }
  const pauses = set.pauses ?? [];
  const over = streamOver(session);
  const sam: StudentPlace = { id: DEMO_STUDENT.id, ...sessionPlace(session, set.problems) };
  const classmates = set.classmates.map((m): StudentPlace => {
    const timeline = classmateTimeline(m, set.problems);
    if (over) {
      const s = scheduleFor(m, set.problems);
      if (!s.starts) return { id: m.id, place: { kind: "not-started" }, since: null };
      const scheduled = wallAt(start, pauses, s.submitAt ?? s.answeredAt[s.answeredAt.length - 1], now);
      const handIn = session?.handedInAt ? Math.min(scheduled, session.handedInAt) : scheduled;
      return { id: m.id, place: { kind: "handed-in" }, since: Math.min(handIn, now) };
    }
    const seg = segmentAt(timeline, streamElapsed(start, pauses, now));
    return { id: m.id, place: seg.place, since: wallAt(start, pauses, seg.at, now) };
  });
  return [sam, ...classmates].map(away);
}

// ── Rows ────────────────────────────────────────────────────────────────────────────────────────────────────────────

/** A row of ticket 315's column: Starting, Warm-up, each question, Handed in. */
export interface PlaceRow {
  key: string;
  label: string;
  students: StudentPlace[];
}

/** The row a place sits in, or null for an absent student (named, in no row). */
export function rowKey(p: Place): string | null {
  switch (p.kind) {
    case "not-started":
    case "confidence":
      return "starting";
    case "warmup-chat":
    case "warmup":
      return "warm-up";
    case "question":
      return p.problem;
    case "handed-in":
      return "handed-in";
    case "absent":
      return null;
  }
}

/**
 * The rows in lesson order (Starting, Warm-up, Q1 … Q10, Handed in), every row present even when empty so rows never
 * reorder, each holding its students in the order given; and the absent students, in no row.
 */
export function placeRows(places: readonly StudentPlace[], problems: readonly Pick<Problem, "id" | "label">[]): { rows: PlaceRow[]; absent: StudentPlace[] } {
  const rows: PlaceRow[] = [{ key: "starting", label: "Starting", students: [] }, { key: "warm-up", label: "Warm-up", students: [] }, ...problems.map((p) => ({ key: p.id, label: p.label, students: [] })), { key: "handed-in", label: "Handed in", students: [] }];
  const absent: StudentPlace[] = [];
  for (const sp of places) {
    const key = rowKey(sp.place);
    const row = key === null ? undefined : rows.find((r) => r.key === key);
    if (row) row.students.push(sp);
    else absent.push(sp);
  }
  return { rows, absent };
}
