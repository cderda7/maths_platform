# 86 · "Another hint" opens the chat on the current hint while the student has not acted on it

Routes: `/student?stage=practice` (the warm-up), the mid-set practice overlay, `POST /api/help-chat`.

## Files touched

| File | What it does |
|---|---|
| `lib/hint.ts` | `stalledHint(problem, lines, shown)`: the latest shown hint while the lines have not moved past every point it is for; null for a general hint |
| `lib/session.ts` | `run/hint` is a no-op while a hint is stalled |
| `lib/helpChat.ts` | `hintOpener(n)`, `HINT_OPENER_START`, `chatOpener(messages)`; the brief names the real opener and explains a pad-said hint line; `helpChatMessages` folds same-side runs into one turn |
| `app/api/help-chat/route.ts` | Hands the transcript to `helpChatSystem` |
| `components/PracticePad.tsx` | `stalled`; the hint row's `onTalkHint` stores the pad's tutor line once and opens the chat; `HelpMenu` reads "Talk it through →" |
| `components/HelpChat.tsx` | A stored tutor line first is the opener; else the fixed one |
| `lib/hint.test.ts`, `lib/session.test.ts`, `lib/helpChat.test.ts` | The rule, the reducer's refusal, the brief and the folded turns |

## How it connects

```
   "I need help" ─► HelpMenu row "another hint"
                        │
                        ├─ stalledHint(p, lines, shown) !== null ──► note "Talk it through →"
                        │      (latest hint h, positionOf(lines) <= max(h.at))     │ tap
                        │                                                         ▼
                        │                              dispatch run/chat { from: "tutor", text: hintOpener(n) }   (once: not if already the last line)
                        │                              setChatOpen(true)
                        │                                                         │
                        │                                   ┌ CHAT ───────────────▼──────────────────────────┐
                        │                                   │ tutor:   Let's talk more about hint 1 before   │  ◄─ stored in run.chat[p.id][0]
                        │                                   │          another one. What is it asking you    │     (HelpChat: a stored tutor line first
                        │                                   │          to do here, in your own words?        │      is the opener; no fixed opener added)
                        │                                   │ student: multiply two numbers?                 │
                        │                                   │ tutor:   Good, what do the two numbers …       │  ◄─ POST /api/help-chat
                        │                                   └────────────────────────────────────────────────┘        system = helpChatSystem(p, lines, messages)
                        │                                                                                              · opener = chatOpener(messages) = the pad's line
                        │                                                                                              · rule: a line beginning "Let's talk more about hint "
                        │                                                                                                was said for you: talk that hint through, no next hint
                        │                                                                                              messages = helpChatMessages(...): from the first student
                        │                                                                                                line; tutor+tutor runs folded into one assistant turn
                        │
                        ├─ else pickHint(...) !== null ─────────────► note "Show →" ─► dispatch run/hint ─► the next hint card
                        │                                                                 (the reducer also refuses while stalled)
                        └─ else ─────────────────────────────────────► "None for this step" / "All shown"

   student writes the line the hint asked for ─► positionOf moves past max(h.at) ─► stalled = null ─► "Show →" again
```

## Verified by

vitest (334 tests, five new, two rewritten); eslint and tsc clean; `next build`; headless Chrome on the
built app (port 3184, CDP 9484), the factorising skill opened from the warm-up's chips: blank pad,
"hint" gives hint 1; the menu then reads "another hint · Talk it through →" and tapping it opens the
chat with one tutor bubble, the pad's line about hint 1, and nothing else; close and repeat, still one
bubble; with `fetch` stubbed, sending "multiply two numbers?" posts `{ problem: "w-monic", lines: [],
messages: [tutor line, student line] }` and the canned reply lands as the third bubble; after a reload
the chat row reads "Continue →" and the same three bubbles are there; one stroke read, the row reads
"Show →" and gives hint 2 ("your line 1"), and then reads "Talk it through →" again. Screenshots of
the chat opened on the hint and of the reply.
