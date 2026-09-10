# 39 · The whole class enters group review together

Route: `/student` (stage `class-wait`), the Class card on `/teacher`. Demo: the "class wait" skip
(Sam just arrived, the count climbing) and "group review" (everyone in).

## Files touched

| File | What it does |
|---|---|
| `lib/readiness.ts` (+ test) | The gate as a pure rule: `CLASS_SIZE` (20), `ARRIVAL_OFFSETS_MS` (each classmate's scripted arrival, 1.5–22 s after the demo student's), `classReadiness(classroom, now)` → `{ handedIn, total, started, reason }`: started when everyone is in, or when a `group-start` advance's grace has passed |
| `lib/classroom.ts` | `arrivals?: Record<student, ms>` on the classroom; `class/arrive` (idempotent per student); `AdvanceKind` gains `group-start` (same one-minute grace as the other advances) |
| `lib/pathway.ts` | Group review is entered through `class-wait`, whatever precedes it (hand-in when group is first, rework when individual is) |
| `data/types.ts`, `app/student/page.tsx`, `lib/session.ts` | The `class-wait` stage; `group/start` (class-wait → group-pass); a `group-start` advance takes a waiting student in and hands a correcting one in as it stands (the guard is bypassed, the post-rework notice shown); a student still working is left alone; `sessionAt("class-wait")` is the reworked run |
| `app/student/screens/ClassWaitScreen.tsx` | "waiting for the class · 14 of 20 handed in" with a thin bar, live on the shared clock |
| `app/student/StudentApp.tsx` | Records the arrival once on entering `class-wait`, dispatches `group/start` when the readiness rule says started; the countdown pill reads "Group review starts in" for a `group-start` advance |
| `app/teacher/GroupStart.tsx`, `app/teacher/ForceSubmit.tsx` | On the Class card, while the pathway has a group stage: "Group review · n of 20 handed in" and "start group review now" → `advance/start group-start`, with the countdown and Cancel while pending, "started" (or "started by you") after |
| `lib/groups.ts` | The teacher's group view reads a waiting student as "Waiting for the class" |
| `lib/demo.ts` (+ test) | Skip targets gain "class wait"; the later jumps mark Sam as arrived long enough ago that everyone is in |
| `lib/pathway.test.ts`, `lib/session.test.ts` | Expectations moved from direct entry to the gate; the eight-pathway walk goes through `group/start` |

## How it connects

```
 rework/done (or hand-in when group is first) ──▶ nextStage ──▶ stage class-wait
 StudentApp effect ──▶ class/arrive { sam, now } (once) ──▶ classroom.arrivals
 classReadiness(classroom, now):
     handedIn = sam ∈ arrivals ? 1 + |{ classmate : now ≥ arrivals.sam + offset }| : 0
     started  = handedIn ≥ 20  ∨  (advance.kind = group-start ∧ now ≥ advance.deadline)
 ClassWaitScreen ◀── handedIn / total          GroupStart (teacher) ◀── the same, + "start group review now" ──▶ advance/start group-start
 StudentApp effect: started ∧ stage = class-wait ──▶ group/start ──▶ group-pass
 advance/apply group-start (grace over): class-wait → group-pass · feedback → group-pass, corrections handed in as they stand
```

## Verified by

vitest (218 tests): the count from nobody to everyone along the scripted offsets, the arrival
recorded once, the teacher's start opening the gate after its grace (and a force-submit advance
not), the session's gate transitions, the eight pathways through the gate, the skip fixtures.
`tsc --noEmit`, `eslint`, `next build`. CDP, two tabs: hand in corrections from individual review
→ "waiting for the class · 1 of 20 handed in" → 6 of 20 six seconds later → the teacher's card
reads 9 of 20 with "start group review now" → group review opens on its own about seventeen
seconds after arrival; skip to class wait → the teacher's start shows "starting · 1:00" with
Cancel and the student's pill "Group review starts in 1:00" → with the grace over the waiting
student is in group review; a student still correcting when the grace ends is in group review
with the post-rework notice.
