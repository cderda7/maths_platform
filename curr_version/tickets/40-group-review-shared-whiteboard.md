# 40: Group review on one shared whiteboard

**What to build:** A group works the union of its members' mistakes, one problem at a time, on a single shared whiteboard that every member sees live on their own iPad. One member holds the pen per problem, drawn by a shuffle that reshuffles when it runs out; the header says "you have the pen" or "Jordan has the pen". The pen-holder rewrites the problem even if they had it right. While reworking, the board is all anyone sees. Only the pen-holder presses Check; a wrong check shows the transcription annotated up to the first mistake with the rest hidden as a count, on the same board. Any member can press "we're stuck", which reveals marks on everyone's handed-in and reworked versions up to the first mistake. Peers' turns draw as synthetic ink in the demo.

**Blocked by:** 36 (groups), 39 (the class starts together).

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

Today's group review is a list of discussion prompts with "Talked" toggles; nobody does any maths, and four students reworking the same problem in parallel would need waiting and retries at every step. One shared board removes the parallel work and the waiting with it, and forces the confident student to explain and the unsure one to ask.

## Solution

A group session in the classroom state: the union, the pen order, the current problem, the shared strokes, the check result. Strokes from the pen-holder's iPad reach every member's board. Check transcribes the board and judges every known line, the final line deciding. The wrong-check annotation and "we're stuck" both follow the first-mistake rule. The demo scripts Sam's group: Sam holds the pen on Q1 (right first time) and Q7 (wrong, then right); Zara on Q2 and Q10; Jordan on Q3 (wrong, the group presses "we're stuck", then right); Liam on Q9.

## Acceptance

- [ ] The union of the group's mistakes, in problem order; the pen shuffle; both header labels
- [ ] The pen-holder's strokes appear on every member's board; watchers cannot write
- [ ] Check for the pen-holder only; a wrong check shows the transcription marked to the first mistake, rest as a count, board kept
- [ ] "We're stuck" for any member marks everyone's earlier versions to the first mistake
- [ ] Peers' turns as scripted synthetic ink; Sam's scripted turns and the Q3 rescue
- [ ] Nothing written on the shared board is marked as a version of anyone's work
- [ ] Unit tests for the union, the shuffle, the check and the first-mistake cut; two-tab browser check; architecture note and root docs; the old quick-pass and discussion screens removed
