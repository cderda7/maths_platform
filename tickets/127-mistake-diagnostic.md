# 127: A live diagnostic beside every problem on the mistake view

**What to build:** To the right of each problem on the mistake view, the option to ask a diagnostic question: collapsed to the "Live diagnostic" chip normally; a click opens the push panel (the same card as the class view's) beside the problem, with a suggested question for that problem on the example tab and the make-your-own tab to write and push one. The switch reads "respond online" (on) and "not recorded" (off), here and on the class view.

**Blocked by:** none (builds on the class view's push panel, ticket 25, and the mistake view, ticket 23).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "in mistake view, want to add to the right of each question the option to ask a diagnostic question. have it be collapsed normally, & when a teacher clicks into it, it expands to suggest a question & the option to make & push their own — as it is here [the class view's Live diagnostic card]. change the slider option to 'respond online' & 'not recorded'." The push panel lived on the class view only, with one fixture question (the Q2 factor check).

## Solution

- `data/diagnostic.ts`: `Diagnostic` gains `problemId`; one fixture per problem of the assignment (Q1–Q10), each aimed at the slip the class made on it (the Q3 null-factor-law zero, the Q4 2a, the Q6 discriminant sign, the Q7 third, the Q9 landing point, the Q10 no-real-roots graph…). The first stays the class view's example.
- `lib/diagnostic.ts`: `diagnosticFor(problemId)` (falls back to the first fixture); `pushBelongsTo(push, example, problemId)`, which panel a push belongs to (a fixture push by id, a teacher-written one by the problem it was written under); `customQuestion` takes the problem.
- `app/teacher/DiagnosticPush.tsx`: props `example`, `problemId`, `collapsible`, `className`. Collapsible, closed, it is the chip alone (a button with a chevron, centred on the problem header; a white badge on its corner while its push waits, the chip's width unchanged so the cards' right edges line up); open, the 380 px card. The pending band, Withdraw and the response show only in the owning panel; while another panel's push waits, the send buttons are off with a title. The switch reads "respond online" / "not recorded".
- `app/teacher/mistakes/TeacherMistakes.tsx`: each problem is a flex row, the card `flex-1 min-w-0`, the panel beside it.
- Tests: `lib/diagnostic.test.ts` (every problem has a well-formed fixture, the fallback, which panel a push belongs to, the problem a written question carries).
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] Every problem row on the mistake view has a collapsed chip, centred on the header, every card ending at the same x; nothing expanded on load
- [x] Clicking Q3's chip opens a 380 px panel beside the card suggesting Q3's own question; the switch reads "not recorded" then "respond online"
- [x] Pushing from Q3 shows Waiting in Q3's panel only; Q2's send is off; the student sees Q3's question marked Recorded; after Send Q3's panel shows "Sam · C · right · recorded"
- [x] Make your own under Q2 pushes a question filed under Q2 (its band in Q2's panel only, Q3's send off, the collapsed chip badged); the student sees it; Q2's own tab shows the response, its example tab does not
- [x] The class view keeps its card with the new switch labels; its fixture push shows Waiting on Q2's panel too (same question) and Withdraw there clears it; collapsing puts the chip back where it was
- [x] vitest (395), eslint, tsc, `next build`, headless run (`mistakes.mjs`)
