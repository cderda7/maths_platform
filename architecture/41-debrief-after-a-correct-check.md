# 41 · The debrief after a correct check

Route: `/student` (stage `group`, after the group's rework checks correct). `/teacher/report`
shows the notes.

## Files touched

| File | What it does |
|---|---|
| `lib/debrief.ts` (+ test) | `debriefPrompt(problem, own)`: "own" when neither the handed-in nor the reworked version passes the same check the group's rework passed, else "peers"; `PROMPT_TEXT`; `groupRework(run, problem)` (the correct attempt); `markedVersions(problem, own, group)` (full red and blue marks on the student's versions, blue standouts on the group's rework, via `lineMarks`); `HOLD_MS` (20 s), `holdProgress`, `holdOver`; `pendingDebrief(run, notes)` (the latest resolved problem the student has not pressed Next on); `PEER_DEBRIEF_MS` (26 s: how long a peer who holds the next pen takes before their first stroke) |
| `lib/session.ts` | `debrief: Record<problem, DebriefNote>` (prompt fixed on first write, text, `markedAt`, `done`); `debrief/note`, `debrief/marks` (only with a non-empty note, once), `debrief/done` (only after the marks) |
| `lib/groupReview.ts`, `lib/classroom.ts`, `lib/classroom-store.ts` | `resolvedAt` on the run, set by `group/check { at }` (stamped by the store; a scripted check uses the turn clock), cleared by `group/next` |
| `app/student/screens/GroupDebrief.tsx` | The debrief: label, expression, "the group got it · Zara wrote it"; three columns (Handed in · Reworked · Group's rework) unmarked with the prompt and a note box → "show me the marks" (enabled once written) → the same three marked, a ring filling round Next over twenty seconds, the note still editable → Next: `debrief/done`, and `group/next` if the group is still on this problem (Finish on the last) |
| `app/student/screens/GroupBoardScreen.tsx` | Shows the debrief for `pendingDebrief` instead of the board; the old "Correct · next" banner removed |
| `app/student/StudentApp.tsx` | When the current problem is resolved and the next pen is a peer's (or it was the last problem), the group moves on `PEER_DEBRIEF_MS` after the check: the new holder's first stroke |
| `lib/report.ts`, `app/teacher/report/TeacherReport.tsx` | `groupNotes` on the report facts; "In group review" on the teacher's report lists each note with which prompt it answered. Nowhere on the student side |

## How it connects

```
 group/check correct ──▶ run.resolved ∋ problem · run.resolvedAt = at
 GroupBoardScreen: pendingDebrief(run, session.debrief) ──▶ GroupDebrief(problem)
   phase note:   markedVersions(…) drawn unmarked · prompt = debrief[problem].prompt ?? debriefPrompt(problem, own)
                 textarea ──▶ debrief/note { problem, prompt, text }        "show me the marks" (text non-empty) ──▶ debrief/marks { at }
   phase marked: the same, marks on · ring = holdProgress(markedAt, now) · Next enabled when holdOver
                 Next ──▶ debrief/done · (run still on problem ? group/next : nothing: rejoin the live board)
 StudentApp: resolvedAt ∧ next pen ≠ sam ∧ now ≥ resolvedAt + PEER_DEBRIEF_MS ──▶ group/next   (the peer's first stroke)
 TeacherReport ◀── reportFacts(session).groupNotes
```

## Verified by

vitest (242 tests): the prompt rule; the marked view (Sam's Q3 handed-in cut red at the slip, the
group's rework with the "expanded first" standout); the hold; the session's note, marks and done
ordering with the prompt fixed on first write; the pending debrief through a check, a move-on
and a done. `tsc --noEmit`, `eslint`, `next build`. CDP on `/student`: Q1 written and checked →
the debrief with three unmarked columns and "describe the mistake your peers most likely made"
(Sam's rework was functional), "show me the marks" disabled until a note is written → marks on,
the handed-in factorising line red, the group's rework outlined blue → Next disabled at 10 s
with the ring half full, enabled at 21 s → the note edited after the marks → Next moves the group
to Q2 (Zara) and stores the note → Zara's Q2 checks correct → Sam's Q2 debrief opens → the group
moves on to Q3 on its own 26 s later while Sam is still in his Q2 debrief → the teacher's report
lists "Q1 · their peers' likely mistake" with the note.
