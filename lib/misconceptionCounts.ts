import { misconceptionName, type MisconceptionId } from "@/data/misconceptions";
import type { AssignmentBundle } from "./assignments";
import { questionFor, pickersAt } from "./diagnostic";
import type { DiagnosticRun } from "./diagnosticChain";
import { mistakesByProblem } from "./mistakes";
import type { StudentSession } from "./session";

/**
 * Counting misconceptions (ticket 299). A sighting is one student showing one misconception on one problem of one set in
 * one class; a count gathers sightings under the misconception's id, which is the same on every problem, set and class
 * (`data/misconceptions.ts`), so counts from different classes add up. Sightings carry no names and no working, only
 * ids, which is all a cross-class count needs. A sighting comes from written work (a wrong line) or from a live
 * diagnostic (a distractor picked, ticket 302); the two count separately, so the same student picking the distractor for
 * the misconception their own line shows is two sightings of it.
 */
export interface Sighting {
  misconception: MisconceptionId;
  source: "work" | "diagnostic";
  /** The class the work came from: a student id is only unique inside it. */
  cohort: string;
  student: string;
  set: string;
  problem: string;
}

export interface MisconceptionCount {
  misconception: MisconceptionId;
  name: string;
  /** Problems a student showed it on, per source (a student showing it twice on one problem in one source counts once). */
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
    rows.flatMap((r) => [...new Set(r.misconceptions)].map((misconception) => ({ misconception, source: "work" as const, cohort: bundle.className, student: r.id, set: bundle.id, problem: problem.id }))),
  );
}

/**
 * Every sighting a diagnostic chain gave at `now`: each student who picked a distractor on a step that has closed or is
 * open, one per step, under the distractor's misconception and the step's problem. The right answer gives none.
 */
export function diagnosticSightings(run: DiagnosticRun, now: number, where: { cohort: string; set: string }, absent: readonly string[] = []): Sighting[] {
  return run.openedAt.flatMap((_, index) => {
    const step = questionFor(run.steps[index]);
    if (!step) return [];
    const pickers = pickersAt(run, now, index, absent);
    return step.options.flatMap((o) => (o.misconception ? (pickers[o.id] ?? []).map((student) => ({ misconception: o.misconception!, source: "diagnostic" as const, cohort: where.cohort, student, set: where.set, problem: step.problemId })) : []));
  });
}

/** Sightings gathered by misconception: most students first, then most sightings, then first seen. */
export function countMisconceptions(sightings: Iterable<Sighting>): MisconceptionCount[] {
  const by = new Map<MisconceptionId, { keys: Set<string>; students: Set<string>; sets: Set<string>; cohorts: Set<string> }>();
  for (const s of sightings) {
    const c = by.get(s.misconception) ?? { keys: new Set(), students: new Set(), sets: new Set(), cohorts: new Set() };
    c.keys.add(JSON.stringify([s.source, s.cohort, s.student, s.set, s.problem]));
    c.students.add(JSON.stringify([s.cohort, s.student]));
    c.sets.add(JSON.stringify([s.cohort, s.set]));
    c.cohorts.add(s.cohort);
    by.set(s.misconception, c);
  }
  return [...by.entries()]
    .map(([misconception, c]) => ({ misconception, name: misconceptionName(misconception), sightings: c.keys.size, students: c.students.size, sets: c.sets.size, cohorts: c.cohorts.size }))
    .sort((a, b) => b.students - a.students || b.sightings - a.sightings);
}
