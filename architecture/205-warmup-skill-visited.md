# 205: A warm-up skill the student leaves turns dark, and the set follows the last one

## Files touched

| File | What it does |
| --- | --- |
| `lib/session.ts` | The student session reducer; `leaveSkill` marks the skill on screen done when the student leaves it by "Next skill" or a chip tap. |
| `lib/session.test.ts` | The chip-tap walk updated to the new meaning of done; a new case taps every chip and gets the set from "Next skill". |
| `app/student/screens/PracticeScreen.tsx` | The warm-up screen: chips and the "Next skill" / "On to the set" button; doc comments only. |
| `tickets/205-warmup-skill-visited.md` | The ticket. |

## How it connects

```
  /student  PracticeScreen
  ┌──────────────────────────────────────────────────────────────┐
  │ chips [fractions][factorising][null factor law][non-monic]   │
  │   state = current │ done (dark) │ todo (light)               │
  │ button: remaining === 0 ? "On to the set" : "Next skill →"   │
  └───────┬───────────────────────────────┬──────────────────────┘
          │ chip tap                      │ button press
          ▼                               ▼
   { warmup/goto, step }           { warmup/skill-done }
          │                               │
          └──────────────┬────────────────┘
                         ▼
               lib/session.ts sessionReducer
               leaveSkill(s): warmup.done + skill on screen
                         │
          goto ──► step = tapped chip
          skill-done ──► next skill never opened (wraps)
                         └─ none left ──► stage "working" (the set)
                         │
                         ▼
               warmup.done read back by the chips and the label
```
