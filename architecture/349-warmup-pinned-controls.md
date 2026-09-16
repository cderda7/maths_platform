# 349: The warm-up's way-on buttons stay in view; "Next skill" checks the warm-up is finished

## Files touched

| File | What it does |
| --- | --- |
| `app/student/screens/PracticeSteps.tsx` | `WorkedStep`'s "Your turn" and `CompletionStep`'s new `next` prop ("On your own") move from the end of scrollable content to `absolute bottom-4 right-4` inside a `relative` wrapper around the middle column (the worked example's `<section data-example>`, the pad/peek `<div>`), so they float over the content rather than flow after it. `CompletionStep`'s `done` prop is now message-only; the button that used to live inside it is the new `next`. |
| `app/student/screens/PracticeScreen.tsx` | `complete` (was `scriptDone` on the current skill's alone problem, or the plain pad problem with no ladder) gates "Next skill": greyed out (`aria-disabled`, `opacity-40`) but still clickable, so a press while unfinished opens a corner confirm (`confirmFor`, matched against the current `skill:phase` key so a chip switch or the problem finishing while it's open both drop it, no effect needed) instead of doing nothing. Splits `CompletionStep`'s call into `done` (message) and `next` (the "On your own" button). |
| `tickets/349-…`, `ARCHITECTURE.md`, `DECISION_LOG.md` | Docs. |

## How it connects

```
 app/student/screens/PracticeScreen.tsx
   complete = onAlone(phase) && scriptDone(warmupScript(aloneProblem), w.lines[aloneProblem.id])
   confirmLeave = confirmFor === `${skill.id}:${phase}` && !complete
        │
        ├─ footer's "Next skill" button: onClick=requestDone, aria-disabled={!complete}
        │     requestDone: complete ? done() : setConfirmFor(key)
        │
        └─ renders <PracticeSteps.WorkedStep next=…> / <CompletionStep done=… next=…> / <PracticePad>
                       │                                    │
                       ▼                                    ▼
        app/student/screens/PracticeSteps.tsx      (pinned corner, `relative` wrapper)
          WorkedStep:   <section data-example className="relative …">
                          <div class="overflow-y-auto …">  worked example steps  </div>
                          {seen && <div class="absolute bottom-4 right-4">{next}</div>}
                        </section>
          CompletionStep: <div className="relative …">
                          {peek ? <ExamplePeek/> : <PadSection/>}
                          {state.done && next && <div class="absolute bottom-4 right-4">{next}</div>}
                        </div>
                        <aside> … <ol data-working>{done}</ol> … </aside>   ← message only, no button
```

`WorkedStep`'s and `CompletionStep`'s "way on" buttons act the moment they're pressed — no confirm — because the
student is choosing to move forward through their own three steps, which was never in question. "Next skill" is
different: it can skip past unfinished work, so it alone is checked, and greying it out (rather than disabling it
outright) means a press still says why instead of doing nothing.

The confirm's stale-close is a comparison, not an effect: `confirmFor` holds the `skill:phase` key it was raised
for, so it reads as open only while that exact key is still current *and* still incomplete. A student can write the
alone problem's last line while the confirm is showing (nothing stops them — the corner card has no backdrop) and
it drops on its own; a `react-hooks/set-state-in-effect`-clean way to reset state on prop change without an effect.

`CompletionStep`'s `next` prop is optional because `app/student/screens/HelpLadder.tsx` (ticket 312) shares the
same component for Q**'s completion step, where the way on is already the ever-present "Back to Qn" in `footer`,
not a button inside `done`; its `done` was already message-only, so the split needed no change there.
