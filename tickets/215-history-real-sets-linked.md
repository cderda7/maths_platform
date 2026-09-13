# 215: History pills read real sets, link to them, and never jump

**What to build:** In a student's history on a set's Class View, a category's five pills are the last five earlier sets that assessed that category, reaching back through the Classroom; for New skills, each earlier set's New skills result. Real pills read "PS5 · Mon 7 Sep" and open that set's Class View. When fewer than five sets assessed the category, simulated pills fill the top of the stack: the oldest dated a week before the class's first set (Tue 18 Aug), the rest between that date and the first set, never after it; they are not links. Neighbouring pills, and the newest against today's pill, never move more than one step (red ↔ orange ↔ light green ↔ dark green).

**Blocked by:** 209.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "say 3/5 test communication -- top pill date should be oldest (a week before PSet1, 2nd pill should be in between top pill & PSet 2 date)"; simulated pills stay before the first set so they read as pre-Edexia; "don't want 'dark green today, red a week ago' … students have a level of consistency between assignments (obviously wnat variation, but don't want random jumping)". Today five generated dates (Aug 11–28) and a seeded shuffle that can put red beside light green; only the newest pill is real and none link.

## Solution

- History from the registry: per category, the earlier sets whose problems touch it (New skills: every earlier set with New skills), last five, oldest first.
- Simulated pills as a one-step walk ending one step from the oldest real pill (or today's), dated from the first set's date backwards.
- Pill label with the set's short name and day; a real pill is a link to that set's Class View, keyboard-focusable; the stack's aria-label names the sets.
- Works with Sets 5 and 6 alone and picks up 211–214 as they land.

What was built:

- `lib/history.ts` (pure): the seeded shuffle of fixed mixes and `HISTORY_DATES` are gone. `HistoryPoint` is `{ date, status, set }` (`set` null on a simulated point). `simulatedWalk(student, category, anchor, n)` walks back from the anchor one step at a time on red → orange → light green → dark green (stays about half the time, turns inward at an end; a hollow anchor walks around orange; Priya dark green). `simulatedDates(firstDue, n)`: the oldest a week before the class's first set, the rest spread evenly over the weekdays strictly between that and the first set (today Mon 31 Aug, Tue 1, Thu 3, Fri 4 Sep; once Set 1 lands on Tue 25 Aug, Tue 18 Aug onwards). `historyWith` takes the last five real results and tops them up; the walk anchors on the oldest real result that has a colour, else today's pill. `stepsApart`, `parseDay`/`formatDay` (year 2026), `shortSetName` ("PS5"), `pillLabel` ("PS5 · Mon 7 Sep", or the day alone).
- `lib/setHistory.ts`: `HistorySource` (a set's name, day, scope and records), `assessed(set, category)` (a home category its problems touch; New skills when the set lists any), `resultsFrom`, `historyFrom(earlier, ownDue, …)` (the testable core, fed a synthetic registry in tests), `earlierSources(id)` reading the registry only through `earlierAssignmentIds` and `assignmentBundle`, `categoryHistory({ id, due }, …)`, `historyPillHref` (`/teacher/a/<set>/class?history=<student>&open=<category>`).
- `app/teacher/TeacherLive.tsx`: a real pill is a `Link` (`role="listitem"`, focus ring, aria-label "Problem Set 5 — Features of a parabola, Mon 7 Sep: solid. Open its Class View"); a simulated pill is a plain span. The stack is a `role="list"` naming the sets. So the longer labels fit, in history mode a category cell's pill fills its column less 1 px a side (today's named pill and the stack above it are one width per column) and the history labels drop their side padding and tracking ("PS5 · MON 7 SEP" is 73 layout px; Algebra's narrowest pill has 76 inside). Nothing on the roster moves; the cream and cut rules of ticket 175 are unchanged. `TeacherLive` takes `init` (`history`, `open`) from `app/teacher/a/[id]/class/page.tsx`, which reads the query: a linked pill lands on that set's Class View with the student in history mode and the category's stack open, scrolls the row into view and drops the query (a reload is the plain view); an unknown student opens nothing.
- Tests: `lib/history.test.ts` (walk, dates, labels), `lib/setHistory.test.ts` (a synthetic six-set registry skipping graphing on two sets and New skills on one: reaches back, last five, simulated fill and dates for any first day; the real registry: Set 6's pills, Set 5's all simulated, and every set × student × category checked for jumps). The ticket 187 history tests in `data/pset5/pset5.test.ts` and the dates test in `lib/renamedSets.test.ts` moved onto the new functions.

Judgment calls:

- Set 5 touches the same six categories as Set 6 today, so no Set 6 category skips Set 5 on screen yet; skipping and reaching back are proven with the synthetic registry and apply automatically when 211–214 land.
- Real results jump today: 20 student × category pairs move more than one step from their Set 5 result to their Set 6 result (for example Harper's algebra dark green on Set 5 and red on Set 6). Ticket 210's class story sheet owns real results, so the fixtures are unchanged; the test lists them as `KNOWN_REAL_JUMPS` and fails on any other jump (and on any jump beside a simulated pill). Ticket 210/217 clears the list.
- A hollow (unseen) real pill (Liam on Set 5) is off the ladder: no step is counted against it, and the walk anchors on the next coloured real result or today's pill.
- Sam's live row on Set 6 has no fixed record; his history reads his Set 5 record like everyone else's.

## Acceptance

- [x] Set 6, a category Set 5 did not assess: its pills skip Set 5; with too few sets the simulated pills are dated 18 Aug and between 18 Aug and the first set
- [x] Real pill labels and links land on the right set's Class View
- [x] Test over every set × student × category: no neighbouring pair (and newest vs today) more than one step; Priya dark green throughout
- [x] No overflow in the history stack at 1280 and 1440 with the longer labels
- [x] vitest (648), eslint, tsc, next build, check:laptop (30); click-through `click215.mjs` (173 checks) opening history on several students on Set 6 and Set 5 at 1280 × 800 and 1440 × 900, Tab to a real pill, following a link
