# 147: Pressing the faded Project says "select one" and flashes the options

**What to build:** On the class review setup page, when Project is faded because no Student screens mode is chosen and the teacher presses it anyway, the button's label becomes "select one" and both options (screens frozen, write with me) flash light blue to point the teacher at the choice. Each press restarts the flash. Choosing a mode clears the nudge and turns Project on.

**Blocked by:** 146.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "if a teacher clicks on 'project' & it's faded bc the screen hasn't been chosen, have the project faded button text change to 'select one' & the whole students screen field pulse blue — like have each of the selection pills flash light blue to direct the teacher there." A disabled button takes no press, so the faded state had no answer.

## Solution

- `app/teacher/whole-class/WholeClassSetup.tsx`: `nudge` counts presses with no mode. Project is `disabled` only with no problem checked; with no mode it is faded (`opacity-40`, `aria-disabled`) and its press bumps `nudge`. Label "select one" while nudged and unchosen. Each option button gets `choose-flash` (and `data-flash`) while nudged and unchosen, keyed on the press count so a second press restarts the animation.
- `app/globals.css`: `@keyframes choose-flash` (paper → standout-soft with the standout-line border → paper) and `.choose-flash` (600 ms, three beats); reduced motion holds the light blue instead.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] Faded Project pressed with no mode: label "select one", both options carry the flash and their background is the light blue mid-beat; no `wc/setup` dispatched, still on the setup page
- [x] A second press restarts the flash; choosing a mode restores "Project", clears the flash and Project opens the board
- [x] vitest (423), eslint, tsc, `next build`, headless run (`setup147.mjs`)
