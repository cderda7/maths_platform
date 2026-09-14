"use client";

import { useSyncExternalStore } from "react";

/**
 * The Mistakes view's live diagnostic flyout, outside React state (ticket 260): which problem's flyout is open and the
 * steps selected in each, per tab. The flyout used to keep both in `DiagnosticPush`'s own state, so anything that mounted
 * the Mistakes tree again closed the flyout under the teacher's pointer and dropped the selection: on the demo's
 * `next dev` server a merge touching the diagnostic data re-renders the page through Fast Refresh, which is what the
 * user saw as "a new mistake comes in and the diagnostic question collapses" (the names held above the pointer landed
 * in the same moment). A store in a module that imports nothing of the app's is not evaluated again when another module
 * changes, so a mount reads the flyout as it was.
 *
 * One flyout is open at a time: it opens on its chip and closes when the pointer leaves it, on Escape, or on sending.
 * The selection stays with its problem while the flyout is closed, as it did in state.
 */

interface FlyoutState {
  open: string | null;
  selected: Readonly<Record<string, readonly string[]>>;
}

let state: FlyoutState = { open: null, selected: {} };
const listeners = new Set<() => void>();
const NONE: readonly string[] = [];
const SERVER: FlyoutState = { open: null, selected: {} };

function set(next: FlyoutState) {
  state = next;
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function setFlyoutOpen(problemId: string, open: boolean) {
  if (open ? state.open === problemId : state.open !== problemId) return;
  set({ ...state, open: open ? problemId : null });
}

export function toggleStep(problemId: string, stepId: string) {
  const sel = state.selected[problemId] ?? NONE;
  set({ ...state, selected: { ...state.selected, [problemId]: sel.includes(stepId) ? sel.filter((x) => x !== stepId) : [...sel, stepId] } });
}

/** After a send: the flyout closes and its selection clears. */
export function sentFrom(problemId: string) {
  set({ open: state.open === problemId ? null : state.open, selected: { ...state.selected, [problemId]: NONE } });
}

/** Test and demo reset. */
export function resetFlyout() {
  set({ open: null, selected: {} });
}

export function getFlyout(): FlyoutState {
  return state;
}

/** One problem's flyout: open or not, and its selected step ids in the order they were clicked. */
export function useFlyout(problemId: string): { open: boolean; selected: readonly string[] } {
  const s = useSyncExternalStore(subscribe, getFlyout, () => SERVER);
  return { open: s.open === problemId, selected: s.selected[problemId] ?? NONE };
}
