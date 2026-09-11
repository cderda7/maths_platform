# 114 · The "full sentence" box is a text field that takes the cursor as it appears

Route: `/student?stage=working`, Q9 or Q10, every line of the working read.

## Files touched

| File | What it does |
|---|---|
| `components/PadSection.tsx` | `answer?: AnswerField` replaces ticket 111's `note`. `AnswerBox`: the chat's textarea (same classes as `WarmupChatScreen`'s box, `rows={2}`), placeholder from the caller, focused in a mount effect, Enter blurs instead of breaking the line; in a `pulse-once` wrapper at the foot of the pad card. |
| `lib/session.ts` | `StudentSession.answers: Record<string, string>`; `answer/set { problem, text }` stores as typed. Untouched by `lines/undo` and `lines/clear`. `INITIAL_SESSION.answers = {}` so `hydrateSession` fills old snapshots. |
| `lib/session.test.ts` | Two problems' answers, the second overwrite wins, undo and clear leave them, an old snapshot hydrates to none. |
| `app/student/screens/WorkingScreen.tsx` | `answer={{ placeholder, value: session.answers[p.id] ?? "", onChange → answer/set }}` when `askSentence` holds. |

## How it connects

```
 scriptDone(RECOGNITION[q], lines) && p.answerAs === "sentence"        (ticket 111, unchanged)
                     │
                     ▼
 WorkingScreen ── answer={ placeholder, value: session.answers[q], onChange }
                     │
                     ▼
 PadSection ── pad card ──┬── DrawPad
                          └── AnswerBox ── <textarea> (chat's classes) ── mount: focus()
                                              │ onChange                    │ Enter: blur()
                                              ▼
                                 dispatch answer/set { problem: q, text } ──▶ session.answers[q]  (localStorage, like the rest)
```

The field mounts when the last line is read (so the focus effect runs then) and unmounts on undo below it; the text outlives both, in the session. Nothing reads `answers` yet beyond this field (see FUTURE_FEATURES).

## Verified by

vitest (348), eslint, tsc, `next build`; the headless click-through `answer114.mjs` (port 3151, CDP 9443; 3131 was another agent's server): no field before the third line; the field with the placeholder after it and `document.activeElement` is the textarea; `Input.insertText` lands in it; Enter leaves no newline and blurs; a reload shows the sentence; undo removes the field; the next burst brings it back with the sentence; the field's computed border (focused), radius 16px, white background, 15px font, 12px 16px padding, 56px min-height match the chat box's classes. `npm run sweep:hint-boxes` against the same build.
