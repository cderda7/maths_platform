# 84 · The concerns chat names the skill in bold, and asks the later ones "How about…?"

Routes: `/student?stage=warmup-chat` (and the chat after a not-confident answer on `/student?stage=confidence`).

## Files touched

| File | What it does |
|---|---|
| `lib/warmup.ts` | `concernTurns`: the skill's name in `**…**` in the ask bubbles, the setup bubble plain; `howAbout(word)`: "How about the **null factor law**?" for a named rule, "How about with **fractions**?" otherwise; `emphasis(text)`: a tutor line as plain and bold runs |
| `app/student/screens/WarmupChatScreen.tsx` | A tutor bubble renders `emphasis(text)`, bold runs as `<strong>`; a student bubble is the text as typed |
| `lib/warmup.test.ts` | The three-, two- and one-skill scripts; `howAbout` over rules and topics; `emphasis` on none, one and two runs |

## How it connects

```
   the ticked skills (warmupSeed) ──► concernTurns(seed) ──► string[][]  (one turn per skill, "**" round the skill)
                                         │
                                         │  turn 0: ["Let's do a warm up on a, b, & c.",            plain: names them all
                                         │           "First, tell me a little bit about your concerns with **a**."]
                                         │  turn 1: [howAbout(b)]   "How about with **fractions**?"
                                         │  turn 2: [howAbout(c)]   "How about the **null factor law**?"
                                         ▼
   WarmupChatScreen.bubble(from, text)
     ├─ tutor   ─► emphasis(text) ─► [{text, bold:false}, {text:"fractions", bold:true}, {text:"?", bold:false}]
     │                                    └─► <span>How about with </span><strong>fractions</strong><span>?</span>
     └─ student ─► text, as typed (a "**" the student types stays a "**")

   howAbout(word):  /^the\b|\b(laws?|rule|identity|formula|distribution)$/
                      ├─ matches ─► "How about the **" + word without a leading "the " + "**?"
                      └─ else    ─► "How about with **" + word + "**?"
```

The stored session is unchanged: only the student's answers are saved, the tutor's lines are derived, so an
older run replays with the new wording.

## Verified by

vitest (329 tests, three new); eslint clean; `next build`; headless Chrome on the built app (port 3161, CDP
9451) at `/student?stage=warmup-chat`, two answers sent: the six bubbles read as the acceptance list, and
the three `<strong>` runs ("factorising", "fractions", "null factor law") render at weight 600. Screenshot of
the chat.
