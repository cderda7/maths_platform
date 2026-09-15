import { currentSlide, liveDiagnostic, type ClassroomState } from "./classroom";

/**
 * The board launched from the teacher's laptop (ticket 333): the pure half. The board is the laptop's second display, so
 * the laptop needs to know two things: whether a board is open (`boardOpen`, fed by the board's heartbeat) and when the
 * class reaches a moment the board is for (`boardMoments`, `cues`), so the header's Present board pill can pulse if no
 * board is up. `projectorScreen` and `placement` choose where Present opens it. The channel, the timers and the windows
 * are `lib/boardPresence-store.ts`.
 */

/** Every open `/board` beats on its own channel, apart from the classroom's state (whether a board is open is never stored). */
export const BOARD_CHANNEL = "edexia-maths-demo/board";
/** A board beats this often... */
export const BEAT_MS = 1000;
/** ...and counts as closed once this long passes without one (a closed window's `pagehide` says so at once). */
export const GONE_MS = 2500;
/** The laptop asks at once when it starts listening; until an answer could have come, the pill holds its place empty. */
export const SETTLE_MS = 300;
/** A cue pulses the pill this many times, each this long (`.board-cue` in app/globals.css holds the same numbers). */
export const PULSES = 3;
export const PULSE_MS = 800;
/** A header that mounts while the cue is still live (Project pushes the laptop to Board controls) pulses too. */
export const CUE_MS = PULSES * PULSE_MS;
/** The window's name, so a second Present finds the first board rather than opening another. */
export const BOARD_WINDOW = "edexia-board";

export type BoardMessage = { type: "beat"; id: string } | { type: "gone"; id: string } | { type: "ask" } | { type: "focus" };

/** Whether any board has beaten recently enough to be open at `now`. */
export function boardOpen(seen: ReadonlyMap<string, number>, now: number): boolean {
  for (const at of seen.values()) if (now - at < GONE_MS) return true;
  return false;
}

/**
 * The moments the board is for, live right now: class review projecting, group review running, a diagnostic out (each
 * push its own). A moment that is new since the last look is a cue; one that was already there (class review under a
 * diagnostic that has just ended) is not.
 */
export function boardMoments(c: ClassroomState | null | undefined): string[] {
  const moments: string[] = [];
  if (currentSlide(c)) moments.push("whole-class");
  if (c?.group && !c.group.done) moments.push("group");
  const run = liveDiagnostic(c);
  if (run) moments.push(`diagnostic@${run.pushedAt}`);
  return moments;
}

/**
 * Whether the header's pill pulses: a moment appeared that was not live before, and no board is open. `before` undefined
 * is the first look in this page (a reload, a fresh tab), which never pulses: only the moment itself does.
 */
export function cues(before: readonly string[] | undefined, after: readonly string[], open: boolean): boolean {
  if (open || before === undefined) return false;
  return after.some((m) => !before.includes(m));
}

/** The part of a Window Management `ScreenDetailed` Present reads. */
export interface ScreenLike {
  availLeft: number;
  availTop: number;
  availWidth: number;
  availHeight: number;
  isPrimary?: boolean;
}

/** The projector: a screen other than the one the laptop's window is on, the non-primary first. None with one screen. */
export function projectorScreen<S extends ScreenLike>(screens: readonly S[], current: S | null | undefined): S | null {
  const others = screens.filter((s) => s !== current && !sameArea(s, current));
  return others.find((s) => !s.isPrimary) ?? others[0] ?? null;
}

const sameArea = (a: ScreenLike, b: ScreenLike | null | undefined) =>
  !!b && a.availLeft === b.availLeft && a.availTop === b.availTop && a.availWidth === b.availWidth && a.availHeight === b.availHeight;

/** `window.open` features that size a popup to fill a screen (a thin title bar stays: true fullscreen needs a press in the window). */
export function placement(s: ScreenLike): string {
  return `popup,left=${s.availLeft},top=${s.availTop},width=${s.availWidth},height=${s.availHeight}`;
}

/** The fallback: an ordinary window the teacher drags to the projector (Safari, Firefox, or Window Management refused). */
export const FALLBACK_FEATURES = "popup,width=1280,height=720";
