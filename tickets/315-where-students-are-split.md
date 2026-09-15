# 315: The Mistakes tab during working splits into Where students are and Where students went wrong

**What to build:** while the class is on individual working, the set's Mistakes tab shows two columns. On the left, **Where students are**: a row per place, with each student's name in the row they are in. On the right, **Where students went wrong**: today's mistake cards at half width, each with its Live diagnostic button top left, whose steps open over the left column.

**Blocked by:** 314 (the place model).

**Status:** ready

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

- [ ] On `/teacher/a/pset-6/mistakes` during individual working: the eyebrow line with the stage pills (indiv working, the done count, force submit) at the top right; under it two equal columns, each headed in the display face at the same size ("Where students are", "Where students went wrong"), the headers level
- [ ] Left: a row per place in lesson order from ticket 314 (Starting, Warm-up, Q1 … Q10, Handed in). The row label sits in a fixed left cell. Each student is a pill (avatar initials, name, the detail in muted text, the three-part step bar for warm-up and practice, the minutes on that step in plain muted figures). Warm-up pills tinted accent, practice pills tinted standout blue, the rest plain. A row with nobody in it stays, with a muted "nobody yet"; absent students named in muted text in the Handed in row. Q rows that hold no students may be collapsed into a range ("Q7–Q10") only if the whole left column otherwise would not fit 1280×800; if collapsed, each pill names its question
- [ ] Rows never reorder; a student's pill moves to the next row when the model says so, and nothing else on the screen moves
- [ ] No italic maths anywhere on the screen
- [ ] Right: today's mistake cards (`TeacherMistakes`), newest activity first as today, at half width. The count tags sit inside the card header; each card's **Live diagnostic** button sits at its top left. Maths still fits per the Mistakes tab's fit rules, one KaTeX line, pills never wrap or clip
- [ ] Pressing Live diagnostic opens that question's step flyout (today's `DiagnosticPush` content and behaviour: pick steps, send N to class) over the left column, below the headers; the question's card gets an accent ring; the mistakes column is never covered. Escape, a press outside and sending close it. After sending, the chain view works as today (`DiagnosticFocus`, whole width) and Done returns to the split
- [ ] Minutes are plain muted numbers (whether they change colour past some limit is still Carson's call; don't colour them)
- [ ] The split is built as a frame a stage fills (left rows, right content), ready for tickets 318–320
- [ ] Once individual working is over, the Mistakes tab reads as today
- [ ] Nothing scrolls sideways at 1280×800 or 1440×900; the left column fits without scrolling at 1280×800 with all 20 students in play (the teacher chrome's 0.72 zoom: measure with offsetWidth, see project testing pitfalls)
- [ ] vitest, eslint, tsc, next build, check:laptop; click-through at 1280×800 and 1440×900 with a student tab and the teacher tab: pills move rows live as the stream and Sam move on, nothing else moves, the flyout opens over the left, sends, the chain view, Done back to the split, screenshots checked for pixel problems
- [ ] Ticket docs: `architecture/315.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES (the minutes colour question)
