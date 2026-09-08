import { PREREQ_IDS, TARGET_ID } from "@/data/subskills";
import type { SubskillId, SubskillStatus } from "@/data/types";
import { evaluateLine } from "./evaluate";
import type { StudentSession } from "./session";

/**
 * What the teacher sees per subskill, derived from how the recognised lines held:
 *   no evidence            → unseen
 *   all lines held         → secure
 *   some held, some didn't → developing
 *   nothing held           → gap
 * A subskill under caution (practice triggered twice) is a gap regardless. "Based on how each
 * step held, not on answers."
 */
export function subskillStatuses(session: StudentSession): Record<SubskillId, SubskillStatus> {
  const ok: Partial<Record<SubskillId, number>> = {};
  const wrong: Partial<Record<SubskillId, number>> = {};
  for (const [pid, lines] of Object.entries(session.lines)) {
    for (const l of lines) {
      const v = evaluateLine(pid, l.tex);
      if (v.verdict === "ok") ok[v.subskill] = (ok[v.subskill] ?? 0) + 1;
      else if (v.verdict === "wrong") wrong[v.subskill] = (wrong[v.subskill] ?? 0) + 1;
    }
  }
  const out = {} as Record<SubskillId, SubskillStatus>;
  for (const id of [...PREREQ_IDS, TARGET_ID]) {
    const o = ok[id] ?? 0;
    const w = wrong[id] ?? 0;
    out[id] = session.escalation.caution.includes(id) ? "gap" : o + w === 0 ? "unseen" : w === 0 ? "secure" : o === 0 ? "gap" : "developing";
  }
  return out;
}

/** Problems with at least one recognised line. */
export function problemsStarted(session: StudentSession): number {
  return Object.values(session.lines).filter((ls) => ls.length > 0).length;
}
