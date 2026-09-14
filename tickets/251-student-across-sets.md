# 251: A student across every set: the holistic assessment page

**What to build:** A teacher page for one student across all six problem sets: their one-line summary, the category × set status grid, and the habits behind anything short of secure, organised by category, each habit naming its set and problems and opening that working. One page, two routes, so Back always goes where the teacher came from.

**Blocked by:** none.

**Status:** open

**Triage:** `ready-for-agent`

---

## Problem Statement

Outside feedback on the demo (2026-09-14): "Your loop doesn't loop. Everything resets per assignment… 'Sam has had a fractions gap for six weeks and here's the evidence' is the thing a teacher would actually pay for." The user agreed ("yeah FAX let's please implement that") and set the shape: Edexia Classroom gets a Holistic Assessment entry leading to student tiles (ticket 252), a tile opens the between-assignments assessment, and clicking a student's name in a set's Class View also opens it (ticket 253). The per-assignment report must stay reachable.

Agreed answers: the per-assignment report is reached from this page by its set's column; the page shows habits organised by category; the summary line is the story sheet's line for the student.

## Solution

- Data: `data/story.ts` already holds every student × category × PS1–PS6 status and the habits (with problem refs) behind each non-secure result; build a pure view model over it (Sam's PS6 live from his session, as the Class View reads it).
- Page, top to bottom: name, avatar, summary line; the grid (categories as rows, PS1–PS6 as columns, the four status colours, *not seen*, *—*, absent from ticket 250, live); habits under their category heading, each "PS4 · Q1, Q2" linking to that student's working on that set.
- A set's column header opens that set's per-assignment student report.
- Routes: `/teacher/students/[id]` (Back → the tiles, ticket 252) and `/teacher/a/[set]/students/[id]` (Back → that set's Class View). The same component; only Back differs.
- Copy rule applies; no difficulty tags.

## Acceptance

- [ ] Unit: the view model for Priya (all secure, no habits), Sam (PS6 live), Liam (missing sets), Chloe (absent on PS6 once 250 lands); habits grouped by category in canonical order
- [ ] Click-through at 1280×800 and 1440×900: all twenty students render on both routes with nothing to scroll sideways; grid cells equal the story sheet; every habit link opens the right working; column header opens the per-assignment report; Back from each route lands on its origin; browser back agrees
- [ ] vitest, eslint, tsc, next build, check:laptop
