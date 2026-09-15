"use client";

import { useEffect, useSyncExternalStore } from "react";

/** "full" in fullscreen, "window" in a window of its own, "framed" inside the split's pane (or before hydration). */
type Fit = "full" | "window" | "framed";

const subscribe = (cb: () => void) => {
  document.addEventListener("fullscreenchange", cb);
  return () => document.removeEventListener("fullscreenchange", cb);
};
const fit = (): Fit => (window.self !== window.top ? "framed" : document.fullscreenElement ? "full" : "window");

/**
 * The board header's Fullscreen button (ticket 333). Present opens the board sized to the projector with a thin title bar
 * left; a press here fills the screen (Esc leaves it and brings the button back). Never inside the split's pane. On load
 * the board tries fullscreen by itself: a browser only allows that where the school's admin policy lets this site do it,
 * and quietly refuses everywhere else.
 */
export default function FullscreenButton() {
  const state = useSyncExternalStore(subscribe, fit, (): Fit => "framed");
  useEffect(() => {
    if (fit() === "window") document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);
  if (state !== "window") return null;
  return (
    <button
      type="button"
      onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
      className="flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-[13px] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
      data-board-fullscreen
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" />
      </svg>
      Fullscreen
    </button>
  );
}
