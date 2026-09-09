import type { Pathway } from "@/data/types";
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
export interface WholeClassSession {
  problems: string[];
  examples: Record<string, ExampleRef[]>;
  slide: number;
  view: BoardView;
  status: "setup" | "active" | "ended";
}

export interface ClassroomState {
  assignment: CreatedAssignment | null;
  advance: PendingAdvance | null;
  wholeClass: WholeClassSession | null;
}

export type ClassroomAction =
  | { type: "assignment/create"; title: string; problemIds: string[]; pathway: Pathway; at?: number }
  | { type: "advance/start"; kind: AdvanceKind; at?: number }
  | { type: "advance/clear" }
  | { type: "wc/setup"; problems: string[]; examples: Record<string, ExampleRef[]> }
  | { type: "wc/project" }
  | { type: "wc/next" }
  | { type: "wc/prev" }
  | { type: "wc/marks"; on: boolean }
  | { type: "wc/end" }
  | { type: "reset" };

export const INITIAL_CLASSROOM: ClassroomState = { assignment: null, advance: null, wholeClass: null };

export function classroomReducer(c: ClassroomState, a: ClassroomAction): ClassroomState {
  switch (a.type) {
    case "assignment/create":
      return { ...c, assignment: { title: a.title, problemIds: [...a.problemIds], pathway: [...a.pathway], createdAt: a.at ?? 0 } };
    case "advance/start": {
      const at = a.at ?? 0;
      return { ...c, advance: { id: `${a.kind}@${at}`, kind: a.kind, deadline: at + GRACE_MS } };
    }
    case "advance/clear":
      return { ...c, advance: null };
    case "wc/setup":
      return { ...c, wholeClass: { problems: [...a.problems], examples: a.examples, slide: 0, view: "unmarked", status: "setup" } };
    case "wc/project":
      return c.wholeClass ? { ...c, wholeClass: { ...c.wholeClass, status: "active", slide: 0, view: "unmarked" } } : c;
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
export function currentSlide(c: ClassroomState | null | undefined): { problemId: string; view: BoardView; index: number; total: number } | null {
  const w = c?.wholeClass;
  if (!w || w.status !== "active") return null;
  const problemId = w.problems[w.slide];
  return problemId ? { problemId, view: w.view, index: w.slide, total: w.problems.length } : null;
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
