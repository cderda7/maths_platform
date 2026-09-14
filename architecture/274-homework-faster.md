# 274: The homework bank moves faster and the folder has no count

## Files touched

| File | What it does |
| --- | --- |
| `lib/homework.ts` | The sequence's clock: `MOTION` 250 / 250 / 650 / 350 / 450 / 50 ms (expand, original, change, similar, fly, gap: 2 s a problem, was 5.6 s), `REDUCED_MOTION` 1950 + 50 ms (was 3800 + 350), `perTile` exported; `bankedCount` gone, `lastLanded` names the problem whose tile landed last (for the folder's bump, never a number). |
| `lib/homework.test.ts` | The new timings (2 s a tile on both clocks, the change the longest phase, Sam's five done at 11 150 ms), `lastLanded`, and no `count` export on the module. |
| `app/student/screens/HomeworkScreen.tsx` | `Folder` shows the icon and "Homework" only: no count badge, no count in its label; the icon bumps (keyed on `lastLanded`) as each tile lands; the root carries `data-hw-landed` (a problem id) in place of `data-hw-count`. |
| `components/HomeworkFlight.tsx` | The line under the question fades in over the end of the change (it used to wait for the hold); reduced motion's fade is a share of `REDUCED_MOTION.show`. |
| `app/globals.css` | `.hw-bump` sized for the folder icon (scale 1.1, 280 ms); still none with reduced motion. |

## How it connects

```
 ReportScreen ── Send ──► session: stage "homework", homeworkAt
                                   │
                                   ▼
 HomeworkScreen ── elapsed = clock − homeworkAt ────────────────────────────┐
   │                                                                        │
   │  lib/homework.ts ◄274                                                  │
   │    MOTION      expand 250 │ original 250 │ change 650 │ similar 350 │ fly 450 │ gap 50
   │    REDUCED     show 1950                                  │ gap 50     = 2000 ms a tile
   │    tileMoment(i, elapsed) ──► active tile, phase, p ──► HomeworkFlight ◄274
   │    lastLanded(banked, elapsed) ──► problem id | null       (line fades in
   │                                   │                         during the change)
   ▼                                   ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ [┄Q1┄][┄Q2┄][Q3 ✕][Q4 ✓] … [Q10 ✕]         ▭ Homework ◄274   │
 │                                            no count; the icon │
 │                                            bumps keyed on the │
 │                                            last landed id     │
 └──────────────────────────────────────────────────────────────┘
   Sam's five: lead 1200 + 5 × 2000 − 50 = 11 150 ms (was 29 150)
```
