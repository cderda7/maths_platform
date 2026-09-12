# 149: One flash, not three

**What to build:** The light-blue flash on the Student screens options, when the faded Project is pressed with no mode chosen (ticket 147), runs once instead of three times.

**Blocked by:** 147.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), on ticket 147: "1 flash will suffice."

## Solution

- `app/globals.css`: `.choose-flash` iterates once (600 ms). Every press still restarts it (the option buttons are keyed on the press count).
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] One press: the options reach the standout-soft blue mid-beat and rest on paper within a second; "select one" stays; a second press flashes once more
- [x] vitest (423), eslint, tsc, `next build`, headless run (`setup147.mjs`)
