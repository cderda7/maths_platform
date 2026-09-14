"use client";

import { useEffect, useRef } from "react";
import { createEscapeStack, isEscapePress } from "@/lib/escape";

/** One stack per page (per window: the split view's frames each have their own). */
const stack = createEscapeStack();
let listening = false;

const listen = () => {
  if (listening) return;
  listening = true;
  // Bubble phase on the window: a control that uses Escape itself (the reorder drag's capture listener, the Fix box) marks the event first.
  window.addEventListener("keydown", (e) => {
    if (isEscapePress(e) && stack.escape()) e.preventDefault();
  });
};

/**
 * While `active`, this thing is a layer Escape closes with `onEscape` (ticket 247): the latest one opened closes first.
 * `onEscape` null makes it a wall that holds Escape. After Escape closes it, focus goes back to what had it when the
 * layer opened (the button that opened it), or to `focusAfter()` when that button is re-created on close.
 */
export function useEscape(active: boolean, onEscape: (() => void) | null, focusAfter?: () => HTMLElement | null) {
  const latest = useRef({ onEscape, focusAfter });
  useEffect(() => {
    latest.current = { onEscape, focusAfter };
  });
  const wall = onEscape === null;
  useEffect(() => {
    if (!active) return;
    listen();
    const opener = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    return stack.push({
      close: wall ? null : () => latest.current.onEscape?.(),
      returnFocus: () => {
        // After the close has rendered: the opener may be hidden until then, or re-created.
        requestAnimationFrame(() => {
          const el = latest.current.focusAfter?.() ?? opener;
          if (el?.isConnected) el.focus({ preventScroll: true });
        });
      },
    });
  }, [active, wall]);
}

/** `useEscape` for a place a hook cannot go (one per item in a list). Renders nothing. */
export function EscapeLayer({ active, onEscape }: { active: boolean; onEscape: () => void }) {
  useEscape(active, onEscape);
  return null;
}
