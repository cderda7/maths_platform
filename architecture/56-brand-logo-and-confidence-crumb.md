# 56 · The header uses the real Edexia logo everywhere; the confidence screen's header no longer says "Before you start"

Routes: every route with a header (`/`, `/student`, `/teacher/*`, `/split`); `/student?stage=confidence` for the crumb.

## Files touched

| File | What it does |
|---|---|
| `public/edexia-logo.png` | New. The real Edexia mark, 512 × 512 RGBA, fetched from `https://edexia.com/edexia-logo.png` |
| `components/Brand.tsx` | `BrandMark` is now a `next/image` of the static-imported PNG (empty alt, `aria-hidden`, `priority`) at the caller's size, default `h-6 w-6`; the hand-drawn four-dot SVG is gone. `Brand` itself is unchanged |
| `app/student/StudentApp.tsx` | The `confidence: "Before you start"` row is removed from `CRUMB`, so the confidence stage shows the default crumb, `ASSIGNMENT.className` |

## How it connects

```
   public/edexia-logo.png ──static import──▶ components/Brand.tsx
                                               BrandMark  (next/image, 24 px)
                                               Brand      = mark · "Edexia" · "· Maths"
                                                  │
          ┌───────────────┬───────────────────────┼──────────────────┐
          ▼               ▼                       ▼                  ▼
   app/page.tsx    app/student/StudentChrome   app/teacher/TeacherChrome   app/split/SplitView
                   header: Brand · crumb · name
                                 ▲
                   StudentApp    CRUMB[stage] ?? (working stages ? title : className)
                                 confidence ──▶ no entry ──▶ "11 Methods B"
                                 (the screen's own Eyebrow still says "Before you start")
```

## Verified by

vitest (272 tests); eslint and tsc clean; `next build`. A headless-Chrome run of the built app on
port 3113 opened `/student?stage=confidence`, `/teacher`, `/` and `/split`: each header's
`[data-brand] img` is complete with a 512 px natural size, rendered at 24 px (19 px on the
teacher chrome, which scales its bar); the confidence header text is "Edexia · Maths 11 Methods B
Sam Okonkwo SO" and exactly one element on the page reads "Before you start" (the eyebrow).
