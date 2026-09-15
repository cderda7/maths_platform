"use client";

import type { ReactNode } from "react";

/** The two columns' headers: the display face at one size, so the two read as a pair and sit level. */
const HEADER = "font-display text-[40px] leading-[1.05] text-ink";

/**
 * The Mistakes tab split in two while a stage runs (ticket 315): two equal columns, each under its own header in the display
 * face at the same size, the headers level. A stage fills it: individual working puts Where students are on the left and
 * the mistake cards on the right; the review modes (tickets 318–320) supply their own rows for the left and keep the right.
 *
 * `overlay` is drawn over the left column below its header (the live diagnostic's steps), covering the left content and
 * never the right. Its maths is upright by the global rule in app/globals.css (ticket 339).
 */
export default function StageSplit({ leftTitle, left, rightTitle, right, overlay, className = "" }: { leftTitle: ReactNode; left: ReactNode; rightTitle: ReactNode; right: ReactNode; overlay?: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-2 items-start gap-10 ${className}`} data-stage-split>
      <section className="min-w-0" data-split-left>
        <h2 className={HEADER} data-split-header="left">
          {leftTitle}
        </h2>
        <div className="relative mt-6">
          {left}
          {overlay && (
            <div className="absolute inset-x-0 top-0 z-40" data-split-overlay>
              {overlay}
            </div>
          )}
        </div>
      </section>
      <section className="min-w-0" data-split-right>
        <h2 className={HEADER} data-split-header="right">
          {rightTitle}
        </h2>
        <div className="mt-6">{right}</div>
      </section>
    </div>
  );
}
