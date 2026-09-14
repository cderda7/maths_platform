"use client";

import { resetSession } from "@/lib/store";

/**
 * Restarts the shared demo in every tab. Outside the product's own chrome, so it reads as a presenter control rather
 * than part of the interface: pinned to the bottom-right corner, or (`inline`) placed by a strip of presenter controls
 * that keeps them off the product's own (the teacher's frame, ticket 263).
 */
export default function ResetDemo({ inline = false }: { inline?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => resetSession()}
      className={`${inline ? "" : "fixed bottom-4 right-4 z-40 "}rounded-full border border-dashed border-line-strong bg-paper/80 px-3 py-1.5 text-[12px] text-ink-muted backdrop-blur hover:text-ink`}
      data-reset
    >
      Reset demo
    </button>
  );
}
