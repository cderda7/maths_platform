import { misconceptionName, type MisconceptionId } from "@/data/misconceptions";
import type { AssignmentBundle } from "./assignments";
import { mistakesByProblem } from "./mistakes";
import type { StudentSession } from "./session";

/**
 * Counting misconceptions (ticket 299). A sighting is one student showing one misconception on one problem of one set in
 * one class; a count gathers sightings under the misconception's id, which is the same on every problem, set and class
 * (`data/misconceptions.ts`), so counts from different classes add up. Sightings carry no names and no working, only
 * ids, which is all a cross-class count needs.
 */
export interface Sighting {
  misconception: MisconceptionId;
  /** The class the work came from: a student id is only unique inside it. */
  cohort: string;
  student: string;
  set: string;
  problem: string;
}

export interface MisconceptionCount {
  misconception: MisconceptionId;
  name: string;
  /** Problems a student showed it on (a student showing it twice on one problem counts once). */
  sightings: number;
  students: number;
  sets: number;
  cohorts: number;
}

/**
 * Every sighting on a set: each row of its Mistakes tab (the class present, first submissions, `mistakesByProblem`)
 * gives one per misconception its wrong lines show.
 */
export function sightingsOn(bundle: Pick<AssignmentBundle, "id" | "className"> & Parameters<typeof mistakesByProblem>[1], session: StudentSession | null = null, now?: number): Sighting[] {
  return mistakesByProblem(session, bundle, now).flatMap(({ problem, rows }) =>
    rows.flatMap((r) => [...new Set(r.misconceptions)].map((misconception) => ({ misconception, cohort: bundle.className, student: r.id, set: bundle.id, problem: problem.id }))),
  );
}

/** Sightings gathered by misconception: most students first, then most sightings, then first seen. */
export function countMisconceptions(sightings: Iterable<Sighting>): MisconceptionCount[] {
  const by = new Map<MisconceptionId, { keys: Set<string>; students: Set<string>; sets: Set<string>; cohorts: Set<string> }>();
  for (const s of sightings) {
    const c = by.get(s.misconception) ?? { keys: new Set(), students: new Set(), sets: new Set(), cohorts: new Set() };
    c.keys.add(JSON.stringify([s.cohort, s.student, s.set, s.problem]));
    c.students.add(JSON.stringify([s.cohort, s.student]));
    c.sets.add(JSON.stringify([s.cohort, s.set]));
    c.cohorts.add(s.cohort);
    by.set(s.misconception, c);
  }
  return [...by.entries()]
    .map(([misconception, c]) => ({ misconception, name: misconceptionName(misconception), sightings: c.keys.size, students: c.students.size, sets: c.sets.size, cohorts: c.cohorts.size }))
    .sort((a, b) => b.students - a.students || b.sightings - a.sightings);
}
