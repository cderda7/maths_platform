# 43 · The individual view, and a tidy of the teacher's screens

Routes: `/teacher` (title line, header chips, name links), `/teacher/report?student=<id>` (the
individual view; plain `/teacher/report` is the demo student), `/teacher/groups` (headers, no
suggested section). The Report tab is gone from the teacher nav.

## Files touched

| File | What it does |
|---|---|
| `lib/commentary.ts` (+ test) | `commentaryFor(student, session)` → `{ ideas, clarification }`. A classmate's ideas are the fixture's `notes` and the clarification their scripted line; the demo student's ideas are the teacher-facing `note` on every wrong line from `feedbackFor(session)`, one idea per distinct note with the problems merged, and the clarification the reflection once `reportSent` |
| `data/classmates.ts` | `Classmate.clarification?` (what the student wrote back), authored for every classmate with notes; `light(...)` takes it after the attempts override |
| `app/teacher/report/page.tsx` | Server page: reads `?student=` and hands `student` to the screen (the convention: clients never read the URL) |
| `app/teacher/report/TeacherReport.tsx` | The individual view for any student: skills drill from `classmateEvidence` or `sessionEvidence`; the commentary bubble (`data-commentary`, standout-soft, ideas as buttons that `restrictTo` the drill via `leavesBehind`); the clarification box (`data-clarification`, paper with an accent border); the demo student's report facts and group notes beneath the skills, nothing of the sort for a classmate |
| `app/teacher/TeacherLive.tsx` | The name is a `Link` to the individual view (`data-student-link`); the notes bubble, `commentClick` and the `notes` row field are gone; the title line is a grid matching the body's columns so `ForceSubmit` sits flush with the table's right edge; each header chip carries an absolutely positioned hover button (`data-expand`) that calls `headerDouble`, labelled by `headerNext` (expand / close); the Class card is drawn only when `groupStartShown` |
| `app/teacher/ForceSubmit.tsx` | Now an inline control, no card: the button, the confirm row, the countdown row |
| `app/teacher/GroupStart.tsx` | `groupStartShown(classroom, now)` exported so the card can hide; the gate is the card's body (no top rule) |
| `app/teacher/TeacherChrome.tsx` | `TEACHER_TABS` without Report |
| `app/teacher/groups/TeacherGroups.tsx` | Header is the count alone (the colour name stays for screen readers); the suggested section behind `SHOW_SUGGESTED = false` |
| `components/HierarchyDrill.tsx` | `Node` renders lowercase unless `keepCase` (categories in the browse drill) |

## How it connects

```
 /teacher · TeacherLive
   title line  ┌──────────────────────────────┐  ┌───────┐
               │ Class View      [force submit]│  │ (320) │   grid-cols-[1fr_320px], same as the body
               └──────────────────────────────┘  └───────┘
   header chip  ALGEBRA ──hover──▶ [expand] (inset-0 over the chip) ──click──▶ headerDouble(c): groups → skills → close
   row          [SO] Sam Okonkwo ──▶ Link /teacher/report?student=sam          (no bubble, no notes under the name)

 /teacher/report?student=<id>  page.tsx (server) ──▶ TeacherReport({ student })
   who = CLASSMATE_MAP[student] ?? DEMO_STUDENT
   evidence = classmateEvidence(who) | sessionEvidence(session) ──▶ hierarchyFor ──▶ HierarchyDrill (lowercase groups and skills)
   lib/commentary.ts  commentaryFor(who.id, session)
     classmate:  ideas = notes · clarification = fixture line
     demo:       ideas = distinct verdict.note over wrong lines (feedbackFor) · clarification = reflection once sent
   ┌ light-blue bubble ─────────────┐   click an idea ──▶ restrictTo(result, leavesBehind(idea.problems, lines))
   │ divided by a, not 2a       Q4  │
   └────────────────────────────────┘
   ┌ white, purple border ──────────┐
   │ "The formula I remembered…"    │
   └────────────────────────────────┘

 /teacher/groups · TeacherGroups: five columns, coloured top edge + count · SHOW_SUGGESTED=false hides reviewGroups(session)
```

## Verified by

vitest (262 tests): a classmate's ideas and clarification, nothing for one without notes or an
unknown id, the demo student's ideas one per distinct note with problems attached, the
clarification only once the report is sent. `tsc --noEmit`, `eslint`, `next build`. CDP,
production build: nav reads Class · Mistakes · Groups; no `[data-notes-bubble]`; the name links
to `/teacher/report?student=tomas`; the force button's right edge equals the table card's right
edge to the pixel and sits on the title line; the hover button is `display: block` on hover with
the chip's exact width and height, and cycles groups → expanded → closed with the label reading
expand / expand / close; group and skill labels compute `text-transform: lowercase`, categories
`none`; the confirm row and the countdown row draw inline at the working stage; Tomas's view
shows two ideas with Q4 and Q7 and his words in the purple box; Sam's shows five ideas and
"Not sent yet"; Zara's, an unknown id and the plain route resolve; the groups page header is
the count alone and no `[data-suggested]` exists; no horizontal overflow.
