# 70 · Split view: a divider drag lasts exactly as long as the button is held

Route: `/split` (the presenter page), every divider handle.

## Files touched

| File | What it does |
|---|---|
| `lib/split.ts` (+ test) | `Drag` (the drag in progress: divider, pointer id, press point, starting sizes, axis extent, sizes last shown) and `dragStep(drag, pointer, shown)`: a pure step from one pointer event to `ignore` (another pointer), `move` (sizes at the pointer) or `end` (at the release point on `pointerup`; at the sizes last shown on `pointercancel` or any move with the primary button up) |
| `app/split/SplitView.tsx` | The handle's `pointerdown` starts the drag and registers window listeners (`pointermove` / `pointerup` / `pointercancel` in the capture phase, `blur`, `visibilitychange`) that feed `dragStep`; the drag ends and the listeners go the moment a step says `end`, on blur, on the tab hiding, or on unmount. The handle no longer has move / up / cancel handlers; pointer capture is still requested but nothing depends on it |

## How it connects

```
   before (ticket 35)                                    after (ticket 70)
   the handle hears its own release                      the window hears everything, from the press on
   ┌─ div[data-divider] ─────────────────┐               ┌─ div[data-divider] ───────────┐
   │ onPointerDown  → capture, drag.ref  │               │ onPointerDown → drag.ref,     │
   │ onPointerMove  → setLive(resize())  │               │   capture (best effort), and: │
   │ onPointerUp    → choose(final)      │               └───────────────┬───────────────┘
   │ onPointerCancel                     │                               │ addEventListener ×5
   └─────────────────────────────────────┘                               ▼
     a pointerup that never reaches this               ┌─ window / document ─────────────────────────┐
     element (released over another app,               │ pointermove ─┐                              │
     focus lost, capture lost over an iframe)          │ pointerup   ─┼→ dragStep(drag, e, panes)    │
     leaves drag.ref set: the view keeps               │ pointercancel┘   ignore → nothing            │
     following whenever the pointer passes             │                  move   → d.sizes, setLive   │
     the handle, cursor stuck on col-resize            │                  end    → end(sizes)         │
                                                       │ blur ──────────→ end(d.sizes last shown)     │
                                                       │ visibilitychange (hidden) → same             │
                                                       └───────────────────────┬─────────────────────┘
                                                                               ▼
                                                        end(): unlisten, drag.ref = null, setLive(null),
                                                               choose({...choice, sizes})  → localStorage
   lib/split.ts  dragStep
     e.pointerId ≠ d.pointerId          → ignore
     pointerup                          → end at resize(from, divider, Δ/extent)
     pointercancel | (buttons & 1) == 0 → end at d.sizes        ← "not pressing" ⇒ released, always
     otherwise                          → move to resize(...)

   Unchanged: placeFor / resize / resetSize, the live cursor and iframe pointer-events-none classes on
   <main> while `live` is set, double-click reset, the stored sizes shape.
```

## Verified by

vitest (305 tests, six new for `dragStep`); eslint and tsc clean; `next build`. Headless Chrome on the
built app (port 3151), real CDP mouse input: nine ways of ending a drag, all clean after the change,
three of which (lost mouseup, window blur, capture lost with the release over an iframe) left the view
dragging with the resize cursor before it. A column, row and side-by-side drag follow live and store on
release with the handle under the drop point (within 0.1 px); a lost release keeps the size last shown
and later moves change nothing; double-click resets; a click lands in the student iframe afterwards.
Screenshots of mid-drag and after release.
