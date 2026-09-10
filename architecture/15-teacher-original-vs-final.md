# 15 · Teacher original vs final side by side (Tier 2)

Route: `/teacher/compare`. Linked from the demo student's expanded rows in the mistake view
("Original vs final →").

## Files touched

| File | What it does |
|---|---|
| `lib/versions.ts` | `rowChanged(row)` and `changedRowCount(aligned)` on top of ticket 13's alignment |
| `lib/versions.test.ts` | 12 lines changed across Q1–Q3, Q4 unchanged |
| `app/teacher/compare/page.tsx` → `TeacherCompare.tsx` | One card per problem: handed-in lines left (slips red, via the same evaluation table), final lines right with changed lines tinted and tagged; per-problem "n lines changed" / "unchanged"; a dashed card until the rework exists |
| `app/teacher/mistakes/TeacherMistakes.tsx` | Expanded live rows get "As handed in. The rework is kept separately." and the link |

## How it connects

```
 session ──▶ versionsOf ──▶ alignVersions ──▶ TeacherCompare (left: original + evaluateLine red · right: final + rowChanged tint)
 TeacherMistakes (live row, expanded) ── "Original vs final →" ──▶ /teacher/compare
 Same alignment as the student's history view (13); same evaluation table as the mistake view (11).
```

## Verified by

vitest (54 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and a two-tab CDP run: with
the reworked run in the student tab, expanding Sam's Q1 in the mistake view shows the link; the
compare page shows Q1 with one red row on the left and two changed rows on the right, Q2 with
five changed rows. Screenshot at 1440×1000.
