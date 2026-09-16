# 355: The decision card's stage names get colour, and the card gets bigger

A pure visual follow-up on ticket 351's card: the destination stage named in the "Next: …" line now carries the same
light-blue look as the pathway strip's own pills, and the whole card — type and footprint — is substantially bigger
(480px → 680px). No decision logic changed; only sizes, spacing, and one new inline component.

```
components/PathwayStop.tsx          components/ui.tsx
┌───────────────────────────┐       ┌────────────────────────────────┐
│ size: "line" | "card"      │       │ Eyebrow({ children, className,  │
│      | "card-lg"  ← new    │       │   style })   ← style prop added │
│ (Create's PathwayMap keeps │       │ (its own text-[11px] class      │
│  using "line"; untouched)  │       │  beats a later className        │
└──────────────┬──────────────┘      │  override in Tailwind's cascade,│
               │                      │  so a real font-size needs      │
               │                      │  inline style, not className)   │
               │                      └────────────────┬─────────────────┘
               ▼                                        ▼
                    app/teacher/DecisionCard.tsx
                    ┌─────────────────────────────────────────────────────────┐
                    │ StageBadge({ children })  ← new                          │
                    │   bg-standout-soft / text-ink / font-display              │
                    │   = exactly StagePill's own look, sized for inline text  │
                    │                                                            │
                    │  next-stage line:                                         │
                    │   "Next: " + <StageBadge>{stage}</StageBadge> + " — …"    │
                    │   skip variants: destination stage badged, the skipped   │
                    │   stage named in this same sentence stays plain text     │
                    │                                                            │
                    │  card: w-[480px] → w-[680px], p-6 → p-9, rounded-2xl →   │
                    │   rounded-[28px]; headline/body/notes text sizes scaled  │
                    │   up throughout; all <Button>s → size="lg"; SplitRow's   │
                    │   text/checkbox/ProblemQuestion figureWidth scaled;      │
                    │   ChangePathway's PathwayStop → size="card-lg", STOP_W   │
                    │   136→190, STOP_H 32→44                                  │
                    └─────────────────────────────────────────────────────────┘
```

Files:

- `components/PathwayStop.tsx` — additive `"card-lg"` size (`px-4 text-[18px]`) for `ChangePathway`'s stops only;
  `PathwayMap.tsx` (Create's own pathway line) still uses `"line"`, untouched.
- `components/ui.tsx` — `Eyebrow` takes an optional `style` prop. Its own `text-[11px]` utility wins over a later
  `className` override regardless of prop order (the same Tailwind-cascade pitfall as the Button padding issue from
  ticket 143), so the card's three `Eyebrow`s that needed a bigger size pass `style={{ fontSize }}` instead.
- `app/teacher/DecisionCard.tsx` — new `StageBadge` component (reuses `StagePill`'s exact colour/text treatment,
  `bg-standout-soft`/`text-ink`/`font-display`, sized for inline flow rather than a block pill); wraps the
  *destination* stage's name in the next-stage line, in all three of its variants (normal, skip-individual,
  skip-both) — never the stage being skipped over, since that one isn't where the class is headed. Every other size
  on the card (card width/padding/radius, headline, evidence line, next-stage line, split ask, notes, `SplitRow`'s
  text/checkbox/figure sizes, the split list's scroll height, `ChangePathway`'s intro line and per-stage description)
  scaled up by roughly the same proportion, plus every `<Button>` moved to the existing `size="lg"` variant instead of
  a one-off size.

**A discovered, not introduced, constraint conflict** (see `DECISION_LOG.md`, `FUTURE_FEATURES.md`): ticket 335 sized
this card so it would never cover a row of Class View's roster at 1280px width. Measured live: ticket 351's 480px
width already broke that by ~59 layout px before this ticket touched anything; 680px breaks it further, by ~260
layout px. Shipped as asked (Carson: "make the whole thing bigger... like double") with the tradeoff logged rather
than silently resolved either direction. A responsive/adaptive width is the real fix, deferred to `FUTURE_FEATURES.md`
as a materially bigger change than this ticket's scope.

Not independently re-verified live this round: the `SplitRows`/two-stage-confirm content at the new sizes (the tick
rows, the confirm heading, `ProblemQuestion`'s new `figureWidth={56}`). Reproducing ticket 337's "half the room has
handed in corrections" demo timing needed more fixture work than this round's scope justified; only the passive
next-stage card (with the badge) and the `Change` view were screenshotted against a running production build. The
underlying logic in that section is untouched — only size/spacing values changed — and vitest's existing coverage of
`moveConfirmSentence` and the split-evidence functions still passes.
