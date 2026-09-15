# 298: Student profiles describe behaviour, never traits

## Files touched

| File | What it does |
| --- | --- |
| `data/story.ts` | The class story sheet: all 20 summaries (`arc`) rewritten as behaviour; pattern wordings and review reasons carry the neutral wordings. |
| `data/patternTags.ts` | Tile tag labels and the wordings they group, renamed to match. |
| `data/classmates.ts`, `data/pset1–5/classmates.ts` | The records' pattern `notes` equal the sheet's new wordings; Sam's record comments lose "careless" and "confident". Clarifications (students' own words) unchanged. |
| `data/pset1/evaluation.ts` | The communication mistake name "Simplified in one line, the square factor not shown". |
| `data/story.test.ts` | New: no summary, pattern, tag or review reason matches a trait word. |
| `data/pset5/pset5.test.ts`, `lib/holistic.test.ts`, `lib/holisticTiles.test.ts` | Names and expected wordings follow. |
| `specs/class-story.md` | Regenerated (`npm run story:sheet`). |

## How it connects

```
 data/story.ts  STORY[id] ─────────────────────────────────────────────┐
   arc ◄298 (behaviour only)                                           │
   cells[c][set].patterns[].text ◄298 ──── equal ──── data/pset*/classmates.ts notes ◄298
   STORY_REVIEW whys ◄298                  (data/finishedSets.test.ts)
        │                     │
        │                     └─▶ data/patternTags.ts labels ◄298 ─▶ patternTagLabel
        ▼                                                                │
 lib/holistic.ts  holisticView ─▶ summary, patterns ─────────────────────┤
        │                                                                │
        ├─▶ app/teacher/students/[id]  HolisticPage: summary line,       │
        │     patterns column (cites PSn · Qk)                           │
        └─▶ lib/holisticTiles.ts ─▶ HolisticTiles: summary + tags ◄──────┘

 data/story.test.ts ◄298  TRAIT regex over arc, patterns, tags, whys (fails the build's tests)
 lib/classStory.ts ─▶ specs/class-story.md (regenerated)
```
