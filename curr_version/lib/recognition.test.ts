import { describe, expect, it } from "vitest";
import { afterUndo, nextLine } from "./recognition";

const script = ["a", "b", "c"];

describe("simulated recognition bookkeeping", () => {
  it("reveals lines in script order, one per burst", () => {
    const l1 = nextLine(script, [], 4)!;
    expect(l1).toEqual({ tex: "a", strokeCount: 4 });
    const l2 = nextLine(script, [l1], 9)!;
    expect(l2.tex).toBe("b");
  });

  it("does not reveal when nothing new has been drawn", () => {
    const l1 = { tex: "a", strokeCount: 4 };
    expect(nextLine(script, [l1], 4)).toBeNull();
    expect(nextLine(script, [], 0)).toBeNull();
  });

  it("stops when the script is exhausted", () => {
    const rev = [
      { tex: "a", strokeCount: 2 },
      { tex: "b", strokeCount: 4 },
      { tex: "c", strokeCount: 6 },
    ];
    expect(nextLine(script, rev, 8)).toBeNull();
  });

  it("undo withdraws a line once its last stroke is gone, and the line comes back on the next burst", () => {
    const rev = [
      { tex: "a", strokeCount: 3 },
      { tex: "b", strokeCount: 7 },
    ];
    expect(afterUndo(rev, 6)).toEqual([{ tex: "a", strokeCount: 3 }]);
    expect(afterUndo(rev, 7)).toEqual(rev);
    expect(afterUndo(rev, 0)).toEqual([]);
    expect(nextLine(script, afterUndo(rev, 6), 7)!.tex).toBe("b");
  });
});
