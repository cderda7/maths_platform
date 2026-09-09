# 28 · Warm-up chooser: pick problems, say it in words, get one composite warm-up

Route: `/student` (stages `overview` → `confidence` → `warmup-pick` → `practice` → `working`).
Deep links: `/student?stage=warmup-pick` (empty chooser), `/student?stage=practice` (a chooser
run that picked Q2 and said "fractions", so the pad has a composite to show).

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `Stage` gains `warmup-pick` |
| `data/practice.ts` | Four more single-leaf practices (sketch, evaluate, worded, binomial identity) so every leaf the set leans on has a warm-up; `COMPOSITE_WARMUPS` (rational-zero, fraction-clearing non-monic, fraction-then-discriminant), each with a hint and a follow-up; `WARMUP_BANK` = composites then singles |
| `data/recognition.ts` | `RECOGNITION_WARMUP` removed: a warm-up's script is its own model steps |
| `lib/warmup.ts` (+ test) | `interpret(text)` (skill words → leaves via a regex table, "Q2"/"q 4" → problem ids; "factorising" means both kinds unless the message says which), `focusLeaves(selected, messages)` (selected problems' leaves then the words', communication excluded, first-mention order), `practiceCovers(p)` (headline leaf + step tags), `chooseWarmup(focus)` (most focus leaves covered; ties: fewest extras, then most on-focus steps, then bank order; nothing → the default), `tutorReply` (names the focus and what one problem covers, or asks again), `warmupScript(p)` |
| `lib/session.ts` | `warmup.selected[]`, `warmup.messages[]`; actions `warmup/select` (toggle), `warmup/say` (student line + tutor reply at once), `warmup/begin` (→ `practice`, only with a focus); `warmupFocus(s)`; `warmupProblem(s)` = `chooseWarmup(focus)` or its follow-up; `confidence/set` → `warmup-pick` when the warm-up was chosen; `sessionAt("practice")` seeds the chooser |
| `lib/hierarchy.ts`, `lib/examples.ts`, `app/teacher/TeacherLive.tsx`, `app/teacher/ForceSubmit.tsx`, `app/student/page.tsx` | Before-hand-in stage lists include `warmup-pick` |
| `components/ProblemCard.tsx` | The pre-set problem card, shared by the overview and the chooser: label, stem, expression, figure, leaf chips, no difficulty tag; selectable (`onToggle`, tick, accent border) and `highlight` (light-blue chips) |
| `app/student/screens/OverviewScreen.tsx` | `ProblemCard`; footer is two lowercase buttons, "warm up" and "start", no title or skill caption |
| `app/student/screens/WarmupPickScreen.tsx` | Left: problems (scrolls) over the skills by category (canonical order, no group level, natural height up to 42 %); right: `Chat` (first prompt; after a selection, "Q2, Q4. now say in your own words…"; the stored student/tutor lines; a textarea disabled until something is selected; "warm up on these →" enabled by a non-empty focus) |
| `app/student/screens/PracticeScreen.tsx` | Serves `warmupProblem(session)`; the worked-example pane on the left is the chosen first problem; chips list everything the problem covers, focus leaves in light blue; script from `warmupScript` |
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
                     problem = chooseWarmup(focus) over WARMUP_BANK = COMPOSITE_WARMUPS ++ PRACTICES
                                 score: leaves covered · fewest extras · most on-focus steps · bank order

 PracticeScreen (ticket 27): warmupProblem(session) on the pad · script = its model steps · chips = practiceCovers(p)
   help menu → hint / worked example (of this problem) / video · follow-up = problem.followUp
```

## Verified by

vitest (145 tests): interpretation (the user's own example sentence → monic, non-monic, fractions,
Q1/Q2/Q4; "non monic" alone; unknown text; "q99"); focus order and communication exclusion; bank
choice (nothing → default, factorising + fractions → rational-zero covering all four, a single
skill → its own practice, Q4 + fractions → the discriminant composite, Q2 + fractions → the
fraction-clearing composite, every leaf in the set covered by something); tutor replies; composite
hints, follow-ups and unique ids; the session's chooser actions and deep links. `tsc --noEmit`,
`eslint`, `next build`. CDP click-through: overview footer reads "warm up" / "start" with no
difficulty tags → confidence → chooser with no difficulty tags, five skill rows by category, the
first prompt, textarea and button disabled → select Q2 and Q4 → the second prompt, five chips
light blue → the example sentence sent → tutor names six skills and says the discriminant can
come in the set, six chips light blue, card chips too → "warm up on these →" → the rational-zero
problem on the pad with its five covered chips → a line read → worked example → "Try one more" →
the follow-up beside the example → reload keeps it → "On to the set" lands on Q1 with
`session.lines` empty → both deep links.
