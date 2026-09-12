# 176: "New assignment" moves from the teacher bar to the class view's right column, above the Pathway card, as a light indigo pill

**What to build:** The "New assignment" pill leaves the teacher bar (every `/teacher/*` route) and heads the class view's right column, directly above the Pathway card, flush with the column's left edge and level with the roster card's top. It is a light indigo pill (the soft accent fill) with deep indigo text and a 1 px deep indigo border, the accent line tint on hover. The bar keeps the brand, the tabs, the teacher's name and avatar.

**Blocked by:** 163, 165.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with a screenshot of the class view: "move new assignment button to right above the pathway box. make the pill light purple ; deep purple text & border".

## Solution

- `app/teacher/TeacherChrome.tsx`: the `Link` to `/teacher/assignments/create` is gone from the bar's right group, which is now the name and the avatar. The header comment says where the button went.
- `app/teacher/TeacherLive.tsx`: the right column (`space-y-6`) opens with a `flex` row holding the same `Link` (`data-new-assignment`): `rounded-full border border-accent-deep bg-accent-soft px-3 py-1 text-[13.5px] font-medium text-accent-deep hover:bg-accent-line`. The Class review card (when a session runs), the Pathway card and the rest follow beneath as before, so with no session running the pill is right above the Pathway card; while a session runs it is above the Class review card that leads the column (ticket 129).
- Docs: this ticket, `architecture/176-new-assignment-above-pathway.md`, `ARCHITECTURE.md`, `README.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] No "New assignment" in the bar on `/teacher`, `/teacher/mistakes`, `/teacher/groups`, `/teacher/report`, `/teacher/assignments/create`; the name and avatar still at the bar's right
- [x] On `/teacher` the pill is the first thing in the right column, flush with the Pathway card's left edge, its top on the roster card's top, the Pathway card 24 layout px beneath it
- [x] Fill `#eeebfc` (accent-soft), text and 1 px border `#4535c8` (accent-deep), hover `#d6d0f7` (accent-line), fully rounded
- [x] A click opens `/teacher/assignments/create`
- [x] No sideways overflow at 1400×1000 or 1280×800
- [x] vitest (479), eslint, tsc, `next build`, `check:laptop` (16); click-through `nav176.mjs` (34 checks)
