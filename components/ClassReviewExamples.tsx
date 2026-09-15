"use client";

import { WorkLines } from "@/components/HierarchyDrill";
import { EXAMPLE_LETTERS } from "@/lib/examples";

/**
 * Class review's pane (ticket 282): each example the teacher put on the board for the problem, side by side, lettered as the
 * board letters them, unmarked and anonymous. Shared by the teacher's report and the student's side column; `stacked` sets the examples one under another.
 */
export default function ClassReviewExamples({ problem, examples, stacked = false }: { problem: string; examples: string[][]; stacked?: boolean }) {
  return (
    <div className={`mt-2 grid gap-3 ${stacked ? "grid-cols-1" : ""}`} style={stacked ? undefined : { gridTemplateColumns: `repeat(${examples.length}, minmax(0, 1fr))` }} data-class-review-examples={examples.length}>
      {examples.map((lines, i) => (
        <div key={i} className="min-w-0" data-class-review-example={EXAMPLE_LETTERS[i]}>
          <div className="text-[11.5px] font-medium text-ink-muted">Example {EXAMPLE_LETTERS[i]}</div>
          <div className="-mt-1">
            <WorkLines problem={problem} texs={lines} narrow unmarked />
          </div>
        </div>
      ))}
    </div>
  );
}
