# 99 · "Talk it through" is a pill on the hint itself; the help menu is four bare pills

Route: `/student?stage=practice` (any warm-up, once a hint is showing), the practice overlay.

## Files touched

| File | What it does |
|---|---|
| `components/HintCard.tsx` | `onTalk?: () => void`; when given (the latest hint), a "Talk it through" pill (`data-talk-hint`) under the hint text: deep purple outline, paper fill, accent-soft on hover. |
| `components/PracticePad.tsx` | `talkHint`: says the tutor's `hintOpener(n)` once (skipped if it is already the last message) and opens the chat; handed to the latest `HintCard` as `onTalk`, not while the worked example plays. `HelpMenu`: no `onTalkHint`, `chatted` or notes; four pills (`border-accent-deep`, `rounded-full`) in a `grid w-fit`, so each is the width of "worked example"; the popup `w-fit min-w-[248px] p-7`. The hint pill is disabled while `stalled` or no hint is `next`. |

## How it connects

```
 components/PracticePad.tsx
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │  stalled = stalledHint(p, lines, shown) !== null                                 │
 │                                                                                  │
 │  HintCard (latest)  ─ onTalk ─▶ talkHint()                                       │
 │   ┌───────────────────┐         ├─ dispatch run/chat {from: tutor,               │
 │   │ HINT 1            │         │    text: hintOpener(hints.length)}  (once)     │
 │   │ Get the like …    │         └─ setChatOpen(true)                             │
 │   │ (Talk it through) │                    │                                     │
 │   └───────────────────┘                    ▼                                     │
 │                                  HelpChat (right column, under the read lines)   │
 │                                  first bubble: "Let's talk more about hint 1 …"  │
 │                                                                                  │
 │  "I need help" ─▶ HelpMenu                                                       │
 │   ┌───────────────────┐                                                          │
 │   │ I'd like a…       │   hint ─────── onHint (greyed while stalled / none next) │
 │   │ ( another hint )  │   example ──── onExample (greyed once seen)              │
 │   │ ( worked example )│   video ────── nowhere yet (greyed)                      │
 │   │ (     video     ) │   chat ─────── onChat                                    │
 │   │ (     chat      ) │   no notes; pills = width of the widest; popup w-fit     │
 │   └───────────────────┘                                                          │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

Ticket 86's stall rule is unchanged (`lib/hint.ts` `stalledHint`, the reducer's refusal of `run/hint`); only where the student reaches the chat-on-a-hint moved, from the menu's relabelled row to the hint card.

## Verified by

vitest (337), eslint, tsc, `next build`; a headless click-through (`talk.mjs`): the fresh menu's four rows by text, width (all 168px), border colour (`rgb(69, 53, 200)`) and popup width (248px); the pill's text and placement inside the card; the stalled menu's greyed "another hint"; the opener in the chat column after one press and stored exactly once after two; the pill present after reloading `/student`.
