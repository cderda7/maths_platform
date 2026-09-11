# 107 · The concerns chat's closing bubble stays up for 2.8 seconds before the pad

Route: `/student?stage=warmup-chat`, after the last answer.

## Files touched

| File | What it does |
|---|---|
| `lib/warmup.ts` | `CHAT_CLOSE_MS` is `2 * (CHAT_BEAT_MS + CHAT_DOTS_MS)` = 2800 (was 1200): the closing bubble's hold before the pad, the length of a whole two-bubble tutor turn. |
| `lib/warmup.test.ts` | The value and the identity. |
| `architecture/74-chat-rhythm.md` | Its record of the constant notes the change. |

## How it connects

```
 last answer ──▶ closingTurn: [ reflection , "Thank you for … Let's start with <first>." ]
                 turnSteps(2, false):  beat 400 · dots 1000 · reflection · beat 400 · dots 1000 · thanks
                                                                                            │
                                                                        + CHAT_CLOSE_MS 2800 (was 1200)
                                                                                            ▼
                                                                    dispatch warmup/begin ──▶ the pad
```

`WarmupChatScreen` was already timing the hand-off as the last step's `at` plus `CHAT_CLOSE_MS`; only the constant moved.

## Verified by

vitest (340), eslint, tsc, `next build`; a headless click-through (`close.mjs`): after the third answer the thanks is up at 3.1s, the chat is still on screen at 5.6s (2.5s later), and the pad is on screen at 6.3s (3.2s later).
