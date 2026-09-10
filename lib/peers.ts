import { ASSIGNMENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { EVALUATION } from "@/data/evaluation";
import type { LeafId } from "@/data/taxonomy";
import type { Problem, Status } from "@/data/types";
import { classmateHierarchy, leavesTouched, sessionHierarchy } from "./hierarchy";
import type { StudentSession } from "./session";

/**
 * What a mastery-level student may see: where the class is finding it hard, aggregated. Counts
 * only, never a name or a line of anyone's work. Pure, over the classmates fixture, through the
 * same evidence path as every status on the teacher's grid.
 */
export interface PeerStruggles {
  classSize: number;
  leaves: { id: LeafId; struggling: number }[];
  problems: { problem: Problem; missed: number; pattern: string }[];
}

const HARD: Status[] = ["developing", "gap"];

export function peerStruggles(): PeerStruggles {
  const results = CLASSMATES.map((c) => classmateHierarchy(c));
  const leaves = leavesTouched()
    .map((id) => ({ id, struggling: results.filter((r) => HARD.includes(r.leaves[id] ?? "unseen")).length }))
    .filter((s) => s.struggling > 0)
    .sort((a, b) => b.struggling - a.struggling);
  const problems = ASSIGNMENT.problems
    .map((problem) => {
      const missed = CLASSMATES.filter((c) => c.wrong.includes(problem.id)).length;
      const pattern = Object.values(EVALUATION[problem.id] ?? {}).find((v) => v.verdict === "wrong")?.clue ?? "";
      return { problem, missed, pattern };
    })
    .filter((p) => p.missed > 0)
    .sort((a, b) => b.missed - a.missed)
    .slice(0, 2);
  return { classSize: CLASSMATES.length, leaves, problems };
}

/** Mastery: every leaf the set leaned on is secure or solid, and at least one is secure. */
export function isMastery(session: StudentSession): boolean {
  const st = Object.values(sessionHierarchy(session).leaves);
  return st.some((v) => v === "secure") && !st.some((v) => v !== undefined && HARD.includes(v));
}
