# 134 · A stage the class has finished is the skill button's blue

Route: `/teacher` (the Pathway card in the side column).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherLive.tsx` | The over pill in the Pathway card: `bg-standout text-white` (was `bg-ink text-white`). Nothing else changed. |

## How it connects

```
 lib/classStage.ts ──▶ stage.state ──▶ Pathway card pill
                                        over     bg-standout text-white   ◀── same fill as the warm-up's lit skill button (PracticeScreen)
                                        current  bg-standout-soft + ring-2 ring-accent
                                        ahead    bg-standout-soft
```

## Verified by

vitest, eslint, tsc, `next build`; `stage.mjs` (port 3193 / CDP 9493): 34 checks, the over-pill check reading `rgb(47, 111, 179)` with white text; 2× crops in eight states.
