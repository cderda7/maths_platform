import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import { resolveLeaf, type LeafId } from "@/data/taxonomy";
import type { Problem } from "@/data/types";
import { problemLeaves } from "./hierarchy";
import type { ClassroomState } from "./classroom";

/**
 * The assignment in force: the one the teacher created (title and chosen problems, in bank
 * order) or the fixture when nothing has been created. Ids not in the bank are dropped; an
 * empty choice falls back to the fixture so the student is never shown an empty set. The goal
 * is the teacher's as written (a blank one is blank: no goal screen); an assignment stored before
 * the goal existed reads the fixture's.
 */
export interface ActiveAssignment {
  title: string;
  problems: Problem[];
  created: boolean;
  /**
   * The skills new on the set (ticket 209): the created set's as Create stored them (inferred, or as the
   * teacher changed them in the review), else the fixture's that the chosen problems invoke.
   */
  newSkills: readonly LeafId[];
  /** The teacher's goal for the class (ticket 154); blank means the student sees no goal screen. */
  goal: string;
}

export function activeAssignment(c: ClassroomState | null | undefined): ActiveAssignment {
  const a = c?.assignment;
  if (!a) return { title: ASSIGNMENT.title, problems: ASSIGNMENT.problems, created: false, newSkills: ASSIGNMENT.newSkills, goal: ASSIGNMENT.goal };
  const chosen = ASSIGNMENT.problems.filter((p) => a.problemIds.includes(p.id));
  const problems = chosen.length ? chosen : ASSIGNMENT.problems;
  const invoked = new Set(problems.flatMap(problemLeaves));
  // Only a skill the set's problems invoke can be new on it; a stored id from an older taxonomy resolves to its home.
  const newSkills = (a.newSkills ?? ASSIGNMENT.newSkills).flatMap((l) => resolveLeaf(l) ?? []).filter((l, i, all) => invoked.has(l) && all.indexOf(l) === i);
  return { title: a.title.trim() || ASSIGNMENT.title, problems, created: true, newSkills, goal: a.goal ?? ASSIGNMENT.goal };
}

export const problemById = (id: string): Problem | undefined => PROBLEM_MAP[id];
