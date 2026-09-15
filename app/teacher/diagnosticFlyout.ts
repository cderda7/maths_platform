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
 *
 * On the split (ticket 316) the same slot over Where students are also holds a student's work panel, opened from their
 * pill, so the store holds that too: one overlay at a time, opening a diagnostic closes the panel and opening a panel
 * closes the diagnostic.
 */

interface FlyoutState {
  open: string | null;
  /** The student whose work panel is open over Where students are (ticket 316), or null. Never at the same time as `open`. */
  student: string | null;
  selected: Readonly<Record<string, readonly string[]>>;
}

let state: FlyoutState = { open: null, student: null, selected: {} };
const listeners = new Set<() => void>();
const NONE: readonly string[] = [];
const SERVER: FlyoutState = { open: null, student: null, selected: {} };

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
  set({ ...state, open: open ? problemId : null, student: open ? null : state.student });
}

/** Opens a student's work panel (closing any diagnostic flyout), or with null closes the panel. */
export function setStudentOpen(student: string | null) {
  if (state.student === student) return;
  set({ ...state, student, open: student === null ? state.open : null });
}

export function toggleStep(problemId: string, stepId: string) {
  const sel = state.selected[problemId] ?? NONE;
  set({ ...state, selected: { ...state.selected, [problemId]: sel.includes(stepId) ? sel.filter((x) => x !== stepId) : [...sel, stepId] } });
}

/** After a send: the flyout closes and its selection clears. */
export function sentFrom(problemId: string) {
  set({ ...state, open: state.open === problemId ? null : state.open, selected: { ...state.selected, [problemId]: NONE } });
}

/** Test and demo reset. */
export function resetFlyout() {
  set({ open: null, student: null, selected: {} });
}

export function getFlyout(): FlyoutState {
  return state;
}

/** The problem whose flyout is open, or null: the split's left column draws that one flyout over its rows (ticket 315). */
export function useOpenFlyout(): string | null {
  return useSyncExternalStore(subscribe, getFlyout, () => SERVER).open;
}

/** The student whose work panel is open on the split, or null (ticket 316). */
export function useOpenStudent(): string | null {
  return useSyncExternalStore(subscribe, getFlyout, () => SERVER).student;
}

/** One problem's flyout: open or not, and its selected step ids in the order they were clicked. */
export function useFlyout(problemId: string): { open: boolean; selected: readonly string[] } {
  const s = useSyncExternalStore(subscribe, getFlyout, () => SERVER);
  return { open: s.open === problemId, selected: s.selected[problemId] ?? NONE };
}
