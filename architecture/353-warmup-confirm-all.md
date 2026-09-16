# 353: "Your turn", "On your own" and "Skip to the set" all confirm before moving on unfinished

## Files touched

| File | What it does |
| --- | --- |
| `lib/session.ts` | `warmup/next`'s action type gains `force?: boolean`; the reducer skips its two readiness guards (example seen in full / completion done) only when `force` is set, so a confirmed early advance actually moves the phase forward instead of being a no-op. `warmupCompletion` (already existed) is now also read directly from `PracticeScreen.tsx` to compute completion-readiness independently of the reducer call. |
| `app/student/screens/PracticeSteps.tsx` | `WorkedStep`'s and `CompletionStep`'s corner button now renders for the whole step (`!again` / unconditional) instead of only once `seen`/`state.done`; the caller (not these components) decides the button's greyed state and what a press does. |
| `app/student/screens/PracticeScreen.tsx` | Computes `workedReady`/`completionReady` independently (mirroring the reducer's own guards) alongside the existing alone-problem `complete`. A generalized `Gate` (`"worked" \| "completion" \| "done" \| "skip"`) replaces ticket 349's single-purpose `confirmFor`: `pending` names which gate is asked and the skill/phase key it was asked on; `press(gate, act)` runs `act` at once if ready, otherwise opens the ask. The four controls (`Your turn`, `On your own`, `Next skill`, `Skip to the set`) all route through it; confirming "Your turn"/"On your own" dispatches `warmup/next` with `force: true`. |
| `lib/warmupSteps.test.ts` | New case: `force: true` advances past an unseen example and an unfinished completion problem, but still no-ops once there's no next phase. |
| `tickets/353-…`, `ARCHITECTURE.md`, `DECISION_LOG.md` | Docs. |

## How it connects

```
 app/student/screens/PracticeScreen.tsx
   workedReady      = w.exampled.includes(ladder.worked.id)
   completionReady  = warmupCompletion(session)?.state.done ?? false     ┐ independently computed,
   complete         = onAlone && scriptDone(warmupScript(aloneProblem))  ┘ mirrors the reducer's own guards
   ready = { worked: workedReady, completion: completionReady, done: complete, skip: false }
        │
        ├─ press(gate, act): ready[gate] ? act() : setPending({ gate, forKey: `${skill.id}:${phase}` })
        │     "Your turn"    → press("worked", advance)
        │     "On your own"  → press("completion", advance)
        │     "Next skill"   → press("done", done)
        │     "Skip to the set" → press("skip", skip)   (ready.skip is always false: always asks)
        │
        └─ asking = pending matches the current skill:phase AND still not ready
              → the corner confirm card (message/label from plain string lookup tables, keyed by gate)
              → its own button: if worked/completion, dispatch warmup/next{force:true}; if skip, skip(); else done()

 app/student/screens/PracticeSteps.tsx
   WorkedStep:     <section data-example>{example}{!again && <div class="absolute bottom-4 right-4">{next}</div>}</section>
   CompletionStep: <div>{pad}{next && <div class="absolute bottom-4 right-4">{next}</div>}</div>
                     ↑ always renders once the step opens; readiness/greying/confirm logic all lives in the caller
```

`asking` (not a plain `confirmFor === key` boolean, as ticket 349 had for the one "Next skill" gate) is derived the
same way for all four controls: it names *which* gate raised the ask, and is read as live-truthy only while the
raised gate's own `forKey` still matches the current skill/phase key *and* that gate is still not ready. Both halves
of that condition matter for the "goes stale" requirement: a chip switch changes `key` (drops it), and finishing the
step while the confirm is still open flips `ready[gate]` to `true` (also drops it, self-closing, no extra state or
effect needed) — exactly ticket 349's trick, generalized from one gate to four.

### The `react-hooks/purity` false positive

An early version stored the four gates' confirm messages *and* their action closures together in one object literal
(`GATE_ASK: Record<Gate, { message, label, act }>`), read as `GATE_ASK[asking].act()` from the confirm button. This
tripped `eslint-plugin-react-hooks`'s new `react-hooks/purity` rule ("Cannot call impure function during render") on
the `Date.now()` inside `advance`/`advanceForced`/`done` — even though nothing was actually called until a later
click. Empirically: a bare reference to a `Date.now()`-touching function, passed as an argument into another
function that's itself only invoked from inside a JSX-attribute arrow (`onClick={() => press("worked", advance)}`),
does **not** trip the rule; the same reference stored as a value inside an object literal built during render (even
completely uncalled at that point) **does**. The fix keeps `askMessage`/`askLabel` as `Record<Gate, string>` (plain
data, never a function value) and resolves which action to actually run via a plain `if`/`else if` chain written
directly inside the confirm button's own `onClick` arrow — the same shape as the codebase's other inline dispatch
handlers (e.g. the skill chips' `onClick={() => dispatch({ type: "warmup/goto", ... })}`), which already linted
clean. Whether this is the rule's intended contract or a gap in a still-new lint rule isn't fully clear from the
outside; the workaround costs nothing (the string lookup tables are simpler than the function ones they replaced)
and is recorded here in case a later ticket runs into the same rule on a similar shape.
