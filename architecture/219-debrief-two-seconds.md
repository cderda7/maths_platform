# 219: The group debrief's green view holds two seconds, not five

## Files touched

| File | What it does |
| --- | --- |
| `lib/debrief.ts` | `UNMARKED_MS` is 2 s; `PEER_DEBRIEF_MS` is 13 s (2 s + the 10 s hold + a press). |
| `lib/debrief.test.ts` | The marks-open timing test at two seconds; the peer wait still covers a whole debrief. |
| `app/student/screens/GroupDebrief.tsx` | Comment only. |
| `tickets/219-debrief-two-seconds.md` | The ticket. |

## How it connects

```
 group/check ─► resolvedAt[q]
                   │
                   ▼
     t from check  0 s ── 2 s ─────────────────────────── 12 s ── 13 s ─►
     GroupDebrief  green │ marks, "take a moment to reflect" │ next on
                         marksAt                          holdOver
     StudentApp    ─────────────────────────────────────────────── PEER_DEBRIEF_MS:
                                                                 a peer's next turn begins
```
