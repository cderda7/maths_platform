"use client";

import { useEffect } from "react";
import { setDemoTimeScale } from "./store";

/**
 * Ticket 357: how much faster the demo's shared clock runs while ArrowRight is held. Supersedes ticket
 * 354's stage-to-stage jump on the same key — Carson: "this has the unit of jumping ahead be stages. i
 * really want functionality within a stage" — so this now speeds up whatever is already playing out
 * within the current stage (classmates arriving, the group board's simulated run, a countdown) rather
 * than skipping to a different one.
 */
export const DEMO_FAST_FORWARD_SCALE = 10;

/** A typing target or other control that already owns its own arrow-key behaviour (a date grid, a reorder tile): ArrowRight is left to it. */
function ownsArrowKey(e: KeyboardEvent): boolean {
  if (e.defaultPrevented) return true;
  const t = e.target;
  return t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
}

/**
 * While ArrowRight is held, runs the demo's shared clock (`setDemoTimeScale` in `lib/store.ts`) at
 * `DEMO_FAST_FORWARD_SCALE`×; releasing it (keyup, or a window blur mid-hold) sets it back to real time.
 * The clock is one global store every "now"-driven surface already reads through `useNow`/`useFrameNow`,
 * so nothing else needs to know this is happening. Defers to `ownsArrowKey` the same way ticket 354's
 * hook did, so `DuePicker`'s date grid and `useReorder`'s Alt+arrow tile move are untouched.
 */
export function useDemoFastForward(): void {
  useEffect(() => {
    let holding = false;
    const release = () => {
      if (!holding) return;
      holding = false;
      setDemoTimeScale(1);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" || e.repeat || holding || ownsArrowKey(e)) return;
      e.preventDefault();
      holding = true;
      setDemoTimeScale(DEMO_FAST_FORWARD_SCALE);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") release();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", release);
    return () => {
      release();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", release);
    };
  }, []);
}
