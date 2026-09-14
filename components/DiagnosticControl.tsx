"use client";

import { liveDiagnostic } from "@/lib/classroom";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { currentIndex, DIAGNOSTIC_FORCE_MS, forceDeadline, isLastStep, isRevealed } from "@/lib/diagnosticChain";
import { useNow } from "@/lib/store";

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** Per surface: the class view's card and the flyout (both in the teacher's zoomed chrome) and the board. */
const PILL = {
  card: "px-2.5 py-1 text-[12px]",
  panel: "px-3 py-1 text-[13px]",
  board: "px-6 py-2.5 text-[20px]",
} as const;
const TEXT = { card: "text-[12.5px] gap-1.5", panel: "text-[14px] gap-1.5", board: "text-[22px] gap-3" } as const;
const DOT = { card: "h-1.5 w-1.5", panel: "h-1.5 w-1.5", board: "h-3 w-3" } as const;

/**
 * The teacher's one control over a running diagnostic chain (ticket 241), the same on the board, in the mistake view's flyout
 * and on the class view's card; whichever is pressed first moves every surface. While answers are still coming in it is
 * **force submit** (styled like the stage's force submit), which gives way to a ten-second countdown with Cancel; once the
 * step is revealed it is **next step**, or on the last step **back to work**. There is no going back a step. Withdraw is a
 * separate action, not this one.
 */
export default function DiagnosticControl({ size, className = "" }: { size: keyof typeof PILL; className?: string }) {
  const classroom = useClassroom();
  const now = useNow();
  const run = liveDiagnostic(classroom);
  if (!run) return null;
  const index = currentIndex(run);
  const pill = `${PILL[size]} whitespace-nowrap rounded-full border border-standout-line bg-standout-soft font-medium leading-tight text-accent-deep transition-colors hover:bg-standout-line/60`;
  const deadline = forceDeadline(run, now);
  if (deadline !== null)
    return (
      <span className={`flex items-center whitespace-nowrap text-ink ${TEXT[size]} ${className}`} data-chain-control="counting">
        <span className={`${DOT[size]} shrink-0 animate-pulse rounded-full bg-accent`} aria-hidden />
        closing in
        {/* The clock ticks once a second, so a fresh countdown never claims more than its ten seconds. */}
        <span className="tabular-nums" data-chain-countdown>
          {mmss(Math.min(DIAGNOSTIC_FORCE_MS, deadline - now))}
        </span>
        <span aria-hidden>·</span>
        <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "diagnostic/force-cancel" })} data-chain-cancel>
          Cancel
        </button>
      </span>
    );
  if (!isRevealed(run, index, now))
    return (
      <button type="button" className={`${pill} ${className}`} onClick={() => dispatchClassroom({ type: "diagnostic/force" })} data-chain-control="force">
        force submit
      </button>
    );
  const last = isLastStep(run, index);
  return (
    <button type="button" className={`${pill} ${className}`} onClick={() => dispatchClassroom({ type: last ? "diagnostic/end" : "diagnostic/next" })} data-chain-control={last ? "end" : "next"}>
      {last ? "back to work" : "next step"}
    </button>
  );
}
