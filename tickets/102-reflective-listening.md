# 102: The concerns chat reflects on every answer before asking the next question

**What to build:** After each of the student's answers in the warm-up concerns chat the tutor's next turn opens with a reflective-listening bubble before the next question: "Gotcha. It sounds like…" after the first answer, "Agreed: that's a tricky skill." after the second, "A lot of students share that struggle." after the third and every later one. The closing turn is the reflection on the last answer, then "Thank you for those insights. Let's start with ___." ("that insight" when the student gave exactly one answer; no skill named when none was ticked). Fixed lines for the demo; the live restatement of the student's own words is a future feature.

**Blocked by:** 74 (the chat's rhythm), 84 (the later questions).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), on the concerns chat: "this chat doesn't feel very responsive for a student that's low confidence. i want to incorporate an empathetic model. that framework involves reflective listening. i want that to happen after each student response -- a restatement in their own words. for the demo, this will just be fixed. the first message will say 'Gotcha. It sounds like...', the second message 'Agreed: that's a tricky skill.', the third message 'A lot of students share that struggle.' Final message: 'Thank you for those insights. Let's start with ___.' (or 'Thank you for that insight. Let's start with ___.' if only one skill identified as 'not confident'). add to F_F making this dynamic; i'll add API keys later."

Grilled and settled: the first line stays literally "Gotcha. It sounds like…" as the demo's sign that a live restatement plugs in there; the third line repeats for a fourth answer and beyond; the last answer gets its reflection and then the thanks; the reflection is the first bubble of the tutor's next turn, so the box stays off until the question lands; singular "that insight" whenever there was exactly one answer, the no-skills case included.

Before this the tutor went straight from one answer to the next question ("asdf" → "How about with zero-finding?"), which reads as a form, not a conversation.

## Solution

- `lib/warmup.ts`: `REFLECTIONS` (the three fixed lines) and `reflection(i)` (the line after answer `i`, the last line for every later answer). `concernTurns` gives each later turn two bubbles, `[reflection(i), howAbout(skill)]`. `closingLine` becomes `closingTurn(first, answers)`: `[reflection(answers - 1), "Thank you for that insight/those insights. Let's start[ with skill]."]`. `concernTranscript` and `concernsAnswered` are unchanged and pick the reflections up through `concernTurns`.
- `app/student/screens/WarmupChatScreen.tsx`: the closing turn is `closingTurn(...)` with the answer count; its two bubbles play through `turnSteps` like any other turn (beat, dots, reflection, beat, dots, thanks), then the pad after `CHAT_CLOSE_MS`.
- Nothing stored, nothing on the teacher side: tutor lines stay derived.

## Acceptance

- [x] Three skills: after "I mix up the signs" the dots, then "Gotcha. It sounds like…" alone with the box still off, then "How about with **fractions**?" and the box on; after the second answer "Agreed: that's a tricky skill." then the null factor law question; after the third "A lot of students share that struggle." then "Thank you for those insights. Let's start with fractions." and the pad
- [x] One skill: "Gotcha. It sounds like…" then "Thank you for that insight. Let's start with factorising."
- [x] No skill ticked: the open question, then "Gotcha. It sounds like…" and "Thank you for that insight. Let's start."
- [x] Five skills: the reflections run Gotcha, Agreed, A lot, A lot
- [x] Only the student's lines are stored
- [x] vitest (339), eslint, tsc, `next build`, headless click-through (`reflect.mjs`); architecture note, root docs, decision log, future features
