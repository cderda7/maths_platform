# 92 · The chat sits under the read-as lines, bubbles gathered above the box to write in

Routes: `/student?stage=practice` (the warm-up), the mid-set practice overlay.

## Files touched

| File | What it does |
|---|---|
| `components/PracticePad.tsx` | The right column renders `ReadAs` always (`max-h-[45%] shrink-0` while the chat is open, `flex-1` otherwise) and `HelpChat` under it when open |
| `components/HelpChat.tsx` | `className` prop; the bubble list is a flex column whose empty first item takes the slack (`mt-auto`), so bubbles gather at the foot and scroll when long |

No logic changed; two components' layout only.

## How it connects

```
   <aside flex-col>                              before (ticket 69–86)          after
   ┌──────────────────────────────┐              ┌────────────────────┐        ┌────────────────────┐
   │ READ AS                      │ ReadAs       │ CHAT         close │        │ READ AS            │
   │  x/4 + x/2 = 9/2 + 6         │ max-h 45%    │ ┌────────────────┐ │        │ [x/4 + x/2 = …]    │ ◄─ still lit by a hint word
   │  …  (scrolls past 45%)       │ when chat    │ │ tutor bubble   │ │        │ [x/4 + x/2 = 21/2] │
   ├──────────────────────────────┤ open         │ └────────────────┘ │        ├────────────────────┤
   │ CHAT                   close │ HelpChat     │                    │        │ CHAT         close │
   │                              │ flex-1       │                    │        │                    │
   │        (slack: li.mt-auto)   │              │      (empty)       │        │   (slack)          │
   │ ┌──────────────────────────┐ │              │                    │        │ ┌────────────────┐ │
   │ │ Let's talk more about…   │ │ bubbles      │                    │        │ │ tutor bubble   │ │
   │ └──────────────────────────┘ │ at the foot  │                    │        │ └────────────────┘ │
   │ [in your own words…] (send)  │              │ [in your own words]│        │ [in your own words]│
   ├──────────────────────────────┤              ├────────────────────┤        ├────────────────────┤
   │        Skip to the set  Next │ footer       │  Skip · Next skill │        │  Skip · Next skill │
   └──────────────────────────────┘              └────────────────────┘        └────────────────────┘
                                                  the read lines were gone      the read lines stay
```

## Verified by

vitest (334 tests, unchanged); eslint and tsc clean; `next build`; headless Chrome on the built app
(port 3184, CDP 9484) on the fractions warm-up: one stroke read, hint 1, "another hint · Talk it
through →": the read-as line is still in the column (one typeset line), the chat's strip starts at
y 255 under it, the one bubble's bottom edge sits 20px above the message box; hovering "x terms"
lights two pieces in that line and the line carries `data-highlight`; four more strokes (five lines),
chat reopened: the read-as list is capped (its list scrolls) and the chat strip starts at y 482 with
the bubble still directly above the box. Screenshots of both states.
