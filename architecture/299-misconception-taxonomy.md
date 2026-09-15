# 299: Mistakes are named by misconception, from one taxonomy with permanent ids

## Files touched

| File | What it does |
| --- | --- |
| `data/misconceptions.ts` | New. The misconception taxonomy: 37 entries (id → name, about), `MisconceptionId`, `misconceptionName`, `isMisconceptionId`, version. Ids are permanent. |
| `data/evaluation.ts` | `LineVerdict.misconception` replaces `name`; `wrong()` takes the id. |
| `data/evaluation.ts`, `data/pset1–5/evaluation.ts` | Every wrong line's fifth argument is its misconception id; header comments follow. |
| `lib/mistakes.ts` | `MistakeRow.misconceptions`, `SlipGroup.misconceptions`; `groupBySlip` clusters by them. |
| `components/Tag.tsx` | `SlipChip` takes a `MisconceptionId` and shows its name. |
| `app/teacher/TeacherMistakes.tsx` | Pills from `g.misconceptions`; `FitGrid` widens a pill group's columns until its widest pill fits on one row. |
| `lib/classroomCards.ts` | `topGap` clusters and names by misconception. |
| `lib/examples.ts` | Picker option `name` from the first wrong line's misconception; `ExampleOption.misconception`. |
| `lib/reviewRule.ts`, `lib/classStory.ts` | A repeated slip, and a group's last try sharing a real slip, compare misconception ids. |
| `lib/misconceptionCounts.ts` | New. `sightingsOn(bundle)` from the Mistakes rows; `countMisconceptions` by id: sightings, students, sets, cohorts. |
| `data/story.ts`, `data/pset1/3/4/5/review.ts`, `specs/class-story.md` | Top gaps renamed; the 14 review cases that became repeated, second submissions removed; sheet regenerated. |
| tests | `data/misconceptions.test.ts`, `lib/misconceptionCounts.test.ts` new; mistakes, cards, examples, evaluate, finished sets and per-set tests follow. |

## How it connects

```
 data/misconceptions.ts ◄299  MISCONCEPTIONS { id: { name, about } }   (ids permanent)
        ▲ id                                   │ name
        │                                      ▼
 data/evaluation.ts + data/pset1–5/evaluation.ts
   wrong(tags, label, clue, note, misconception) ─▶ LineVerdict.misconception
        │ evaluateLine
        ├──────────────▶ lib/mistakes.ts  MistakeRow.misconceptions ─▶ groupBySlip (clusters by id)
        │                      │                         │
        │                      │                         └─▶ app/teacher/TeacherMistakes
        │                      │                               pill = SlipChip(id) ─▶ name
        │                      │                               FitGrid widens columns to fit it
        │                      ├─▶ lib/classroomCards.ts topGap ─▶ Classroom "top gap: <name>"
        │                      └─▶ lib/misconceptionCounts.ts ◄299 sightingsOn ─▶ countMisconceptions
        │                                                     (students · sets · cohorts)
        ├──────────────▶ lib/examples.ts optionsFor ─▶ whole-class ExamplePicker option name
        └──────────────▶ lib/reviewRule.ts slipsOn: repeated = same id on another problem
                               └─▶ lib/classStory.ts reviewMismatches ◀── data/story.ts STORY_REVIEW
                                                                        data/psetN/review.ts
```
