# 90 · The worked example is maths alone, one column, with a "Question about a step?" chat beside it

Route: `/student?stage=practice` (any warm-up's worked example), the practice overlay; `POST /api/help-chat`.

## Files touched

| File | What it does |
|---|---|
| `components/PracticeCard.tsx` | Each revealed step is display-mode KaTeX at the problem's size, centred (`data-step`); no caption; a two-case step's two boxes centred; the reveal button centred. |
| `components/PracticePad.tsx` | The "Guess the next step" line is gone. While the example plays the right column is `HelpChat` with `exampleShown`; otherwise the chat (closable) or the read-as. |
| `components/HelpChat.tsx` | `exampleShown?` / `onClose?`: beside the example the eyebrow reads "Question about a step?", the opener is the example's, no close, no autofocus, and `shown` rides on each turn. |
| `lib/helpChat.ts` | `EXAMPLE_OPENER`, `chatOpener(messages, example)`, `shown?` on `HelpChatRequest` (parsed as a whole non-negative number), `helpChatSystem(…, shown)` marks the steps on screen and frees the tutor on those only. |
| `app/api/help-chat/route.ts` | Hands `body.shown` to the brief. |
| `lib/helpChat.test.ts` | The opener, the parser, the example brief, the pad brief unchanged. |

## How it connects

```
 PracticePad (run.example)
 ┌───────────────┬──────────────────────────────────┬──────────────────────────────┐
 │ problem       │ WORKED EXAMPLE                   │ QUESTION ABOUT A STEP?        │
 │ hints         │ ┌ PracticeCard ────────────────┐ │ ┌ HelpChat ────────────────┐ │
 │ I need help   │ │ stem            [leaf chip]  │ │ │ tutor: Which step, and   │ │
 │ (disabled)    │ │      x/4 + x/2 − 6 = 9/2     │ │ │        what about it?    │ │
 │               │ │ ────────────────────────────  │ │ │ student: why is step 2…  │ │
 │               │ │      x/4 + x/2 = 9/2 + 6     │ │ │ tutor: (streams)         │ │
 │               │ │      x/4 + x/2 = 21/2        │ │ │ [in your own words…][send]│ │
 │               │ │         [ Next step ]        │ │ └──────────────────────────┘ │
 │               │ └──────────────────────────────┘ │ footer buttons               │
 └───────────────┴──────────────────────────────────┴──────────────────────────────┘
        each step: <M display> at the problem's size, centred        exampleShown = run.exampleShown
                                                                              │
                                                    send ─► POST /api/help-chat { problem, lines, messages, shown }
                                                                              │
                                                    helpChatSystem(p, lines, messages, shown)
                                                      steps: "1. (on screen) …", "3. (not yet shown) …"
                                                      rule: a step on screen may be explained in full;
                                                            hints-only for every step not yet shown
```

On the follow-up (`second`) the compact card on the left is the same component at `text-[20px]`, and the right column is the read-as again, since the student is writing.

## Verified by

vitest (337), eslint, tsc, `next build`; a headless click-through of the fractions and factorising
warm-ups: the example opens with the chat on the right (eyebrow, opener, no close, body focused),
the six fraction steps and the problem all measure 21.6px on centre x 690, the factorising example's
two-case step is boxed and centred, a sent turn posts `shown: 3`, and the follow-up's compact card
has no captions.
