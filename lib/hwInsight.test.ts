import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flasher, HW_INSIGHT_MESSAGE, HW_INSIGHT_MS } from "./hwInsight";

describe("homework cell insight placeholder (ticket 324)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("reads the user's words exactly and lasts about two and a half seconds", () => {
    expect(HW_INSIGHT_MESSAGE).toBe("HW insight scoped in FUTURE_FEATURES");
    expect(HW_INSIGHT_MS).toBe(2500);
  });

  it("shows the pressed cell, then clears after the timer", () => {
    const seen: (string | null)[] = [];
    const f = flasher<string>((s) => seen.push(s));
    f.press("hw-2");
    expect(seen).toEqual(["hw-2"]);
    vi.advanceTimersByTime(HW_INSIGHT_MS - 1);
    expect(seen).toEqual(["hw-2"]);
    vi.advanceTimersByTime(1);
    expect(seen).toEqual(["hw-2", null]);
  });

  it("restarts the timer when the same cell is pressed again", () => {
    const seen: (string | null)[] = [];
    const f = flasher<string>((s) => seen.push(s));
    f.press("hw-1");
    vi.advanceTimersByTime(2000);
    f.press("hw-1");
    vi.advanceTimersByTime(2000);
    expect(seen.at(-1)).toBe("hw-1");
    vi.advanceTimersByTime(500);
    expect(seen).toEqual(["hw-1", "hw-1", null]);
  });

  it("moves to another cell, with one clear at the end", () => {
    const seen: (string | null)[] = [];
    const f = flasher<string>((s) => seen.push(s));
    f.press("hw-1");
    vi.advanceTimersByTime(1000);
    f.press("hw-3");
    vi.advanceTimersByTime(HW_INSIGHT_MS);
    expect(seen).toEqual(["hw-1", "hw-3", null]);
  });

  it("never clears after dispose", () => {
    const show = vi.fn();
    const f = flasher<string>(show);
    f.press("hw-2");
    f.dispose();
    vi.advanceTimersByTime(HW_INSIGHT_MS * 2);
    expect(show).toHaveBeenCalledTimes(1);
  });
});
