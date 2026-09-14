# 260: A sent diagnostic chain runs in a focused view on the Mistakes page, side by side; the flyout never collapses on a new mistake

**What to build:** Two changes to the Mistakes view's live diagnostic. First, an open flyout stays open when new mistakes arrive. Second, sending a chain replaces the Mistakes page with a focused view of that chain: every question side by side and centred, the teacher's one control centred under the row, and back to the problems on **done**. Force submit counts down 5 s instead of 10 s. The control reads **next question** and **done** on every surface.

**Blocked by:** 242.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), with a screenshot of Q1's flyout with its three steps selected:

- "when a new student mistake comes into mistake view, the diagnostic question automatically collapses. fix that — diagnostic question shouldn't collapse with new mistake"
- "we currently have it where if mouse moves off of diagnostic question, that leads to the pop up disappearing. but once the question has been pushed, want it to persist. also change force submit from 10 sec to 5 sec here. also change from 'next step' button to 'next question' button. actually like the teacher won't need to see the other questions when focused on one diagnostic question or chain of qs. so have a new window pop up that just shows [the sent step cards: question, options, counts, slip labels, avatars] & after all diagnostics answered & teacher selects 'done' (ie review for last question/step in chain is over), return to mistakes page view. best to organize side by side — so Q2 to the right of Q1, Q3 right of Q2, & the question / chain of questions is center aligned in the page"

## Agreed behaviour

1. **The collapse bug.** A new mistake row arriving in the Mistakes view never closes the open flyout. Reproduce it end to end before fixing, and find the real cause. Before sending, closing when the pointer leaves stays as it is.
2. **The focused view replaces the page, not a floating box.** The teacher chrome and tabs stay. A header names the problem: "Q1 x² − 5x + 6 = 0 · Live diagnostic". The problem cards are hidden until done, and then the Mistakes page comes back where it was, at the same scroll. A switch to Class and back mid-chain shows the focused view again, because the view comes from the stored chain, not local state.
3. **Layout.** Every question of the chain sits side by side in solution order, and the row is centred on the page. The current question has the accent border. Earlier questions keep their results. Later ones show only their question and options, dimmed, with no counts yet. One control sits centred under the row (force submit → next question → done), with Withdraw beside or under it.
4. **Wording and timing everywhere** (focused view, board, class card): "next step" becomes "next question", and the last question's "back to work" becomes "done". The force-submit countdown is 5 s instead of 10 s.
5. **Chains wider than the screen** (Q2 has five steps) never scroll or wrap. The cards get smaller so the whole chain fits one row at 1280×800 and 1440×900. Maths never splits and never overflows its cell. Text stays readable, including the smallest case: five questions at 1280.

## Solution

- **Root cause of the collapse** (reproduced, `hmr260.mjs`): the flyout's open state and its step selection lived in `DiagnosticPush`'s React state. Anything that mounted the Mistakes tree again closed the flyout under the pointer and cleared the selection. The user runs the demo on `next dev` from the main checkout, which other sessions merge into all day. A merge that touches the diagnostic modules (`data/diagnostic.ts`, which tickets 240–242 all changed) re-renders the page through Fast Refresh and remounts that tree. In the same moment the names held above the pointer (ticket 189) landed with their glow, so it looked like "a new mistake comes in and it collapses". The same scenario on a production build, with the real pointer resting on the flyout while rows arrive, did not collapse at any size, zoom or pointer position tried. The rows are held above the pointer and nothing under the flyout moves.
- `app/teacher/diagnosticFlyout.ts` (new): a module-level store for which problem's flyout is open (one at a time) and each problem's selection (`setFlyoutOpen`, `toggleStep`, `sentFrom`, `useFlyout`). A module that imports nothing of the app's is not evaluated again when other modules change, so a remount reads the flyout as it was.
- `app/teacher/DiagnosticPush.tsx`: reads and writes the store. Sending closes the flyout and clears its selection. The live-chain band, the chain's ticks and the chip's badge go, since the focused view covers the page while a chain is out.
- `app/teacher/DiagnosticStep.tsx` (new): `StepHeading` (step name and "n slipped here"), `StepQuestion` (stem and options, the right option green), and `pickersFor` (avatars with repeat marks). The flyout and the focused view share them.
- `app/teacher/DiagnosticFocus.tsx` (new): the focused view. Cards are `flex: 0 1 460px` in a centred row and narrow equally to fit. Inside a card, `@max-[300px]` stacks the options in one column and puts the slip count under the step name. The status line, `DiagnosticControl size="focus"` and Withdraw sit in a band that sticks to the window's foot.
- `app/teacher/TeacherMistakes.tsx`: while the live set has a chain out, it renders `DiagnosticFocus` under the back button and eyebrow. The page itself stays mounted but `hidden`, so expanded problems stay expanded. `useScrollAroundFocus` records the page's scroll from scroll events, because the browser has already clamped it by the time the send commits. It restores the scroll once the problems are back.
- `components/FitStem.tsx` (new): a stem at 17 px, or smaller by the one factor that fits its widest maths inside the card. It is used by `StepQuestion` and by the panel size of `DiagnosticResults`, whose cells also stack in a narrow card.
- `lib/diagnosticChain.ts`: `DIAGNOSTIC_FORCE_MS` goes from 10 000 to 5 000. `components/DiagnosticControl.tsx`: the labels "next question" and "done", and a `focus` size.
- Tests: `lib/diagnostic.test.ts` for the 5 s countdown (pressed at once, the close now lands before the last classmates, who are left out); `app/teacher/diagnosticFlyout.test.ts` for the store.
- `chain241.mjs` and `who242.mjs` read the running chain from the focused view, with the new wording, the 5 s timings and the class of 19 (ticket 250 made Chloe absent on Set 6).

## Acceptance

- [x] The collapse reproduced before the fix on the user's setup (`next dev`, a merge touching `data/diagnostic.ts` while the flyout is open with two steps selected): the flyout closed and the selection was lost (`hmr260.mjs`, 1/4). After the fix the flyout stays open in the same place with both steps still selected (4/4, run again on the final code).
- [x] Production build, real pointer resting on the flyout while two or more new rows arrive: still open, never moved, selection kept (focus260, both sizes).
- [x] Sending Q1's three steps opens the focused view. It has the header "Q1 [x^2 - 5x + 6 = 0] · Live diagnostic", the problems hidden, the tabs and back button kept, three cards in one row in solution order, and the row centred (62 px each side). The current card has the accent border; the later cards are at 50% opacity with no counts. One control is centred under the row, with Withdraw.
- [x] Force submit counts down from 0:05 in the view and on the board, stays centred, and Cancel restores it. Next question and done read so in the view, on the board and on the class card.
- [x] Switching to Class mid-chain and back shows the focused view again, same step and control. Next question keeps step 1's counts and avatars. Done returns to the Mistakes page at the scroll it was sent from, and gives back the board and Sam's working. Withdraw does the same.
- [x] Q2's five steps sit in one row inside the window at 1280×800 and 1440×900 (302 px cards), centred, with no sideways scroll and no maths split or past its cell or card. Stems are at least 12 px and options at least 11 px (layout px). This holds with answers in, and the control stays in the window.
- [x] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes

## Done (2026-09-14)

- **Numbers.** vitest 870 (5 new in `app/teacher/diagnosticFlyout.test.ts`; the force-submit tests in `lib/diagnostic.test.ts` rewritten for 5 s). eslint clean, tsc clean, next build, check:laptop 72/72, sweep:hint-boxes 132/132. Click-throughs on a production build: `focus260.mjs` 76/76 at 1280×800 and 1440×900 (teacher, board, Sam's iPad). `chain241.mjs` 104/104 and `who242.mjs` 56/56, both updated. `hmr260.mjs` on `next dev`: 1/4 before the fix, 4/4 after.
- **Why not the headless reproduction the brief suggested.** On a production build the flyout stayed open through arrivals in twenty-odd scenarios: 1000–1512 px windows, device scale 1–2, browser zoom 67–90%, the pointer at rest, jiggling, on the send button, after a chain, after a wheel scroll, and on the dev server with no file change. The hold above the pointer (ticket 189) keeps every card above the pointer still, and nothing above Q1 can move. The one reproduction was a remount. `ps` showed the user's `next dev` running from the main checkout since 11 Sep, and a file change there collapsed the flyout exactly as described.
- **Fitting five.** The cards narrow instead of shrinking their text. Each is 302 px at both laptop sizes (the content box is 1592 layout px at both), the options stack in one column, and the text stays at the flyout's sizes. The one exception is Q2's Factorise stem, "3x² + 5x − 2 = 3x(x + 2) − 1(x + 2)", which `FitStem` sets a little smaller (still over 12 layout px) so it stays inside its card.
- **The control's band** sticks to the window's foot. On a five-step chain at 1280×800 the current card is taller than the window, and without the band the control would be below the fold. Cards pass under a fade of the page's ground.
- **Withdraw** sits on its own line under the control. Beside it, it read as a second link next to the countdown's Cancel.
- **Scroll.** Done restores the scroll the page had at the send. The open flyout adds to the page's height, so a scroll that needed the flyout's extra length comes back at the most the page allows.
