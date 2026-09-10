"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { CLASSMATES } from "@/data/classmates";
import { GRACE_MS, isPending, isProjecting } from "@/lib/classroom";
import { dispatchClassroom, useAssignment, useClassroom } from "@/lib/classroom-store";
import type { StudentSession } from "@/lib/session";
import { useNow } from "@/lib/store";

const WORKING = ["overview", "confidence", "warmup-chat", "practice", "working"];
const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * "Force assignment submit", inline on the class view's title line, right against the table's
 * edge: a confirmation with how many students are still working, then a one-minute grace shown
 * on every student's screen before their work is handed in as it stands.
 */
export default function ForceSubmit({ session }: { session: StudentSession | null }) {
  const classroom = useClassroom();
  const now = useNow();
  const { problems } = useAssignment();
  const [confirming, setConfirming] = useState(false);
  const advance = classroom.advance;
  const pending = isPending(classroom, now) && advance?.kind === "force-submit";
  const projecting = isProjecting(classroom);
  const liveWorking = !session || WORKING.includes(session.stage);
  const stillWorking = (liveWorking ? 1 : 0) + CLASSMATES.filter((c) => c.done < problems.length).length;

  return (
    <div className="flex items-center gap-3" data-force-submit>
      {pending && advance ? (
        <div className="flex items-center gap-4" data-advance-pending>
          <span className="flex items-center gap-2 text-[14px] text-ink">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
            Handing in · {mmss(advance.deadline - now)}
          </span>
          <button type="button" className="text-[13px] text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "advance/clear" })} data-advance-cancel>
            Cancel
          </button>
        </div>
      ) : confirming ? (
        <div className="flex items-center gap-3" data-confirm>
          <p className="text-[14px] text-ink">
            {stillWorking} still working · {Math.round(GRACE_MS / 60000)} minute to finish
          </p>
          <Button
            variant="accent"
            onClick={() => {
              dispatchClassroom({ type: "advance/start", kind: "force-submit" });
              setConfirming(false);
            }}
            data-confirm-yes
          >
            Force assignment submit
          </Button>
          <Button variant="ghost" onClick={() => setConfirming(false)}>
            Not now
          </Button>
        </div>
      ) : (
        <Button variant="sky" disabled={!liveWorking || projecting} onClick={() => setConfirming(true)} data-force>
          force assignment submit
        </Button>
      )}
    </div>
  );
}
