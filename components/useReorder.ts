"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { arrowTarget, beyondSlop, HOLD_MS, shiftedSlot, slotAt, stackedTops, type Rect } from "@/lib/reorder";

export interface ReorderOptions {
  /** How many items, from the first, can be held and landed on; a tail item outside the count (the create screen's ghost) neither moves nor makes room. */
  count: number;
  onMove: (from: number, to: number) => void;
  /** Items per row, for Alt+arrows: left and right step one slot, up and down one row. */
  columns?: number;
  /** A press inside an element matching this is that element's (a button, a select) and never starts a hold. */
  ignore?: string;
  /** How an item is named in the aria-live line after a keyboard move. */
  name?: (i: number) => string;
}

export interface ItemProps {
  ref: (el: HTMLElement | null) => void;
  style: CSSProperties | undefined;
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  /** Swallows the click that ends a hold, so a drag never also does what a click does (open the tile's editor). */
  onClickCapture: (e: ReactMouseEvent<HTMLElement>) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
  "data-drag": "held" | "shifted" | undefined;
}

export interface Reorder {
  /** The drag in progress: the held item and the slot it is over. */
  drag: { from: number; to: number } | null;
  /** The slot item `i` shows in now: its own, or the one it slid to while another is held. */
  slot: (i: number) => number;
  /** Spread on item `i`'s outer element (a `li`, a wrapper div). */
  item: (i: number) => ItemProps;
  /** The sentence to put in an aria-live region after a keyboard move. */
  announced: string;
}

interface Press {
  index: number;
  x: number;
  y: number;
  timer: ReturnType<typeof setTimeout>;
}
interface Live {
  from: number;
  to: number;
  dx: number;
  dy: number;
  /** Every movable item's box at the hold, in viewport px: the slots. */
  rects: Rect[];
  /** Every registered item's box, the tail items past `count` included: a drop over one of those lands on the last slot. */
  landing: Rect[];
  /** Viewport px per layout px (the teacher chrome is zoomed), so a translate lands under the pointer. */
  zoom: number;
  /** The text field under the press, with its selection, so the drag does not extend it. */
  field: { el: HTMLTextAreaElement | HTMLInputElement; start: number | null; end: number | null } | null;
}

const DEFAULT_IGNORE = "button, select, a, input, textarea";

/**
 * Drag to reorder by press-and-hold (ticket 150). Spread `item(i)` on each item's outer element:
 * a press that stays still for `HOLD_MS` lifts the item (a shorter press is a click and does
 * whatever it did before; a press that moves first is a text selection or a scroll); moving then
 * carries it under the pointer while the others slide a slot to make room, all by transform, so
 * nothing resizes (a drop over an item past `count`, the create screen's ghost, lands on the
 * last slot); release calls `onMove(from, to)` and the caller reorders its list. Escape
 * drops it back. Alt+arrows while an item has focus move it one slot without the mouse. The
 * shared pure part (which slot, who slides) is `lib/reorder`.
 */
export function useReorder({ count, onMove, columns = 1, ignore = DEFAULT_IGNORE, name = (i) => `Item ${i + 1}` }: ReorderOptions): Reorder {
  const [drag, setDrag] = useState<Live | null>(null);
  const [announced, setAnnounced] = useState("");
  const els = useRef(new Map<number, HTMLElement>());
  const press = useRef<Press | null>(null);
  const live = useRef<Live | null>(null);
  /** True from a hold's release until the click it produces has passed. */
  const held = useRef(false);
  const latest = useRef({ count, onMove });
  useEffect(() => {
    latest.current = { count, onMove };
  });

  const detach = useRef<() => void>(() => {});

  const update = (next: Live | null) => {
    live.current = next;
    setDrag(next);
  };

  const finish = useCallback((commit: boolean) => {
    if (press.current) {
      clearTimeout(press.current.timer);
      press.current = null;
    }
    const d = live.current;
    detach.current();
    if (!d) return;
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
    held.current = true;
    setTimeout(() => (held.current = false), 0);
    update(null);
    if (commit && d.from !== d.to) latest.current.onMove(d.from, d.to);
  }, []);

  useEffect(() => () => finish(false), [finish]);

  const begin = (index: number) => {
    press.current = null;
    const landing: Rect[] = [];
    for (let i = 0; els.current.has(i); i++) {
      const r = els.current.get(i)!.getBoundingClientRect();
      landing.push({ left: r.left, top: r.top, width: r.width, height: r.height });
    }
    const count = latest.current.count;
    if (landing.length < count) return;
    const rects = landing.slice(0, count);
    const held = els.current.get(index)!;
    const zoom = held.offsetWidth ? held.getBoundingClientRect().width / held.offsetWidth : 1;
    const active = document.activeElement;
    const field = (active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement) && held.contains(active) ? { el: active, start: active.selectionStart, end: active.selectionEnd } : null;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
    update({ from: index, to: index, dx: 0, dy: 0, rects, landing, zoom: zoom || 1, field });
  };

  const onPointerDown = (index: number) => (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0 || press.current || live.current || index >= latest.current.count) return;
    if (ignore && (e.target as HTMLElement).closest(ignore)) return;
    const x0 = e.clientX;
    const y0 = e.clientY;
    const timer = setTimeout(() => begin(index), HOLD_MS);
    press.current = { index, x: x0, y: y0, timer };

    const move = (ev: PointerEvent) => {
      const p = press.current;
      if (p) {
        if (beyondSlop(p.x, p.y, ev.clientX, ev.clientY)) finish(false);
        return;
      }
      const d = live.current;
      if (!d) return;
      if (d.field && d.field.start !== null && d.field.end !== null) d.field.el.setSelectionRange(d.field.start, d.field.end);
      const over = slotAt(d.landing, ev.clientX, ev.clientY);
      update({ ...d, dx: ev.clientX - x0, dy: ev.clientY - y0, to: over < 0 ? d.from : Math.min(over, d.rects.length - 1) });
    };
    const up = () => finish(true);
    const cancel = () => finish(false);
    const key = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" && live.current) {
        ev.preventDefault();
        finish(false);
      }
    };
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", cancel, true);
    window.addEventListener("blur", cancel);
    window.addEventListener("keydown", key, true);
    detach.current = () => {
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", cancel, true);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", key, true);
      detach.current = () => {};
    };
  };

  const onKeyDown = (index: number) => (e: ReactKeyboardEvent<HTMLElement>) => {
    if (!e.altKey || e.metaKey || e.ctrlKey || index >= latest.current.count) return;
    const to = arrowTarget(index, e.key, latest.current.count, columns);
    if (to === null) return;
    e.preventDefault();
    latest.current.onMove(index, to);
    setAnnounced(`${name(index)} moved to position ${to + 1} of ${latest.current.count}`);
  };

  const slot = (i: number) => (drag && i < drag.rects.length ? shiftedSlot(i, drag.from, drag.to) : i);

  const item = (i: number): ItemProps => {
    let style: CSSProperties | undefined;
    let state: ItemProps["data-drag"];
    if (drag && i < drag.rects.length) {
      if (i === drag.from) {
        state = "held";
        style = { transform: `translate(${drag.dx / drag.zoom}px, ${drag.dy / drag.zoom}px) scale(1.02)`, transition: "none", position: "relative", zIndex: 30, cursor: "grabbing" };
      } else {
        const s = shiftedSlot(i, drag.from, drag.to);
        // A grid's cells share one size, so the slot's box is the target; a column's cards differ, so the stack is re-laid from their heights.
        const dx = columns > 1 ? (drag.rects[s].left - drag.rects[i].left) / drag.zoom : 0;
        const dy = (columns > 1 ? drag.rects[s].top - drag.rects[i].top : stackedTops(drag.rects, drag.from, drag.to)[i] - drag.rects[i].top) / drag.zoom;
        state = s !== i ? "shifted" : undefined;
        style = { transform: `translate(${dx}px, ${dy}px)`, transition: "transform 160ms ease" };
      }
    }
    return {
      ref: (el: HTMLElement | null) => {
        if (el) els.current.set(i, el);
        else els.current.delete(i);
      },
      style,
      onPointerDown: onPointerDown(i),
      onClickCapture: (e) => {
        if (!held.current) return;
        e.stopPropagation();
        e.preventDefault();
      },
      onKeyDown: onKeyDown(i),
      "data-drag": state,
    };
  };

  return { drag: drag ? { from: drag.from, to: drag.to } : null, slot, item, announced };
}
