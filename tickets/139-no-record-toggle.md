# 139: No recorded / not-recorded switch on the diagnostic

**What to build:** Remove the "respond online" / "not recorded" switch from the live diagnostic panel on the class view and the mistake view, and the recorded flag behind it everywhere (the student's modal pill, the response line, the session model). Pushing is one button with nothing to decide first. The finger-raising idea the switch stood for goes to FUTURE_FEATURES.

**Blocked by:** 127.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "let's just eliminate the whole 'online record' vs 'not recorded' entirely. the idea of students raising fingers to respond & not feel recorded is good, but too nuanced. add to F_F. take away the toggle & the friction in that decision."

## Solution

- `app/teacher/DiagnosticPush.tsx`: the header row is the chip alone; no `recorded` state; the push action carries no flag; the response line ends at right / wrong.
- `app/student/screens/DiagnosticModal.tsx` and `app/student/StudentApp.tsx`: no `recorded` prop, no Recorded / Not recorded pill; the eyebrow stands alone.
- `lib/session.ts`: `recorded` dropped from `diagnostic`, `diagnosticAnswers` and the `diagnostic/push` action. A session persisted with the old field still loads (the extra key is ignored).
- `lib/session.test.ts`: the three diagnostic tests follow.
- `FUTURE_FEATURES.md`: the idea, why it is out, and how it would come back (a separate quiet action, not a mode). Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `README.md`.

## Acceptance

- [x] No switch, no "recorded" text, on the class view's card, the mistake view's flyouts or the student's modal; `grep recorded` over app/, lib/ and data/ finds only unrelated prose
- [x] A push from the mistake view still reaches the student and the response line reads "Sam · C · right"
- [x] vitest (403), eslint, tsc, `next build`, headless run (`mistakes.mjs`)
