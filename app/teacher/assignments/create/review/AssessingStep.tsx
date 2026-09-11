"use client";

import { useEffect, useState } from "react";
import { ASSESS_BEAT_MS, ASSESS_LINES } from "@/data/review";

/**
 * The assessing step: a bar in the middle of the page that fills steadily over `ms`, with a
 * line beneath it that changes as the run goes (reading, coverage, the class's gaps), then a
 * short beat before the recommendations. Nothing here is tappable and nothing is stored: a
 * reload during the run starts the step over.
 */
export default function AssessingStep({ ms, onDone }: { ms: number; onDone: () => void }) {
  const [line, setLine] = useState(0);
  useEffect(() => {
    const timers = ASSESS_LINES.map((l, i) => (i === 0 ? null : setTimeout(() => setLine(i), l.at * ms)));
    const done = setTimeout(onDone, ms + ASSESS_BEAT_MS);
    return () => {
      for (const t of timers) if (t) clearTimeout(t);
      clearTimeout(done);
    };
  }, [ms, onDone]);
  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center" data-assessing>
      <div className="h-1.5 w-[360px] overflow-hidden rounded-full bg-line" role="progressbar" aria-label="Assessing the set" aria-valuemin={0} aria-valuemax={100}>
        <div className="assess-fill h-full rounded-full bg-accent" style={{ animationDuration: `${ms}ms` }} data-assess-fill />
      </div>
      <p className="mt-5 text-[14.5px] text-ink-soft" data-assess-line={line}>
        {ASSESS_LINES[line].text}
      </p>
    </div>
  );
}
