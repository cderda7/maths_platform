"use client";

import { presentBoard, usePresence } from "@/lib/boardPresence-store";

/**
 * The teacher header's board pill (ticket 333), just before the teacher's name on every teacher page. No board open: a
 * soft indigo "Present board", which opens it sized to the projector (or an ordinary window to drag there). A board open:
 * a quiet "Board open" with a green dot; a press brings it forward. It pulses three times when class review projects,
 * group review starts or a diagnostic goes out while no board is open. Until the board could have answered, the closed
 * pill holds its place invisible, so a page load never flashes the wrong word and nothing beside it moves.
 */
export default function PresentBoard() {
  const { state, again, cue } = usePresence();
  if (state === "open")
    return (
      <button type="button" onClick={presentBoard} className="flex items-center gap-2 rounded-full border border-transparent px-3 py-1 text-[13.5px] text-ink-soft transition-colors hover:bg-cream-deep" title="Bring the board forward" data-present-board="open">
        <span className="h-2 w-2 rounded-full bg-secure" aria-hidden />
        Board open
      </button>
    );
  return (
    <button
      key={cue?.id ?? 0}
      type="button"
      onClick={presentBoard}
      disabled={state === "unknown"}
      aria-hidden={state === "unknown" || undefined}
      className={`flex items-center gap-2 rounded-full border border-transparent bg-accent-soft px-3 py-1 text-[13.5px] font-medium text-accent-deep transition-colors hover:bg-accent-line ${state === "unknown" ? "invisible" : ""} ${cue ? "board-cue" : ""}`}
      data-present-board={state}
      data-board-cue={cue ? cue.id : undefined}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="1.75" y="2.75" width="12.5" height="8.5" rx="1.25" />
        <path d="M8 11.25v2M5.5 13.25h5" />
      </svg>
      {again ? "Press again to present" : "Present board"}
    </button>
  );
}
