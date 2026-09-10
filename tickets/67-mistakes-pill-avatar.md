# 67: Mistakes view: the slip pill starts under the avatar, not the name

**What to build:** On `/teacher/mistakes` the red slip pill's left edge lines up with the student's avatar circle rather than with the name, so the pill spans the whole tile from avatar to right edge.

**Blocked by:** 66

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the ticket-66 view: "make it so that the red pill spans the student 'avatar' — the circle with the initials".

## Solution

The pill row's left padding in `TeacherMistakes.tsx` goes from `pl-16` (the avatar's width plus its gap, which put the pill under the name) to `pl-5`, the same as the tile's own horizontal padding, so the pill's left edge and the avatar's coincide.

## Acceptance

- [x] In every slip group the pill's left edge equals the first student's avatar left edge; the right edge is unchanged
- [x] eslint, tsc, vitest, `next build` pass
- [x] Architecture note and `ARCHITECTURE.md` row
