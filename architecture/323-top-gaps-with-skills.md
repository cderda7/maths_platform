# 323: Classroom cards name their top three gaps under skill tags

## Files touched

| File | What it does |
| --- | --- |
| `lib/classroomCards.ts` | `topGaps` (misconceptions ranked by students, each with its skill label), `gapGroups`, `TOP_GAPS`; `AssignmentCard.topGaps` replaces `topGap`. |
| `app/teacher/Classroom.tsx` | The status line as a two-row grid; `TopGaps` draws the label, red pills and one spanning `CategoryChip` per skill group; no mistakes count. |
| `components/Tag.tsx` | `CategoryChip` spreads extra props. |
| `data/misconceptions.ts` | `partial-distribution` renamed "not multiplied into every term". |
| `data/story.ts`, `lib/classStory.ts`, `specs/class-story.md` | The sheet's "Top gaps" column: three names per set. |
| `lib/classroomCards.test.ts`, `data/pset1–5/*.test.ts`, `data/story.test.ts`, `data/finishedSets.test.ts`, `lib/examples.test.ts` | The three gaps and their skills per set. |

## How it connects

```
 mistakesByProblem(session, bundle, now)          bundle.newSkills
   rows: misconceptions + lines                          │
   (wrong line: misconception, tags[leaf])               │
                 │                                       │
                 ▼                                       ▼
        topGaps(problems, newSkills) ── skillLabel(leaf) ─┐
          rank by students, top 3        columnOf == new? │
                 │                        leafName.short  │
                 │                        : categoryName  │
                 ▼                                        │
      AssignmentCard.topGaps  ◄───────────────────────────┘
                 │
                 ▼
   app/teacher/Classroom.tsx  Card ─► LiveLine / PastLine ─► TopGaps
                                              │
                                   gapGroups(topGaps)
                                              │
            ┌─────────────────────────────────┴───────────────┐
            ▼ row 1 (22 px)                                   ▼ row 2 (28 px)
   CategoryChip  grid-column: start / span n        status · submitted · top gaps: [pill][pill][pill]
   (components/Tag.tsx)
```
