# 103 · The chat under the read-as lines takes only the height it needs, capped at about the bottom third, and scrolls

Route: `/student?stage=practice` (any warm-up), the practice overlay with the chat open under "Read as".

## Files touched

| File | What it does |
|---|---|
| `components/PracticePad.tsx` | The read-as list is `flex-1` in both states (no more 45% cap while the chat is open); the chat under it is `max-h-[42%] shrink-0`. Beside the worked example the chat is passed `flex-1`. |
| `components/HelpChat.tsx` | The outer box is `flex min-h-0 flex-col` with its growth left to the caller's `className`; the empty `mt-auto` first item is gone, so the box is content-sized until the cap and the transcript scrolls past it. |

## How it connects

```
 aside (right column, flex column, min-h-0)
 ┌───────────────────────────────────────────┐
 │ READ AS                        flex-1     │  ← takes whatever the chat leaves
 │   x − 2 = 0   x + 5 = 0                   │
 │   x = 2       x = −5                      │
 │                                           │
 ├───────────────────────────────────────────┤  border-t
 │ CHAT                             close    │
 │   ┆ (earlier bubbles, scrolled away) ┆    │  ol: min-h-0 flex-1 overflow-y-auto
 │   ┌──────────────────────────────┐        │     scrollIntoView(end) on every
 │   │ Reply 6: try substituting …  │        │     message / streamed chunk
 │   └──────────────────────────────┘        │
 │   [ in your own words…        ] ( send )  │  max-h-[42%] shrink-0: content-sized
 ├───────────────────────────────────────────┤  until the cap, then the list scrolls
 │                Skip to the set  Next skill│  footer
 └───────────────────────────────────────────┘

 beside the worked example: <HelpChat className="flex-1"> — the column is the chat, unchanged
```

Nothing in the data path moved: lines said still go through `run/chat`, the reply still streams from `/api/help-chat`, and the chat still survives a reload and a reopen (ticket 69). Only the two `className`s decide who gets the column's height.

## Verified by

vitest (338), eslint, tsc, `next build`; a headless click-through (`chat103.mjs`, replies served in-page): the fresh chat is 24% of the column with no scrollbar; after one and after six exchanges the chat is 42% of the column, the transcript is scrolled to its end with the latest reply in view and the box inside the column; a reload and reopen holds the same cap over the stored transcript; beside the worked example the chat is 90% of the column as before.
