import { DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import type { ClassroomState } from "./classroom";

/**
 * The gate into group review: the whole class enters together. Each student's arrival (their
 * corrections handed in, or their set when the pathway has no individual review) is recorded on
 * the classroom. For the demo the classmates arrive on a scripted timeline anchored to the demo
 * student's own arrival, so the count climbs while they watch. Group review starts on its own the
 * moment everyone is in, or when the teacher's "start group review" grace runs out. Pure.
 */
export const CLASS_SIZE = 1 + CLASSMATES.length;

/** Milliseconds after the demo student's arrival at which each classmate hands in, in fixture order: a spread of about twenty seconds. */
export const ARRIVAL_OFFSETS_MS: Record<string, number> = Object.fromEntries(CLASSMATES.map((c, i) => [c.id, 1500 + i * 1100 + (i % 3) * 250]));
export const LAST_ARRIVAL_MS = Math.max(...Object.values(ARRIVAL_OFFSETS_MS));

export interface Readiness {
  /** How many of the class have handed in, the demo student included. */
  handedIn: number;
  total: number;
  /** True once everyone is in, or once a "start group review" advance's grace has passed. */
  started: boolean;
  /** Why it started, when it has. */
  reason: "everyone" | "teacher" | null;
}

export function classReadiness(c: ClassroomState | null | undefined, now: number): Readiness {
  const samAt = c?.arrivals?.[DEMO_STUDENT.id];
  const classmatesIn = samAt === undefined ? 0 : CLASSMATES.filter((m) => now >= samAt + ARRIVAL_OFFSETS_MS[m.id]).length;
  const handedIn = (samAt === undefined ? 0 : 1) + classmatesIn;
  const everyone = handedIn >= CLASS_SIZE;
  const forced = !!c?.advance && c.advance.kind === "group-start" && now >= c.advance.deadline;
  return { handedIn, total: CLASS_SIZE, started: everyone || forced, reason: everyone ? "everyone" : forced ? "teacher" : null };
}
