/**
 * The problem sets' old names (ticket 208): Problem Set 2 became Problem Set 6 and Problem Set 1
 * became Problem Set 5 when the Classroom grew to six sets. Two readers keep old links and old demo
 * state working: `next.config.ts` redirects `/teacher/a/<old id>/…` to the new id with the rest of
 * the path and the query kept, and `migrateClassroom` (`lib/classroom.ts`) renames what a browser
 * stored before the rename. No imports, so the Next config can load it. See DECISION_LOG.md,
 * 2026-09-13 (sets renamed in place).
 */

/** Old set id → new set id. */
export const RENAMED_SET_IDS: Readonly<Record<string, string>> = {
  "pset-2": "pset-6",
  "pset-1": "pset-5",
};

/**
 * Old titles as the demo stored them → the new ones: the fixture's upper-case title (the student
 * side's own create, the presenter skips) and the create flow's seeded draft title. A title the
 * teacher typed is theirs and never renamed.
 */
export const RENAMED_SET_TITLES: Readonly<Record<string, string>> = {
  "PROBLEM SET 2 — ROOTS OF A QUADRATIC": "PROBLEM SET 6 — ROOTS OF A QUADRATIC",
  "Problem Set 2 — Roots of a quadratic": "Problem Set 6 — Roots of a quadratic",
};

/** A set id as it reads now: an old id's new name, any other id as it is. */
export const currentSetId = (id: string): string => RENAMED_SET_IDS[id] ?? id;

/** A stored title as it reads now: an old seeded title's new name, anything else as it is. */
export const currentSetTitle = (title: string): string => RENAMED_SET_TITLES[title] ?? title;
