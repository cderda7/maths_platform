import { ASSIGNMENT } from "@/data/assignment";
import { studentLeafName, type LeafId } from "@/data/taxonomy";
import type { Problem } from "@/data/types";
import { relevantSkills } from "./hierarchy";

/**
 * The "not confident with…" list on the confidence screen. The student names factorising as one
 * thing (the row reads "factorising"), and ticking it opens two sub-rows, "monic" and "non-monic",
 * to tick one or both; a student who ticks factorising and neither kind means both. The answer
 * stored in the session stays a list of leaves (`Confidence.leaves`), so the concerns chat and the
 * warm-up never see the row: `pickedLeaves` turns the ticked rows into leaves at submit and
 * `pickedRows` turns a stored answer back into rows for the locked view after it. Pure, tested.
 * See DECISION_LOG.md, "The factorising row expands to leaves at submit".
 */

export const FACTORISING = "factorising" as const;
export const MONIC: LeafId = "algebra.expand-factor.monic";
export const NONMONIC: LeafId = "algebra.expand-factor.nonmonic";
/** The kinds under the factorising row, in the order they are listed and assumed. */
export const FACTORISING_KINDS: readonly LeafId[] = [MONIC, NONMONIC];

/** A row's id: a leaf, or the factorising row that stands for the two factorising leaves. */
export type PickId = LeafId | typeof FACTORISING;
export type PickRow = { id: PickId; label: string; children?: { id: LeafId; label: string }[] };

const isKind = (id: PickId): id is LeafId => (FACTORISING_KINDS as readonly string[]).includes(id);

/**
 * The rows the list shows: the set's most relevant skills, with the two factorising leaves folded
 * into one "factorising" row where the first of them sat, its children the two kinds.
 */
export function pickerRows(problems: Problem[] = ASSIGNMENT.problems): PickRow[] {
  const rows: PickRow[] = [];
  for (const id of relevantSkills(problems)) {
    if (isKind(id)) {
      if (!rows.some((r) => r.id === FACTORISING)) rows.push({ id: FACTORISING, label: "factorising", children: [{ id: MONIC, label: "monic" }, { id: NONMONIC, label: "non-monic" }] });
    } else rows.push({ id, label: studentLeafName(id).name.toLowerCase() });
  }
  return rows;
}

/**
 * The leaves a set of ticked rows means, in tick order: the factorising row becomes the kinds
 * ticked under it (in their tick order) or, with none ticked, both kinds; a kind ticked without
 * the row is dropped (the sub-rows only show while the row is on).
 */
export function pickedLeaves(picked: PickId[]): LeafId[] {
  if (!picked.includes(FACTORISING)) return picked.filter((id): id is LeafId => id !== FACTORISING && !isKind(id));
  const kinds = picked.filter(isKind);
  const out: LeafId[] = [];
  for (const id of picked) {
    if (id === FACTORISING) out.push(...(kinds.length ? kinds : FACTORISING_KINDS));
    else if (!isKind(id)) out.push(id);
  }
  return out;
}

/** A stored answer as rows: any factorising kind puts the factorising row where the first kind sat, the kinds present ticked under it. */
export function pickedRows(leaves: LeafId[]): PickId[] {
  const out: PickId[] = [];
  for (const id of leaves) {
    if (isKind(id) && !out.includes(FACTORISING)) out.push(FACTORISING);
    out.push(id);
  }
  return out;
}
