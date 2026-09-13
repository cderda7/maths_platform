import { describe, expect, it } from "vitest";
import { outcomeTemplate, pressWork, sameWork, type OpenWork } from "./reportWork";

const q4: OpenWork = { kind: "problem", id: "p4" };
const q7: OpenWork = { kind: "problem", id: "p7" };
const nfl: OpenWork = { kind: "skill", leaf: "functions.zeros.nfl" };

describe("the report's side column (ticket 233)", () => {
  it("opens what was pressed from the key and reflection", () => {
    expect(pressWork(null, q4)).toEqual(q4);
    expect(pressWork(null, nfl)).toEqual(nfl);
  });

  it("switches to another tile or skill in place", () => {
    expect(pressWork(q4, q7)).toEqual(q7);
    expect(pressWork(q4, nfl)).toEqual(nfl);
    expect(pressWork(nfl, q4)).toEqual(q4);
  });

  it("closes when the open one is pressed again", () => {
    expect(pressWork(q4, { kind: "problem", id: "p4" })).toBeNull();
    expect(pressWork(nfl, { kind: "skill", leaf: "functions.zeros.nfl" })).toBeNull();
  });

  it("tells a problem and a skill apart", () => {
    expect(sameWork(q4, q4)).toBe(true);
    expect(sameWork(q4, nfl)).toBe(false);
    expect(sameWork(null, null)).toBe(true);
    expect(sameWork(null, q4)).toBe(false);
  });
});

describe("outcomeTemplate", () => {
  it("gives each column an fr per tile, one for an empty column, and its own floor", () => {
    expect(outcomeTemplate([5, 4, 0, 1], [100, 110, 90, 64])).toBe("minmax(100px, 5fr) minmax(110px, 4fr) minmax(90px, 1fr) minmax(64px, 1fr)");
    expect(outcomeTemplate([10, 0], [100, 64])).toBe("minmax(100px, 10fr) minmax(64px, 1fr)");
  });
});
