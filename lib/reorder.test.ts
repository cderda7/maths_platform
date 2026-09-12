import { describe, expect, it } from "vitest";
import { arrowTarget, beyondSlop, HOLD_MS, HOLD_SLOP, moveItem, shiftedSlot, slotAt, stackedTops, type Rect } from "./reorder";

describe("moveItem", () => {
  const list = ["a", "b", "c", "d", "e"];
  it("moves an item forward and backward", () => {
    expect(moveItem(list, 0, 3)).toEqual(["b", "c", "d", "a", "e"]);
    expect(moveItem(list, 4, 1)).toEqual(["a", "e", "b", "c", "d"]);
  });
  it("returns a copy when nothing moves or an index is out of range", () => {
    expect(moveItem(list, 2, 2)).toEqual(list);
    expect(moveItem(list, 2, 2)).not.toBe(list);
    expect(moveItem(list, -1, 2)).toEqual(list);
    expect(moveItem(list, 2, 5)).toEqual(list);
  });
});

describe("HOLD_MS", () => {
  it("sits above a click's press-to-release and below a beat (ticket 160)", () => {
    expect(HOLD_MS).toBeGreaterThanOrEqual(120);
    expect(HOLD_MS).toBeLessThanOrEqual(200);
  });
});

describe("beyondSlop", () => {
  it("allows a wander within the tolerance and refuses one past it", () => {
    expect(beyondSlop(10, 10, 10 + HOLD_SLOP, 10)).toBe(false);
    expect(beyondSlop(10, 10, 10 + HOLD_SLOP + 1, 10)).toBe(true);
    expect(beyondSlop(10, 10, 15, 15)).toBe(true);
  });
});

/** A five-wide grid of 100 px tiles with 20 px gaps, two rows. */
const grid: Rect[] = Array.from({ length: 8 }, (_, i) => ({ left: (i % 5) * 120, top: Math.floor(i / 5) * 120, width: 100, height: 100 }));
/** A column of cards of different heights. */
const column: Rect[] = [
  { left: 0, top: 0, width: 400, height: 200 },
  { left: 0, top: 216, width: 400, height: 120 },
  { left: 0, top: 352, width: 400, height: 300 },
];

describe("slotAt", () => {
  it("picks the tile whose centre is nearest the pointer in a grid", () => {
    expect(slotAt(grid, 50, 50)).toBe(0);
    expect(slotAt(grid, 300, 40)).toBe(2);
    expect(slotAt(grid, 130, 180)).toBe(6);
    expect(slotAt(grid, 700, 700)).toBe(7);
  });
  it("picks by centre in a column of uneven cards", () => {
    expect(slotAt(column, 200, 10)).toBe(0);
    expect(slotAt(column, 200, 250)).toBe(1);
    expect(slotAt(column, 200, 400)).toBe(2);
  });
  it("is -1 with nothing to land on", () => {
    expect(slotAt([], 1, 1)).toBe(-1);
  });
});

describe("shiftedSlot", () => {
  it("slides the items between the hole and the target one slot", () => {
    // 1 held over 3: 2 and 3 move up, 1 takes 3.
    expect([0, 1, 2, 3, 4].map((i) => shiftedSlot(i, 1, 3))).toEqual([0, 3, 1, 2, 4]);
    // 3 held over 1: 1 and 2 move down, 3 takes 1.
    expect([0, 1, 2, 3, 4].map((i) => shiftedSlot(i, 3, 1))).toEqual([0, 2, 3, 1, 4]);
  });
  it("moves nothing while the item is over its own slot", () => {
    expect([0, 1, 2].map((i) => shiftedSlot(i, 1, 1))).toEqual([0, 1, 2]);
  });
  it("agrees with moveItem", () => {
    const list = ["a", "b", "c", "d", "e"];
    for (let from = 0; from < 5; from++)
      for (let to = 0; to < 5; to++) {
        const moved = moveItem(list, from, to);
        list.forEach((x, i) => expect(moved[shiftedSlot(i, from, to)]).toBe(x));
      }
  });
});

describe("stackedTops", () => {
  it("restacks a column of uneven cards in the shifted order, keeping the gap", () => {
    // Third (300 tall) held over first: it takes the top, the 200 and the 120 follow after it.
    expect(stackedTops(column, 2, 0)).toEqual([316, 532, 0]);
    // First (200 tall) held over last: the 120 and the 300 move up, it lands after them.
    expect(stackedTops(column, 0, 2)).toEqual([452, 0, 136]);
  });
  it("leaves every top where it is while the item is over its own slot", () => {
    expect(stackedTops(column, 1, 1)).toEqual(column.map((r) => r.top));
  });
  it("copes with one card and none", () => {
    expect(stackedTops([column[0]], 0, 0)).toEqual([0]);
    expect(stackedTops([], 0, 0)).toEqual([]);
  });
});

describe("arrowTarget", () => {
  it("steps one slot sideways and one row up or down", () => {
    expect(arrowTarget(6, "ArrowLeft", 8, 5)).toBe(5);
    expect(arrowTarget(6, "ArrowRight", 8, 5)).toBe(7);
    expect(arrowTarget(6, "ArrowUp", 8, 5)).toBe(1);
    expect(arrowTarget(1, "ArrowDown", 8, 5)).toBe(6);
  });
  it("refuses a step off the list and any other key", () => {
    expect(arrowTarget(0, "ArrowLeft", 8, 5)).toBeNull();
    expect(arrowTarget(7, "ArrowRight", 8, 5)).toBeNull();
    expect(arrowTarget(3, "ArrowDown", 8, 5)).toBeNull();
    expect(arrowTarget(3, "Enter", 8, 5)).toBeNull();
  });
  it("is up and down only in a column", () => {
    expect(arrowTarget(1, "ArrowUp", 3, 1)).toBe(0);
    expect(arrowTarget(1, "ArrowDown", 3, 1)).toBe(2);
    expect(arrowTarget(1, "ArrowLeft", 3, 1)).toBe(0);
  });
});
