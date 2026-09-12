# 146 · Student screens on the setup page start unchosen

Route: `/teacher/whole-class`.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/whole-class/WholeClassSetup.tsx` | `mode: FollowMode | null` starting `null`; the two option buttons press only a chosen one; the helper line and Project's `disabled` follow; `project` sends `wc/setup` with the chosen mode. |

## How it connects

```
 WholeClassSetup
   Problems (top three pre-checked)            Student screens
   ┌──────────────────────────┐                ( ) screens frozen   their pad mirrors what you write
   │ ✓ Q7 · ✓ Q3 · ✓ Q2 …     │                ( ) write with me    their pad is live; they copy
   └──────────────────────────┘                "Choose one to project."
                                               [ Project ]  off until mode !== null (and a problem is checked)
                    │ click one → aria-pressed, line → "You can change this per problem from the board.", Project on
                    ▼
   dispatchClassroom wc/setup { problems, examples, mode }  ──▶ wholeClass.modes[pid] = mode (every projected problem)
   dispatchClassroom wc/project · router → /teacher/board  ──▶ BoardControls / SmartBoard toggle shows that mode
   (reducer fallback `a.mode ?? "frozen"` and currentSlide's frozen default: stored sessions only)
```

## Verified by

vitest (406), eslint, tsc, `next build`; a headless run (`setup.mjs`) of the setup page: no option pressed on load, "Choose one to project." shown, Project disabled with three problems checked; "screens frozen" pressed on click, the line changed, Project on; Project lands on the board with "screens frozen" pressed on its toggle.
