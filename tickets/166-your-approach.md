# 166: The class-review tag reads "your approach"

**What to build:** On the student's class-review screen the light blue tag on the example that is the student's own first hand-in reads "your approach" instead of "your initial response". Nothing else changes.

**Blocked by:** 161.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "change from 'your intial response' to 'your approach'."

## Solution

- `app/student/screens/FrozenScreen.tsx`: the tag's text.
- `components/ExampleColumns.tsx`, `lib/frozen.ts`: the doc comments that quote the tag.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `README.md`.

## Acceptance

- [x] Student at class review: one light blue tag on B reading "your approach", on one line, the three columns' first boxes still level
- [x] Everything else in ticket 161's click-through still holds (`review166.mjs`, the same checks with the new wording)
- [x] vitest, eslint, tsc, `next build`
