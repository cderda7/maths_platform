import type { FinishedSet } from "@/data/finishedSet";
import * as REGISTERED from "@/data/finishedSets";
import { dueOrder } from "./dueDate";

/**
 * Every registered finished set (ticket 210), oldest due first: the one list the registry
 * (`lib/assignments.ts`), the evaluation index (`lib/evaluate.ts`) and the frozen groups
 * (`lib/seating.ts`) are built from. Sets due the same day keep the export order.
 */
export const FINISHED_SETS: readonly FinishedSet[] = Object.values(REGISTERED as Record<string, FinishedSet>).sort((a, b) => dueOrder(a.fixture.due) - dueOrder(b.fixture.due));

/** A finished set by its id (`pset-5`), or undefined. */
export const finishedSetById = (id: string): FinishedSet | undefined => FINISHED_SETS.find((s) => s.fixture.id === id);
