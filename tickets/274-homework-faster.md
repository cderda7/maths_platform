# 274: The homework bank moves faster and the folder has no count

**What to build:** Ticket 256's homework sequence runs noticeably faster, spending its time on showing that each question changes into the same type with different numbers rather than holding the question for the student to read. The Homework folder shows no number.

**Blocked by:** none.

**Status:** open

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14): "post student report HW creation doesn't need to be quite so slow. don't need the student to like look at the problem & think about how to solve it; would rather it moves faster while demonstrating it's the same type of question w dif numbers. also don't need HW to be 0. can have it just not have a number. there will be other problems in addition to these." Today each problem takes about 5.6 s (grow, hold the original, change, hold the similar, fly), about 30 s for Sam's five.

## Solution

- `lib/homework.ts` timings: cut the holds on the original and similar question to what it takes to see the change; the number roll stays the visible centre of each problem. Aim for about 2 s per problem (Sam's five in about 10 s plus the lead) and tune by watching screenshots or a recording frame by frame; the change must still read (numbers visibly move while the shape stays).
- The folder: no count anywhere (not "0", not a total). Its tiles still land in it.
- Reduced motion stays side by side, on the same shorter clock.

## Acceptance

- [ ] Unit: the new per-tile timings; no count exposed
- [ ] Click-through on the iPad at 1280×800 and 1440×900: Sam's sequence finishes within the new budget; each problem still shows original then similar with the numbers changing in place; no number on the folder at any frame, with nothing wrong (strong run) too; reduced motion; reload mid-sequence; nothing moves or clips
- [ ] vitest, eslint, tsc, next build, sweep:hint-boxes
