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
 *
 * `rows` (px, ticket 287) is the width a column's tiles take on one row, when that is more than its floor. A column holds
 * that much only while the grid has room for it beside every other column's floor and the `gap`s: past that it takes what
 * is left and its tiles wrap, rather than pushing the last column out of the card (Sam's Problem Set 1 on the iPad: ten
 * right first time beside four more columns, 21 px over).
 */
export function outcomeTemplate(counts: number[], floors: number[], rows: number[] = floors, gap = 0): string {
  const total = floors.reduce((a, f) => a + f, 0) + gap * Math.max(counts.length - 1, 0);
  return counts
    .map((n, i) => {
      const row = rows[i] ?? floors[i];
      const min = row > floors[i] ? `max(${floors[i]}px, min(${row}px, calc(100% - ${total - floors[i]}px)))` : `${floors[i]}px`;
      return `minmax(${min}, ${Math.max(n, 1)}fr)`;
    })
    .join(" ");
}
