# 224: The group intro holds 30 seconds

## Files touched

| File | What it does |
| --- | --- |
| `lib/groupIntro.ts` | `GROUP_INTRO_MS` = 30 000, a fixed number; the words-based timing is gone. |
| `lib/groupIntro.test.ts` | The timing test at 30 s. |
| `app/globals.css` | `intro-drain` default duration 30 s. |
| `tickets/224-group-intro-thirty.md` | The ticket. |

## How it connects

```
 readiness.startedAt ──► boardOpensFor(+ GROUP_INTRO_MS = 30 s) ──► run.startedAt
                                                                      │
        t from class start  0 s ───────────── GroupIntro ──────────── 30 s ─► board, peers, race
```
