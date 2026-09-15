# 321: Design tuner Borders: problem set cards and homework cells

## Files touched

| File | What it does |
| --- | --- |
| `app/globals.css` | `--color-set-border`, `--color-hw-border` (`@theme`); `--set-card-border-width/-style`, `--hw-card-border-width/-style` (`:root`); `@utility set-card-edge` / `hw-card-edge`: clear 1px border + inward outline from the tokens. |
| `app/teacher/Classroom.tsx` | Problem set cards and open homework cells use the edge utilities and outline colours; the sent cell keeps its own dashed border. |
| `app/student/StudentClassroom.tsx` | Sam's set cards and homework cells use the edge utilities; state colours (To do, hover, completed, missed) become outline colours. |
| `lib/designTokens.ts` | `BORDER_KINDS`, `BORDER_STYLES`, `BORDER_MAX_PX`: which tokens the Borders section edits. |
| `components/DesignTuner.tsx` | Borders section (width slider, style switch, colour editor per kind); border colours out of the Colours list; ⌥-click on a box opens Borders. |
| `lib/designTokens.test.ts` | Defaults equal today's look; one kind's proposal leaves the other and `line` alone through save. |

## How it connects

```
 components/DesignTuner.tsx  ── Borders ◄321 ──────────────────────────────┐
   Width  0–4px ─┐   Style solid/dashed/dotted ─┐   Colour (OKLCH) ─┐       │
                 ▼                              ▼                   ▼       │
 lib/designTokens.ts  BORDER_KINDS ◄321 { set | hw → width, style, color }  │
                 │                                                          │
   proposal ─▶ :root:root{ --set-card-border-width: 4px; … }  (live)        │
   Save ─────▶ app/api/dev/design-tokens ─▶ setTokenValues ─▶ globals.css ◄─┘
                                                                  │
 app/globals.css ◄321                                             ▼
   @theme  --color-set-border  --color-hw-border
   :root   --set-card-border-{width,style}  --hw-card-border-{width,style}
   @utility set-card-edge / hw-card-edge
       border: 1px solid transparent        (layout as before)
       outline: width style, offset −width  (drawn inward, moves nothing)
             │                                         │
             ▼                                         ▼
 app/teacher/Classroom.tsx                   app/student/StudentClassroom.tsx
   Card        set-card-edge outline-set-border   SetCard  set-card-edge  (To do: outline-accent-line)
   HW cell     hw-card-edge  outline-hw-border    HW cell  hw-card-edge   (completed green, missed red)
   sent cell   own dashed border (untouched)
```
