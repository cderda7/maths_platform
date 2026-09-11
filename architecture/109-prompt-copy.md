# 109 · The practice prompt reads "2 minutes on factorising?" with its two sentences on two lines

Route: `/student` while working, after a second mistake on a group (the card over the working screen).

## Files touched

| File | What it does |
|---|---|
| `app/student/screens/PracticePrompt.tsx` | `PromptModal`: heading `2 minutes on {short}?` (was "two minutes …"); body `This is your second mistake on {word}.` `<br />` `Let's do a short problem to review.` (was one lowercase run in a single paragraph). |
| `data/taxonomy.ts` | The `groupWord` doc comment quotes the sentence as it now reads. |

## How it connects

```
 line/reveal (2nd wrong line on a group) ──▶ session.prompt = { leaf, reason: "detected" }
                                                        │
                                                        ▼
                             PromptModal ── studentLeafName(leaf).short ──▶ "2 minutes on factorising?"
                                         ── groupWord(groupOf(leaf)) ─────▶ "This is your second mistake on factorising."
                                                                            <br />
                                                                            "Let's do a short problem to review."
                                                        │
                                          Not now ──▶ prompt/decline     Yes ──▶ prompt/accept ──▶ PracticeOverlay
```

The trigger, the names and the two buttons are unchanged from ticket 31; only the card's text and its line break moved.

## Verified by

vitest (340), eslint, tsc, `next build`; a headless screenshot of the card (`prompt-shot.mjs`, the prompt set in localStorage on a fresh working run): heading "2 minutes on factorising?", the body breaking after "factorising." with "Let's do a short problem to review." alone on the second line, the buttons where they were.
