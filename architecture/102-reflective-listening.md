# 102 · The concerns chat reflects on every answer before asking the next question

Route: `/student?stage=warmup-chat` (a not-confident answer that took the warm-up), the concerns chat.

## Files touched

| File | What it does |
|---|---|
| `lib/warmup.ts` | `REFLECTIONS` and `reflection(i)`: the fixed reflective-listening line after answer `i`, the third line for every later answer. `concernTurns`: each later turn is `[reflection, question]`. `closingTurn(first, answers)` replaces `closingLine`: `[reflection, "Thank you for that insight / those insights. Let's start[ with skill]."]`. |
| `app/student/screens/WarmupChatScreen.tsx` | The closing turn is `closingTurn` with the answer count; its two bubbles play through the same `turnSteps` rhythm as every other turn. |
| `lib/warmup.test.ts` | The turn shapes for three and five skills, the reflection ladder, the four closing shapes, the transcript with reflections. |

## How it connects

```
 confidence answer ──▶ warmupSeed (the ticked skills, tick order)
                              │
                              ▼
                        concernTurns(seed)
   turn 0  [ "Let's do a warm up on a, b, & c." , "First, tell me … **a**." ]
   turn 1  [ reflection(0) "Gotcha. It sounds like…"           , "How about with **b**?" ]
   turn 2  [ reflection(1) "Agreed: that's a tricky skill."     , "How about the **c**?"  ]
   turn 3+ [ reflection(2) "A lot of students share that struggle." , … ]
                              │
        student answers (the only lines stored: session.warmup.messages)
                              │
                              ▼
                 closingTurn(byEase(focus)[0], answers.length)
   [ reflection(answers - 1) , "Thank you for that insight | those insights. Let's start with <first>." ]
                              │
                              ▼  CHAT_CLOSE_MS
                        warmup/begin ──▶ the practice pad

 WarmupChatScreen: current = closing ? closingTurn(…) : turns[turnIndex]
                   turnSteps(current.length, opening): beat · dots · bubble, per bubble
                   the box is on only once the turn's last bubble (the question) has landed
```

Ticket 74's rhythm and ticket 84's question forms are unchanged; a reflection is one more bubble at the head of each later turn, so the box stays off through it. The reflections carry no skill mark, so `skillRuns` leaves them whole.

## Verified by

vitest (339), eslint, tsc, `next build`; a headless click-through (`reflect.mjs`) of four seeds: three skills (the mid-turn state 1.5s after a send, the reflection up alone and the box off; the three turns' tails; the closing pair; the pad after the close beat; only student lines stored), one skill (singular thanks), no skill (open question, singular thanks, no skill named), five skills (the reflections Gotcha, Agreed, A lot, A lot).
