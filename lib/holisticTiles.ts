import { habitTagLabel } from "@/data/habitTags";
import { STORY, type StoryCategory } from "@/data/story";
import { holisticHref } from "./assignments";
import { holisticView, type HolisticNow, type HolisticView } from "./holistic";

/**
 * Holistic Assessment's tiles (ticket 252): every student as a tile, built on the holistic page's view model
 * (`holisticView`, ticket 251), so a tile never says what the student's page does not. A tile carries the story
 * sheet's line, the student's recurring habits as tags under their category, and their strengths. Pure.
 *
 * - A habit is recurring when it shows on two or more sets. The sheet words a habit for its set, so the habits of a
 *   category collapse by their tag (`data/habitTags.ts`: an authored label for a habit worded differently by set, else
 *   its own words) and a tag counts the sets it shows on. A one-set habit stays on the student's page.
 * - A strength is a category the student is secure in on every set that assessed them in it: a set that does not
 *   assess the category ("—"), a set the student was away for, and the live set where it has nothing of theirs yet
 *   are passed over; "not seen" on a finished set is a set with nothing secure, so it is not a strength.
 * See DECISION_LOG.md, 2026-09-14 (ticket 252).
 */

export interface TileTag {
  label: string;
  /** The sets it shows on, oldest first ("PS4", "PS5"). */
  sets: string[];
}

export interface TileHabits {
  category: StoryCategory;
  name: string;
  /** Most sets first; a tie in the order the habits first show. */
  tags: TileTag[];
}

export interface HolisticTile {
  student: HolisticView["student"];
  /** The student's page from Holistic Assessment: Back comes here. */
  href: string;
  summary: string;
  /** Categories with a recurring habit, in canonical order. */
  habits: TileHabits[];
  /** Categories secure on every set that assessed the student in them, in canonical order. */
  strengths: { category: StoryCategory; name: string }[];
}

/** A habit is on a tile from this many sets. */
export const RECURRING_SETS = 2;

/** The twenty, in the class order (Sam first, as the story sheet and the Class View list them). */
export function holisticTiles(at: HolisticNow): HolisticTile[] {
  return Object.keys(STORY).flatMap((id) => {
    const tile = holisticTile(id, at);
    return tile ? [tile] : [];
  });
}

export function holisticTile(student: string, at: HolisticNow): HolisticTile | null {
  const view = holisticView(student, at);
  if (!view) return null;
  const order = view.columns.map((c) => c.label);

  const habits: TileHabits[] = view.habits.flatMap((g) => {
    const byTag = new Map<string, Set<string>>();
    for (const h of g.habits) {
      const label = habitTagLabel(student, g.category, h.text);
      const sets = byTag.get(label) ?? new Set<string>();
      for (const ref of h.refs) sets.add(ref.label);
      byTag.set(label, sets);
    }
    const tags = [...byTag]
      .filter(([, sets]) => sets.size >= RECURRING_SETS)
      .map(([label, sets]) => ({ label, sets: order.filter((s) => sets.has(s)) }))
      .sort((a, b) => b.sets.length - a.sets.length);
    return tags.length ? [{ category: g.category, name: g.name, tags }] : [];
  });

  const strengths = view.rows.flatMap((r) => {
    const results = r.cells.filter((cell, j) => !(cell === "none" || cell === "absent" || (cell === "unseen" && !view.columns[j].finished)));
    return results.length > 0 && results.every((cell) => cell === "secure") ? [{ category: r.category, name: r.name }] : [];
  });

  return { student: view.student, href: holisticHref(student), summary: view.summary, habits, strengths };
}
