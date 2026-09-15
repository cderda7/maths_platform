import type { StoryCategory } from "@/data/story";
import { FAMILIES, FAMILY_IDS, familyOf, SIGNATURE_MIN_SETS, type FamilyId } from "@/data/signatures";
import type { MisconceptionId } from "@/data/misconceptions";

/**
 * A student's error signatures (ticket 303): one family of errors (`data/signatures.ts`) seen on two sets or more,
 * whatever topic or category each set put it in. The holistic page and the tiles bin patterns by category; the
 * signature is the signal that runs across the bins (Sam's minus signs in algebra, graphing and New skills across four
 * sets). Read from the patterns the page surfaces (`surfacing`, ticket 276), so a signature never names a set or a
 * pattern the page does not show. Pure.
 */

/** One pattern as the page surfaces it: its category, wording, misconception and the sets it shows on. */
export interface SignatureInput {
  category: StoryCategory;
  text: string;
  tag: string;
  misconception: MisconceptionId | null;
  refs: readonly { set: string; label: string }[];
}

export interface Signature {
  family: FamilyId;
  name: string;
  gloss: string;
  /** The sets it shows on, in the order given (oldest first on the page): ids and labels. */
  sets: { id: string; label: string }[];
  /** Its patterns, in the order given: category, wording and tag. */
  patterns: { category: StoryCategory; text: string; tag: string }[];
  /** The grid cells that carry it: a set × category once each. */
  cells: { set: string; category: StoryCategory }[];
}

/** `sets`: every set on the page, oldest first, so a signature's sets read in that order. */
export function signaturesOf(patterns: readonly SignatureInput[], sets: readonly { id: string; label: string }[]): Signature[] {
  const by = new Map<FamilyId, SignatureInput[]>();
  for (const p of patterns) {
    const f = familyOf(p.misconception);
    by.set(f, [...(by.get(f) ?? []), p]);
  }
  const out: Signature[] = [];
  for (const [family, ps] of by) {
    const seen = new Set(ps.flatMap((p) => p.refs.map((r) => r.set)));
    if (seen.size < SIGNATURE_MIN_SETS) continue;
    const cells = new Map<string, { set: string; category: StoryCategory }>();
    for (const p of ps) for (const r of p.refs) cells.set(`${r.set}|${p.category}`, { set: r.set, category: p.category });
    out.push({
      family,
      name: FAMILIES[family].name,
      gloss: FAMILIES[family].gloss,
      sets: sets.filter((s) => seen.has(s.id)).map((s) => ({ id: s.id, label: s.label })),
      patterns: ps.map((p) => ({ category: p.category, text: p.text, tag: p.tag })),
      cells: [...cells.values()],
    });
  }
  // Most sets first, then most patterns, then the families' own order.
  return out.sort((a, b) => b.sets.length - a.sets.length || b.patterns.length - a.patterns.length || FAMILY_IDS.indexOf(a.family) - FAMILY_IDS.indexOf(b.family));
}
