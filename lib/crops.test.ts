import { describe, expect, it } from "vitest";
import { cropRect } from "./crops";

describe("cropRect", () => {
  it("turns a normalised box into whole pixels on the picture", () => {
    expect(cropRect({ x0: 0.175, y0: 0.492, x1: 0.519, y1: 0.739 }, 640, 600)).toEqual({ x: 112, y: 295, w: 220, h: 148 });
    expect(cropRect({ x0: 0, y0: 0, x1: 1, y1: 1 }, 100, 50)).toEqual({ x: 0, y: 0, w: 100, h: 50 });
  });

  it("clamps inside the picture and never returns an empty rect", () => {
    expect(cropRect({ x0: 0.9, y0: 0.9, x1: 1, y1: 1 }, 10, 10)).toEqual({ x: 9, y: 9, w: 1, h: 1 });
    expect(cropRect({ x0: 0.5, y0: 0.5, x1: 0.5, y1: 0.5 }, 100, 100)).toEqual({ x: 50, y: 50, w: 1, h: 1 });
    expect(cropRect({ x0: 0.999, y0: 0, x1: 1, y1: 0.001 }, 100, 100)).toEqual({ x: 99, y: 0, w: 1, h: 1 });
  });
});
