# 315: The Mistakes tab during working splits into Where students are and Where students went wrong

**What to build:** while the class is on individual working, the set's Mistakes tab shows two columns. On the left, **Where students are**: a row per place, with each student's name in the row they are in. On the right, **Where students went wrong**: today's mistake cards at half width, each with its Live diagnostic button top left, whose steps open over the left column.

**Blocked by:** 314 (the place model).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

See ticket 314. Mockup agreed with the user on 2026-09-15: https://claude.ai/artifact/VqKBobvLqcd1ftSauepHkH (the first two frames; read it with the Artifact tool's `read` action). The user's words, in order:

- "potentially, one option is to have the window split vertically — right half showing mistakes rolling in, left half showing where students are at … only show name & where they're at organized into rows … students at top all be earlier on, students further down later on"
- Chose one row per place (rows never reshuffle; names move between rows). "take away italics."
- "make title Where students went wrong a header of same size & format as Where students are, just over that column instead. can remove 'lesson order' header."
- "need diagnostic functionality from there — the purple tag that allows teacher to send a diagnostic question … move live diagnostic to the top left of the box. then, when it opens, it can pop up over the 'where students are' table."
- The Class tab is not locked: "can still navigate there, just don't see much bc student info not populated". No change there.
- "we'll reuse this same structure for when they're in different review modes" (tickets 318–320). Build the frame so a stage can supply its own rows.

## Acceptance

- [x] On `/teacher/a/pset-6/mistakes` during individual working: the eyebrow line with the stage pills (indiv working, the done count, force submit) at the top right; under it two equal columns, each headed in the display face at the same size ("Where students are", "Where students went wrong"), the headers level
- [x] Left: a row per place in lesson order from ticket 314 (Starting, Warm-up, Q1 … Q10, Handed in). The row label sits in a fixed left cell. Each student is a pill (avatar initials, name, the detail in muted text, the three-part step bar for warm-up and practice, the minutes on that step in plain muted figures). Warm-up pills tinted accent, practice pills tinted standout blue, the rest plain. A row with nobody in it stays, with a muted "nobody yet"; absent students named in muted text in the Handed in row. Q rows that hold no students may be collapsed into a range ("Q7–Q10") only if the whole left column otherwise would not fit 1280×800; if collapsed, each pill names its question
- [x] Rows never reorder; a student's pill moves to the next row when the model says so, and nothing else on the screen moves
- [x] No italic maths anywhere on the screen
- [x] Right: today's mistake cards (`TeacherMistakes`), newest activity first as today, at half width. The count tags sit inside the card header; each card's **Live diagnostic** button sits at its top left. Maths still fits per the Mistakes tab's fit rules, one KaTeX line, pills never wrap or clip
- [x] Pressing Live diagnostic opens that question's step flyout (today's `DiagnosticPush` content and behaviour: pick steps, send N to class) over the left column, below the headers; the question's card gets an accent ring; the mistakes column is never covered. Escape, a press outside and sending close it. After sending, the chain view works as today (`DiagnosticFocus`, whole width) and Done returns to the split
- [x] Minutes are plain muted numbers (whether they change colour past some limit is still Carson's call; don't colour them)
- [x] The split is built as a frame a stage fills (left rows, right content), ready for tickets 318–320
- [x] Once individual working is over, the Mistakes tab reads as today
- [x] Nothing scrolls sideways at 1280×800 or 1440×900; the left column fits without scrolling at 1280×800 with all 20 students in play (the teacher chrome's 0.72 zoom: measure with offsetWidth, see project testing pitfalls)
- [x] vitest, eslint, tsc, next build, check:laptop; click-through at 1280×800 and 1440×900 with a student tab and the teacher tab: pills move rows live as the stream and Sam move on, nothing else moves, the flyout opens over the left, sends, the chain view, Done back to the split, screenshots checked for pixel problems
- [x] Ticket docs: `architecture/315.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES (the minutes colour question)

## Solution

On `/teacher/a/pset-6/mistakes`, while the live set is on individual working, `TeacherMistakes` draws a split (`app/teacher/StageSplit.tsx`): the eyebrow line carries the stage pills at its right, then two equal columns under "Where students are" and "Where students went wrong", both 40 px in the display face, level. Once working is over the tab is as it was (one title, counts beside each card, the diagnostic chip beside it).

- **Left (`app/teacher/WhereStudentsAre.tsx`, `lib/whereStudents.ts`).** `useWhereRows` reads ticket 314's `classPlaces` every tick and holds what it saw (`carryPlaces`): Sam's first-seen time and every student's row entry (`classmatesEntered` walks each classmate's timeline back to the start of their run in the row, so a hint or practice step keeps their spot). `whereRows` turns that into a row per place in lesson order. Each row has a label in a fixed 132 px cell (Starting "check-in", Warm-up "3 steps each"), its pills in the order the students came in (a newcomer joins the end), "nobody yet" when empty, and Chloe named absent under Handed in. A `StudentPill` is avatar, name, the detail in muted words ("not started", "chat", the warm-up's skill, "hint 2", "practice · monic factorising", "back on Q2"), the three-part step bar for warm-up and practice, and the time on the step. Warm-up pills are tinted accent, practice standout blue, the rest plain. A pill that has just come into its row shows a fading 3 px ring. `onPress` makes the pill a button, ready for ticket 316.
- **The time.** `stepTime` shows seconds under a minute ("40 s") and whole minutes from a minute ("6 min"), plain muted, in a fixed 46 px slot so a tick never re-wraps a row.
- **Fold.** `PlaceTable` measures the unfolded rows before paint on every render and resize. Only when the table's foot would pass the scroll region (12 px kept) does each run of two or more empty question rows fold into one range row ("Q3–Q10", nobody yet). The fold writes `hidden` straight to the rows, holds no state and cannot flip. Only empty rows fold, so no pill ever needs to name its question.
- **Right.** The mistake cards as today, newest activity first, at half width. The counts move into the card header at its right. The difficulty tag leaves the header on the split (the mockup has none; the question needs its room). The Live diagnostic button (`DiagnosticChip`) sits at the header's top left. Maths is upright on the whole split (`.upright-maths` in `app/globals.css` sets KaTeX's italic letters in its roman face), and the Mistakes tab's fit rules measure it as set.
- **Live diagnostic.** `DiagnosticPush` is split into `DiagnosticSteps` (the steps and the send, shared) and the side flyout. On the split, `DiagnosticOverlay` draws the open flyout over the left column below the headers, full column width, headed "Live diagnostic · Q2 · the whole question". The question's card gets a 2 px accent ring. Escape (focus back on the button), a press anywhere outside (other than a Live diagnostic button) and sending close it; the pointer leaving does not, since it has to cross from the card to reach it. Another card's button switches it. After sending, `DiagnosticFocus` takes the page as today and done returns to the split. `useOpenFlyout` in `diagnosticFlyout.ts` names the open one.

Verification: vitest 1951 (`lib/whereStudents.test.ts` 11: the time formatter; details and tones; every row in lesson order and all twenty accounted for at every 7 s of the stream; Jordan's pill; arrival order second by second with Sam carried; a row entry held through Liam's help; carried places; the runs that may fold), eslint, tsc, next build, check:laptop 76. Click-through `click315.mjs` 75/75 at 1280×800 and 71/71 at 1440×900 with Sam's iPad tab (`/student/a/pset-6?stage=confidence`, then `?stage=working` and Next: Q2) and the teacher tab against a production build, with real presses and keys:
- the split: equal columns, level headers in one face and size, the stage pills on the eyebrow line at the top right, rows in lesson order, Chloe absent
- Sam in Starting, then Q1, then Q2
- 40 s of the stream: pills moved rows 19 times at 1280×800 and 18 at 1440×900, and on every move the headers, eyebrow, columns, table and row order stayed put
- no italic maths, no wrapped or clipped pill or misconception pill, maths inside its box, no sideways scroll
- the button at the card's top left with the counts inside the header
- the flyout exactly over the left column below the headers, covering the rows and never the mistakes; the accent ring; no card moved on opening
- Escape with focus return, a press outside, the button again, and another card's button switching the flyout
- two steps picked, send 2 to class, the chain view at whole width, force, next, force, done, back to the split
- the students-done skip: the tab reads as before

`fit315.mjs` 415/415: a reload every 5 s across the whole stream at 1280×800. The left column always fits (tallest 975 of 989 layout px), 19 pills, a folded row never holds a pill, a fold only where the unfolded rows would not fit, no sideways scroll. Screenshots checked at each step.

## Judgement calls

- **On the split, the teacher sees the time on a step as seconds under a minute ("40 s") and whole minutes from a minute ("6 min"), plain muted grey.** At the demo's pace most steps last seconds, so minutes alone would read 0. Whether the time changes colour past a limit is still Carson's call (FUTURE_FEATURES).
- **On the split's mistake cards, the teacher does not see the difficulty tag ("simple familiar").** The agreed mockup has none, and at half width the question wrapped under it. After individual working, the tag is back beside the question.
- **On the split, only empty question rows fold, and only when the column would not fit.** At 1280×800 that happens for the first seconds (everyone in Starting, Warm-up and Q1, "Q3–Q10") and whenever a run of empty rows exists while the rows are tall. A pill never moves into a range row, so no pill names its question.
- **On the split, a student with no detail in their row shows none.** The confidence check reads just the name and the time in Starting (the row's "check-in" says it), and a student working on a question reads just the name and the time. Sam before the set reads "not started".
- **On the split, the maths is upright everywhere, the flyout included.** The chain view after sending is not the split, so it keeps today's italic maths, as does the Mistakes tab after individual working.
- **On the split, the pills in a row stand in the order the students came into it.** A newcomer joins the end. A student leaving closes the gap, so the pills after them shift left; nothing else on the screen moves.
- **The time on a step includes a diagnostic chain's pause.** The pill's time is `now − since`, so a step that spanned a chain reads longer than the student worked on it (FUTURE_FEATURES).
- **Sam's time on a step counts from when the teacher's tab first saw the place** (`carrySince`), until tickets 312 and 313 record step times in his session. A teacher reload starts his time again.

