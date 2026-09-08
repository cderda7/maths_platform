# Decision log — Edexia · Maths (current build)

Significant technical decisions for the closed-loop demo in `curr_version/`. Newest at the bottom.
Product and pedagogy decisions inherited from the Sept 7 mockup are in
`roughdraft_sept7/decisions_log.md`.

## 2026-09-08 · Fresh app in `curr_version/`, kit ported from the roughdraft

**Decision.** Start a new Next.js 16 / React 19 / Tailwind 4 / KaTeX app in `curr_version/` and
copy in only the roughdraft's design tokens and small presentational kit (card, button, eyebrow,
tags, KaTeX wrapper, brand mark). Do not extend the roughdraft app.

**Context.** The v2 spec re-scopes the demo around a single scripted student loop on an iPad
frame plus a teacher tab. The roughdraft has eleven screens, three sample students and a
tutor-chat script that the demo doesn't want, and its navigation assumes a desktop product.

**Alternatives considered.** Extend the roughdraft in place (fastest start, but every screen would
need its nav and routing reworked and the dead screens would confuse a demo audience). Start from
`create-next-app` with no port (clean, but the visual language would drift from edexia.ai for no
reason).

**Tradeoffs.** Two apps in one repo until the roughdraft is deleted; root scripts now point at
`curr_version/` with `*:roughdraft` variants. Some duplicated kit code between the two.

**Defence.** The demo reads as the same product as the mockup and the marketing site from the
first screen, and nothing unrelated to the closed loop ships in the demo bundle.

## 2026-09-08 · iPad stage: true-size 1180×820 screen, scaled to fit

**Decision.** Student screens render inside a fixed 1180×820 logical-point landscape screen
(the 10th-generation iPad) with a dark bezel. The whole device is CSS-scaled down uniformly when
the browser viewport is smaller, never reflowed.

**Alternatives considered.** A responsive layout capped at iPad width (would look like a narrow
website, not a device). A fixed frame that overflows on small laptops (unusable on a 13-inch
screen when the demo is projected).

**Tradeoffs.** Text is slightly smaller than true size on small laptops; drawing input in later
tickets must divide pointer coordinates by the scale factor.

**Defence.** Every layout inside the frame is designed once at real iPad size, which is what the
demo is selling, and the frame still fits on any laptop.
