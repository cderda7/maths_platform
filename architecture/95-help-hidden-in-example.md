# 95 · "I need help" is gone, not greyed, while the worked example plays

Routes: `/student?stage=practice` (the warm-up), the mid-set practice overlay.

## Files touched

| File | What it does |
|---|---|
| `components/PracticePad.tsx` | The "I need help" block renders only while `run.example` is false (was: always, `disabled` during the example) |

## How it connects

```
   run.example ─┬─ false ─► left column: problem · hint cards · [ I need help ]   right: read-as (+ chat under it)
                └─ true  ─► left column: problem · hint cards                     centre: the worked example · right: "Question about a step?" chat
                                                       (no button: the help is already on screen)
   run/next (the follow-up) or warmup/skill-done (the next skill) ─► run.example = false ─► the button is back
```

## Verified by

vitest (337 tests, unchanged); eslint and tsc clean; `next build`; headless Chrome on the built app
(port 3184, CDP 9484), the fractions warm-up: the button is enabled on the pad, absent while the
example plays (the example section present), absent when the example is complete, and enabled again
on the factorising problem after "Next skill →".
