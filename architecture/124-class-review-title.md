# 124 · "Class review" as the stage's title everywhere

Routes: `/teacher` (the card and the status), `/teacher/whole-class` (the H1), `/teacher/assignments/new` and `/teacher/assignments/create/review` (the map), `/student` (the demo strip), `/` (the copy).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/WholeClassCard.tsx` | The card's eyebrow: "Class review". |
| `app/teacher/whole-class/WholeClassSetup.tsx` | The setup page's H1: "Class review". |
| `lib/pathway.ts` | `STAGE_WORD["whole-class"] = "class review"`; feeds the map's node label and `pathwaySentence`. `STAGE_SHORT` (the chip) already said it. |
| `lib/demo.ts` | `SkipTarget` "class review"; the demo strip renders the target strings as its buttons. |
| `app/teacher/TeacherLive.tsx` | Assignment status suffix "· in class review". |
| `app/page.tsx` | The home page's two mentions of the stage. |
| `lib/demo.test.ts`, `lib/board.test.ts` | Follow the renamed skip target. |

## How it connects

```
 lib/pathway.ts                                  on screen
 STAGE_WORD["whole-class"] = "class review" ───▶ PathwayMap node · pathwaySentence (create screen, review step)
 STAGE_SHORT["whole-class"] = "class review" ──▶ pathwayChip (teacher bar)            [unchanged]

 lib/demo.ts  SKIP_TARGETS[…, "class review", …] ─▶ components/SkipTo.tsx buttons (student demo strip)

 WholeClassCard   <Eyebrow>Class review</Eyebrow>       ┐
 WholeClassSetup  <H1>Class review</H1>                 ├─ titles; the stage id "whole-class",
 TeacherLive      "· in class review"                   │  the route /teacher/whole-class and the
 app/page.tsx     "the board wakes for class review"    ┘  wc/* actions keep their names
```

## Verified by

vitest (390), eslint, tsc, `next build`; a headless run (`titles.mjs`) over the demo strip, the home page, the class view before and during the stage, the setup page, the create screen, the board, the board controls and the frozen student screen: each title reads "Class review" and no screen contains "whole-class review".
