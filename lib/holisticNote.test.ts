import { describe, expect, it } from "vitest";
import { dismissNote, HOLISTIC_NOTE_KEY, isNoteDismissed } from "./holisticNote";

/** A Map standing in for localStorage. */
function memory() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m };
}

describe("the Class View's did-you-know note (ticket 253)", () => {
  it("shows until dismissed, then stays dismissed", () => {
    const s = memory();
    expect(isNoteDismissed(s)).toBe(false);
    dismissNote(s, 1_000);
    expect(isNoteDismissed(s)).toBe(true);
    expect(s.m.get(HOLISTIC_NOTE_KEY)).toBe("1000");
    dismissNote(s, 2_000);
    expect(isNoteDismissed(s)).toBe(true);
  });

  it("clearing its key brings it back", () => {
    const s = memory();
    dismissNote(s, 1_000);
    s.removeItem(HOLISTIC_NOTE_KEY);
    expect(isNoteDismissed(s)).toBe(false);
  });

  it("has its own key, outside the demo's classroom and session keys (Reset demo leaves it)", () => {
    expect(HOLISTIC_NOTE_KEY).not.toMatch(/^edexia-maths-demo\//);
  });

  it("reads blocked storage as not dismissed, and dismissing into it does not throw", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(isNoteDismissed(blocked)).toBe(false);
    expect(() => dismissNote(blocked, 1)).not.toThrow();
  });
});
