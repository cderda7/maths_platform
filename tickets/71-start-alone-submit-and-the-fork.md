# 71: Start alone, Submit, and the fork after a not-confident answer

**What to build:** The start screen has one button, START. The confidence screen's button reads "Submit" whatever the answer, because the answer decides where the student goes next. "Confident" plus Submit opens Q1. Either not-confident answer ("not confident", "not confident with…") plus Submit keeps the student on the confidence screen: the answer is recorded, the answer list locks, and two buttons appear just above the spot Submit occupied, which is now empty: "Warm up" (accent) and "Start the set" (secondary). "Warm up" opens the concerns chat; "Start the set" opens Q1. The state of "answered, choosing" lives in the session, so a reload and the teacher's mirror see it.

**Blocked by:** None (can start immediately).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The warm-up was offered on the start screen, before the student had said anything about how they feel, and the confidence screen's button then told them where they were going ("Warm up" / "Start Q1"). A student who says they are not confident is the one who should be offered the warm-up, and the offer should come the moment they have said so.

## Solution

The overview loses WARM UP; START moves the session to the confidence screen. The reducer's confidence answer sends "confident" to `working` and leaves the other two on `confidence` with the answer stored. Two new actions, warm-up accept and decline, move on to `warmup-chat` or `working` and record `practice` as taken or declined. The old overview accept/decline actions go. The confidence screen renders the two buttons once the session holds a not-confident answer, and neither of them sits where Submit was: the student has to move to reach either.

## Acceptance

- [x] Start screen: only START, accent, bottom-right; it opens the confidence screen
- [x] Confidence screen: the button reads "Submit" for all three answers; disabled until an answer is picked
- [x] "confident" + Submit → Q1 (`working`)
- [x] "not confident" + Submit and "not confident with…" + Submit → still on the confidence screen, the answer list locked, Submit gone, "Warm up" and "Start the set" shown just above where Submit was
- [x] "Warm up" → the concerns chat with the ticked skills as its seed; "Start the set" → Q1
- [x] Session holds the answer while the choice is open; `practice` is null until the choice, then taken/declined
- [x] Demo strip and `?stage=` fixtures unchanged in where they land ("warm-up" → the chat with three skills ticked)
- [x] vitest, eslint, tsc, `next build`, a headless-Chrome click-through; architecture note and root docs
