# 204: "Talk it through" puts the cursor in the chat

## Files touched

| File | What it does |
| --- | --- |
| `components/PracticePad.tsx` | The practice pad; counts each ask for the chat (`chatAsks`, `openChat`) and passes it to the chat. |
| `components/HelpChat.tsx` | The help chat; focuses its box on mount and again whenever `asked` changes. |
| `tickets/204-talk-jumps-to-chat.md` | The ticket. |

## How it connects

```
  HintCard "Talk it through" ──► talkHint(TALK_OPENER) ──┐
  StallNotice "Talk it through" ► talkHint(hintOpener n) ─┤
  HelpMenu "chat" ────────────────────────────────────────┤
                                                          ▼
                                   PracticePad.openChat()
                                   chatOpen = true, chatAsks + 1
                                                          │
                                                          ▼  asked={chatAsks}
                                   HelpChat (right column, under ReadAs)
                                   useEffect([example, asked]) ─► textarea.focus()
                                   (skipped beside the worked example)
```
