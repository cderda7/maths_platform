# 101 · The help menu's row always reads "hint"; pressed while the previous hint is unacted on, a notice leads into the chat

Route: `/student?stage=practice` (any warm-up, once a hint is showing and no line has moved past it), the practice overlay.

## Files touched

| File | What it does |
|---|---|
| `components/PracticePad.tsx` | `help: "closed" \| "menu" \| "stall"` replaces the boolean; `HelpMenu` takes `{ next, stalled }`, its first pill always "hint", live when either holds; the pad's `onHint` shows the notice when stalled, else dispatches `run/hint`. `StallNotice` (new): scrim, 300px card, the sentence, one "Talk it through" pill on the shared `talkHint`. |
| `lib/hint.ts` | Doc comment on `stalledHint`: "hint" leads into the chat while stalled. |

## How it connects

```
 "I need help" ─▶ help = "menu" ─▶ HelpMenu
                                    ( hint )  ── onHint ──┬─ stalled ──▶ help = "stall" ─▶ StallNotice
                                    ( worked example )    │                                 "Let's talk through the previous hint
                                    (     video     )     │                                  before giving you another."
                                    (     chat      )     │                                 ( Talk it through ) ── talkHint ──┐
                                                          └─ not stalled ──▶ run/hint                                        │
                                                                                                                              ▼
 HintCard (latest)  ( Talk it through ) ── talkHint ─────────────────────────────────────────────▶ run/chat {tutor: hintOpener(n)} once
                                                                                                   help = "closed", chatOpen = true
                                                                                                   HelpChat: "Let's talk more about hint 1 …"
```

Ticket 86's stall rule (`stalledHint`, the reducer refusing `run/hint`) is unchanged; ticket 99's greyed row is replaced by the notice, so a student who reaches for a hint is told why there is none yet and given the way on.

## Verified by

vitest (338), eslint, tsc, `next build`; a headless click-through (`talk2.mjs`): the fresh and stalled menus both read "hint" live; pressing it while stalled gives no second hint, closes the menu and shows the notice with the exact sentence and button; Escape closes it with nothing stored; "Talk it through" on the notice closes every overlay, opens the chat with the opener, stored once, and the hint card's pill afterwards adds nothing.
