# 302: A diagnostic's distractors point at the misconception taxonomy

## Files touched

| File | What it does |
| --- | --- |
| `data/diagnostic.ts` | `DiagnosticOption.misconception: MisconceptionId` and `detail: string` on every distractor. |
| `data/misconceptions.ts` | Seven new entries for distractors no student wrote. |
| `components/DiagnosticResults.tsx` | Off the board: the misconception's name, then the detail. |
| `lib/misconceptionCounts.ts` | `Sighting.source` (work, diagnostic); `diagnosticSightings` from a chain's pickers. |
| `lib/diagnostic.test.ts` | Maths checks read `detail`; ids valid; a slip-tied option's id is its line's; no speculative words in a detail. |
| `data/signatures.ts` | Ticket 303's error families place the seven new ids; a new family, "Graph features wrong", holds wrong-feature. |
| `data/misconceptions.test.ts`, `lib/misconceptionCounts.test.ts` | Every id used by a wrong line or a distractor; diagnostic sightings. |

## How it connects

```
 data/misconceptions.ts (299, +7 ◄302) ◄── id ── data/diagnostic.ts  DiagnosticOption { tex, misconception ◄302, detail ◄302, slip }
        │ name                                        │                                   │ slip = a real wrong line
        │                                             │                                   ▼
        │                                             │               data/evaluation.ts LineVerdict.misconception (same id, tested)
        ▼                                             ▼
 components/DiagnosticResults.tsx ◄302  card / panel: name + detail · board: neither
        ▲ DiagnosticPush flyout · DiagnosticFocus (Mistakes) · Class view card · /board

 lib/diagnostic.ts pickersAt ─▶ lib/misconceptionCounts.ts diagnosticSightings ◄302 ─▶ countMisconceptions
                                 sightingsOn (work) ─────────────────────────────────▶ (source kept apart)
```
