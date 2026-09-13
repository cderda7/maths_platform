# 191: A finished set's Class View has no Pathway card; the key's half note reads "incomplete"

**What to build:** On a finished assignment's Class View (Problem Set 1), drop the Pathway card from the side column: every stage is over, so it tells the teacher nothing. The Key card moves up to the top of the column, level with the table. In the dot key (Class View and the student report), the half dot's note reads "incomplete" instead of "incomplete · problems skipped". A live set (Problem Set 2) keeps its Pathway card.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13, screenshot of Problem Set 1's Class View): "for a completed assignment, you can remove the pathway box. also, change the 'half' note to incomplete, instead of incomplete - problems skipped".

## Solution

- `app/teacher/TeacherLive.tsx`: the Pathway card renders only when `assignment.kind !== "finished"`, the same flag that already hides the refresh line and the live cards.
- `components/StatusKey.tsx`: the half row's note is "incomplete".

## Acceptance

- [x] `/teacher/a/pset-1/class`: no `[data-pathway-card]`; the Key card's top within a pixel of the table card's
- [x] The key reads "half · incomplete" on one line, no "skipped"
- [x] `/teacher/a/pset-2/class` once created: the Pathway card is there
- [x] vitest 566, eslint, next build; click-through `class191.mjs` (6 checks)
