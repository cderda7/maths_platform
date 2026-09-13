# 198 · The chat opens on a hint two ways, each with its own line

## Files touched

| File | What it does |
| --- | --- |
| `lib/helpChat.ts` | `HINT_OPENER_START` ("Let's talk about hint "), `TALK_OPENER` (the question alone), `hintOpener(n)`; `HelpChatRequest.hinted` parsed; `helpChatSystem(..., hinted)` lists the hint cards on screen and explains both pad-said lines. |
| `app/api/help-chat/route.ts` | Passes `body.hinted` into the brief. |
| `components/PracticePad.tsx` | `talkHint(text)`: the card's pill → `TALK_OPENER`, the stall notice's pill → `hintOpener(n)`; `hinted={shown}` to both chats. |
| `components/HelpChat.tsx` | `hinted` prop, sent with every turn. |
| `lib/helpChat.test.ts` | The two lines, the brief's cards section, `hinted` parsing. |

## How it connects

```
 PracticePad (warm-up / isolated practice)
 ┌──────────────────────────┐
 │ HINT n  …                │
 │ ( Talk it through ) ─────┼── talkHint(TALK_OPENER) ─────────────────┐
 └──────────────────────────┘                                          │
 I need help → "hint" (stalled) → StallNotice                          ▼
                                  ( Talk it through ) ── talkHint(hintOpener(n)) ──► run/chat {tutor: line} (once)
                                                                                         │
                                                                                         ▼
 HelpChat ── POST /api/help-chat { problem, lines, messages, hinted, shown? }
                    │
                    ▼
   parseHelpChatRequest ──► helpChatSystem(problem, lines, messages, shown, hinted)
                                ├─ "The hints on the student's screen": Hint 1: …, Hint 2: …
                                └─ rule: a line beginning "Let's talk about hint " or reading exactly
                                   TALK_OPENER was said by the pad → talk that hint through
```

## Verification

vitest, eslint, tsc, `next build`; `click199.mjs` (with ticket 203) on all 15 warm-ups. The card's pill gives one bubble with the question alone, and a second press adds nothing. The stall notice's pill gives "Let's talk about hint n before another one. …" with n the latest card's number. A sent turn carries `hinted: [0]` and the opener, with the model call stubbed in the page.
