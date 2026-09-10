# 61: Teacher side: the arrow cursor everywhere, never the hand

**What to build:** On every teacher route the mouse pointer is the arrow. Links, buttons, clickable rows, chips, drag handles and disabled controls no longer switch to the hand (or the grab / not-allowed symbols). The one exception is a field the teacher types into, which keeps the I-beam.

**Blocked by:** —

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11): "in teacher view, sometimes changes between cursor symbol & hand symbol. make it so that it is ALWAYS cursor -- never turns into a hand." The hand came from three places: the browser's own pointer on every `<a href>` (tabs, "New assignment", the student-name links), Tailwind `cursor-pointer` / `cursor-grab` utilities on the class-view rows, the diagnostic-push label, the group cards and their move menu, and the shared `Button`'s `disabled:cursor-not-allowed`.

## Solution

One unlayered rule in `app/globals.css`, scoped to the `[data-teacher-root]` wrapper that `TeacherChrome` already puts around every teacher screen: everything inside computes to `cursor: default`, with text inputs and textareas set back to `cursor: text`. Being outside Tailwind's `@layer utilities`, it wins over every `cursor-*` utility and over the browser's pointer on links, so shared components (`Button`, `HierarchyDrill`, `HintCard`) need no change and a future `cursor-pointer` on a teacher screen is harmless. The teacher-only utilities that the rule made dead are removed from the four files that carried them, so the code does not claim a cursor it never shows. Student and board screens are untouched.

## Acceptance

- [x] Every element under `[data-teacher-root]` on `/teacher`, `/teacher/mistakes`, `/teacher/groups`, `/teacher/report` (demo and `?student=`), `/teacher/assignments/new`, `/teacher/whole-class`, `/teacher/compare`, `/teacher/board` computes to `cursor: default`, text fields to `text`
- [x] Hovering a tab link, a student's row, "see dot skills" and "New assignment" shows the arrow
- [x] `grep cursor- app/teacher` is empty
- [x] eslint, tsc, vitest, `next build` pass
- [x] Architecture note and `ARCHITECTURE.md` row
