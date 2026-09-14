import { useSyncExternalStore } from "react";

/**
 * The Class View's "did you know?" note (ticket 253): a student's name opens their holistic page, which is also
 * Holistic Assessment in Edexia Classroom. Once the teacher dismisses it, it never shows again in this browser.
 * Its own localStorage key, outside the demo's classroom and session keys, so Reset demo leaves it dismissed
 * (`resetSession` writes only those two). Clearing the key brings it back.
 */
export const HOLISTIC_NOTE_KEY = "edexia-demo-holistic-note-dismissed";

/** The two calls the note needs from `localStorage`, so the rules test without a browser. */
type NoteStorage = Pick<Storage, "getItem" | "setItem">;

/** Whether the note has been dismissed: any stored value counts. Storage that throws (blocked) reads as not dismissed. */
export function isNoteDismissed(storage: NoteStorage): boolean {
  try {
    return storage.getItem(HOLISTIC_NOTE_KEY) !== null;
  } catch {
    return false;
  }
}

/** Dismisses the note for good, stamped with when. Storage that throws leaves it dismissed for this page only. */
export function dismissNote(storage: NoteStorage, at: number): void {
  try {
    storage.setItem(HOLISTIC_NOTE_KEY, String(at));
  } catch {
    // Blocked storage: the listeners below still hide it until the page reloads.
  }
}

const listeners = new Set<() => void>();
/** Dismissed on this page without storage (blocked): hidden until a reload. */
let dismissedHere = false;

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  // Another tab dismissing it, or the key cleared from devtools, reaches this one as a storage event.
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};

/**
 * Whether the note shows: `false` once dismissed, `true` while not, and `null` on the server and in the first
 * client render, so a teacher who dismissed it never sees it flash in before the stored answer is read.
 */
export function useHolisticNote(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => !dismissedHere && !isNoteDismissed(localStorage),
    () => null,
  );
}

/** The note's Dismiss: stored, and every note on the page hides at once. */
export function dismissHolisticNote(): void {
  dismissedHere = true;
  dismissNote(localStorage, Date.now());
  listeners.forEach((cb) => cb());
}
