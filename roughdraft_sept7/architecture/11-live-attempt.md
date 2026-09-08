# 11 · Live attempt: a student who hasn't started

Route `/student/work`, "View as → Sam". Sam Okonkwo is a new roster member with nothing
submitted. Working is typed one line per move, typeset as you type, and checked by a simulated
step evaluator. The next step is planned from the evaluation with the same rules Jordan's
scripted path uses.

## Files touched

| File | Role |
|---|---|
| `lib/evaluate.ts` | **New.** Pure functions: `normalize` (canonical form of a line, typed or TeX), `toTex` (typed → display), `toPlain` (data TeX → typed, for prefill), `evaluateAttempt` (lines → `Evaluation`), `nextCoreAfter` and the next-step planner. |
| `lib/evaluate.test.ts` | **New.** Vitest unit tests: normalisation equivalences, Jordan's Q2 reproduced from typed lines, unclear / shaky / unreached cases, stretch and warm-up planning. |
| `vitest.config.mts` | **New.** Maps `@/` to the repo root. `npx vitest run`. |
| `app/student/work/WorkingEditor.tsx` | **New.** Client component. Numbered line inputs with live KaTeX preview; Enter adds a line, Backspace on empty removes, ⌘/Ctrl+Enter submits. |
| `app/student/work/WorkFlow.tsx` | Reworked around one state shape for all three students: a `path` of problem ids, plus per-problem `lines`, `evals` and `checks` for the live student. Scripted students read their `Evaluation` from `FLOWS`; Sam's comes from `evaluateAttempt`. Adds "edit and check again", "keep going", reviewer prefill links, and a conditional "not started" label. |
| `app/student/work/page.tsx` | Accepts `who=sam`, plus `problem`, `lines` (pipe-separated) and `confidence` so a typed attempt is deep-linkable. Confidence options are inlined: a value imported from a `"use client"` module into a server component arrives as a client reference, not an array. |
| `data/types.ts` | `SolutionStep` gains `label` + `subskill`; new `Misstep` (slip/shaky line with note and optional `then` consequences); `Problem` gains `lead` and `missteps`; `Evaluation` gains `reached`. |
| `data/problems.ts` | Every solution step labelled; `lead` copy for each core problem; `missteps` for Q1, Q2, Q3, Q5, Q6 and two warm-ups. |
| `data/students.ts` | Sam Okonkwo: 0/10, every subskill `unseen`, "Not started". Renders as an empty row on the teacher dashboard. |
| `package.json` | `vitest` and `@types/node@^24` (matches the Node 24 runtime; vitest 5 needs 22+). |

## How it connects

```
  URL ?who=sam[&problem=q2&lines=a|b|c&confidence=certain&phase=evaluated]
        │
        ▼
┌────────────────────────┐  init   ┌────────────────────────────────────────────────────────┐
│ work/page.tsx (server) │────────▶│ work/WorkFlow.tsx (client)                             │
└────────────────────────┘         │  state per student: { path[], phase, confidence,       │
                                   │                       lines{}, evals{}, checks{} }     │
                                   └───┬───────────────────────────┬────────────────────────┘
                                       │ scripted (priya, jordan)  │ live (sam)
                                       ▼                           ▼
                             flows.ts FLOWS[who]       ┌──────────────────────────┐
                             .find(problemId)          │ WorkingEditor.tsx        │
                             └─▶ Evaluation            │  lines[] ◀──▶ onChange   │
                                                       │  preview: M(toTex(line)) │
                                                       └──────────┬───────────────┘
                                                                  │ "Check my working"
                                                                  ▼
                                        ┌──────────────────────────────────────────────┐
                                        │ lib/evaluate.ts                              │
                                        │  evaluateAttempt(problem, lines, {visited,   │
                                        │                                   evals})    │
                                        │   ├─ normalize(line) vs problem.solution[]   │──▶ sound (label, subskill)
                                        │   ├─            vs problem.missteps[]        │──▶ slip | shaky (+note)
                                        │   ├─            vs misstep.then[]            │──▶ sound + "built on the line above"
                                        │   ├─ solution hit, prior step skipped        │──▶ shaky
                                        │   └─ otherwise                               │──▶ unclear (+ "what did you do here?")
                                        │  summarise(steps, reached)                   │
                                        │  planNext(problem, exercised, ctx, reached)  │──▶ sidestep | stretch | advance | finish
                                        └──────────────────┬───────────────────────────┘
                                                           │ Evaluation  (same type the scripted flows use)
                                                           ▼
                        StepTrace · MarkerLegend · "What this showed" · calibrationNote · NextStepCard
                                                           │ onGo / onStay
                                                           ▼
                                             goTo(target) ──▶ path.push(target)     nextCoreAfter(current, path)

  data/problems.ts  solution[].{tex,label,subskill}   missteps[].{tex,marker,label,subskill,note,then[]}   lead
  data/students.ts  sam ──▶ Nav toggle · teacher roster row (0/10 · Not started · all "not seen yet")
```

## What changed in the shared vocabulary

- `SolutionStep` and `Misstep` now carry the same `label` + `subskill` an `EvalStep` shows, so a
  live trace and a scripted trace read identically.
- `Evaluation.reached` is the only live-specific field; the UI uses it to offer "Keep going"
  instead of pushing the student forward.
