# 229: The "I'd like a…" menu has a close ×

## Files touched

| File | What it does |
| --- | --- |
| `components/PracticePad.tsx` | The practice pad; its `HelpMenu` card now carries a corner × that calls the menu's `onClose`. |
| `tickets/229-help-menu-close.md` | The ticket. |

## How it connects

```
 /student  stage "practice"  →  PracticePad.tsx
   "I need help" ──► HelpMenu (inside Scrim, from PracticePrompt.tsx)
                     ┌ card ─────────────────── × ◄ 229 ┐
                     │ I'd like a…                      │
                     │ ( hint ) ( worked example )      │
                     │ ( video ) ( chat )               │
                     └──────────────────────────────────┘
   ways out, all one onClose ──► help overlay cleared
     • × click           (229)
     • scrim click       (Scrim onDismiss)
     • Escape            (Scrim onDismiss)
```
