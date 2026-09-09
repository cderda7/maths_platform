import type { Pathway } from "@/data/types";
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

export interface ClassroomState {
  assignment: CreatedAssignment | null;
}

export type ClassroomAction =
  | { type: "assignment/create"; title: string; problemIds: string[]; pathway: Pathway; at?: number }
  | { type: "reset" };

export const INITIAL_CLASSROOM: ClassroomState = { assignment: null };

export function classroomReducer(c: ClassroomState, a: ClassroomAction): ClassroomState {
  switch (a.type) {
    case "assignment/create":
      return { ...c, assignment: { title: a.title, problemIds: [...a.problemIds], pathway: [...a.pathway], createdAt: a.at ?? 0 } };
    case "reset":
      return INITIAL_CLASSROOM;
  }
}

/** The pathway in force: the created assignment's, or the build's default. */
export function pathwayOf(c: ClassroomState | null | undefined): Pathway {
  return c?.assignment?.pathway ?? DEFAULT_PATHWAY;
}
