"use client";

import { resetSession } from "@/lib/store";

/**
 * Restarts the shared demo in every tab. Pinned to the bottom-right corner, outside the product's
 * own chrome, so it reads as a presenter control rather than part of the interface.
 */
export default function ResetDemo() {
  return (
    <button
      type="button"
      onClick={() => resetSession()}
      className="fixed bottom-4 right-4 z-40 rounded-full border border-dashed border-line-strong bg-paper/80 px-3 py-1.5 text-[12px] text-ink-muted backdrop-blur hover:text-ink"
      data-reset
    >
      Reset demo
    </button>
  );
}
