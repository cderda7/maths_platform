import { DEMO_STUDENT } from "@/data/assignment";
import type { Classmate } from "@/data/classmates";
import { leafName } from "@/data/taxonomy";
import type { Problem } from "@/data/types";
import { carrySince, classmateTimeline, placeKey, placeRows, placeStep, rowKey, type Place, type PlaceStep, type StudentPlace } from "./place";
import type { StudentSession } from "./session";
import { streamElapsed, streamOver, wallAt, type StreamSet } from "./stream";

/**
 * The Mistakes tab's "Where students are" column during individual working (ticket 315), as data the screen draws: a row
 * per place in lesson order (`placeRows`, ticket 314), each row a label and its students' pills, and the absent named
 * under Handed in. A pill is a student's avatar and name, the detail in muted words (the warm-up's skill, a hint, practice
 * on a skill, back on the question), the step of three for warm-up and practice, the time on that step, and a tone (warm-up
 * accent, practice standout blue, the rest plain). Inside a row the pills stand in the order the students came into it, so
 * a student arriving joins the end and nobody already there moves. No React.
 *
 * The rows are the frame's left content (`StageSplit`), so a later stage (tickets 318–320, the review modes) supplies its
 * own `WhereRow`s and the same pills. See DECISION_LOG.md, 2026-09-15 (Where students are beside the mistakes).
 */

export type PillTone = "warmup" | "practice" | "plain";

export interface WherePill {
  id: string;
  name: string;
  initials: string;
  /** What the student is doing inside the row, in muted words; null when the row says it all (on a question, handed in). */
  detail: string | null;
  tone: PillTone;
  /** The step of three for warm-up and practice, else null. */
  step: PlaceStep | null;
  /** The time on this step ("40 s", "6 min"), or null when not known. */
  time: string | null;
  /** When the student came into this row (absolute ms), or null when not known: the pill's landing glow counts from it. */
  arrivedAt: number | null;
}

export interface WhereRow {
  key: string;
  label: string;
  /** A second line under the label, muted ("check-in"), or null. */
  sub: string | null;
  pills: WherePill[];
  /** Students named in this row in muted text, not as pills: the absent, under Handed in. */
  absent: { id: string; name: string }[];
}

/** A student's place as the column holds it: the place, when its step began, and when the student came into its row. */
export interface SeenPlace extends StudentPlace {
  entered: number | null;
}

/**
 * The time on a step, one formatter for every pill: seconds under a minute ("40 s"), whole minutes from one minute
 * ("6 min"). A step a whole set runs through in about seven minutes mostly lasts seconds, so minutes alone would read 0.
 * Never negative (a clock a tab behind another's).
 */
export function stepTime(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min`;
}

/** The muted words after a name: what the student is doing in their row; null where the row's label says it all. */
export function placeDetail(p: Place): string | null {
  switch (p.kind) {
    case "not-started":
      return "not started";
    case "confidence":
      return null;
    case "warmup-chat":
      return "chat";
    case "warmup":
      return leafName(p.leaf).short;
    case "question":
      if (p.detail?.kind === "hint") return `hint ${p.detail.hint}`;
      if (p.detail?.kind === "practice") return p.detail.step === 3 ? `back on ${p.label}` : `practice · ${leafName(p.detail.leaf).short}`;
      return null;
    case "handed-in":
    case "absent":
      return null;
  }
}

/** Warm-up (its chat and its steps) is tinted accent, practice from a question standout blue, everything else plain. */
export function placeTone(p: Place): PillTone {
  if (p.kind === "warmup" || p.kind === "warmup-chat") return "warmup";
  if (p.kind === "question" && p.detail?.kind === "practice") return "practice";
  return "plain";
}

const SUB: Readonly<Record<string, string>> = { starting: "check-in", "warm-up": "3 steps each" };

/**
 * When each classmate came into the row they are in at `now`, from their timeline on the stream's clock: the first of the
 * run of places up to now that share the row (a hint or a practice step keeps the student in the question's row). Empty for
 * a set with no stream and once the stream is over (a hand-in's own time is its row's).
 */
export function classmatesEntered(set: StreamSet, session: StudentSession | null, now: number): Record<string, number> {
  const start = set.startedAt;
  if (start === null || start === undefined || streamOver(session)) return {};
  const pauses = set.pauses ?? [];
  const elapsed = Math.max(0, streamElapsed(start, pauses, now));
  const out: Record<string, number> = {};
  for (const m of set.classmates) {
    const timeline = classmateTimeline(m, set.problems);
    let i = 0;
    timeline.forEach((seg, k) => {
      if (seg.at <= elapsed) i = k;
    });
    const row = rowKey(timeline[i].place);
    while (i > 0 && rowKey(timeline[i - 1].place) === row) i--;
    out[m.id] = wallAt(start, pauses, timeline[i].at, now);
  }
  return out;
}

/**
 * The class's places as the column holds them, carried from the previous read: a place with no time of its own (Sam's
 * today) keeps the moment it was first seen (`carrySince`), and a student's row entry is the classmate's own (`entered`),
 * else carried while the row is the same, else the step's time. Returns `prev` itself when nothing changed, so a screen
 * holding it re-renders only on a move.
 */
export function carryPlaces(prev: readonly SeenPlace[], next: readonly StudentPlace[], now: number, entered: Readonly<Record<string, number>> = {}): readonly SeenPlace[] {
  const carried = next.map((n): SeenPlace => {
    const before = prev.find((p) => p.id === n.id);
    const place = carrySince(before, n, now);
    const sameRow = !!before && rowKey(before.place) === rowKey(n.place);
    return { ...place, entered: entered[n.id] ?? (sameRow ? (before.entered ?? place.since) : place.since) };
  });
  const same = carried.length === prev.length && carried.every((c, i) => c.id === prev[i].id && c.since === prev[i].since && c.entered === prev[i].entered && placeKey(c.place) === placeKey(prev[i].place));
  return same ? prev : carried;
}

/** A run of neighbouring question rows with nobody in them, as the one row they fold into when the column would not otherwise fit. */
export interface EmptyRun {
  /** The first and last rows' keys. */
  from: string;
  to: string;
  /** "Q7–Q10". */
  label: string;
  keys: string[];
}

/**
 * Every run of two or more neighbouring question rows (not Starting, Warm-up or Handed in) with nobody in them. Only empty
 * rows fold, so a folded row holds no pill and every pill stays in its own question's row.
 */
export function emptyQuestionRuns(rows: readonly WhereRow[]): EmptyRun[] {
  const out: EmptyRun[] = [];
  let run: WhereRow[] = [];
  const close = () => {
    if (run.length >= 2) out.push({ from: run[0].key, to: run[run.length - 1].key, label: `${run[0].label}–${run[run.length - 1].label}`, keys: run.map((r) => r.key) });
    run = [];
  };
  for (const r of rows) {
    const question = !(r.key in SUB) && r.key !== "handed-in";
    if (question && r.pills.length === 0 && r.absent.length === 0) run.push(r);
    else close();
  }
  close();
  return out;
}

/**
 * The rows to draw at `now`: every row of `placeRows` in lesson order (none ever dropped or reordered), each row's students
 * as pills in the order they came into it (ties and unknowns in the order given: Sam, then the roster), the absent named in
 * the Handed in row. A name comes from the roster (Sam from the demo student); the time on a step is `now − since`, none
 * when `since` is unknown.
 */
export function whereRows(places: readonly (StudentPlace & { entered?: number | null })[], problems: readonly Pick<Problem, "id" | "label">[], classmates: readonly Pick<Classmate, "id" | "name" | "initials">[], now: number): WhereRow[] {
  const person = (id: string) => (id === DEMO_STUDENT.id ? DEMO_STUDENT : (classmates.find((m) => m.id === id) ?? { id, name: id, initials: id.slice(0, 2).toUpperCase() }));
  const order = new Map(places.map((p, i) => [p.id, i]));
  const { rows, absent } = placeRows(places, problems);
  const enteredOf = (sp: StudentPlace & { entered?: number | null }) => sp.entered ?? sp.since;
  return rows.map((r) => ({
    key: r.key,
    label: r.label,
    sub: SUB[r.key] ?? null,
    pills: [...r.students]
      .sort((a, b) => (enteredOf(a) ?? Infinity) - (enteredOf(b) ?? Infinity) || order.get(a.id)! - order.get(b.id)!)
      .map((sp): WherePill => {
        const { name, initials } = person(sp.id);
        return { id: sp.id, name, initials, detail: placeDetail(sp.place), tone: placeTone(sp.place), step: placeStep(sp.place), time: sp.since === null ? null : stepTime(now - sp.since), arrivedAt: enteredOf(sp) };
      }),
    absent: r.key === "handed-in" ? absent.map((a) => ({ id: a.id, name: person(a.id).name })) : [],
  }));
}
