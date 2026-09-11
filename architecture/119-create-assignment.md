# 119 · The create screen: questions typed into tiles

Route: `/teacher/assignments/create` (step one), `/teacher/assignments/create/review` (the stub for step two). The old `/teacher/assignments/new` is untouched.

## Files touched

| File | What it does |
|---|---|
| `lib/mathInput.ts` | The typed question read into the student's card shape. `parseQuestion(text)` → `{ stem: Segment[], tex, raw }`: prose segments with inline maths runs, and the centred expression (the last run when it ends the text; a newline forces the split). `toTex(raw)` is the shorthand grammar. `typesets(tex)` asks KaTeX without throwing. `stemText`, `splitPaste`. Pure; tested. |
| `components/QuestionView.tsx` | Renders a `ParsedQuestion` as the card body: the prose with inline `M`, then `M display` for the expression, sizes from `ProblemCard`; a run KaTeX rejects is shown as typed in mono. Used by the tile and the stub. |
| `app/teacher/assignments/create/CreateAssignment.tsx` | The screen. `useSyncExternalStore` says when we are on the client; then `Editor` mounts with its state read from `getClassroom().draft`. State: `title`, `qs` (always ending in an empty ghost, `withGhost`), `focusId`, `removed`. Every change dispatches `draft/set` (`draftOf`: empties dropped, stem and tex parsed). Handlers per tile: change, focus, blur, next (Enter), backspace-on-empty (remove and step back, or step back from the ghost), remove (×, nothing focused), paste-lines. `undoRemove` reinserts at the old index; Cmd+Z on the grid does the same while a removal is pending. Continue: pinned `fixed bottom-16 right-6`, on when any tile has text, saves and routes. |
| `app/teacher/assignments/create/QuestionTile.tsx` | One tile. Focused: the `.grow-wrap` text box at the top (Enter → next, Shift+Enter newline, Backspace on empty, a multi-line paste split), `QuestionView` beneath. Blurred: `QuestionView` alone, or "Type a question" in the ghost. A press anywhere on the tile opens the editor and, while editing, keeps the caret. × in the corner, visible on hover and while focused. `overflow-hidden`, fixed by the grid cell. |
| `app/teacher/assignments/create/page.tsx`, `review/page.tsx`, `review/ReviewStub.tsx` | Server pages; the stub reads `useClassroom().draft` and lists the questions in the same grid, or says nothing is drafted with a link back. |
| `lib/classroom.ts` | `DraftQuestion { id, text, stem, tex }`, `AssignmentDraft { title, questions, updatedAt }`, `draft?` on `ClassroomState`, the `draft/set` action and reducer case. |
| `app/teacher/TeacherChrome.tsx` | The pill links to `/teacher/assignments/create`, lit on any `/teacher/assignments/*` path. |
| `app/globals.css` | `.grow-wrap`: a grid whose `::after` mirrors the textarea's value, so the box is as tall as its text; the focus border colour lives here because an unlayered rule beats a utility. |
| `data/assignment.ts`, `data/evaluation.ts`, `data/recognition.ts`, `data/classmates.ts`, nine `lib/*.test.ts` | Unchanged in the end: the first commit mirrored Q1 to `x^2 + 5x + 6 = 0` (correct `(x+2)(x+3)`, slip `(x-2)(x-3)`); the follow-up commit restored the thirteen files exactly, the student side staying on `x^2 - 5x + 6 = 0`. The +5x problem is the teacher's typed draft only. |
| `lib/mathInput.test.ts`, `lib/classroom.test.ts` | The grammar, the run detection, the split and the override, the stem string, the paste split; the draft reducer. |

## How it connects

```
 /teacher/assignments/create                                   classroom store (localStorage + BroadcastChannel)
 ┌─────────────────────────────────────────────────────────┐   ┌──────────────────────────────────┐
 │ 11 METHODS B                                             │   │ draft: { title, questions[],     │
 │ [Untitled assignment                      ]  ◀ title     │   │          updatedAt }             │
 │ ┌ Q1 ────────── × ┐ ┌ Q2 ──────────┐ … ┌ Q8 (ghost) ──┐ │   │   question: { id, text,          │
 │ │ [Solve for x. x**2 + 5x + 6 = 0] │ │ Find all …   │   │ Type a       │ │   │              stem "$…$", tex }   │
 │ │ Solve for x.     │ │ (x−3)(x+2)=6 │   │ question     │ │   └───────▲──────────────┬───────────┘
 │ │   x² + 5x + 6 = 0│ │              │   │              │ │           │ draft/set    │ getClassroom().draft
 │ └──────────────────┘ └──────────────┘   └──────────────┘ │           │ (every edit) │ (Editor's first state)
 │ Q2 removed. Undo                    ◀ removed, Cmd+Z     │           │              ▼
 │                                          [ Continue ] ◀──┼── fixed ──┘        /teacher/assignments/create/review
 └─────────────────────────────────────────────────────────┘                     ReviewStub: the same tiles (stub)

 QuestionTile (focused)                       lib/mathInput
 ┌────────────────────────────┐               parseQuestion("Solve for x. x**2 + 5x + 6 = 0")
 │ Q3                       × │                 tokens: Solve for x. | x**2 + 5x + 6 = 0
 │ ┌ .grow-wrap ────────────┐ │                 prose  ─ weak "x." closes ─ strong run ──▶ expression
 │ │ textarea = text        │ │──onChange──▶    → { stem: [text "Solve for x."], tex: "x^{2} + 5x + 6 = 0" }
 │ └────────────────────────┘ │               toTex: ** ^ _ / * sqrt pi inf <= >= != +- sin…  unicode
 │ QuestionView(parsed)       │◀──useMemo──    "y = x**2 + 4x + 5." inside prose ─▶ inline M; "\n" ─▶ forced split
 │   stem (inline M) · M disp │               typesets(tex) false ─▶ shown as typed, never red
 └────────────────────────────┘
 Enter ─▶ h.onNext ─▶ focusId = next tile      Backspace on "" ─▶ remove + step back (ghost: step back only)
 Shift+Enter ─▶ newline                        paste "a\nb\nc" ─▶ this tile = a, new tiles b, c (caret in c)
```

## Verified by

vitest (376), eslint, tsc, `next build`; a headless run (`create.mjs`, port 3161/9461) that clears the store, types the title and four questions (Enter between them, Shift+Enter in the fourth), pastes three lines, checks every tile's stem, inline maths and expression against the bank's Q1–Q7, blurs and measures (equal squares to 1px, nothing overflowing, × at opacity 0, Continue clear of the reset pill), removes Q2 with × and restores it with Undo, empties Q7 and removes it with Backspace and restores it with Cmd+Z, steps back from the ghost, reloads, checks the pill and that no unit, pathway or tags render, continues to the stub and reads the seven questions there, opens the old screen, pastes fourteen more and scrolls under the pinned Continue, and lands on the empty stub; six screenshots.
