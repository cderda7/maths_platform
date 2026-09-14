# 257: The SKIP TO bar no longer covers the Q6–Q10 row

**What to build:** On the student working screen, the demo's SKIP TO bar (`components/SkipTo.tsx`) sits over the bottom of the problem picker's Q6–Q10 row at the iPad frame's bottom edge. Move it so nothing inside the iPad is covered at any supported window size.

**Blocked by:** none.

**Status:** skipped (the user, 2026-09-14: not a concern for now; see FUTURE_FEATURES.md)

**Triage:** `wontfix` (for now)

---

## Problem Statement

Outside review (2026-09-14): "The problem picker (Q1–Q10) is clipped by the bottom of the iPad frame; Q6–Q10 are half cut off." The user's screenshot of mathsplatform.netlify.app/student (a ~1000×620 CSS px Chrome window) shows the SKIP TO bar overlapping the Q6–Q10 row.

## Solution

Reproduce first at the screenshot's size, 1280×800 and 1440×900. Then place SKIP TO outside the iPad frame (below it), keeping it readable as demo chrome, so no stage's content is covered.

## Acceptance

- [ ] Click-through at ~1000×620, 1280×800, 1440×900 on every SKIP TO stage: the bar's rect intersects nothing inside the iPad screen; Q6–Q10 fully visible and pressable; no page scroll introduced
- [ ] eslint, tsc, next build
