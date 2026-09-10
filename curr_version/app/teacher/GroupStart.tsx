"use client";

import { Button } from "@/components/ui";
import { GRACE_MS, isPending } from "@/lib/classroom";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { classReadiness } from "@/lib/readiness";
import { useNow } from "@/lib/store";

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * The gate into group review, on the Class card: how many have handed in corrections, and "start
 * group review now" to end the wait for everyone after the usual one-minute grace (a student still
 * correcting hands in as it stands). Shown only while the pathway has a group stage ahead.
 */
export default function GroupStart() {
  const classroom = useClassroom();
  const now = useNow();
  const readiness = classReadiness(classroom, now);
  const advance = classroom.advance;
  const pending = isPending(classroom, now) && advance?.kind === "group-start";
  const pathway = classroom.assignment?.pathway ?? [];
  if (!pathway.includes("group") || readiness.handedIn === 0) return null;
  return (
    <div className="mt-4 border-t border-line pt-4" data-group-start>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13.5px] leading-snug text-ink" data-ready-count>
          Group review · {readiness.handedIn} of {readiness.total} handed in
        </span>
        {readiness.started ? (
          <span className="text-[13px] text-secure" data-started>
            started{readiness.reason === "teacher" ? " by you" : ""}
          </span>
        ) : pending && advance ? (
          <span className="flex items-center gap-3 text-[13px] text-ink" data-group-pending>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
              starting · {mmss(advance.deadline - now)}
            </span>
            <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "advance/clear" })}>
              Cancel
            </button>
          </span>
        ) : (
          <Button variant="secondary" className="shrink-0 whitespace-nowrap" onClick={() => dispatchClassroom({ type: "advance/start", kind: "group-start" })} data-start-group title={`${Math.round(GRACE_MS / 60000)} minute for anyone still correcting`}>
            start now
          </Button>
        )}
      </div>
    </div>
  );
}
