import { STORY, type StoryCategory } from "@/data/story";
import { holisticHref } from "./assignments";
import { holisticView, type HolisticNow, type HolisticView } from "./holistic";

/**
 * Holistic Assessment's tiles (ticket 252): every student as a tile, built on the holistic page's view model
 * (`holisticView`, ticket 251), so a tile never says what the student's page does not. A tile carries the story
 * sheet's line, the student's patterns as tags under their category, and their strengths. Pure.
 *
 * - A tag is one pattern the page surfaces (`surfacing` in `lib/holistic.ts`, ticket 276: one of its sets among the
 *   class's five most recent), however many sets it shows on, one included. The sheet words a pattern for its set, so a
 *   category's wordings collapse by their tag (`data/patternTags.ts`: an authored label for a pattern worded differently
 *   by set, else its own words) and a tag counts every set it shows on, older ones too.
 * - A strength is a category the student is secure in on every set that assessed them in it: a set that does not
 *   assess the category ("—"), a set the student was away for, and the live set where it has nothing of theirs yet
 *   are passed over; "not seen" on a finished set is a set with nothing secure, so it is not a strength.
 * See DECISION_LOG.md, 2026-09-14 (tickets 252 and 276).
 */

export interface TileTag {
  label: string;
  /** The sets it shows on, oldest first ("PS4", "PS5"). */
  sets: string[];
}

export interface TilePatterns {
  category: StoryCategory;
  name: string;
  /** Most sets first; a tie in the order the patterns first show. */
  tags: TileTag[];
}

export interface HolisticTile {
  student: HolisticView["student"];
  /** The student's page from Holistic Assessment: Back comes here. */
  href: string;
  summary: string;
  /** Categories with a pattern that surfaces, in canonical order. */
  patterns: TilePatterns[];
  /** Categories secure on every set that assessed the student in them, in canonical order. */
  strengths: { category: StoryCategory; name: string }[];
}

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
  const order = view.sets.map((c) => c.label);

  const patterns: TilePatterns[] = view.patterns.flatMap((g) => {
    const byTag = new Map<string, Set<string>>();
    for (const p of g.patterns) {
      const sets = byTag.get(p.tag) ?? new Set<string>();
      for (const ref of p.refs) sets.add(ref.label);
      byTag.set(p.tag, sets);
    }
    const tags = [...byTag]
      .map(([label, sets]) => ({ label, sets: order.filter((s) => sets.has(s)) }))
      .sort((a, b) => b.sets.length - a.sets.length);
    return tags.length ? [{ category: g.category, name: g.name, tags }] : [];
  });

  const strengths = view.categories.flatMap((r) => {
    const results = r.cells.filter((cell, j) => !(cell === "none" || cell === "absent" || (cell === "unseen" && !view.sets[j].finished)));
    return results.length > 0 && results.every((cell) => cell === "secure") ? [{ category: r.category, name: r.name }] : [];
  });

  return { student: view.student, href: holisticHref(student), summary: view.summary, patterns, strengths };
}
