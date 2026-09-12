# 126: The category pill's corners follow the header chip

**What to build:** The category marker from ticket 125 loses its stadium ends: its corners take the shape of the category header chip above it (`rounded-md`, 6 px on a 22 px chip), scaled to the pill's 13 px height, so 4 px. The hover area and the clicked-category ring around it match.

**Blocked by:** 125.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a crop of the grid under its header: "make it less rounded -- mimic the shape of the category header".

## Solution

- `components/Tag.tsx`: `PILL_SIZE` carries `rounded` (4 px); `StatusDot` applies `rounded-full` only to a dot (or a `px`-sized marker), so the pill's corners come from `PILL_SIZE`. Colour, half fill and the unseen outline unchanged.
- `app/teacher/TeacherLive.tsx`: the category button's hover area and ring are `rounded-md`.
- `components/SkillColumns.tsx`: the student row's wrapper the same.

## Acceptance

- [x] Class grid: every pill 4 px corners on 28 × 13, the header chips 6 px on 22; a clicked category's ring rounded-md
- [x] vitest (390), eslint, tsc, `next build`, headless crop (`corners.mjs`)
