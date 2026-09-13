import type { LeafId } from "@/data/taxonomy";

/**
 * What the student's report shows in its side column (ticket 233): the key and the reflection, or the
 * marked working behind one problem (a Q tile under What happened) or one skill (a skill row).
 */
export type ReportWork = { kind: "problem"; id: string } | { kind: "skill"; leaf: LeafId } | null;
export type OpenWork = Exclude<ReportWork, null>;

export const sameWork = (a: ReportWork, b: ReportWork): boolean =>
  a === null || b === null ? a === b : a.kind === "problem" ? b.kind === "problem" && a.id === b.id : b.kind === "skill" && a.leaf === b.leaf;

/** A press on a tile or skill: the one already open closes, any other opens in its place. */
export const pressWork = (current: ReportWork, pressed: OpenWork): ReportWork => (sameWork(current, pressed) ? null : pressed);

/**
 * What happened's columns, each as wide as its tiles want and never narrower than its label wants
 * (`floors`, px): an fr per tile (one for an empty column), so a long run of tiles stays on one line.
 */
export const outcomeTemplate = (counts: number[], floors: number[]): string => counts.map((n, i) => `minmax(${floors[i]}px, ${Math.max(n, 1)}fr)`).join(" ");
