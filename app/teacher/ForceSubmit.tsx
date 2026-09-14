"use client";

import { GRACE_MS, isPending } from "@/lib/classroom";
import { canForce, FORCE_KIND, FORCE_PENDING_WORD, otherAdvancePending, type ClassStageId } from "@/lib/classStage";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import type { StudentSession } from "@/lib/session";
import { useNow } from "@/lib/store";

export const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** The small pill's look, shared with "end lesson" above it (ticket 273); size and margin are each caller's. */
export const FORCE_PILL = "whitespace-nowrap rounded-full border border-standout-line bg-standout-soft font-medium leading-tight text-accent-deep transition-colors hover:bg-standout-line/60 disabled:cursor-not-allowed disabled:opacity-40";

/**
 * "force submit" beside the Pathway card's current pill (ticket 145; "Force assignment submit"
 * on the title line before it, "start group now" under the count for the gate): one press starts
 * the one-minute grace shown on every student's screen, after which the stage ends for everyone
 * as it stands (the set handed in; the corrections handed in and the gate into group review
 * opened; group review over). While the grace runs the button gives way to the countdown with
 * Cancel. No confirmation step: the minute with Cancel is the undo. Disabled once the live
 * student is past the stage, while the teacher projects, or while "end lesson"'s minute runs (ticket 273).
 *
 * The Mistakes tab carries it too (ticket 185), `inline` in its title row: no bottom margin, the
 * countdown on one line, and the button a size up (13.5 px, ticket 199) beside the title's 16 px stage pill.
 */
export default function ForceSubmit({ stage, session, inline = false }: { stage: ClassStageId; session: StudentSession | null; inline?: boolean }) {
  const classroom = useClassroom();
  const now = useNow();
  const kind = FORCE_KIND[stage];
  if (!kind) return null;
  const advance = classroom.advance;
  const pending = isPending(classroom, now) && advance?.kind === kind;
  return pending && advance ? (
    <span className={`flex text-ink ${inline ? "items-center gap-1.5" : "flex-col items-start"}`} data-force-pending>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent" aria-hidden />
        {FORCE_PENDING_WORD[stage]}
      </span>
      <span className="flex items-center gap-1.5">
        {/* The clock ticks once a second, so a fresh countdown never claims more than the grace. */}
        <span className="tabular-nums">{mmss(Math.min(GRACE_MS, advance.deadline - now))}</span>
        <span aria-hidden>·</span>
        <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "advance/clear" })} data-force-cancel>
          Cancel
        </button>
      </span>
    </span>
  ) : (
    <button
      type="button"
      className={`${inline ? "px-3 py-1 text-[13.5px]" : "mb-1 px-2.5 py-1 text-[12px]"} ${FORCE_PILL}`}
      disabled={!canForce(stage, classroom, session) || otherAdvancePending(classroom, now, kind)}
      onClick={() => dispatchClassroom({ type: "advance/start", kind })}
      data-force={stage}
    >
      force submit
    </button>
  );
}
