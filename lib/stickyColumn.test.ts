import { describe, expect, it } from "vitest";
import { stickyTop, STICKY_FOOT, STICKY_TOP } from "./stickyColumn";

describe("stickyTop", () => {
  it("sticks a column that fits under the region's top edge", () => {
    expect(stickyTop(400, 700)).toBe(STICKY_TOP);
  });

  it("still sticks at the top when the column fills the room exactly", () => {
    const region = 700;
    expect(stickyTop(region - STICKY_TOP - STICKY_FOOT, region)).toBe(STICKY_TOP);
  });

  it("takes a negative top one px past the room, so the foot stays in view", () => {
    const region = 700;
    const column = region - STICKY_TOP - STICKY_FOOT + 1;
    expect(stickyTop(column, region)).toBe(region - STICKY_FOOT - column);
    expect(stickyTop(column, region)).toBeLessThan(STICKY_TOP);
  });

  it("rests a tall column's foot STICKY_FOOT above the region's", () => {
    const region = 700;
    const column = 1000;
    const top = stickyTop(column, region);
    expect(top + column).toBe(region - STICKY_FOOT);
  });

  it("never returns a top that would push the column down the region", () => {
    for (const column of [0, 1, 200, 688, 689, 700, 1200]) {
      expect(stickyTop(column, 700)).toBeLessThanOrEqual(STICKY_TOP);
    }
  });

  it("falls back to the plain top before anything is measured", () => {
    expect(stickyTop(0, 0)).toBe(STICKY_TOP);
    expect(stickyTop(400, 0)).toBe(STICKY_TOP);
  });

  it("takes its own top and foot", () => {
    expect(stickyTop(100, 700, 30, 20)).toBe(30);
    expect(stickyTop(700, 700, 30, 20)).toBe(700 - 20 - 700);
  });
});
