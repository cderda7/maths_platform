import type { Problem, UnitRef } from "@/data/types";
import { unitOf } from "@/data/taxonomy";
import { problemLeaves } from "./hierarchy";

/** The QCAA unit a set of problems points at: the unit whose Unit Focus leaves are tagged most; Unit 1 when none are. */
export function inferUnitFromProblems(problems: Problem[]): 1 | 2 | 3 | 4 {
  const counts = new Map<number, number>();
  for (const p of problems) for (const l of problemLeaves(p)) {
    const u = unitOf(l);
    if (u) counts.set(u, (counts.get(u) ?? 0) + 1);
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return (best?.[0] as 1 | 2 | 3 | 4 | undefined) ?? 1;
}

/** Re-inference from the teacher's own words, by keyword. Unit 1 when nothing matches. */
export function inferUnitFromText(text: string): 1 | 2 | 3 | 4 {
  const t = text.toLowerCase();
  if (/calculus|derivative|differentiat|chain rule|product rule|quotient rule|rates? of change|\brates?\b/.test(t)) return 3;
  if (/exponential|logarithm|\blog\b|series|sequence/.test(t)) return 2;
  if (/statistic|sample|sampling|distribution|probability/.test(t)) return 4;
  return 1;
}

/** The unit titles of the QCAA Mathematical Methods 2025 syllabus (ticket 184 moved the class onto it; the 2019 titles were corrected in ticket 188). */
export const UNIT_TITLES: Record<1 | 2 | 3 | 4, string> = {
  1: "Surds, algebra, functions and probability",
  2: "Calculus and further functions",
  3: "Further calculus, skewness and integration",
  4: "Further integration, trigonometry and statistics",
};

export const unitRef = (n: 1 | 2 | 3 | 4, topic = "", title = UNIT_TITLES[n]): UnitRef => ({ number: n, topic, title });
