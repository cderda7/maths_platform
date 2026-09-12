import { describe, expect, it } from "vitest";
import { fitScale } from "./pdfPages";

describe("fitScale", () => {
  it("fits a page's longer edge in the side and never scales up", () => {
    // A4 at 72 dpi is 595 × 842 points.
    expect(fitScale(595, 842, 160)).toBeCloseTo(160 / 842, 6);
    expect(Math.round(842 * fitScale(595, 842, 160))).toBe(160);
    expect(fitScale(842, 595, 160)).toBeCloseTo(160 / 842, 6);
    expect(fitScale(100, 50, 160)).toBe(1);
    expect(fitScale(0, 0, 160)).toBe(1);
  });
});
