# 315: The Mistakes tab during working splits into Where students are and Where students went wrong

## Files touched

| File | What it does |
| --- | --- |
| `lib/whereStudents.ts` | New. The left column as data, no React. `stepTime` (the one time formatter: "40 s" under a minute, "6 min" from one), `placeDetail` and `placeTone` (a pill's muted words and its tint), `classmatesEntered` (when each classmate came into their row, from their timeline on the stream's clock), `carryPlaces` (Sam's first-seen time and each row entry held between reads), `whereRows` (ticket 314's `placeRows` as `WhereRow`s of `WherePill`s in arrival order, the absent under Handed in), `emptyQuestionRuns` (the runs of empty question rows that may fold). |
| `lib/whereStudents.test.ts` | New, 11 tests: the formatter, details and tones, every row and all twenty at every 7 s of the stream, Jordan's pill, arrival order second by second, a row entry held through help, carried places, the fold runs. |
| `app/teacher/StageSplit.tsx` | New. The frame a stage fills: two equal columns under display-face headers of one size, `left`, `right`, and an `overlay` drawn over the left column below its header; `.upright-maths` on the whole. Tickets 318–320 give it their own left rows. |
| `app/teacher/WhereStudentsAre.tsx` | New. `useWhereRows` (the model read every tick, carried state replaced during render only on a change), `StudentPill` (avatar, name, detail, `StepBar`, time in a fixed slot, the arrival ring; `onPress` turns it into a button for ticket 316), `PlaceTable` (rows with fixed label cells, "nobody yet", and the fold measured before paint and written to `hidden`). |
| `app/teacher/TeacherMistakes.tsx` | `split` while the live set is on individual working: the stage pills join the eyebrow line; the problem list (now a `list` const) goes in `StageSplit`'s right column with the counts inside each card header, `DiagnosticChip` at its top left, no difficulty tag, and the accent ring on the card whose flyout is open; `PlaceTable` on the left; `DiagnosticOverlay` as the overlay. Otherwise unchanged. |
| `app/teacher/DiagnosticPush.tsx` | `DiagnosticSteps` split out (the step cards, selection, results and send, shared by both flyouts); `DiagnosticPush` keeps the side chip and flyout; new `DiagnosticChip` (the card header's button) and `DiagnosticOverlay` (the split's flyout: header with the whole question, the steps; Escape, a press outside and sending close it). |
| `app/teacher/diagnosticFlyout.ts` | `useOpenFlyout()`: which problem's flyout is open, for the split to draw it over the left column. |
| `app/globals.css` | `.upright-maths .katex .mathnormal, .mathit`: KaTeX's italic letters in its roman face on the split. `.arrive-ring`: the arrival glow as a 3 px ring for pills. |

## How it connects

```
 lib/place.ts (314)  classPlaces · classmateTimeline · placeRows · carrySince · rowKey
        │
        ▼
 lib/whereStudents.ts ◄315
   classmatesEntered(set, session, now) ──┐
   carryPlaces(prev, places, now, entered)├─▶ SeenPlace[] (since, entered)
   whereRows(seen, problems, roster, now) ─▶ WhereRow { label, sub, pills: WherePill[], absent }
   stepTime · placeDetail · placeTone · emptyQuestionRuns
        │
        ▼
 app/teacher/WhereStudentsAre.tsx ◄315
   useWhereRows(bundle, session, now) ─▶ PlaceTable { rows } ─▶ StudentPill (onPress? → ticket 316)
                                          └ fold: empty question runs ─▶ "Q3–Q10" when the column would not fit
        │ left
        ▼
 app/teacher/StageSplit.tsx ◄315   [ Where students are │ Where students went wrong ]
        ▲ right                     overlay over the left, below the headers
        │
 app/teacher/TeacherMistakes.tsx   split = live set && stage "working"
   eyebrow line + stage pills ─────────────────────────────────────────────▶ (not split: title row as before)
   list: problem cards ── header: DiagnosticChip │ Q │ question │ expand │ counts
                          ring when useOpenFlyout() === problem
        │
        ▼
 app/teacher/DiagnosticPush.tsx
   DiagnosticChip ──▶ diagnosticFlyout.ts setFlyoutOpen / useOpenFlyout ◄315
   DiagnosticOverlay ─▶ DiagnosticSteps ◄315 (shared) ◀── DiagnosticPush (side flyout, after working)
        │ send: dispatchClassroom("diagnostic/push")
        ▼
 DiagnosticFocus (the chain, whole width) ── done ──▶ back to the split
```
