import { DEMO_STUDENT } from "@/data/assignment";
import { DEMO_ARRIVAL_OFFSETS_MS } from "@/data/arrivals";
import { CLASSMATES } from "@/data/classmates";
import type { ClassroomState } from "./classroom";
import { liveAbsent, presentCount } from "./absence";

/**
 * The gate into group review: the whole class enters together. Each student's arrival (their
 * corrections handed in, or their set when the pathway has no individual review) is recorded on
 * the classroom. For the demo the classmates arrive on a scripted timeline anchored to the demo
 * student's own arrival, so the count climbs while they watch. Group review starts on its own the
 * moment everyone is in, or when the grace of the teacher's force submit on individual review
 * (ticket 145; "start group review now" before it) runs out. An absent student (ticket 250) never arrives and is not
 * waited for: the class in the room is everyone. Pure.
 */
/** The class on the roster: the demo student and the classmates. What a set counts is this less its absent students (`presentCount`). */
export const CLASS_SIZE = 1 + CLASSMATES.length;

/** Milliseconds after the demo student's arrival at which each classmate hands in: the demo's named timing, about a minute in all (`data/arrivals.ts`, ticket 332). */
export const ARRIVAL_OFFSETS_MS: Readonly<Record<string, number>> = DEMO_ARRIVAL_OFFSETS_MS;
export const LAST_ARRIVAL_MS = Math.max(...Object.values(ARRIVAL_OFFSETS_MS));

export interface Readiness {
  /** How many of the class have handed in, the demo student included. */
  handedIn: number;
  /** The class in the room: twenty less the absent. */
  total: number;
  /** True once everyone is in, or once a force submit on individual review has passed its grace. */
  started: boolean;
  /** Why it started, when it has. */
  reason: "everyone" | "teacher" | null;
  /** The moment it started (the last hand-in, or the end of the teacher's grace, whichever came first); null until then. The group intro's clock runs from here (ticket 220). */
  startedAt: number | null;
}

export function classReadiness(c: ClassroomState | null | undefined, now: number): Readiness {
  const samAt = c?.arrivals?.[DEMO_STUDENT.id];
  const absent = liveAbsent(c);
  const present = CLASSMATES.filter((m) => !absent.includes(m.id));
  const total = presentCount(CLASSMATES, absent);
  const classmatesIn = samAt === undefined ? 0 : present.filter((m) => now >= samAt + ARRIVAL_OFFSETS_MS[m.id]).length;
  const handedIn = (samAt === undefined ? 0 : 1) + classmatesIn;
  const everyone = handedIn >= total;
  const forced = !!c?.advance && c.advance.kind === "force-review" && now >= c.advance.deadline;
  const lastIn = Math.max(0, ...present.map((m) => ARRIVAL_OFFSETS_MS[m.id]));
  const moments = [...(everyone && samAt !== undefined ? [samAt + lastIn] : []), ...(forced ? [c!.advance!.deadline] : [])];
  return { handedIn, total, started: everyone || forced, reason: everyone ? "everyone" : forced ? "teacher" : null, startedAt: moments.length ? Math.min(...moments) : null };
}
