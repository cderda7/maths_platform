"use client";

import { useEffect, useRef } from "react";

/**
 * Ticket 354: press-and-hold ArrowRight to run a demo control forward. A single press advances one
 * step; holding the key keeps advancing on this schedule (never the OS's own fixed-rate key repeat,
 * which is skipped via `e.repeat`) so the demo visibly speeds up the longer it is held, until release,
 * a window blur, or `onStep` reporting there is nothing left to advance to.
 */
export const HOLD_STEP_START_MS = 450;
export const HOLD_STEP_FLOOR_MS = 60;
export const HOLD_STEP_HALVES_EVERY = 2;

/** The delay before the next auto-step, given how many auto-steps have already fired this hold. Halves every two steps down to a floor, so the ramp reads as acceleration rather than a fixed repeat rate. */
export function holdStepDelayMs(repeats: number): number {
  const halvings = Math.floor(repeats / HOLD_STEP_HALVES_EVERY);
  return Math.max(HOLD_STEP_FLOOR_MS, Math.round(HOLD_STEP_START_MS / 2 ** halvings));
}

/** A typing target or other control that already owns its own arrow-key behaviour (a date grid, a reorder tile): ArrowRight is left to it. */
function ownsArrowKey(e: KeyboardEvent): boolean {
  if (e.defaultPrevented) return true;
  const t = e.target;
  return t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
}

/**
 * Wires ArrowRight, held or tapped, to `onStep`. `onStep` runs one step and reports whether it moved
 * anything; a hold keeps calling it on the accelerating schedule above until it returns false. Reads
 * `onStep`/`active` through refs updated every render, so a change of either mid-hold (the callback's
 * identity changes each time the demo state it closes over moves on) never interrupts a hold in
 * progress — only mount/unmount touches the listeners themselves.
 */
export function useArrowRightHold(onStep: () => boolean, active: boolean): void {
  const stepRef = useRef(onStep);
  const activeRef = useRef(active);
  useEffect(() => {
    stepRef.current = onStep;
    activeRef.current = active;
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let repeats = 0;
    const clear = () => {
      if (timer !== null) clearTimeout(timer);
      timer = null;
    };
    const schedule = () => {
      timer = setTimeout(() => {
        if (activeRef.current && stepRef.current()) {
          repeats += 1;
          schedule();
        } else {
          clear();
        }
      }, holdStepDelayMs(repeats));
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" || e.repeat || timer !== null || !activeRef.current || ownsArrowKey(e)) return;
      e.preventDefault();
      repeats = 0;
      if (stepRef.current()) schedule();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") clear();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clear);
    return () => {
      clear();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clear);
    };
  }, []);
}
