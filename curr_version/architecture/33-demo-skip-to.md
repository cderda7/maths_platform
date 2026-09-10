# 33 · Demo "skip to" strip

Route: `/student` (any stage). Presenter-only.

## Files touched

| File | What it does |
|---|---|
| `lib/demo.ts` (+ test) | `SKIP_TARGETS`, `DEMO_PATHWAY` (all three review stages), `skipFixture(target, now)` → `{ session, classroom }`: a fresh classroom with the full pathway, then `INITIAL_SESSION` / `sessionAt(stage)` per target; the whole-class jump runs `problemsByStruggle` + `suggestExamples` over the reworked run, `wc/setup`, and `wc/project` at `now − GRACE − 1 s` so the freeze is immediate |
| `components/SkipTo.tsx` | The strip: dashed border, bottom-left, one button per target; applies the fixture with `setClassroom` and `setSession` |
| `app/student/StudentApp.tsx` | Mounts the strip outside the chrome |

## How it connects

```
 SkipTo ── click ──▶ skipFixture(target, Date.now()) ──▶ setClassroom(classroom) · setSession(session)
                        classroom: assignment/create (pathway individual·group·whole-class) [· wc/setup · wc/project (grace over)]
                        session:   start → INITIAL_SESSION · warm-up → warmup-pick · working · indiv review → feedback · group review → group-pass · report
                                   whole-class review → reworkedSession at "frozen"  (StudentApp's freeze effect keeps it there while projecting)
 Both stores broadcast, so an open teacher tab follows the jump.
```

## Verified by

vitest (174 tests): every target's stage and pathway, projection only for whole-class, identical
submitted lines across the review stages, two projected problems with examples and no countdown.
CDP: each button in turn, the stored stage and whole-class status after each. `tsc --noEmit`,
`eslint`, `next build`.
