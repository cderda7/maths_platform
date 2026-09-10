# 69: Help chat: a fourth option under "I need help", a tutor that only hints and offers a choice of ways in

**What to build:** On the practice pad (the warm-up and the mid-set isolated practice), "I need help" lists a fourth option after hint, worked example and video: **chat**. Picking it opens an AI chat in the pad's right column where the student talks in their own words. The tutor is hint-oriented: it never gives the answer or the next line. Where a problem has more than one sensible way in at the student's stage, the tutor lays out two, asks "which one makes more sense to you?", and stays on the one chosen.

**Blocked by:** —

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11): "currently, when a student clicks on 'i need help', they have 3 options -- hint, worked example, video. i want to add a 4th -- chat. this opens an AI chat where the student can just talk in natural language & resolve their issues. the chat should have the rule of being HINT oriented, & in fact should be in conversation with the student to ensure that it's not giving a prescriptive hint, but rather one that makes sense to the student -- in particular for problems where there are multiple approaches. at least expose the student to the 2 possible options at that stage, & ask 'which hint makes more sense to you?' & then continue down that path."

## Solution

**The menu.** `HelpMenu` in `components/PracticePad.tsx` gains a `chat` row with "Open →", or "Continue →" once something has been said on this problem. Unlike the hint and the example it is never spent: the chat can be closed and reopened.

**The panel.** `components/HelpChat.tsx` takes the right column's place (the read-back returns on "close"), keyed by problem id so the follow-up starts its own chat. It shows the tutor's fixed opener ("What's got you stuck?"), the chat so far, the reply streaming in as a pulsing bubble, and a two-line box with a send button (Enter sends, Shift+Enter breaks a line). Maths in a reply written as `$...$` is typeset with KaTeX inline. Each line said is dispatched into the run as it happens (`run/chat`, on `PracticeRun.chat` per problem id), so the chat survives a reload and a reopen, and a reply lands on the problem it was asked on even if the pad has moved to the follow-up.

**The tutor.** `lib/helpChat.ts` builds the brief: the problem, its skill, the reference working (for the tutor's eyes only), the pad's own hint, the **ways in** listed on the fixture, and the lines the pad has read so far. The rules: hints never answers; start from where the student is; when more than one sensible way in exists, lay out two in a sentence each and ask which makes more sense, then stay on the chosen one; smallest next nudge, one at a time; two or three short sentences, Australian spelling. `data/practice.ts` gains `approaches` on the twelve problems that genuinely have two ways in (factorise or the formula; split the middle term or the cross method; four products or the grid; expand first or move first; the discriminant or complete the square; halfway between the intercepts or the formula for the axis; and so on). The three with one way (fractions, null factor law, conclusions) list none and the brief says so.

**The route.** `app/api/help-chat/route.ts` is the app's one live model call: it validates the body, looks the problem up server-side (the client sends only an id), streams `claude-opus-5` through the Anthropic SDK with the server-side refusal fallback, and pipes the text deltas back as `text/plain`. The first event is awaited before the response is sent, so no credentials (503 `not-configured`), a rate limit (429) or an API failure (502) reach the pad as statuses rather than a broken stream. Credentials come from the server's environment (`ANTHROPIC_API_KEY`, or an `ant auth login` profile); with none, the tutor's bubble says "The chat isn't connected on this device." and nothing is stored for that turn.

**Also fixed on the way:** three pad lines in `data/practice.ts` (`w-sketch`, `w-worded`, `w-zeros`) wrote `\;` with a single backslash, so the string read as `;` and the "or" line typeset with stray semicolons. Doubled, like every other TeX backslash in the file.

**Judgment calls (flagged):**
- The chat takes the right column, replacing the "Read as" list while open, so the student can keep writing on the pad with the tutor beside them. The tutor reads the lines anyway. A modal would have blocked the pad; the middle column is the pad itself.
- The tutor's first line is fixed app copy rather than a model turn, so opening the chat costs nothing and the choice of ways in comes in the first reply, once the tutor knows what the student is stuck on.
- Only the student and tutor lines are stored; a failed turn's note and the opener are not.

## Acceptance

- [x] "I need help" on the pad lists hint, worked example, video, chat; chat reads "Open →" and, once used on that problem, "Continue →"
- [x] Picking chat closes the menu and opens the chat in the right column with the opener showing and the box focused; "close" brings the read-back back
- [x] A sent line appears as the student's bubble at once; the reply streams into a tutor bubble; maths in `$...$` is typeset
- [x] Without credentials on the server the route answers 503 and the pad shows "The chat isn't connected on this device."; a malformed body is 400, an unknown problem 404
- [x] The route posts the problem id, the pad's lines and the chat so far; the brief carries the problem, skill, reference working, hint, ways in and lines
- [x] The chat is kept per problem in the run, survives close/reopen and a reload, and the follow-up starts its own
- [x] A snapshot saved before the chat existed hydrates with an empty chat
- [x] eslint, tsc, vitest (299), `next build` pass
- [x] Architecture note, `ARCHITECTURE.md` row, `DECISION_LOG.md` entry, `FUTURE_FEATURES.md` entries
