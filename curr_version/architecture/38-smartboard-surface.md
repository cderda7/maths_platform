# 38 · The smartboard surface

Routes: `/board` (the smartboard: opened once at the start of the lesson, left on the projector,
nothing to press), `/teacher/board` (now the teacher's controls only), `/teacher` (the "Board ·
…" indicator), `/` (the third card), `/split` (the board pane points at `/board`).

## Files touched

| File | What it does |
|---|---|
| `lib/board.ts` (+ test) | `boardContent(classroom, session)` → `BoardContent`: `blank` (the class name and the assignment title, nothing else) while students work and through individual and group review, and after whole-class review has ended; `holding` once group review is over and the teacher hasn't advanced (the pathway has a group stage and the student sits where it hands over, `nextStage(pathway, "group-done")`, or on report / peers / history with no whole-class session active or ended); `whole-class` while projecting: the problem, slide index and total, the view, the anonymous `boardExamples` and the teacher's ink. `boardWord` for the indicator: `blank`, `holding`, `Q3 · 2 of 3 · marks`. Until ticket 40 gives the classroom a group session, the demo student's session is the class's clock |
| `app/board/page.tsx`, `app/board/SmartBoard.tsx` | The projector's surface. Reads the classroom store and the session live (`useLiveSession`), draws `boardContent`: `Blank` (class and title, centred, dim), `Holding` (class and title in the header, "Group review · Standings" with a pulsing dot; ticket 42 replaces it with the final standings), `Slide` (label, `problem n of m`, expression and stem; 2–3 example cards with the letter, `n/m students` and the lines, red / blue only in the marked view; a read-only mirror of the teacher's working titled "Ms Okafor's working"). No button, no link, no live pad, no name, no difficulty |
| `app/teacher/board/BoardControls.tsx` (renamed from `Board.tsx`) | The teacher's side on the laptop, inside `TeacherChrome`: "Board controls" with the indicator; the problem strip (label, expression, stem, `problem n of m`); the "Your working" pad (`wc/stroke` · undo · clear, mirrored to frozen students and to the board); Previous · screens frozen / write with me · Show marks · End · Next. The examples are gone from this page. Idle: "No session projecting · Set up →" |
| `app/teacher/BoardIndicator.tsx` | "Board · blank / holding / Q2 · 1 of 2 · marks": the same `boardContent` rule, a pill with a small screen glyph; takes the session it is shown beside |
| `app/teacher/TeacherLive.tsx` | The indicator beside the assignment status line, on the batched session like the rest of the view |
| `app/teacher/WholeClassCard.tsx` | The card's link reads "Controls →" (still `/teacher/board`) |
| `lib/store.ts` | `useLiveSession()`: a read-only, unbatched view of the session for a surface that doesn't own it |
| `lib/split.ts` (+ test) | The board pane's `href` is `/board` |
| `app/page.tsx` | A third card, "Smartboard · The projector", `md:grid-cols-3`; the intro names the projector |
| `README.md` | The controls page and the smartboard described |

## How it connects

```
 /  home ── Student · iPad ──▶ /student         Teacher ──▶ /teacher         Smartboard ──▶ /board   (three cards; /split frames all three)

                        classroom store (localStorage + BroadcastChannel)            session store
                          assignment · pathway · wholeClass { status, slide, view, modes, ink }   stage · lines · ink …
                                     │                                                   │
                                     └──────────────┬────────────────────────────────────┘
                                                    ▼
                          lib/board.ts  boardContent(classroom, session)
                             currentSlide ─────────────────────────────▶ whole-class { problem, index, total, view, examples = boardExamples(refs, pid, session), teacherInk }
                             wholeClass.status === "ended" ───────────▶ blank
                             pathway has group ∧ stage ∈ { nextStage(pathway, group-done), report, peers, history } ▶ holding
                             otherwise ───────────────────────────────▶ blank { className, title }
                                                    │
              ┌─────────────────────────────────────┼──────────────────────────────────────┐
              ▼                                     ▼                                      ▼
 /board · SmartBoard (useLiveSession)     /teacher · TeacherLive                  /teacher/board · BoardControls
   blank    → class · title                  BoardIndicator(live) ──▶ "Board · …"     BoardIndicator(session) · problem strip
   holding  → "Group review · Standings"                                              pad ──▶ wc/stroke · wc/ink-undo · wc/ink-clear
   slide    → examples A/B/C · n/m students                                           prev · mode (wc/mode) · marks (wc/marks) · End (wc/end) · next (wc/next)
              marks iff view = marked                                                              │
              mirror of teacherInk (readOnly)                                                      ▼
   no button, no link, no live pad                       every tab: the board redraws, the student's FrozenScreen follows view · mode · teacherInk
```

## Verified by

vitest (215 tests): the board is blank with only the class and the fixture title before anything
exists; every skip target's kind (blank through group review, whole-class while projecting,
holding on the report skip); the created title; holding only when the pathway has a group stage
(three-stage on `waiting`, group-last on `report` and `peers`, not on `group-discuss`, not without
a group stage, not with a pending setup projected); the slide's problem, index, view, examples
with counts, ink following marks / stroke / next; blank after End; no student name in any state
and nothing but `kind`, `className`, `title` on the blank and holding boards; the split pane
hrefs. `tsc --noEmit`, `eslint`, `next build`. CDP, six tabs sharing storage (student, board,
live view, controls, home, split): three home cards, the third at `/board`; the board blank at
the start with the class and title and zero interactive elements; blank after the working,
individual-review and group-review skips with the live indicator reading "Board · blank";
holding after the report skip (placeholder, nothing interactive, indicator "holding"); the
whole-class skip waking the board with two examples, `n/7 students`, a mirror canvas, no marks,
no name, no difficulty, indicator "Board · Q2 · 1 of 2" on both teacher pages, the controls page
with no examples and all six controls; Show marks from the controls marking the board and the
student's frozen view (indicator "… · marks"), Hide marks clearing them; a stroke on the
controls' pad stored once in the classroom and drawn on both the student's mirror (0 → 362 ink
px) and the board's (0 → 77); the mode toggle changing the student's mode; Next → problem 2 on
the board and in the indicator, Previous → problem 1 marked; End → board blank, student released,
teacher back on the live view; `/split?panes=board` framing `/board`.
