import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import type { Problem } from "@/data/types";
import type { ClassroomState } from "./classroom";

/**
 * The assignment in force: the one the teacher created (title and chosen problems, in bank
 * order) or the fixture when nothing has been created. Ids not in the bank are dropped; an
 * empty choice falls back to the fixture so the student is never shown an empty set.
 */
export interface ActiveAssignment {
  title: string;
  problems: Problem[];
  created: boolean;
  /** The confirmed QCAA unit (names the Unit category). */
  unit: 1 | 2 | 3 | 4;
}

export function activeAssignment(c: ClassroomState | null | undefined): ActiveAssignment {
  const a = c?.assignment;
  if (!a) return { title: ASSIGNMENT.title, problems: ASSIGNMENT.problems, created: false, unit: ASSIGNMENT.unit.number };
  const chosen = ASSIGNMENT.problems.filter((p) => a.problemIds.includes(p.id));
  return { title: a.title.trim() || ASSIGNMENT.title, problems: chosen.length ? chosen : ASSIGNMENT.problems, created: true, unit: a.unit ?? ASSIGNMENT.unit.number };
}

export const problemById = (id: string): Problem | undefined => PROBLEM_MAP[id];
