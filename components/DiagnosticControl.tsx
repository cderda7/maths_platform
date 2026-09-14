"use client";

import { liveDiagnostic } from "@/lib/classroom";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { currentIndex, DIAGNOSTIC_FORCE_MS, forceDeadline, isLastStep, isRevealed } from "@/lib/diagnosticChain";
import { useNow } from "@/lib/store";
import { liveAbsent } from "@/lib/absence";

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** Per surface: the class view's card, the flyout and the Mistakes view's focused view (all in the teacher's zoomed chrome), and the board. */
const PILL = {
  card: "px-2.5 py-1 text-[12px]",
  panel: "px-3 py-1 text-[13px]",
  focus: "px-5 py-2 text-[17px]",
  board: "px-6 py-2.5 text-[20px]",
} as const;
const TEXT = { card: "text-[12.5px] gap-1.5", panel: "text-[14px] gap-1.5", focus: "text-[17px] gap-2", board: "text-[22px] gap-3" } as const;
const DOT = { card: "h-1.5 w-1.5", panel: "h-1.5 w-1.5", focus: "h-2 w-2", board: "h-3 w-3" } as const;

/**
 * The teacher's one control over a running diagnostic chain (ticket 241), the same on the board, in the Mistakes view's
 * focused view (ticket 260) and on the class view's card; whichever is pressed first moves every surface. While answers are
 * still coming in it is **force submit** (styled like the stage's force submit), which gives way to a five-second countdown
 * with Cancel (ten until ticket 260); once the step is revealed it is **next question**, or on the last step **done**, which
 * ends the chain: every iPad back to its work, the board back to what it showed, the Mistakes view back to its problems.
 * There is no going back a step. Withdraw is a separate action, not this one.
 */
export default function DiagnosticControl({ size, className = "" }: { size: keyof typeof PILL; className?: string }) {
  const classroom = useClassroom();
  const now = useNow();
  const run = liveDiagnostic(classroom);
  if (!run) return null;
  const index = currentIndex(run);
  const pill = `${PILL[size]} whitespace-nowrap rounded-full border border-standout-line bg-standout-soft font-medium leading-tight text-accent-deep transition-colors hover:bg-standout-line/60`;
  const absent = liveAbsent(classroom);
  const deadline = forceDeadline(run, now, absent);
  if (deadline !== null)
    return (
      <span className={`flex items-center whitespace-nowrap text-ink ${TEXT[size]} ${className}`} data-chain-control="counting">
        <span className={`${DOT[size]} shrink-0 animate-pulse rounded-full bg-accent`} aria-hidden />
        closing in
        {/* The clock ticks once a second, so a fresh countdown never claims more than its five seconds. */}
        <span className="tabular-nums" data-chain-countdown>
          {mmss(Math.min(DIAGNOSTIC_FORCE_MS, deadline - now))}
        </span>
        <span aria-hidden>·</span>
        <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "diagnostic/force-cancel" })} data-chain-cancel>
          Cancel
        </button>
      </span>
    );
  if (!isRevealed(run, index, now, absent))
    return (
      <button type="button" className={`${pill} ${className}`} onClick={() => dispatchClassroom({ type: "diagnostic/force" })} data-chain-control="force">
        force submit
      </button>
    );
  const last = isLastStep(run, index);
  return (
    <button type="button" className={`${pill} ${className}`} onClick={() => dispatchClassroom({ type: last ? "diagnostic/end" : "diagnostic/next" })} data-chain-control={last ? "end" : "next"}>
      {last ? "done" : "next question"}
    </button>
  );
}
