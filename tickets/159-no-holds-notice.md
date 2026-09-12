# 159: No "Every problem holds now." notice after a clean rework

**What to build:** When a student hands in the rework (or the teacher's force review hands it in for them) and no problem still contains a mistake, no notice appears over the next screen. The notice that names a count ("1 of your problems still contains a mistake. Double-check fractions.") stays as it was.

**Blocked by:** nothing.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a screenshot of the toast "Every problem holds now. ✕" sitting over the demo strip's group review / class review / report tabs: "remove this 'every problem hodls now'".

## Solution

- `lib/session.ts`: `reworkNotice(s)` returns the final version's summary sentence when its count is above zero and `null` otherwise; both places that set the post-rework notice (`rework/done`, and `advance/apply` for the teacher's `force-review` on a student still correcting) read it. `feedbackSummary`'s "Every problem holds now." head is untouched: nothing else displays it.
- Tests: `lib/feedback.test.ts` (a blank problem finished with a slip hands in with no notice); `lib/session.test.ts` (Q7 reworked with the model solution hands in with no notice by the student's own press and by the teacher's force review).
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] `/student?stage=feedback&run=strong`, Hand in: the waiting screen with no notice, "holds now" nowhere on the page
- [x] `/student?stage=feedback` (the weak run, Q7 still wrong): Hand in shows "5 of your problems still contain a mistake. Double-check …" and ✕ dismisses it
- [x] vitest (452), eslint, tsc, `next build`, headless click-through (`notice159.mjs`)
