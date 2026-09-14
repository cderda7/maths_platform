/**
 * Where Holistic Assessment's tiles were scrolled when the teacher opened a student (ticket 252), so Back (or the
 * browser's back) returns to the same tiles. The teacher scroll region is an element, not the window, so the router's
 * own scroll restoration never sees it. Per tab (sessionStorage); the Classroom's entry forgets it, so arriving
 * from there opens the tiles at the top. Storage can be unavailable (private mode): then the tiles open at the top.
 */
const KEY = "edexia-maths-demo/holistic-tiles-scroll/v1";

export function rememberTilesScroll(top: number): void {
  try {
    sessionStorage.setItem(KEY, String(Math.round(top)));
  } catch {
    // no storage: the tiles open at the top
  }
}

export function recallTilesScroll(): number | null {
  try {
    const v = sessionStorage.getItem(KEY);
    const n = v === null ? NaN : Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function forgetTilesScroll(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // nothing to forget
  }
}
