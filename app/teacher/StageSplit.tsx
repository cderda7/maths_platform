"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { stickyTop } from "@/lib/stickyColumn";

/** The two columns' headers: the display face at one size, so the two read as a pair and sit level. */
const HEADER = "font-display text-[40px] leading-[1.05] text-ink";

/**
 * The Mistakes tab split in two while a stage runs (ticket 315): two equal columns, each under its own header in the display
 * face at the same size, the headers level. A stage fills it: individual working puts Where students are on the left and
 * the mistake cards on the right; the review modes (tickets 318–320) supply their own rows for the left and keep the right.
 *
 * `overlay` is drawn over the left column below its header (the live diagnostic's steps), covering the left content and
 * never the right. Its maths is upright by the global rule in app/globals.css (ticket 339).
 *
 * `stickyLeft` keeps the left column on screen while the teacher scrolls the cards (ticket 346): the column, its header
 * included, sticks inside the scroll region, so a card further down is still read against the rows it came from. The grid
 * already lays each column out from its own top (`items-start`), which is what leaves the column room to stick in its
 * track; nothing about the page at rest changes, so no row or card moves when the page is not being scrolled. The `top`
 * is measured (`lib/stickyColumn.ts`) rather than fixed, because a column taller than the region — or an overlay longer
 * than the column — must scroll up to its foot before it sticks, or its last rows could never be read. It is written straight to the style and holds no state, as
 * the fit rules do. Individual working, individual review and group review pass it; class review (tickets 320, 344) does
 * not, since its rows are still being settled.
 */
export default function StageSplit({
  leftTitle,
  left,
  rightTitle,
  right,
  overlay,
  stickyLeft = false,
  className = "",
}: {
  leftTitle: ReactNode;
  left: ReactNode;
  rightTitle: ReactNode;
  right: ReactNode;
  overlay?: ReactNode;
  /** Keep the left column on screen while the right column scrolls (ticket 346). */
  stickyLeft?: boolean;
  className?: string;
}) {
  const leftRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const column = leftRef.current;
    const main = column?.closest<HTMLElement>("[data-teacher-scroll]");
    if (!column) return;
    if (!stickyLeft || !main) {
      column.style.top = "";
      return;
    }
    // Layout px on both sides (`offsetHeight`, `clientHeight`): the teacher frame's zoom scales the whole page, so nothing
    // here divides by it. A top never changes a height, so observing the column cannot loop.
    // The overlay (the diagnostic's steps, a student's work) is laid over the rows and can be taller than they are, so it
    // is measured with them: a panel longer than the region has to be able to scroll into view like anything else.
    const place = () => {
      const overlay = column.querySelector<HTMLElement>("[data-split-overlay]");
      const zoom = main.getBoundingClientRect().height / main.clientHeight || 1;
      const over = overlay ? (overlay.getBoundingClientRect().bottom - column.getBoundingClientRect().top) / zoom : 0;
      column.style.top = `${stickyTop(Math.max(column.offsetHeight, over), main.clientHeight)}px`;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(main);
    ro.observe(column);
    const overlay = column.querySelector<HTMLElement>("[data-split-overlay]");
    if (overlay) ro.observe(overlay);
    document.fonts?.ready.then(place);
    return () => ro.disconnect();
  });
  return (
    <div className={`grid grid-cols-2 items-start gap-10 ${className}`} data-stage-split>
      <section ref={leftRef} className={`min-w-0 ${stickyLeft ? "sticky self-start" : ""}`} data-split-left data-sticky-left={stickyLeft || undefined}>
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
