import { describe, expect, it } from "vitest";
import { demoClockNow, tickDemoClock, type DemoClock } from "./demoClock";

describe("tickDemoClock (ticket 357: held ArrowRight speeds up time within a stage)", () => {
  const fresh: DemoClock = { realMs: 1_000, offsetMs: 0 };

  it("at scale 1 the virtual clock matches real time exactly", () => {
    const c = tickDemoClock(fresh, 5_000, 1);
    expect(demoClockNow(c)).toBe(5_000);
  });

  it("at scale 10, one real second passing reads as ten seconds having passed", () => {
    const c = tickDemoClock(fresh, fresh.realMs + 1_000, 10);
    expect(demoClockNow(c) - demoClockNow(fresh)).toBe(10_000);
  });

  it("accumulates across ticks at different scales rather than resetting each time", () => {
    let c = fresh;
    c = tickDemoClock(c, c.realMs + 500, 10); // +5000ms virtual
    c = tickDemoClock(c, c.realMs + 500, 1); // +500ms virtual (real time)
    c = tickDemoClock(c, c.realMs + 200, 10); // +2000ms virtual
    expect(demoClockNow(c) - demoClockNow(fresh)).toBe(5_000 + 500 + 2_000);
  });

  it("a real timestamp at or before the clock's own is a no-op", () => {
    const c = tickDemoClock(fresh, fresh.realMs, 10);
    expect(c).toEqual(fresh);
    const stale = tickDemoClock(fresh, fresh.realMs - 10, 10);
    expect(stale).toEqual(fresh);
  });

  it("releasing back to scale 1 keeps the accumulated offset instead of decaying it", () => {
    const sped = tickDemoClock(fresh, fresh.realMs + 1_000, 10);
    const released = tickDemoClock(sped, sped.realMs + 1_000, 1);
    expect(demoClockNow(released)).toBe(demoClockNow(sped) + 1_000);
  });
});
