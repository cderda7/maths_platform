import { CLASSMATES } from "./classmates";

/**
 * Simulation only (ticket 332): when each classmate reaches the gate into group review, in milliseconds after the demo
 * student's own arrival, in fixture order. The whole class arrives over about a minute (the last at 59.1 s), so the count
 * climbs while the presenter watches and the decision card before group review (ticket 337) has time on screen. Before
 * ticket 332 the spread was about twenty seconds. The product rule stays in `lib/readiness.ts`: the gate opens by itself
 * the moment everyone in the room is in, whenever that is; only these moments are the demo's.
 */
export const DEMO_ARRIVAL_OFFSETS_MS: Readonly<Record<string, number>> = Object.fromEntries(CLASSMATES.map((c, i) => [c.id, 1500 + i * 3200 + (i % 3) * 400]));
