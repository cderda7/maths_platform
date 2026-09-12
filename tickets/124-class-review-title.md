# 124: "Class review" as the stage's title everywhere

**What to build:** Every place the third review stage is named on screen says "class review" (title case where it is a title): the card on the class view, the setup page's H1, the pathway map's node and sentence, the demo strip's skip button, the class view's status suffix, and the home page's two mentions. The pathway chip already said "class review"; the rest catches up. Routes, identifiers, data-attributes and the `whole-class` stage id stay as they are.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "everywhere where 'whole class review' is a title, change it to 'class review'. need to make that consistent." The chip in the teacher bar said "class review" while the card beside it, the setup page and the pathway map all said "Whole-class review".

## Solution

- `app/teacher/WholeClassCard.tsx`: the eyebrow reads "Class review".
- `app/teacher/whole-class/WholeClassSetup.tsx`: the H1 reads "Class review".
- `lib/pathway.ts`: `STAGE_WORD["whole-class"]` is "class review", so the map's node and the sentence beneath it match the chip.
- `lib/demo.ts`: the skip target is "class review" (its button on the demo strip shows the string); the two tests that walk the targets follow.
- `app/teacher/TeacherLive.tsx`: the assignment status suffix is "· in class review".
- `app/page.tsx`: the two home-page lines name the stage "class review".
- `README.md`: the same four mentions. Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] Class view card eyebrow, setup H1, pathway map node and sentence, skip strip, status suffix and home page all say "class review"; no screen still shows "whole-class review" (home, class view before and during the stage, setup, create screen, board, board controls, frozen student)
- [x] vitest (390), eslint, tsc, `next build`, headless run (`titles.mjs`)
