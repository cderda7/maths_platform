# 151: The student's header carries the review pathway

**What to build:** The Edexia header on every student screen shows the review pathway horizontally, the same idea as the teacher's Pathway card: one pill per stage (indiv working → indiv review → group review → class review, only the stages the assignment has), light blue ahead, ringed in purple while current, the lit skill button's dark blue with white text once over. It sits beside the student's name so it is in the same place on every screen.

**Blocked by:** 129.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with the class view's Pathway card on screen: "just as the teacher has transparency into the review process, want the student to, as well. same exact idea with the light blue & then dark blue when it's being worked through / done. have it organized horizontally. add to the Edexia header section. have it be a part of every student screen, in the edexia header."

## Solution

- `lib/classStage.ts`: `pathwayStages(classroom, session, now)` returns every stage of the pathway as over / current / ahead with its word and no count; `classStages` now builds on it and adds the counts. One function decides the stage for both sides, so the teacher's card and the student's strip always light the same pill.
- `app/student/PathwayStrip.tsx`: the strip. An `ol` in the display face at 15 px, a pill per stage (`rounded-lg px-3 py-1.5`), a horizontal arrow between pills, `aria-current="step"` on the current one, `data-pathway-strip` / `data-stage` / `data-stage-state` for tests. Not interactive.
- `app/student/StudentChrome.tsx`: takes `stages` and renders the strip in the header's right-hand group, 24 px before the student's name, so the crumb's changing length never moves it.
- `app/student/StudentApp.tsx`: computes the stages from the classroom, the session and the clock and passes them down.
- `lib/classStage.test.ts`: the strip's stages equal the card's minus the counts at every skip target; the expected states at working, group review and class review.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] Every student screen (overview, warm-up, working, individual review, class wait, group review, class review frozen, report, peers, history) shows the strip in the header, inside it and vertically centred, clear of the crumb and 24 px from the name, pills in one row, in the same place on every screen
- [x] States follow the class: working current on the overview and while working; indiv working over and indiv review ringed after hand-in and at the gate; group review ringed on the board; class review ringed while frozen; everything over once the teacher ends the session
- [x] Colours: over = `--color-standout` with white text, current and ahead = `--color-standout-soft` with ink, the ring `--color-accent` and only on the current pill
- [x] Only the assignment's stages: `?pathway=wc` gives two pills and one arrow, `?pathway=none` the working alone
- [x] vitest (424), eslint, tsc, `next build`, headless run (`strip149.mjs`, 113 checks)
