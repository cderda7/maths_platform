# 87: The factorising warm-up's second hint no longer lists the pairs to try

**What to build:** The hint given after the product line ("Once you have a pair that multiplies to 12, check it adds to 7 as well. The pairs to try: 1 and 12, 2 and 6, 3 and 4.") loses its second sentence. It now names the check and leaves the pairs to the student.

**Blocked by:** 85 (the monic hints).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11): "The pairs to try: 1 and 12, 2 and 6, 3 and 4. delete this part of the hint please". Listing every factor pair does the enumerating for the student, which is the prescriptive hint the warm-up is meant to avoid.

## Solution

- `data/practice.ts`: the sentence is removed from the `w-monic` hint at position 1. Its linked words ("pair" → 3 and 4, "12" → 12) still resolve in the remaining sentence and in the student's line.

## Acceptance

- [x] The hint reads "Once you have a pair that multiplies to 12, check it adds to 7 as well." and nothing more
- [x] vitest (the fixture test checks every phrase is still found in its hint), eslint; architecture note, root docs
