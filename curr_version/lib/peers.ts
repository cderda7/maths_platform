import { ASSIGNMENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { EVALUATION } from "@/data/evaluation";
import { PREREQ_IDS, TARGET_ID } from "@/data/subskills";
import type { Problem, SubskillId, SubskillStatus } from "@/data/types";
import type { StudentSession } from "./session";
import { subskillStatuses } from "./status";

/**
 * What a mastery-level student may see: where the class is finding it hard, aggregated. Counts
 * only, never a name or a line of anyone's work. Pure, over the classmates fixture.
 */
export interface PeerStruggles {
  classSize: number;
  subskills: { id: SubskillId; struggling: number }[];
  problems: { problem: Problem; missed: number; pattern: string }[];
}

const HARD: SubskillStatus[] = ["developing", "gap"];

export function peerStruggles(): PeerStruggles {
  const subskills = [...PREREQ_IDS, TARGET_ID]
    .map((id) => ({ id, struggling: CLASSMATES.filter((c) => HARD.includes(c.statuses[id])).length }))
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
  return { classSize: CLASSMATES.length, subskills, problems };
}

/** Mastery: every subskill the set leaned on held; none developing or a gap. */
export function isMastery(session: StudentSession): boolean {
  const st = subskillStatuses(session);
  return Object.values(st).some((v) => v === "secure") && !Object.values(st).some((v) => HARD.includes(v));
}
