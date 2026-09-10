import type { Pathway, Stroke } from "@/data/types";
import { DEFAULT_GROUPS, type GroupColour, type SeatingGroups } from "@/data/groups";
import { moveStudent, seatingOf } from "./seating";
import type { ExampleRef } from "./examples";
import { DEFAULT_PATHWAY } from "./pathway";

/**
 * Teacher-owned state shared by every tab: the created assignment and, from later tickets, the
 * pending class advance and the whole-class session. Separate from the student session because
 * the writer and the lifetime differ (the teacher writes once per lesson; the student on every
 * stroke). Pure data plus a reducer, mirrored across tabs by `classroom-store.ts`.
 */
export interface CreatedAssignment {
  title: string;
  /** Ordered ids from the problem bank. */
  problemIds: string[];
  pathway: Pathway;
  /** The confirmed QCAA unit for Unit Focus. */
  unit: 1 | 2 | 3 | 4;
  createdAt: number;
}

/** A teacher-driven move of the whole class, applied by every student tab when the deadline passes. */
export type AdvanceKind = "force-submit" | "whole-class-start";
export interface PendingAdvance {
  id: string;
  kind: AdvanceKind;
  /** ms since epoch; the grace runs until then. */
  deadline: number;
}

/** The universal grace between a teacher advance and its effect. */
export const GRACE_MS = 60_000;
/** An advance whose deadline passed longer ago than this is ignored by a tab that never saw it. */
export const STALE_MS = 60_000;

/** The whole-class review session: chosen problems, chosen examples, and where the board is. */
export type BoardView = "unmarked" | "marked";
/** What a student's pad does during whole-class review: mirror the teacher's writing, or take the student's own. */
export type FollowMode = "frozen" | "write-with-me";
export const FOLLOW_MODE_WORD: Record<FollowMode, string> = { frozen: "screens frozen", "write-with-me": "write with me" };
export interface WholeClassSession {
  problems: string[];
  examples: Record<string, ExampleRef[]>;
  slide: number;
  view: BoardView;
  status: "setup" | "active" | "ended";
  /** The mode per projected problem, seeded from the setup choice; the board can change one at a time. */
  modes: Record<string, FollowMode>;
  /** The teacher's writing per problem, mirrored onto frozen students' pads. */
  ink: Record<string, Stroke[]>;
}

export interface ClassroomState {
  assignment: CreatedAssignment | null;
  advance: PendingAdvance | null;
  wholeClass: WholeClassSession | null;
  /** The teacher's seating groups, per class; absent in older stored state (read through `seatingOf`). */
  groups?: SeatingGroups;
}

export type ClassroomAction =
  | { type: "assignment/create"; title: string; problemIds: string[]; pathway: Pathway; unit?: 1 | 2 | 3 | 4; at?: number }
  /** The groups page: move one student to a colour. */
  | { type: "groups/move"; student: string; to: GroupColour }
  | { type: "groups/reset" }
  | { type: "advance/start"; kind: AdvanceKind; at?: number }
  | { type: "advance/clear" }
  | { type: "wc/setup"; problems: string[]; examples: Record<string, ExampleRef[]>; mode?: FollowMode }
  /** Switch one projected problem's mode from the board. */
  | { type: "wc/mode"; problem: string; mode: FollowMode }
  /** The teacher's pad on the board. */
  | { type: "wc/stroke"; problem: string; stroke: Stroke }
  | { type: "wc/ink-undo"; problem: string }
  | { type: "wc/ink-clear"; problem: string }
  /** Activates the session and starts the whole-class-start grace in one step, so no tab can see one without the other. */
  | { type: "wc/project"; at?: number }
  | { type: "wc/next" }
  | { type: "wc/prev" }
  | { type: "wc/marks"; on: boolean }
  | { type: "wc/end" }
  | { type: "reset" };

export const INITIAL_CLASSROOM: ClassroomState = { assignment: null, advance: null, wholeClass: null, groups: DEFAULT_GROUPS };

export function classroomReducer(c: ClassroomState, a: ClassroomAction): ClassroomState {
  switch (a.type) {
    case "assignment/create":
      return { ...c, assignment: { title: a.title, problemIds: [...a.problemIds], pathway: [...a.pathway], unit: a.unit ?? 1, createdAt: a.at ?? 0 } };
    case "advance/start": {
      const at = a.at ?? 0;
      return { ...c, advance: { id: `${a.kind}@${at}`, kind: a.kind, deadline: at + GRACE_MS } };
    }
    case "advance/clear":
      return { ...c, advance: null };
    case "groups/move":
      return { ...c, groups: moveStudent(seatingOf(c.groups), a.student, a.to) };
    case "groups/reset":
      return { ...c, groups: DEFAULT_GROUPS };
    case "wc/setup": {
      const mode = a.mode ?? "frozen";
      return { ...c, wholeClass: { problems: [...a.problems], examples: a.examples, slide: 0, view: "unmarked", status: "setup", modes: Object.fromEntries(a.problems.map((id) => [id, mode])), ink: {} } };
    }
    case "wc/mode":
      return c.wholeClass ? { ...c, wholeClass: { ...c.wholeClass, modes: { ...(c.wholeClass.modes ?? {}), [a.problem]: a.mode } } } : c;
    case "wc/stroke": {
      const w = c.wholeClass;
      if (!w) return c;
      return { ...c, wholeClass: { ...w, ink: { ...(w.ink ?? {}), [a.problem]: [...(w.ink?.[a.problem] ?? []), a.stroke] } } };
    }
    case "wc/ink-undo": {
      const w = c.wholeClass;
      if (!w) return c;
      return { ...c, wholeClass: { ...w, ink: { ...(w.ink ?? {}), [a.problem]: (w.ink?.[a.problem] ?? []).slice(0, -1) } } };
    }
    case "wc/ink-clear":
      return c.wholeClass ? { ...c, wholeClass: { ...c.wholeClass, ink: { ...(c.wholeClass.ink ?? {}), [a.problem]: [] } } } : c;
    case "wc/project": {
      if (!c.wholeClass) return c;
      const at = a.at ?? 0;
      return { ...c, wholeClass: { ...c.wholeClass, status: "active", slide: 0, view: "unmarked" }, advance: { id: `whole-class-start@${at}`, kind: "whole-class-start", deadline: at + GRACE_MS } };
    }
    case "wc/next": {
      const w = c.wholeClass;
      if (!w) return c;
      if (w.slide >= w.problems.length - 1) return c;
      return { ...c, wholeClass: { ...w, slide: w.slide + 1, view: "unmarked" } };
    }
    case "wc/prev": {
      const w = c.wholeClass;
      if (!w) return c;
      if (w.view === "marked") return { ...c, wholeClass: { ...w, view: "unmarked" } };
      if (w.slide === 0) return c;
      return { ...c, wholeClass: { ...w, slide: w.slide - 1, view: "marked" } };
    }
    case "wc/marks":
      return c.wholeClass ? { ...c, wholeClass: { ...c.wholeClass, view: a.on ? "marked" : "unmarked" } } : c;
    case "wc/end":
      return c.wholeClass ? { ...c, wholeClass: { ...c.wholeClass, status: "ended" }, advance: null } : c;
    case "reset":
      return INITIAL_CLASSROOM;
  }
}

export const isProjecting = (c: ClassroomState | null | undefined) => c?.wholeClass?.status === "active";
/** The problem id on the board right now, if projecting. */
export function currentSlide(c: ClassroomState | null | undefined): { problemId: string; view: BoardView; index: number; total: number; mode: FollowMode; teacherInk: Stroke[] } | null {
  const w = c?.wholeClass;
  if (!w || w.status !== "active") return null;
  const problemId = w.problems[w.slide];
  // Older stored sessions have no modes or ink: frozen, nothing written.
  return problemId ? { problemId, view: w.view, index: w.slide, total: w.problems.length, mode: w.modes?.[problemId] ?? "frozen", teacherInk: w.ink?.[problemId] ?? [] } : null;
}

/** True while an advance is counting down. */
export function isPending(c: ClassroomState | null | undefined, now: number): boolean {
  return !!c?.advance && now < c.advance.deadline;
}

/** True once an advance's deadline has passed and it is still fresh enough to apply. */
export function isDue(c: ClassroomState | null | undefined, now: number): boolean {
  return !!c?.advance && now >= c.advance.deadline && now - c.advance.deadline < STALE_MS;
}

/** The pathway in force: the created assignment's, or the build's default. */
export function pathwayOf(c: ClassroomState | null | undefined): Pathway {
  return c?.assignment?.pathway ?? DEFAULT_PATHWAY;
}
