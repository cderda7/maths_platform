# 69 · Help chat: a fourth option under "I need help", a tutor that only hints and offers a choice of ways in

Route: `/student?stage=practice` (the warm-up pad) and the isolated-practice overlay on `/student?stage=working`; `POST /api/help-chat`.

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `ChatMessage` (shared with the warm-up's concerns chat) and `Approach`; `PracticeProblem.approaches?` |
| `data/practice.ts` | `approaches` on the twelve problems with two ways in; three single-backslash `\;` lines fixed |
| `lib/helpChat.ts` | Pure: `findPractice`, `parseHelpChatRequest`, `helpChatSystem` (the tutor's brief and rules), `helpChatMessages`, `chatSegments`, the model id and the opener |
| `lib/helpChat.test.ts` | The brief carries the problem, working, hint, ways in and lines; the rules are in it; the request parser; the transcript mapping; `$...$` splitting |
| `lib/session.ts` | `PracticeRun.chat` per problem id; `run/chat` appends one line (blank dropped) on the problem named |
| `lib/session.test.ts` | Chat kept per problem, a late reply lands on the problem it was asked on; an old snapshot hydrates with an empty chat |
| `lib/warmup.ts` | `WarmupMessage` is now an alias of `ChatMessage` |
| `app/api/help-chat/route.ts` | The one live model call: validate, look the problem up, stream `claude-opus-5` with the server-side refusal fallback, first event awaited so failures are statuses (503 / 429 / 502), text deltas piped as `text/plain` |
| `components/HelpChat.tsx` | The panel: opener, bubbles with inline KaTeX, the streaming reply, the box; dispatches each line into the run; 503 → a "not connected" note |
| `components/PracticePad.tsx` | The `chat` row in `HelpMenu`; `chatOpen` swaps the right column between `HelpChat` (keyed by problem) and `ReadAs` |
| `package.json` | `@anthropic-ai/sdk` |
| `README.md` | How to connect the chat (`ANTHROPIC_API_KEY` in `.env.local`) |

## How it connects

```
 components/PracticePad.tsx                                lib/session.ts
 ┌────────────────────────────────────┐                    PracticeRun.chat: Record<problemId, ChatMessage[]>
 │ "I need help" ──▶ HelpMenu         │                    run/chat {run, problem, message}
 │    hint · worked example · video · │                      └─▶ runReducer: append (blank text dropped)
 │    chat  "Open →" / "Continue →" ──┼─▶ chatOpen = true              ▲
 │                                    │                                │ dispatch (student line at once,
 │ right column:                      │                                │           tutor line when the stream ends)
 │   chatOpen ? <HelpChat key={p.id}> │   components/HelpChat.tsx      │
 │            : <ReadAs>              │   ┌────────────────────────────┴──────────────────┐
 └────────────────────────────────────┘   │ opener  CHAT_OPENER (shown, never stored)     │
                                          │ bubbles messages ▸ ChatText: $..$ ─▶ <M> KaTeX │
                                          │ pending  the reply streaming in (pulsing "…")  │
                                          │ note     503 → "isn't connected" (not stored) │
                                          │ box      Enter sends · Shift+Enter breaks     │
                                          └──────────────────────┬────────────────────────┘
                                                                 │ fetch POST /api/help-chat
                                                                 │ { problem: id, lines: tex[], messages }
                                                                 ▼
 app/api/help-chat/route.ts                                lib/helpChat.ts (pure, tested)
 ┌────────────────────────────────────────┐                parseHelpChatRequest ─ shape, ends with the student
 │ parse ─▶ 400 · findPractice ─▶ 404     │◀───────────    findPractice ─ first problems and follow-ups
 │ client.beta.messages.stream            │                helpChatSystem(problem, lines):
 │   claude-opus-5 · fallbacks: default   │                  problem · skill · reference working (eyes only)
 │ await first event:                     │                  · pad hint · ways in ◀── data/practice.ts approaches
 │   AuthenticationError/no creds ─▶ 503  │                  · lines read · the rules (hints only, two ways,
 │   RateLimitError ─▶ 429 · APIError 502 │                    "which makes more sense?", stay on the chosen one)
 │ text deltas ─▶ text/plain stream       │                helpChatMessages(chat) ─ user/assistant turns
 │ refusal with nothing sent ─▶ CHAT_DECLINED               chatSegments(reply) ─ prose | tex
 └───────────────────┬────────────────────┘
                     ▼
              Anthropic API (credentials from the server's environment)
```

## Verified by

vitest (299 tests, 22 new); eslint and tsc clean; `next build`. `curl` against the built app on port 3131: a
malformed body is 400 `bad-request`, an unknown id 404 `unknown-problem`, and a real turn with no credentials
on this machine 503 `not-configured`. A headless-Chrome run of the same build opened `/student?stage=practice`,
moved to the factorising step, and drove the pad with real clicks and input events: the menu lists hint /
worked example / video / chat ("Open →"); chat closes the menu, replaces the read-back with the panel, shows the
opener and focuses the box; a sent line appears at once and the real 503 produces the "isn't connected" note;
with the route intercepted (CDP `Fetch`) to serve a two-ways reply, the posted body is the problem id, the
lines and the chat so far, the reply typesets five KaTeX spans, and the pending bubble is gone; a stroke on the
pad then travels as `lines` on the next turn; close brings the read-back back, the menu reads "Continue →",
reopening and a reload both show the six bubbles (localStorage holds `warmup.chat["w-monic"]`); the follow-up
opens with "Open →" and only the opener. Screenshots of the menu, the open panel, the not-connected note, the
reply and the follow-up were checked by eye. The real model conversation could not be exercised here: no
Anthropic credentials are configured on this machine.
