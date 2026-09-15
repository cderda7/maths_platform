# 348: The whole table in the cell it is working on

Ticket 319's group grid drew one avatar, the pen-holder's, in the cell a group was working on. Carson: "show all 4
student avatars in the box, with the colred ring around the student who's working." The cell now draws the whole table,
in seating order, and the ring in the group's colour moves onto the student holding the pen.

The cell is about 115 layout px wide once five groups share half the split at 1280 × 800, so the avatars are sized to
the cell before paint rather than fixed: `cellAvatars` is the arithmetic, the grid measures a cell and writes the result
as CSS variables, and every cell draws at that one size so the tables read alike.

```
            data/groups.ts            lib/standings.ts (ticket 332)
            GROUP_HEX ───────┐        groupsAt ── members (present, seating order)
                             │        penOf ───── who holds the pen now
                             ▼            │
                      lib/groupGrid.ts    │
                      ┌───────────────────▼──────────────────────┐
                      │ gridOf → GridColumn { members, pen, … }  │
                      │ cellAvatars(avail, seats)                │
                      │   → { size, gap, text }  (28 … 16 px)    │
                      └───────────────┬──────────────────────────┘
                                      │ (pure; lib/groupGrid.test.ts)
                                      ▼
                  app/teacher/WhereGroupsAre.tsx · GroupGrid
                  ┌──────────────────────────────────────────────┐
                  │ useLayoutEffect: narrowest [data-cell]        │
                  │   offsetWidth − 2·CELL_PAD ─► cellAvatars     │
                  │   writes --cell-av / -gap / -text on the grid │
                  │   again on resize + document.fonts.ready      │
                  │   (no state, no re-render)                    │
                  └───────────────┬──────────────────────────────┘
                                  ▼
                     cell on the board  ┌─────────────────────┐
                     faint inset ring   │ ( SO ) JW  ZH  LO   │  ring: pen-holder only
                     in the group hue   └─────────────────────┘  avatars: components/ui Avatar
                                                                  sized by the CSS variables
```

Files:

- `lib/groupGrid.ts` — `AVATAR_MAX` (28, ticket 319's size), `AVATAR_MIN` (16, where initials stop being readable),
  `AVATAR_RING` (2, drawn outside the avatar, so the row needs it at each end) and `cellAvatars(avail, members)`, which
  returns the avatar size, the gap between them (wider while they are near full size, and always clearing the ring) and
  the initials' size. Pure, so the fit is a unit test rather than a screenshot.
- `app/teacher/WhereGroupsAre.tsx` — `GroupGrid` measures the narrowest cell before paint and writes `--cell-av`,
  `--cell-av-gap` and `--cell-av-text`; the cell on the board draws `column.members` in seating order, the pen-holder's
  avatar ringed in the group's colour, over a fainter inset ring on the cell itself.
- `components/ui.tsx` — `Avatar` takes an optional `style`, so a measured size can be passed in place of its size classes.

Everything else of ticket 319 is untouched: the tones, the "n/m" head, the chip, the class review band, the cards on the
right, and the grid's own geometry (a cell's width is its share of the row, whatever is drawn inside it).
