# 37: Teacher on a laptop

**What to build:** The teacher's surface is a laptop, not a tablet: frameless, full browser width, the home page saying so. Every teacher page fits a normal laptop viewport with no horizontal scroll, and that stays true.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

Another reviewer hit a horizontal scrollbar on the assignment-creation screen at a normal laptop width. Today's measurements at 1440×900 and 1280×800 show no overflow on any of the seven teacher pages, but nothing guards that, and the copy still treats the teacher as device-agnostic.

## Solution

Keep the teacher pages frameless and full width. State the laptop on the home card. Add an automated viewport check over every teacher route at the two laptop sizes that fails on any horizontal overflow, so the demo cannot trip on it again.

## Acceptance

- [ ] Home card copy names the laptop
- [ ] Every teacher route measured at 1440×900 and 1280×800 with no horizontal scroll, in an automated check that runs with the rest of the verification
- [ ] Any overflow found is fixed in the same ticket
- [ ] Architecture note and root docs
