import type { Classmate } from "@/data/classmates";
import { BEFORE_HAND_IN_STAGES, type Problem, type Stage } from "@/data/types";
import type { StudentSession } from "./session";

/**
 * Where one student is on one assignment (ticket 185): the one meaning of "submitted" for the
 * class view's rows, the Pathway card's working count and the landing rule. A student who has not
 * begun is `not-started`; one on the check-in or the warm-up is `warming-up`; one on the set is
 * `working` on the first problem they have not answered (named by its label, "Q4"); one who has
 * handed the set in (whole or in part) is `submitted`. Pure.
 */
export type StudentProgress = { kind: "not-started" } | { kind: "warming-up" } | { kind: "working"; label: string } | { kind: "submitted" };

/** The stages before the set in which the student is getting ready for it: the check-in, the concerns chat, the warm-up. */
const WARM_UP_STAGES: readonly Stage[] = ["confidence", "warmup-chat", "practice"];

/**
 * The live student's progress from his session. On the set, the problem is the first (in the
 * assignment's order) with no recognised line; with every problem written on, the one he is on.
 */
export function sessionProgress(session: StudentSession | null, problems: readonly Problem[]): StudentProgress {
  if (!session) return { kind: "not-started" };
  if (!BEFORE_HAND_IN_STAGES.includes(session.stage)) return { kind: "submitted" };
  if (WARM_UP_STAGES.includes(session.stage)) return { kind: "warming-up" };
  if (session.stage !== "working") return { kind: "not-started" };
  const first = problems.findIndex((p) => !(session.lines[p.id]?.length ?? 0));
  const at = first >= 0 ? first : Math.max(0, Math.min(session.problemIndex, problems.length - 1));
  return { kind: "working", label: problems[at]?.label ?? `Q${at + 1}` };
}

/**
 * A classmate's progress at a moment. The fixture's classmates are a finished snapshot: anyone with a
 * problem done handed in, anyone with none never started. Ticket 189's stream passes what it knows
 * at `now` (`warmingUp`, `answered`, `submitted`) and the same function names the row.
 */
export function classmateProgress(c: Pick<Classmate, "done">, problems: readonly Problem[], live?: { submitted: boolean; warmingUp: boolean; answered: number; started: boolean }): StudentProgress {
  if (!live) return c.done > 0 ? { kind: "submitted" } : { kind: "not-started" };
  if (live.submitted) return { kind: "submitted" };
  if (live.warmingUp) return { kind: "warming-up" };
  if (!live.started) return { kind: "not-started" };
  const at = Math.min(live.answered, problems.length - 1);
  return { kind: "working", label: problems[at]?.label ?? `Q${at + 1}` };
}

export const isSubmitted = (p: StudentProgress): boolean => p.kind === "submitted";

/** The words in the pill beside the name of a student still on the set: "Q4 in progress", "warming up"; nothing once handed in or before starting. */
export function progressTag(p: StudentProgress): string | null {
  switch (p.kind) {
    case "warming-up":
      return "warming up";
    case "working":
      return `${p.label} in progress`;
    default:
      return null;
  }
}
