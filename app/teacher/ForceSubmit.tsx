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

/** The pill's look, shared with "end lesson" beside it (ticket 273); its size is `FORCE_PILL_SIZE`. */
export const FORCE_PILL = "whitespace-nowrap rounded-full border border-standout-line bg-standout-soft font-medium leading-tight text-accent-deep transition-colors hover:bg-standout-line/60 disabled:cursor-not-allowed disabled:opacity-40";
/** Force submit's and end lesson's size on the pathway strip (ticket 334): their text a size up from the stage pills' 13.5 px. */
export const FORCE_PILL_SIZE = "px-3.5 py-1 text-[15px]";
/** A countdown in the pill's place: the same text size, on one line. */
export const PENDING_LINE = "flex items-center gap-1.5 whitespace-nowrap text-[15px] leading-tight text-ink";

/**
 * "force submit" beside the current stage on the pathway strip (ticket 145; on the Pathway card and the Mistakes title row
 * until ticket 334 put one strip on the back button's line of both tabs): one press starts the one-minute grace shown on
 * every student's screen, after which the stage ends for everyone as it stands (the set handed in; the corrections handed
 * in and the gate into group review opened; group review over). While the grace runs the button gives way to the pending
 * word and the countdown with Cancel, on one line. No confirmation step: the minute with Cancel is the undo. Disabled once
 * the live student is past the stage, while the teacher projects, or while "end lesson"'s minute runs (ticket 273).
 */
export default function ForceSubmit({ stage, session }: { stage: ClassStageId; session: StudentSession | null }) {
  const classroom = useClassroom();
  const now = useNow();
  const kind = FORCE_KIND[stage];
  if (!kind) return null;
  const advance = classroom.advance;
  const pending = isPending(classroom, now) && advance?.kind === kind;
  return pending && advance ? (
    <span className={PENDING_LINE} data-force-pending>
      <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent" aria-hidden />
      {FORCE_PENDING_WORD[stage]}
      {/* The clock ticks once a second, so a fresh countdown never claims more than the grace. */}
      <span className="tabular-nums">{mmss(Math.min(GRACE_MS, advance.deadline - now))}</span>
      <span aria-hidden>·</span>
      <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "advance/clear" })} data-force-cancel>
        Cancel
      </button>
    </span>
  ) : (
    <button
      type="button"
      className={`${FORCE_PILL_SIZE} ${FORCE_PILL}`}
      disabled={!canForce(stage, classroom, session) || otherAdvancePending(classroom, now, kind)}
      onClick={() => dispatchClassroom({ type: "advance/start", kind })}
      data-force={stage}
    >
      force submit
    </button>
  );
}
