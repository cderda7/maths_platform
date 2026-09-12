# 129: The Pathway card marks where the class is

**What to build:** On the class view the **Pathway** card's chip carries the class's progress: the stage the class is on has a purple ring and, to its right, how many of the class are done with it (`12/20 done`); stages the class has moved on from are dark navy with white text (the student's own warm-up bubbles' colours) and carry no count, since everyone is done with them; stages ahead stay light blue. The first pill reads **indiv working** instead of **submit**. The separate **Class** card (`Group review · 20 of 20 handed in · started`) is gone; its one control, starting group review before everyone is in, is a line under the count. While a class review session runs, the **Class review** card leads the side column.

**Blocked by:** 124.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with crops of the class review card, the Class card and the pathway chip: "move class review to top when it is in use. eliminate this [the Class card]. add purple border around the blue pill where class currently is. change submit to indiv working. add a note to the right -- 12/20 done for the current stage. once a stage is moved on from, remove that text -- it's obvious all are done. change from light blue to dark blue (as in the student warm up color scheme) once a stage is over".

## Solution

- `lib/classStage.ts` (new): `classStages(classroom, session, now, problemCount)` names every stage of the pathway (the working first) as over, current or ahead, with a per-student count for the current one. The class enters a stage when the class does: class review when the teacher projects, group review when the gate opens (everyone in or the teacher's start), individual review when the live student hands in (the classmates' review is scripted from that moment). Counts: working = the live student past working plus classmates with every problem done (Force assignment submit's line); individual review = handed in at the gate; group review = members of groups at 100 %; class review = none. Ended: every stage over, none current.
- `lib/pathway.ts`: the chip's first word is `indiv working`.
- `app/teacher/TeacherLive.tsx`: the Pathway card renders the stages: over `bg-ink text-white`, current `ring-2 ring-accent` (a shadow, so nothing moves), the count absolutely positioned to the right of the current pill in the body sans at 12.5 px. The column sits at the card's left so the note has the rest of the width. The Class card is gone. The class review card is rendered above the Pathway card while `currentSlide` is non-null, below the group card otherwise.
- `app/teacher/GroupStart.tsx`: now the gate line under the count: **start group now**, then `● starting · 0:59 · Cancel` while the grace runs; nothing once the gate has opened.

## Acceptance

- [x] `indiv working → indiv review → group review → class review`; the current pill ringed, its count to the right, over pills navy, no count on them
- [x] The count climbs (class wait: 1/20 → 20/20), the gate line under it, the countdown and Cancel inside the card
- [x] Class review in use: its card first in the column; ended: every pill navy, nothing ringed, the card back below
- [x] Pills never move between states
- [x] vitest, eslint, tsc, `next build`, headless click-through (`stage.mjs`, 34 checks) with crops
