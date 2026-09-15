# 306: A missed homework's cell on Sam's Classroom has a dark red border

**What to build:** the missed homework's cell in the homework column beside Completed (HW2 in the demo) is outlined in the dark red `wrong-deep` instead of the neutral line.

**Blocked by:** 290 (the homework column), 294 (the missed cell's note).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15), with a screenshot of Sam's Classroom: "add dark red border to hte missing HW2 box".

## Solution

`app/student/StudentClassroom.tsx`: the missed cell's `border-line` becomes `border-wrong-deep` (#9e2f27, the dark red already used for the wrong-answer rings on the teacher's mistakes screen). The border stays 1 px, so the cell's size and everything around it are unchanged; the fill, the caution triangle, the name and the note are as before. Completed and upcoming cells keep their own borders.

## Verification

- eslint, vitest, next build.
- Click-through `click305.mjs` 10/10 at 1280x800 and 1440x900 on a fresh demo: HW2 is the missed cell; all four border sides compute to rgb(158, 47, 39) at 1 px; its width equals HW1's cell; HW1 keeps its green line; nothing scrolls sideways; screenshot checked.
