# 91 · The skill box's text is ink, so the line reads in one colour

Routes: `/student?stage=warmup-chat`.

## Files touched

| File | What it does |
|---|---|
| `app/student/screens/WarmupChatScreen.tsx` | The skill box: `text-standout` → `text-ink`; fill and edge unchanged |

## How it connects

```
   skillRuns(text) ─► {text:"fractions", skill:true}
                          │
                          ▼
   <span data-skill class="rounded-md border border-standout-line bg-standout-soft px-1.5 py-px text-ink">fractions</span>
                                                                                          ^^^^^^^^ was text-standout (ticket 89)
   the bubble:  "How about with [fractions]?"   one ink colour end to end; the box is fill and edge only
```

## Verified by

vitest (full suite green); eslint clean; `next build`; headless Chrome on the built app at
`/student?stage=warmup-chat`, two answers sent: the three `[data-skill]` boxes have colour
rgb(20, 18, 58) (ink) on background rgb(232, 240, 250). Screenshot of the chat.
