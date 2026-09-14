# 252: Holistic Assessment in Edexia Classroom: every student as a tile

> Since ticket 276 (`architecture/276-patterns.md`): habits are called patterns (`data/patternTags.ts`), a tile shows every pattern the student's page surfaces (one set included, "· 1 set"), no longer only those on two sets or more (`RECURRING_SETS` is gone), and an empty tile reads "Nothing to note".

## Files touched

| File | What it does |
| --- | --- |
| `data/patternTags.ts` | `PATTERN_TAGS`: per student and category, the patterns the story sheet words differently from set to set, each with one short label ("signs in the wrong brackets" for Sam's PS4 and PS5 wordings). Authored, never matched by similarity; a pattern worded alike on every set needs no entry. `patternTagLabel(student, category, text)`: the label, else the pattern's own words. |
| `data/patternTags.test.ts` | Every text is that student's pattern in that category, word for word; each tag gathers two wordings or more over two sets or more; a text in one tag only. |
| `lib/holisticTiles.ts` | `holisticTiles({ classroom, session, now })` (the twenty in the class order) and `holisticTile(student, …)`, over `holisticView` (ticket 251): name, initials, the sheet's line, the student's page href; the patterns collapsed by tag per category with the sets each shows on, kept when on two sets or more (`RECURRING_SETS`, removed by ticket 276), most sets first; strengths, the categories secure on every set that assessed the student in them (a set not assessing the category, a set they were away for, and the live set where nothing of theirs is seen yet are passed over). |
| `lib/holisticTiles.test.ts` | All twenty equal their holistic view; Priya strengths only; Liam (few seen sets) one tag, no strengths; Sam's two-wording tag and Jordan's four; mid-stream counts; tags equal to the page's refs for all twenty in both states; strengths with the absence toggle. |
| `lib/holistic.ts` | `HolisticColumn.finished`: a finished set, whose "not seen" is final. |
| `app/teacher/students/page.tsx` | The `/teacher/students` route. |
| `app/teacher/students/HolisticTiles.tsx` | The page: ← Edexia Classroom, eyebrow, "Holistic Assessment", twenty tiles three to a row (a row one height). A tile is one link: avatar, name, →, the line, then each category's tags ("label · n sets", sets on hover) and a Strengths row, or "No habit on two sets yet" (ticket 276: "Nothing to note"). Waits for the session batch and the clock; restores the scroll once drawn. |
| `app/teacher/students/tilesScroll.ts` | The tiles' scroll in sessionStorage: remembered on a tile press, recalled on the tiles' mount, forgotten by the Classroom's entry. |
| `app/teacher/Classroom.tsx` | "Holistic Assessment" on the title row beside "+ New assignment", one height with it; forgets the tiles' scroll. |
| `scripts/laptop-check.mjs` | `/teacher/students` added: 74 route/size checks. |

## How it connects

```
 data/story.ts  STORY[student].cells[category][set].patterns[{ text, problems }]
      │                                   data/patternTags.ts  PATTERN_TAGS[student][category] = [{ label, texts[] }]
      ▼                                            │
 lib/holistic.ts  holisticView (251)               │ patternTagLabel(student, category, text)
      │  columns[{ label, finished }] · rows · patterns[category → text → refs]
      ▼                                            ▼
 lib/holisticTiles.ts  holisticTile / holisticTiles({ classroom, session, now })
      │   patterns ─► collapse by label, sets = union of refs, keep ≥ 2 sets, most sets first
      │   rows   ─► strength: every result secure (skip —, absent, not seen on the live set), at least one
      │   { student, href, summary, patterns[category → tags[{ label, sets }]], strengths[] }
      ▼
 app/teacher/students/HolisticTiles.tsx   /teacher/students   (useClassroom · useBatchedSession 3 s · useNow)
      ▲                          │
      │                          │ tile press ─► rememberTilesScroll(scrollTop)   (tilesScroll.ts, sessionStorage)
      │                          ▼
 app/teacher/Classroom.tsx   /teacher/students/<id>  HolisticPage (251)
   title row:                    │ Back "← Holistic Assessment" / browser back
   [Holistic Assessment] ─┐      ▼
   [+ New assignment]     │  /teacher/students ─► recallTilesScroll() ─► [data-teacher-scroll].scrollTop
                          └─► forgetTilesScroll() ─► /teacher/students at the top
```
