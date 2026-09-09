# 28 · Warm-up chooser: pick problems, say it in words, warm up one skill at a time

Route: `/student` (stages `overview` → `confidence` → `warmup-pick` → `practice` → `working`).
Deep links: `/student?stage=warmup-pick` (empty chooser), `/student?stage=practice` (a chooser
run that picked Q2 and said "fractions", so the pad has a composite to show).

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `Stage` gains `warmup-pick` |
| `data/practice.ts` | Five more single-leaf practices (sketch, evaluate, worded, zero-finding, binomial identity) so every leaf the set leans on has a warm-up of its own; `WARMUP_BANK` = every practice. (Three composite problems were authored first and removed the same day: harder than the set.) |
| `data/recognition.ts` | `RECOGNITION_WARMUP` removed: a warm-up's script is its own model steps |
| `lib/warmup.ts` (+ test) | `interpret(text)` (skill words → leaves via a regex table, "Q2"/"q 4" → problem ids; "factorising" means both kinds unless the message says which), `focusLeaves(selected, messages)` (selected problems' leaves then the words', communication excluded, first-mention order), `EASE` (perceived ease, easiest first: fractions, linear, expansion, evaluating, quadratic equations, monic, null factor law, non-monic, binomial, discriminant, zero-finding, features, sketch, worded, formal, conclusions) and `byEase`, `warmupSequence(focus)` (one practice per focus leaf in ease order, a sibling's practice when a leaf has none, never the same problem twice, nothing → the default alone), `tutorReply` (names the sequence easiest first, or asks again), `warmupScript(p)` |
| `lib/session.ts` | `warmup.selected[]`, `warmup.messages[]`, `warmup.step`; actions `warmup/select` (toggle), `warmup/say` (student line + tutor reply at once), `warmup/begin` (→ `practice`, only with a focus), `warmup/skill-done` (next step with a fresh problem state, or → `working` after the last); `warmupFocus(s)`, `warmupStep(s)` (the sequence's current problem), `warmupProblem(s)` (that or its follow-up); `confidence/set` → `warmup-pick` when the warm-up was chosen; `sessionAt("practice")` seeds the chooser; `hydrateSession` fills nested slices of an older snapshot |
| `lib/hierarchy.ts`, `lib/examples.ts`, `app/teacher/TeacherLive.tsx`, `app/teacher/ForceSubmit.tsx`, `app/student/page.tsx` | Before-hand-in stage lists include `warmup-pick` |
| `components/ProblemCard.tsx` | The pre-set problem card, shared by the overview and the chooser: label, stem, expression, figure, centred leaf chips, no difficulty tag; selectable (`onToggle`, tick, accent border) and `highlight` (light-blue chips) |
| `components/Tag.tsx` | `LeafChip` passes through extra attributes (`data-state` on the sequence chips) |
| `app/student/screens/OverviewScreen.tsx` | `ProblemCard`; footer is two lowercase buttons, "warm up" and "start", no title or skill caption |
| `app/student/screens/WarmupPickScreen.tsx` | Left: problems (scrolls) over the skills by category (canonical order, no group level, natural height up to 42 %); right: `Chat` (first prompt; after a selection, "Q2, Q4. now say in your own words…"; the stored student/tutor lines; a textarea disabled until something is selected; "warm up on these →" enabled by a non-empty focus) |
| `app/student/screens/PracticeScreen.tsx` | Serves `warmupProblem(session)`; a centred chip strip above the problem shows the whole sequence (done = dark blue, current = light blue with a dark border, to do = light blue); the right column's button is "Next skill →" with "Skip to the set" beside it, "On to the set" on the last skill, the same after a worked example; the worked-example pane on the left is the step's first problem; script from `warmupScript` |
| Overview, WorkingScreen, WarmupPickScreen | Skill chip groups centre-aligned |
| `app/student/StudentApp.tsx` | Renders the chooser at `warmup-pick`; crumb "Warm-up" |
| `lib/session.test.ts` | New order and deep links; the chooser's selection and chat; the pad tests run on a chooser run that named monic factorising |

## How it connects

```
 OverviewScreen ── "warm up" ──▶ practice/accept ─┐
                ── "start" ────▶ practice/decline ─┴─▶ ConfidenceScreen ── confidence/set ──▶ taken ? warmup-pick : working

 WarmupPickScreen (stage warmup-pick)                     session.warmup { selected[], messages[] }
 ┌─────────────────────────────┬────────────────────────────────────┐
 │ ProblemCard × 10 (toggle) ──┼─▶ warmup/select                    │
 │ Skills by category          │  Chat: prompt · "Q2, Q4. now say…" │
 │   chip light blue when      │  textarea ──▶ warmup/say ──▶ tutorReply(text, focusLeaves(selected, messages))
 │   focus ∋ leaf              │  "warm up on these →" ──▶ warmup/begin ──▶ stage practice (focus non-empty)
 └─────────────────────────────┴────────────────────────────────────┘
                     focus = focusLeaves(selected, messages)      ← lib/warmup.ts, pure
                     sequence = warmupSequence(focus) = byEase(focus) → PRACTICES[leaf] (or a group sibling), deduped

 PracticeScreen (ticket 27): sequence[warmup.step] on the pad · script = its model steps
   chip strip: [done ■][done ■][current □][todo □][todo □]  · "Next skill →" ──▶ warmup/skill-done ──▶ step + 1 … last ──▶ working
   help menu → hint / worked example (of this problem) / video · follow-up = problem.followUp
```

## Verified by

vitest (145 tests): interpretation (the user's own example sentence → monic, non-monic, fractions,
Q1/Q2/Q4; "non monic" alone; unknown text; "q99"); focus order and communication exclusion; the
sequence (Q2 + "monic factorising and fractions" → fractions, quadratic equations, monic, null
factor law, non-monic; nothing → the default alone; one problem per leaf across the whole set with
no repeats; unlisted leaves last); tutor replies; every practice has a hint and a script; the
session's chooser actions, the step walk ending on `working`, deep links, and hydration of an
older snapshot. `tsc --noEmit`, `eslint`, `next build`. CDP click-through: overview footer reads
"warm up" / "start" with no difficulty tags → confidence → chooser with no difficulty tags, five
skill rows by category, prompts and disabled controls → select Q2, send "monic factorising and
fractions" → the tutor names the five skills easiest first, chips light blue → "warm up on these →"
→ fractions on the pad with the five-chip strip → "Next skill →" twice: two chips dark blue, monic
current → worked example → "Try one more" → the follow-up with "Next skill →" → two more skills →
non-monic last with "On to the set" only → reload keeps the strip → the set opens on Q1 with
`session.lines` empty.
