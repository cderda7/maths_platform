# 250: An absent student is greyed out, leaves the counts and leaves their group for the day

**What to build:** The teacher can mark a student absent for an assignment from the Class View roster. An absent student is greyed out everywhere on that assignment's teacher screens, is taken out of every class count (a fraction reads x/19 with one absent), and is out of their seating group for that assignment's group review. On Problem Set 6, Chloe (today "missing", with no work) becomes the demo's absent student.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), on real lessons: "we need to add a 'grey out' setting to represent an absent student." Seating groups are fixed fours; an absence breaks a group, and today a student who is not in the room counts against the class as not handed in. Asked what happens to the counts, the user chose "leave the denominator": "this is great bc now Chloe, who doesn't do anything with the assignment, will be that absent student."

Settled in the same conversation: in group review, a problem a member **did not attempt** does not count towards the group's union of wrong problems; a problem they started and left **incomplete** does.

## Solution

- Classroom state gains per-assignment absences (student ids). A toggle on each Class View roster row marks and unmarks absent; the row greys out (name, avatar, every cell) and stays in its place.
- Every count on that assignment's teacher screens (Class View, Mistakes, diagnostics' n/20 answered, class review's "n/m students", the Classroom card) leaves absent students out of numerator and denominator.
- Group review: an absent student leaves their seating group for this assignment only; the class's default groups are untouched. A group of four with one absent is a group of three.
- Chloe is absent on Problem Set 6 in the story data (`data/story.ts`, regenerate `specs/class-story.md`), replacing "missing". Her status cells read absent, not *not seen*.
- Check `lib/group.ts`: the union of wrong problems must skip not-attempted problems and include incomplete ones; fix and test if it doesn't.

## Acceptance

- [x] Unit: absences in the classroom reducer (mark, unmark, per assignment, reset); counts with and without an absent student; a group with an absent member; union skips not-attempted, includes incomplete
- [x] Click-through at 1280×800 and 1440×900: mark and unmark a student on PS6 Class View; the row greys without moving anything; every count on the set's tabs reads /19 and back to /20; Chloe starts absent on PS6 and present on PS1–PS5; her group review group is three; no sideways scroll
- [x] vitest, eslint, tsc, next build, check:laptop
