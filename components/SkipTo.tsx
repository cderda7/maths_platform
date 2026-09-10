"use client";

import { SKIP_TARGETS, skipFixture, type SkipTarget } from "@/lib/demo";
import { setClassroom } from "@/lib/classroom-store";
import { setSession } from "@/lib/store";

/**
 * Presenter shortcuts into Sam's run, pinned bottom-left outside the product's chrome and drawn
 * with the same dashed border as "Reset demo", so they read as demo controls, not the interface.
 */
function jump(t: SkipTarget) {
  const { session, classroom } = skipFixture(t, Date.now());
  setClassroom(classroom);
  setSession(session);
}

export default function SkipTo() {
  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-1.5 rounded-full border border-dashed border-line-strong bg-paper/80 px-2 py-1 backdrop-blur" data-skip-to>
      <span className="pl-1.5 text-[11px] uppercase tracking-wide text-ink-muted">skip to</span>
      {SKIP_TARGETS.map((t) => (
        <button key={t} type="button" onClick={() => jump(t)} data-skip={t} className="rounded-full px-2.5 py-1 text-[12px] text-ink-muted transition-colors hover:bg-cream-deep hover:text-ink">
          {t}
        </button>
      ))}
    </div>
  );
}
