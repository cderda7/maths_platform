/**
 * Ticket 357: the pure arithmetic behind the demo's fast-forwardable clock (`demoNow` in `lib/store.ts`,
 * driven by holding ArrowRight in `lib/arrowHold.ts`). A `DemoClock` pairs the real timestamp it last
 * saw with an accumulated offset; `tickDemoClock` advances both given a new real timestamp and the scale
 * in force since the last tick, working in elapsed deltas (not a fixed rate) so it produces the same
 * virtual timeline however often it's called — once a second or once a frame. Kept separate from
 * `lib/store.ts`'s module-level mutable state so the accumulation math itself is pure and testable.
 */
export interface DemoClock {
  realMs: number;
  offsetMs: number;
}

/** The clock after real time reaches `realMs`, having run at `scale`× since the last tick. `scale` of 1 leaves the offset unchanged; a `realMs` at or before the clock's own is a no-op (a stale or repeated read). */
export function tickDemoClock(clock: DemoClock, realMs: number, scale: number): DemoClock {
  if (realMs <= clock.realMs) return clock;
  return { realMs, offsetMs: clock.offsetMs + (realMs - clock.realMs) * (scale - 1) };
}

/** The clock's own virtual "now": real time plus whatever has accumulated. */
export function demoClockNow(clock: DemoClock): number {
  return clock.realMs + clock.offsetMs;
}
