# 328: Where students are: times in whole minutes; three minutes in a row turns dark purple

**What to build:** on the Mistakes tab's Where students are column, every pill's time reads in whole minutes ("<1 min here", "1 min here", "2 min here" …), and from "3 min here" the time is dark purple: the student could use a check-in.

**Blocked by:** 327.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Carson, 2026-09-15, after ticket 327: "the second counts are a bit overwhelming. let's organize by minutes. so <1 min here, 1 min here, 2 min here, etc. when a student gets to 3 min here, write the text 3 min here text in dark purple -- signals to teacher that student could use check in"

This answers ticket 315's open question (does the time change colour past a limit?): yes, dark purple at three minutes in the row.

## Acceptance

- [x] Every pill time is whole minutes: "<1 min" under a minute, then "1 min", "2 min" …, for "here" and "took" alike (one formatter)
- [x] A "here" time of three minutes or more ("3 min here" and up), figures and word, is dark purple (`accent-dark`, #2f2491); under three minutes it stays muted. The pill carries `data-check-in`
- [x] A "took" time is never purple (a handed-in student needs no check-in)
- [x] Nothing else about the pill changes: one line, fixed slot, no width change as the minute ticks
- [x] vitest, eslint, tsc, next build; click-through at 1280×800 and 1440×900 against a production build (the colour of every pill's time at 25 s, 150 s and 90 min, the flag exactly from 3 min, screenshots checked)

## Solution

- `lib/whereStudents.ts`: `duration` reads whole minutes; `PillTime.checkIn` (true on "here" from `CHECK_IN_MS`, 3 min; always false on "took").
- `app/teacher/WhereStudentsAre.tsx`: `StudentPill` colours the "here" time `text-accent-dark` when `checkIn`, `text-ink-muted` otherwise.
