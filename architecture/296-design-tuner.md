# 296: Design tuner

## Files touched

| File | What it does |
| --- | --- |
| `components/DesignTuner.tsx` | The panel, client only. ⌥C opens it; it fetches the tokens, keeps a proposal (localStorage), and writes the changed values as one unlayered `:root:root{…}` `<style>` over the page. Space held disables that sheet (the saved design); ⌘Z undoes one gesture; ⌥-click matches an element's computed colours to tokens and opens their row. Sections: Colours (a row per family, red as gap + wrong until Split, OKLCH sliders whose tracks paint where they lead, shades that follow or detach), Markers (pill corners, dot corners, incomplete split/hatched and its line), Corners (one scale over `--radius-sm`…`3xl`). Save posts the changes. Its own look is fixed CSS, so tuning never restyles it. |
| `lib/designTokens.ts` | The pure model: `parseTokens` (declarations in `@theme` and `:root` blocks), `setTokenValues` (rewrites named values, everything else byte for byte, refuses unknown names and values that could leave their line), `colorFamilies`, `LINKS`, `proposedColors` (direct edits, links, shades following their main), `changedValues`, `scaleLength`. |
| `lib/oklch.ts` | hex ↔ OKLCH (Ottosson's OKLab), chroma lowered to fit sRGB, computed `rgb()` → hex. |
| `lib/designTokens.test.ts` | Round-trips every colour token, Chrome's own OKLCH reading of the red, gamut fitting, family grouping, the byte-for-byte rewrite, refusals, following, linking, splitting, corner scaling. |
| `app/api/dev/design-tokens/route.ts` | `next dev` only (404 otherwise). GET the tokens, POST `{values}` to rewrite them. Finds `app/globals.css` beside its own source, not under `process.cwd()`. JSON-only and same-origin. |
| `app/layout.tsx` | Imports and renders the tuner inside a `NODE_ENV === "development"` branch, so a production build carries none of it. |
| `app/globals.css` | Declares `--radius-sm`…`3xl` in `@theme` (Tailwind's values) and `--marker-pill-radius`, `--marker-dot-radius`, `--marker-half-angle`, `--marker-half-stripe` in `:root`; `.marker-half` paints the incomplete fill from them. The accent, secure and standout-soft animation rings read their tokens (`rgb(from var(--color-…) r g b / a)`) instead of copied literals. |
| `components/Tag.tsx` | `StatusDot`: pill corners and dot corners from the marker tokens; a half marker sets `--marker-color` and takes `.marker-half`. |
| `components/SkillColumns.tsx` | The labelled category pill's half fill through `.marker-half` (`--marker-rest` keeps its tinted right half). |
| `components/StatusKey.tsx` | The key's grey half dot through `.marker-half` and the dot corner token. |
| `README.md` | "Run it" names the tuner and its keys. |
| `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md` | The ticket row, why the tuner edits tokens, and what it leaves out. |
| `tickets/296-design-tuner.md` | The ticket, done. |

At the saved defaults every marker is pixel-identical to main (screenshot of the element against itself forced back to main's inline paint).

## How it connects

```
  ⌥C / ⌥-click / Space                        app/globals.css
        │                                   ┌──────────────────────────────┐
        ▼                                   │ @theme  --color-*  --radius-* │
 components/DesignTuner.tsx ◄296            │ :root   --marker-*            │
 ┌──────────────────────────────┐   GET     │ .marker-half { gradient from  │
 │ proposal (localStorage)      │◄──────────┤   --marker-half-* }           │
 │  colors / split / values     │  tokens   └──────────────▲───────────────┘
 │        │                     │                          │ rewrite values
 │        ▼                     │   POST {values}          │ (next dev HMR
 │ lib/designTokens.ts ◄296     ├──────────▶ app/api/dev/design-tokens ◄296
 │  proposedColors, changed…    │           route.ts (dev only, 404 in prod)
 │  lib/oklch.ts ◄296           │
 │        │                     │
 │        ▼                     │
 │ <style>:root:root{--x:…}     │──▶ every element painted with a token
 │  (disabled while Space held) │     ├─ Tailwind utilities (bg-gap, rounded-2xl…)
 └──────────────────────────────┘     └─ markers ◄296
                                          components/Tag.tsx StatusDot
                                          components/SkillColumns.tsx
                                          components/StatusKey.tsx
 app/layout.tsx ◄296 ── NODE_ENV === "development" ──▶ import + render tuner
```
