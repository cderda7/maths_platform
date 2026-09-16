import { describe, expect, it } from "vitest";
import { HOLD_STEP_FLOOR_MS, HOLD_STEP_START_MS, holdStepDelayMs } from "./arrowHold";

describe("holdStepDelayMs (ticket 354: held ArrowRight speeds the demo up)", () => {
  it("starts at the first-press delay and never climbs back up while held", () => {
    expect(holdStepDelayMs(0)).toBe(HOLD_STEP_START_MS);
    const delays = Array.from({ length: 12 }, (_, i) => holdStepDelayMs(i));
    for (let i = 1; i < delays.length; i++) expect(delays[i]).toBeLessThanOrEqual(delays[i - 1]);
  });

  it("halves every two auto-steps down to the floor, then holds there", () => {
    expect([holdStepDelayMs(0), holdStepDelayMs(1)]).toEqual([450, 450]);
    expect([holdStepDelayMs(2), holdStepDelayMs(3)]).toEqual([225, 225]);
    expect(holdStepDelayMs(100)).toBe(HOLD_STEP_FLOOR_MS);
  });
});
