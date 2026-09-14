# 258: Create's primary button is never under the Netlify badge

**What to build:** Outside review (2026-09-14): "the primary CTA sits bottom-right under the Netlify badge on every create step." The user's screenshot shows the badge clear of the iPad; the claim is about the teacher's full-width Create steps. Reproduce on the deployed site and, if it overlaps, give the steps' footer room so the button is always pressable.

**Blocked by:** none.

**Status:** skipped (the user, 2026-09-14: not a concern for now; see FUTURE_FEATURES.md)

**Triage:** `wontfix` (for now)

---

## Solution

- Reproduce on mathsplatform.netlify.app/teacher/assignments/create at 1280×800 and 1440×900, scrolled to the bottom of each step: compare the primary button's rect with the "Powered by Netlify" badge's.
- If they overlap: bottom clearance on the step footer (or move the button) so they never intersect. If they never do: close as not reproduced with the measurements.

## Acceptance

- [ ] Measurements before and after on every step at both sizes; button and badge rects disjoint
- [ ] eslint, tsc, next build
