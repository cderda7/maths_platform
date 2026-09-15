# 343: Three older wrong lines carry the narrower misconception

## Files touched

| File | What it does |
| --- | --- |
| `data/pset3/evaluation.ts` | PS3's evaluation table. Q5's (x + 15)(x − 1) and Q8's (x − 2)(x − 12) now `pair-sum-wrong`, with explanation and question about the pair's sum. |
| `data/pset5/evaluation.ts` | PS5's evaluation table. Q8's y = (2x + 1)(x − 3) now `pair-signs-swapped`, explanation and question about the swapped signs. |
| `lib/stepCheck.test.ts` | The check's agreement with every table: `NARROWER` keeps only PS4 Q4, with why it stays broad. |
| `data/story.ts` | The class story sheet: the writers' patterns on those problems (PS3 Liam, Chloe, Ethan, Oliver; PS5 Jordan, Ethan, Oliver, Sofia), PS3's and PS5's top gaps, and the review reasons that quote the patterns. |
| `specs/class-story.md` | Regenerated from the sheet (`npm run story:sheet`). |
| `data/patternTags.ts` | The new pair wordings join each student's "factor brackets wrong" tag. |
| `data/pset3/classmates.ts`, `data/pset5/classmates.ts` | The writers' report notes (Commentary) match the sheet; doc comments. |
| `data/pset3/pset3.test.ts`, `data/pset5/pset5.test.ts`, `lib/holistic.test.ts`, `lib/holisticTiles.test.ts` | Top gaps, Jordan's misconceptions and signatures, and the relabelled lines with every writer's commentary. |

## How it connects

```
 data/misconceptions.ts            data/signatures.ts
  pair-sum-wrong ─────────────┐     factor-pairs: pair-sum-wrong, brackets-dont-expand, …
  pair-signs-swapped ──────┐  │     minus-signs:  pair-signs-swapped, collecting-sign, …
  brackets-dont-expand     │  │                 │
                           ▼  ▼                 │ familyOf
 data/pset3/evaluation.ts ◄343  data/pset5/evaluation.ts ◄343
   Q5 (x+15)(x−1) → pair-sum-wrong   Q8 y=(2x+1)(x−3) → pair-signs-swapped
   Q8 (x−2)(x−12) → pair-sum-wrong
           │
           │ evaluateLine(pid, tex)
           ├──────────────────────────────▶ lib/stepCheck.test.ts ◄343  (checkStep agrees; NARROWER = PS4 Q4)
           ▼
 lib/mistakes.ts mistakesByProblem ─┬─▶ TeacherMistakes (pills, columns grouped by slip)
                                    ├─▶ lib/classroomCards.ts topGaps ─▶ Classroom card
                                    ├─▶ lib/misconceptionCounts.ts sightings
                                    └─▶ report red-line chips (MisconceptionChip)
           │
           │ checked against (data/story.test.ts: id on a problem, family on each)
           ▼
 data/story.ts ◄343  patterns · topGaps · review reasons ──▶ specs/class-story.md ◄343 (generated)
      │   │
      │   └──▶ lib/reviewRule.ts  (pattern over >1 problem = repeated; gap = pattern)
      │          outcomes unchanged: Jordan's PS3 Q8+Q9 kept as one pattern
      ▼
 lib/holistic.ts holisticView ──▶ lib/signatures.ts signaturesOf (≥ 2 sets per family)
      │   ▲                          Jordan, Oliver: + Minus signs wrong (PS2, PS5)
      │   └── data/patternTags.ts ◄343            Ethan: Factor pairs 3 → 2 sets
      ▼
 lib/holisticTiles.ts ──▶ /teacher/students tiles, /teacher/students/<id>

 data/pset3|5/classmates.ts ◄343  notes ──▶ TeacherReport Commentary
```
