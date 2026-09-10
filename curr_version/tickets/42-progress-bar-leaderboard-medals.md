# 42: Progress bar, leaderboard and medals

**What to build:** A group's progress is the number of its members' original mistakes now resolved over the total, so it jumps by the count of members who had a problem wrong when the group's rework checks correct. The smartboard shows five rows, each with four names, its colour, a large bar and a percentage, reordered with animation as bars move, ties by who got there first. A group at 100% locks its position: gold for the first, silver, bronze, nothing for the rest. Final standings hold until the teacher advances. The other four groups run a scripted ten-minute timeline, two finishing before Sam's group and two after. The teacher's live view shows per-group detail with each bar and who has the pen, never the leaderboard. The iPad shows only the student's own group's bar.

**Blocked by:** 38 (the board), 40 (the group session that produces progress).

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

The race is the point of the board during group review, and it has to be legible from the back of the room: a bar at 75% must look different from one at 70%.

## Solution

Progress derived from the group session and the fixture's wrong lists. Rows sized for a projector. Locking and medals as state on the group session so a later group cannot leapfrog. The timeline is a scripted fixture driven from the moment group review starts.

## Acceptance

- [ ] Progress rule with the exact jumps (a union of three problems with 2, 2 and 1 members wrong jumps 40%, 40%, 20%)
- [ ] Board rows: four names, colour, large bar, percentage; animated reorder; ties by arrival
- [ ] 100% locks position; gold, silver, bronze; nothing for fourth and fifth; standings hold until the teacher advances
- [ ] Scripted timeline for the other four groups, two ahead of Sam's group and two behind
- [ ] Teacher live view: per-group bar and pen-holder; iPad: own group's bar only
- [ ] Unit tests for progress, locking and ties; two-tab browser check; architecture note and root docs
