/**
 * Reordering by press-and-hold (ticket 150): the pure part of the drag the create screen's tiles,
 * the review's tiles and the class review's example cards share. A press that stays still for
 * `HOLD_MS` lifts the item; a press that moves past `HOLD_SLOP` before then is a click, a caret
 * placement or a text selection and never a drag. While held, the item is over whichever slot's
 * centre is nearest the pointer (`slotAt`), the others slide one slot along to make room
 * (`shiftedSlot`), and on release the list is `moveItem`d. The hook that drives it is
 * `components/useReorder`.
 */

/**
 * How long a press must stay still before it becomes a drag. 150 ms (ticket 160; 300 felt slow):
 * above a click's press-to-release, so a click stays a click, and short enough that the lift
 * reads as immediate.
 */
export const HOLD_MS = 150;
/** How far (px) a press may wander during the hold and still be a hold. */
export const HOLD_SLOP = 6;

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** The list with the item at `from` moved to `to`; unchanged when either index is out of range or they are equal. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return [...list];
  const out = [...list];
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}

/** Whether a press that started at (x0, y0) has moved past the hold's tolerance. */
export const beyondSlop = (x0: number, y0: number, x: number, y: number, slop = HOLD_SLOP) => Math.hypot(x - x0, y - y0) > slop;

/** The slot whose centre is nearest the point: the index into `rects`, or -1 with no rects. Works the same for a grid and a column. */
export function slotAt(rects: readonly Rect[], x: number, y: number): number {
  let best = -1;
  let dist = Infinity;
  rects.forEach((r, i) => {
    const d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y);
    if (d < dist) {
      dist = d;
      best = i;
    }
  });
  return best;
}

/**
 * The slot item `i` shows in while the item at `from` is held over `to`: the held item takes
 * `to`, and the items between slide one slot towards the hole it left.
 */
export function shiftedSlot(i: number, from: number, to: number): number {
  if (i === from) return to;
  if (from < to && i > from && i <= to) return i - 1;
  if (to < from && i >= to && i < from) return i + 1;
  return i;
}

/**
 * Where each item's top lands in a column of uneven heights while the item at `from` is held
 * over `to`: the items restacked in their shifted order from the first item's top, each after
 * the previous plus the column's gap (read from the first two rects). A grid's cells share one
 * size, so there the slot's own box is the target (`shiftedSlot`); in a column a tall card
 * moved onto a short card's slot would overlap the next, so the stack is re-laid instead.
 */
export function stackedTops(rects: readonly Rect[], from: number, to: number): number[] {
  if (rects.length === 0) return [];
  const gap = rects.length > 1 ? rects[1].top - (rects[0].top + rects[0].height) : 0;
  const order = moveItem(
    rects.map((_, i) => i),
    from,
    to,
  );
  const tops = new Array<number>(rects.length);
  let y = rects[0].top;
  for (const i of order) {
    tops[i] = y;
    y += rects[i].height + gap;
  }
  return tops;
}

/** The slot an arrow key moves item `i` to in a grid `columns` wide, or null when it would leave the list. */
export function arrowTarget(i: number, key: string, count: number, columns: number): number | null {
  const step = key === "ArrowLeft" ? -1 : key === "ArrowRight" ? 1 : key === "ArrowUp" ? -columns : key === "ArrowDown" ? columns : null;
  if (step === null) return null;
  const to = i + step;
  return to >= 0 && to < count ? to : null;
}
