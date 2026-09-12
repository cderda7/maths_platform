"use client";

import { GRACE_MS, isPending, type ClassroomState } from "@/lib/classroom";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { classReadiness } from "@/lib/readiness";
import { useNow } from "@/lib/store";

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** Whether the gate has anything to say: a group stage ahead, at least one student in, and the gate not yet open. */
export function groupStartShown(classroom: ClassroomState, now: number): boolean {
  const pathway = classroom.assignment?.pathway ?? [];
  const readiness = classReadiness(classroom, now);
  return pathway.includes("group") && readiness.handedIn > 0 && !readiness.started;
}

/**
 * The gate into group review, a line under the Pathway card's count for the stage before it
 * (ticket 129; the Class card it used to fill is gone): "start now" ends the wait for everyone
 * after the usual one-minute grace (a student still correcting hands in as it stands), then the
 * countdown with Cancel while the grace runs. Nothing once the gate has opened: the pathway's
 * marker has moved on to group review by then.
 */
export default function GroupStart() {
  const classroom = useClassroom();
  const now = useNow();
  const advance = classroom.advance;
  const pending = isPending(classroom, now) && advance?.kind === "group-start";
  if (!groupStartShown(classroom, now)) return null;
  return pending && advance ? (
    <span className="flex flex-col items-start whitespace-nowrap text-ink" data-group-pending>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent" aria-hidden />
        starting · {mmss(advance.deadline - now)}
      </span>
      <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "advance/clear" })} data-group-cancel>
        Cancel
      </button>
    </span>
  ) : (
    <button type="button" className="block text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "advance/start", kind: "group-start" })} data-start-group title={`Start group review: ${Math.round(GRACE_MS / 60000)} minute for anyone still correcting`}>
      start group now
    </button>
  );
}
