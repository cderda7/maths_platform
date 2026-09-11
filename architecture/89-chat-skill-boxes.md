# 89 · The concerns chat's skill names sit in a light blue box, not bold

Routes: `/student?stage=warmup-chat` (and the chat after a not-confident answer on `/student?stage=confidence`).

## Files touched

| File | What it does |
|---|---|
| `lib/warmup.ts` | `skillRuns(text)` (was `emphasis`): a tutor line as `{ text, skill }` runs; `named(word)` (was `bold`) wraps a skill in `**…**` |
| `app/student/screens/WarmupChatScreen.tsx` | A skill run is a rounded box: `bg-standout-soft`, `border-standout-line`, `text-standout`, normal weight, `data-skill` |
| `lib/warmup.test.ts` | Renamed with the helper; same cases |

## How it connects

```
   concernTurns(seed) ──► "How about with **fractions**?"        (unchanged since ticket 84)
                                    │
                                    ▼
   WarmupChatScreen.bubble("tutor", text)
     └─► skillRuns(text) ─► [{text:"How about with ", skill:false}, {text:"fractions", skill:true}, {text:"?", skill:false}]
                                    │
                                    ▼
          <span>How about with </span><span data-skill class="rounded-md border border-standout-line bg-standout-soft px-1.5 py-px text-standout">fractions</span><span>?</span>

   tokens (app/globals.css):  --color-standout #2f6fb3 · --color-standout-soft #e8f0fa · --color-standout-line #c3d7ee
                              the palette's one blue (the "standout" step mark), reused here as a plain highlight
```

## Verified by

vitest (19 warm-up tests, all passing after the rename; full suite green); eslint clean; `next build`;
headless Chrome on the built app (port 3162, CDP 9452) at `/student?stage=warmup-chat`, two answers
sent: three `[data-skill]` boxes ("factorising", "fractions", "null factor law") at font-weight 400,
background rgb(232, 240, 250), colour rgb(47, 111, 179); zero `<strong>` elements. Screenshot of the chat.
