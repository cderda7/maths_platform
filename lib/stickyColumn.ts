/**
 * Where the Mistakes split's left column sticks while the cards scroll (ticket 346).
 *
 * The teacher reads a mistake card against the rows beside it, so the rows stay on screen while the right column scrolls:
 * the left column is `position: sticky` inside the scroll region (`[data-teacher-scroll]`), and this says what its `top` is.
 * A column that fits the region sticks under the region's top edge, a hair below it (`STICKY_TOP`). A column taller than
 * the region cannot stick there without hiding its last rows, so it takes a negative top instead: it scrolls up with the
 * page until its foot is in view and sticks from then on, which is the only way every row stays reachable. The fit rules
 * (ticket 315's folded question rows, 318's shortened pills, 319's grid) keep the column inside the region in normal play,
 * so the negative top is the safety net, not the everyday case.
 *
 * Both numbers are layout px, as the teacher frame's zoom (0.72) measures everything.
 */

/** Kept between the stuck column's top and the scroll region's, so the rows never sit on the region's edge. */
export const STICKY_TOP = 16;
/** Kept under a column too tall to stick at the top, so its last row clears the region's foot. */
export const STICKY_FOOT = 12;

/**
 * The `top` for the left column, in layout px: `STICKY_TOP` while the column fits the region, otherwise negative, so the
 * column's foot comes to rest `STICKY_FOOT` above the region's.
 */
export function stickyTop(column: number, region: number, top = STICKY_TOP, foot = STICKY_FOOT): number {
  if (column <= 0 || region <= 0) return top;
  const room = region - top - foot;
  return column <= room ? top : Math.min(top, region - foot - column);
}

/**
 * How far down the scroll region's content the left column's table ends, in layout px, for the fit rules (ticket 315's
 * folded rows, 318's shortened pills) to compare against `main.clientHeight - FOOT_ROOM`: the same budget as before ticket
 * 346, so what folds and what shortens is unchanged, and the column stays short enough to sit still at any scroll.
 *
 * It walks `offsetTop`, which is where the table sits with nothing scrolled and nothing stuck. Read from the rects and the
 * region instead, the number would climb with `scrollTop` once the column stuck, and the teacher scrolling the cards would
 * fold the question rows away or shorten every pill under their eye.
 */
export function splitFoot(table: HTMLElement, main: HTMLElement): number {
  const zoom = main.getBoundingClientRect().height / main.clientHeight || 1;
  const column = table.closest<HTMLElement>("[data-sticky-left]");
  if (!column) return (table.getBoundingClientRect().bottom - main.getBoundingClientRect().top) / zoom + main.scrollTop;
  // The split's own place in the content, read off the right column, which never sticks; then the column's own extent,
  // read between two rects that stick together. Neither moves as the teacher scrolls, and `offsetTop` is no use here
  // because a stuck column reports its shifted place.
  const right = column.parentElement?.querySelector<HTMLElement>("[data-split-right]");
  const top = right ? (right.getBoundingClientRect().top - main.getBoundingClientRect().top) / zoom + main.scrollTop : STICKY_TOP;
  return top + (table.getBoundingClientRect().bottom - column.getBoundingClientRect().top) / zoom;
}
