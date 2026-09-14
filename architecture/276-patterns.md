# 276: Patterns: recent patterns only, one-set patterns shown, no Patterns header or live pill

## Files touched

| File | What it does |
| --- | --- |
| `lib/holistic.ts` | `RECENT_SETS` (5); `recentSets(sets)`: the ids of the class's latest five sets by due date (`dueOrder`); `surfacing(patterns, window)`: keeps a pattern (the wordings sharing a `tag`) when one occurrence is on a recent set, with every wording and set, older ones included. `holisticView` applies it per category; each `HolisticPattern` row carries its `tag` (`patternTagLabel`). `HolisticSet.live` removed. Renamed `HabitRef`/`HolisticHabit`/`HabitGroup`/`habits` → `PatternRef`/`HolisticPattern`/`PatternGroup`/`patterns`. |
| `lib/holisticTiles.ts` | Tags are the view's patterns collapsed by `tag`, one set or many (`RECURRING_SETS` gone); `TileHabits` → `TilePatterns`, `habits` → `patterns`. |
| `data/patternTags.ts` (was `data/habitTags.ts`) | `PATTERN_TAGS`, `PatternTag`, `patternTagLabel`: unchanged content. |
| `data/patternTags.test.ts` (was `data/habitTags.test.ts`) | Follows the rename. |
| `app/teacher/students/HolisticPage.tsx` | The side column (ticket 277) is `Patterns`: no "Habits" eyebrow over the category groups (they start at the column's top), "No patterns to note" when empty; no live pill on a set head; `data-pattern-*` attributes, `data-pattern-tag` on each row, `data-holistic-side="patterns"`. |
| `app/teacher/students/HolisticTiles.tsx` | "label · 1 set" / "· n sets"; `data-tile-patterns`; an empty tile reads "Nothing to note". |
| `data/story.ts` | `Pattern`, `StoryCell.patterns`; the review part's "Pattern:" reasoning. |
| `lib/reviewRule.ts` | The review basis `"habit"` → `"pattern"`, `ReviewSlip.pattern`. |
| `lib/classStory.ts`, `specs/class-story.md` | The sheet's prose says patterns; regenerated (`npm run story:sheet`). |
| `lib/holistic.test.ts`, `lib/holisticTiles.test.ts`, `data/story.test.ts`, `data/finishedSets.test.ts`, `data/pset*/` | The window rule (only-PS1 hidden, PS1 + PS4 shows both, only PS6 shows, one set shows, by due date, tags not wordings, the live set only as seen); tiles equal the page's surfacing patterns for all twenty in three states; comments and names follow the rename. |
| `scripts/laptop-check.mjs`, `README.md` | Wording. |

## How it connects

```
 data/story.ts  STORY[student].cells[category][set].patterns[{ text, problems }]
      │                                   data/patternTags.ts  patternTagLabel(student, category, text)
      ▼                                            │
 lib/holistic.ts  holisticView(student, { classroom, session, now })
      │   sets[] (the Classroom's, PS6 once sent) ──► recentSets(sets): latest 5 by dueOrder
      │                                                    │  PS1–PS5 held: all five
      │                                                    │  PS1–PS6 held: PS2–PS6
      │   rows per category: { text, tag ◄──────────────────┘  refs[set …] }   (live set: seen problems only)
      │           │
      │           ▼
      │   surfacing(rows, window): tag has a ref in window ─► keep all its rows and refs (PS1 too)
      │                            otherwise                ─► drop (a PS1-only pattern)
      │   { student, summary, sets, categories, patterns[category → rows] }
      │
      ├──────────────► app/teacher/students/HolisticPage.tsx
      │                  grid PS6…PS1 (no live pill) │ side column: Patterns in FitHeight (no header) · rows "● PS1 · Q7"
      ▼
 lib/holisticTiles.ts  holisticTile: view.patterns ─► collapse by tag, sets = union, most sets first
      │   (no ≥ 2 sets filter: "label · 1 set" shows)
      ▼
 app/teacher/students/HolisticTiles.tsx   /teacher/students
```
