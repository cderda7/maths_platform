# 146: Student screens on the setup page start unchosen

**What to build:** On the class review setup page the "Student screens" choice (screens frozen / write with me) has no preselected option. Both start empty; the teacher must click one, and Project stays off until they do.

**Blocked by:** 44 (the follow modes).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "instead of having a default for student screens, let's force the teacher to choose. so both empty — teacher must click in to choose." The setup page opened with "screens frozen" already selected, so a teacher could project without ever deciding what the class's iPads would do.

## Solution

- `app/teacher/whole-class/WholeClassSetup.tsx`: `mode` starts `null`; neither option carries `aria-pressed`; the helper line reads "Choose one to project." until one is picked (then "You can change this per problem from the board."); Project is disabled while no problem or no mode is chosen and `project` returns early without a mode. Once chosen, `wc/setup` is sent with that mode as before.
- Unchanged: the board and board-controls toggle (a projected problem always has a mode by then) and the reducer's fallback to frozen for classrooms stored before modes existed.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] The setup page loads with no mode pressed, "Choose one to project." under the options, Project disabled even with problems checked
- [x] Clicking "screens frozen" presses it, the line changes, Project comes on; Project opens the board with that mode on its toggle
- [x] vitest (406), eslint, tsc, `next build`, headless run (`setup.mjs`)
