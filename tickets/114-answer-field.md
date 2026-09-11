# 114: The "full sentence" box is a text field that takes the cursor as it appears

**What to build:** The box ticket 111 put at the foot of the pad becomes a text field, the help chat's box to the pixel: the same rounded border, size and muted grey placeholder, the instruction "Provide your final answer as a full sentence." as that placeholder (a statement with a full stop where the chat's reads "in your own words…"). When it appears the cursor is already in it, so the student types without clicking. What they type is kept in the session per problem.

**Blocked by:** 111 (the box and when it appears), 74 (the chat box it copies).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with the ticket 111 box and the warm-up chat's box side by side: "let me click into it to type. same functionality as here – when that text box opens, have the cursor automatically go there so the student can start typing without clicking into it. also same visual – the faded grey instructions – only difference being this one will be a statement ending in a period, whereas the example i'm giving you does …; but that should be the only difference". Ticket 111 had read "text box" as a box of text: a tinted card no one could type in.

## Solution

- `components/PadSection.tsx`: the `note` prop is replaced by `answer?: AnswerField` (`{ placeholder, value, onChange }`). `AnswerBox` renders the chat's textarea (`rounded-2xl border border-line-strong bg-paper px-4 py-3 text-[15px] placeholder:text-ink-muted focus:border-ink-muted`, `rows={2}`, `min-h-[56px]`) in a `pulse-once` wrapper, at the foot of the pad card as before, and focuses it on mount. Enter (without shift) ends the typing instead of adding a line: the answer is one sentence.
- `lib/session.ts`: `answers: Record<string, string>` and `answer/set`; kept through undo and clear, so the sentence is back if the field is. Old snapshots hydrate to `{}`.
- `app/student/screens/WorkingScreen.tsx`: passes the placeholder, the stored sentence and the dispatch when the problem asks for one.
- `lib/session.test.ts`: the answer per problem, through undo and clear, and hydration.

## Acceptance

- [x] Q9, three lines read: the field appears with the placeholder in muted grey and the cursor in it; typing lands in it without a click
- [x] Enter ends the typing (no new line); a reload shows the sentence; undo below the last line removes the field; writing the line again brings it back with the sentence
- [x] The field's computed border, radius, background, font size, padding and min-height are the warm-up chat box's
- [x] vitest (348), eslint, tsc, `next build`, the headless click-through (`answer114.mjs`), `npm run sweep:hint-boxes`; architecture note, root docs, decision log, future features
