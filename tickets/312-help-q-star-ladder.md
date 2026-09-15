# 312: I need help on a question runs Q* worked, Q** finished, then back to Q

**What to build:** during the set, "I need help" (and the practice offer after a repeated slip) runs three steps on the student's iPad: Q*, a whole question like Q fully worked; Q**, a second one with the named skill's lines blank for the student to write; then back on Q itself. Video comes off the help menu everywhere.

**Blocked by:** 310 (the questions), 311 (the line check), 314 (the teacher's place model reads this ticket's session state).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Today "I need help" on a question opens a skill practice (`HelpPicker` → `PracticeOverlay` → `PracticePad`): an isolated problem on the named skill, attempted cold, with a flat help menu (hint, worked example, video, chat), and a follow-up that opens only after the worked example has been seen. No student is guaranteed to see the method modelled, and the isolated skill problem leaves the jump back to the full question to the student.

The user (2026-09-15) set the new flow: Q → Q* (a whole different question, worked) → Q** (another, the student finishes it) → back to Q. They also said:

- Video comes off the supports: "assumes student has headphones — unlikely in practice".
- A wrong line in Q** is marked; the student opens chat if they want it. The tutor never opens it on its own.
- The practice offer after a repeated slip ("Two minutes on monic?", `lib/escalation.ts`) opens the same three steps.
- Help is never gated on having written something first. A student can ask before writing anything.
- "I need help" is still there for students who said they were confident.

## Acceptance

- [x] On the working screen, "I need help" → the picker (which skill is getting in the way) → **Q\***: Q*'s whole question (stem and expression, `ProblemQuestion`) and its worked example, step by step as the worked example plays today, with chat beside it (a tap on a line asks about that line; the tutor answers about Q*, never Q)
- [x] Then **Q\*\***: Q**'s whole question, its given lines shown, the named skill's lines blank (ticket 310's rule). The student writes each blank on the pad. Each line is checked (ticket 311): right moves on, wrong is marked red in place with its misconception chip where known, and nothing else happens. After two wrong lines on the same blank, that blank fills in and the student carries on
- [x] Then **back on Q**, with "see the example again" (reopens Q*'s worked example) beside hint and chat
- [x] The help menu everywhere (warm-up, practice, back on Q) has no video option
- [x] Chat opens only when the student presses it, at every step
- [x] "Back to Qn" is there at every step and returns to Q with the student's own lines untouched
- [x] The repeated-slip practice offer opens the same three steps, on the skill the slip was on
- [x] The session records, per question, that practice was taken, on which skill, how far the student got (Q*, Q**, back on Q) and when each step started; a reload lands on the same step. Ticket 314's place model reads it: Sam's place on the teacher's laptop shows the step
- [x] Nothing written in Q* or Q** is marked on the set; the set score rule (`lib/setScore.ts`, right first time) is unchanged
- [x] The hint-box sweep covers every Q** hint (`npm run sweep:hint-boxes` against a production build, per project CLAUDE.md): no lit box covers a neighbour, nothing moves
- [x] No difficulty tags on any student screen
- [x] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes; a click-through at 1280×800 and 1440×900 on Sam's iPad: the full route from I need help on Q2 through a wrong line marked and corrected, back to Q2, plus Back to Q2 from each step and a reload on each step; nothing scrolls sideways, every KaTeX expression on one line
- [x] Ticket docs: `architecture/312.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES for anything deferred

## Notes

- Reproduce today's flow in the browser before changing it.
- The warm-up keeps today's behaviour in this ticket (ticket 313 changes it), but loses video.

## Solution

- **The steps in the session** (`lib/session.ts`). `help/request` and `prompt/accept` on a question with Q* and Q** open `overlay` (the skill) with `ladder: { problem, step: "worked" }` and a fresh `overlayRun` whose worked example is playing; `ladder/next` (Q* seen in full) moves to `"completion"`; `overlay/done` ("Back to Qn", from either step) closes it; `ladder/again` ("see the example again") reopens Q* as `"again"`. Each accepted practice records `steps: { worked, completion?, back? }`, when each step began (once, the first time). The actions carry `at`; the screens pass `Date.now()`. The session is stored as before, so a reload lands on the same step; `hydrateSession` fills `ladder` and `questionRun` for an older snapshot. A question without Q* and Q** (none on Problem Set 6) still opens the older isolated practice (`PracticeOverlay`). The repeated-slip offer on a question with Q* and Q** is on the skill of the slip itself; elsewhere still the most fundamental slipped on.
- **Q\*\*, line by line** (`lib/ladder.ts`, pure). `ladderFor(problem, leaf)` gives Q*, Q** and its blanks (ticket 310's `blankSteps`). `completionState(steps, blanks, lines)` walks the lines the pad has read against the blank being written: a right line fills the blank and moves on, a wrong line stays marked in place, two wrong lines fill the blank in; an unreadable line counts for neither. Only the given lines up to the blank being written, and that blank, are on screen; a later line shows once the blanks before it are done. Derived from the lines alone, so undo, a reload and every tab agree. Every check result goes through `markLine` (the one place `checkStep` becomes a mark) and every consequence through `MARK_RULES`; the screen styles marks from one table (`MARK_LOOK`), so a further result (say "right, written differently", shown with the step's own form) is one more kind in each. Since ticket 325 (on main during this ticket) the check already counts numbers written another way as right (0.5 for ½); nothing here changed for it. `completionWorking` is the working the hint picker reads (every step before the blank). `LADDER_SLIPS` and `completionScript` write the demo's wrong line through ticket 311's `padScript`: on Q2**'s factors, `(2x + 3)(x - 5) = 0`, the right numbers with their signs in the wrong brackets, Sam's own non-monic slip (`data/story.ts`; his Problem Set 6 Q2 line), marked "signs swapped in the pair".
- **Back on Q** (`data/questionHelp.ts`, `lib/ladder.ts` `questionPractice`). Every Problem Set 6 question gains a hint per point of its own working and the chat's ways in, written from its Q**'s with Q's numbers. `question/hint` picks by the set's own lines into `questionRun`, which also holds the chat on the question; nothing touches `lines`.
- **Screens.** `app/student/screens/HelpLadder.tsx` (new), over the working screen: step 1 is Q*'s whole question on the left, its worked example step by step in the middle and the chat beside it ("Question about a step?", silent until the student writes), then "Your turn →"; step 2 is Q**'s whole question with its hints and "I need help" (hint, see the example again, chat) on the left, the pad in the middle and the Working column on the right (given lines, each blank's lines marked right with a green edge or red with the misconception chip, "Couldn't read this line", "Filled in for you", the dashed slot being written, "That's every line"). A three-step line names where the student is (1 Example › 2 Your turn › 3 Q2); "Back to Q2 →" is at every step, Escape the same. `WorkingScreen` back on a question after practice on it: "see the example again", "hint" and "chat" pills above "I need help" (the picker, unchanged), the hint cards under the question with their words lighting the question and the read lines, the chat under the read lines. `PromptModal` says what Yes opens. `components/HelpMenu.tsx` (new) holds the menu, the stall notice and the card close, out of `PracticePad`, with no video anywhere; `components/HintCards.tsx` (new) is the pad's hint cards and lit-word state for Q** and the question.
- **No question said twice.** The worked example card (`components/PracticeCard.tsx`, `question={false}`) drops its stem and expression wherever the column beside it already shows the question: Q*, Q* opened again from back on the question, and the warm-up's worked example in place of the pad. The skill chip stays at the card's top right and the working starts under it with no rule above the first line. "see the example again" on Q** keeps Q*'s question in the card only when Q*'s working does not open on its own equation (Q2*'s does, so its card is the working alone); the warm-up follow-up's small example card in the left column is unchanged.
- **The chat** (`lib/helpChat.ts`, `app/api/help-chat/route.ts`, `components/HelpChat.tsx`). The pad sends the skill; `findPractice(id, leaf)` finds Q*, Q** and the set question too, and `chatOn(id)` tells the brief which it is: on Q* and Q** the tutor talks about that question only, never the set's; on the set question it never says whether a line is right.
- **The teacher's place** (`lib/place.ts` `sessionPlace`). Sam on Q* is practice step 1, on Q** step 2, back on the question step 3, each `since` the session's recorded time; the example opened again is a look (still step 3). Ticket 315's Where students are shows it.
- **Hint boxes** (`lib/hint.ts`). A comma right after a lit fragment is typeset flush against it, so that side of the box is tight ("b = −5," lit on Q4 back on the question covered the comma by 2.3 px). `scripts/hint-box-sweep.mjs` sweeps every Q** for every skill its picker offers (each blank written in turn, the demo's slip included) and every question back on itself at each point of its working (`scripts/question-working.json`, held to the data by a test); `HINT_SWEEP_ONLY` runs one half while working.

## Verification

- Vitest 2086 (lib/ladder.test.ts 24: Q*, Q** and blanks for every question and picker skill, marks and rules, Q** line by line, every Q** completing from its own lines, the demo slip marked then corrected, the session's steps and times, Back from each step with the set's lines untouched, a reload, back-on-question hints and chat, the offer on the slip's skill, teacher advances, the chat's lookups, brief and request; Sam's steps in lib/place.test.ts; the Q hints under every hint test in lib/pairs.test.ts), eslint, tsc, next build; check:laptop 76; sweep:hint-boxes 454/454 (warm-ups, every Q** for every picker skill, every question back on itself; the questions half 191/191 again after rebasing onto tickets 316, 325, 326, 327, 328, 329 and 330); click-through click312.mjs 240/240 at 1280x800 and 1440x900 against a production build with Sam's iPad tab and the teacher tab (I need help on Q2 through the picker to Q*, a reload on Q*, Q** showing only the given line and first blank, a reload on Q**, the help menu hint/example/chat, three blanks right, Sam's slip marked signs swapped in the pair with no chat opened and the null factor law line still hidden, corrected, back on Q2 with his line untouched and the steps recorded, a reload back on Q2, hint and chat on Q2, see the example again with every step and a reload on it, Back to Q2 from Q* and from Q**, the repeated-slip offer on non-monic opening Q*, the warm-up menu without video, the example card carrying no stem or expression of its own on Q*, the example again, Q**'s look at it and the warm-up's worked example, the teacher's Where students are showing Sam at practice step 1, 2 and back on Q2 step 3 with times, no sideways scroll, every KaTeX on one line, no difficulty tag, screenshots checked).

## Judgement calls

- **On Q\*\*, a line after a blank is on screen only once that blank is written right or filled in.** Q2**'s null factor law line shows the factors, so it waits for them (decided with the orchestrator, recorded here).
- **On Sam's iPad, the offer after a repeated slip on Q2 now reads "2 minutes on non-monic factorising?" (it read "monic").** The ticket says the offer opens the three steps "on the skill the slip was on", and Q2's Q* and Q** are non-monic. On a question without Q* and Q** the offer still goes to the most fundamental skill slipped on. Sam's report line reads "Practice · non-monic factorising · Q2".
- **On Sam's iPad, back on Q2 after practice, hint and chat are on Q2 itself, and only once he has taken practice on it.** Set questions had no hints and the chat served practice problems only, so each Problem Set 6 question now carries hints written from its Q**'s. Before practice the working screen is unchanged ("I need help" opens the picker). The tutor on the set question never says whether a line is right, since the set is marked.
- **On Q\*\*, "I need help" offers hint, see the example again and chat.** The example shows in the pad's place until "Back to your turn"; it is not saved, so a reload returns to the pad.
- **On the teacher's laptop, Sam looking at the example again from back on Q2 still reads "back on Q2".** A look, not a step; `since` stays when he came back.
- **On Q\*\*, a line the pad cannot read says "Couldn't read this line" and does not count towards the two tries.**
- **On Q\*\*, a line in a form the check does not accept (an expanded or unfactorised line, a sentence in other words) is marked wrong**, as tickets 311 and 325 decided (0.5 for ½ is right since 325); the one place to change is `markLine` / `MARK_RULES` / `MARK_LOOK`.
- **Q\* and Q\*\* on the iPad show the whole question as the working screen does (stem, expression set large, the figure), not `ProblemQuestion`**, which is the teacher's one-line form with a thumbnail.
- **Every lit hint fragment followed by a comma gets a box tight at that side**, warm-ups included; nothing moves.

