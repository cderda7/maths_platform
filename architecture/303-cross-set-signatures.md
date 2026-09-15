# 303: Error signatures across sets

## Files touched

| File | What it does |
| --- | --- |
| `data/signatures.ts` | New. `FAMILIES`: 14 error families over `MISCONCEPTION_IDS` (name, one-line gloss, misconceptions), `steps` for communication patterns; `familyOf(misconception \| null)`; `SIGNATURE_MIN_SETS = 2`. |
| `data/signatures.test.ts` | New. Every misconception in exactly one family; `steps` the only family without misconceptions; names say what is wrong. |
| `data/story.ts` | `Pattern.misconception` (`h(text, misconception, ...problems)`) on all 222 patterns; pattern wordings, review reasons and 10 summaries say what is wrong, not why. |
| `data/story.test.ts` | Each pattern's misconception is on one of its problems in the student's wrong lines (`mistakesByProblem`) and every problem shows its family; no diagnosing words. |
| `data/patternTags.ts` | Tags follow the new wordings; repeated texts dropped; tags that mixed families split (Harper's and Sofia's dropped, Tomas's and Lucas's trimmed). |
| `data/classmates.ts`, `data/pset1–5/classmates.ts` | Records' pattern notes equal the new wordings. |
| `lib/signatures.ts` | New. `signaturesOf(patterns, sets)`: patterns by family, a family on 2+ sets is a `Signature` (family, name, gloss, sets, patterns, cells); most sets, then most patterns, then family order. Pure. |
| `lib/signatures.test.ts` | New. The rule; Sam, Priya, Aiden, Grace; every signature's patterns, sets and cells are the page's; tiles list a pattern once; a tag's wordings are one family. |
| `lib/holistic.ts` | `HolisticPattern.misconception`; `HolisticView.signatures` from the surfaced patterns. |
| `lib/holisticTiles.ts` | `HolisticTile.signatures`; patterns a signature covers leave the category groups. |
| `app/teacher/students/HolisticPage.tsx` | `Signatures`: the "ACROSS SETS" chip line under the summary; a lit chip rings its cells (`Cell` `lit`), marks its patterns (`Patterns` `lit`) and opens a flyout under the line; Escape and a press elsewhere clear. |
| `app/teacher/students/HolisticTiles.tsx` | "Across sets" tag group first. |
| `lib/holistic.test.ts`, `lib/holisticTiles.test.ts` | Follow the view's new field and the tiles' signatures. |
| `specs/class-story.md` | Regenerated. |

## How it connects

```
 data/misconceptions.ts (299) ──▶ data/signatures.ts ◄303  FAMILIES, familyOf
        ▲                                   │
        │ LineVerdict.misconception          │
 data/*evaluation.ts ─▶ lib/mistakes.ts ─────┼──── checked by data/story.test.ts ◄303
   (each wrong line)    mistakesByProblem    │     (pattern id ∈ student's wrong lines)
                                             │
 data/story.ts ◄303  Pattern { text, misconception, problems }
        │
        ▼
 lib/holistic.ts  holisticView ─▶ patterns (surfacing, 276) ─▶ lib/signatures.ts ◄303
        │                                                        signaturesOf ─▶ view.signatures
        ├─▶ app/teacher/students/HolisticPage.tsx
        │     Header ─ Signatures ◄303 (chips; lit ─▶ Grid Cell rings, Patterns marks, flyout)
        │     Grid ─ Patterns
        └─▶ lib/holisticTiles.ts ◄303 (signatures first, covered patterns out)
              └─▶ app/teacher/students/HolisticTiles.tsx ("Across sets" group)
```
