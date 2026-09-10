# 56: The header uses the real Edexia logo everywhere; the confidence screen's header no longer says "Before you start"

**What to build:** Replace the hand-drawn four-dot SVG in the `Brand` wordmark with Edexia's actual brain-network logo, on every header that renders `Brand` (student, teacher, home, split view). On the student confidence screen, drop "Before you start" from the top bar; the eyebrow above "How confident are you?" keeps it.

**Blocked by:** —

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The wordmark in every header used a placeholder mark drawn during the mockup (four dots around a centre). The product's real logo is the purple brain-network mark from edexia.com. On the confidence screen the same words, "Before you start", appeared twice within an inch of each other: as the top-bar crumb beside the wordmark and as the eyebrow above the headline.

## Solution

`components/Brand.tsx`'s `BrandMark` renders `public/edexia-logo.png` (the 512 px mark downloaded from edexia.com) through `next/image` with a static import, at the same 24 px square as the old SVG, so every `Brand` caller changes at once. The `confidence` entry is removed from `StudentApp`'s `CRUMB` map; the stage now falls through to the default crumb, the class name, the same as the overview screen before it. The `Eyebrow` in `ConfidenceScreen` is untouched.

## Acceptance

- [x] Student, teacher, home and split headers show the brain-network logo at 24 px beside "Edexia · Maths"
- [x] Confidence screen top bar reads "Edexia · Maths  11 Methods B"; the eyebrow above "How confident are you?" still reads "Before you start"
- [x] vitest, eslint, tsc, `next build`; headless-Chrome screenshots of the four headers; architecture note and root docs
