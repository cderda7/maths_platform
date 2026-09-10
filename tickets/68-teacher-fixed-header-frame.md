# 68: Teacher side: the bar never rides the rubber-band; only the content scrolls

**What to build:** On the teacher's laptop the Edexia bar takes up its banner at all times. When the page is scrolled past its end and bounces back (the macOS rubber-band), the content bounces and the bar does not move at all. The bounce itself stays.

**Blocked by:** 65

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), after ticket 65 made the bar sticky: "it kinda does this weird bounce when i get to the bottom of the page. i like that feature (the bounce) for the body of the web page, but just have the header like very fixed -- shouldnt' do the bounce thing, should just very literally take up that heading banner at all times." A sticky (or fixed) element pins to the scrolled document, and the browser's elastic overscroll moves the whole scrolled document, so the bar rode the bounce with everything else.

## Solution

The window is no longer the scroller on the teacher side. `TeacherChrome` is now a full-height frame: an unzoomed outer div takes the viewport height (`h-screen`), the zoomed inner frame fills it (`h-full`, flex column), the bar is a `shrink-0` row in that frame, and `main` beneath it is `flex-1 min-h-0 overflow-y-auto` with the old page container (`max-w-[1640px] px-6 py-12`) inside. The document never overflows, so no rubber-band can carry the bar; the content region overscrolls and bounces on its own. The `sticky top-0` from ticket 65 is gone since there is nothing for the bar to stick against.

Why the outer div: a `100vh` height inside the `zoom: 0.8` wrapper shrinks with the zoom to 80% of the window (measured: 730 of 913 px), while a percentage of an unzoomed parent fills it exactly.

## Acceptance

- [x] On every teacher route the document has no scroll overflow and `window.scrollY` stays 0 after real wheel input
- [x] The frame spans the viewport exactly (top 0 to `innerHeight`) under the 0.8 zoom; the bar's top edge is at 0 and the content region starts at the bar's bottom edge
- [x] Wheel input scrolls the content region to its end on the routes that overflow (`/teacher`, `/teacher/mistakes`, `/teacher/assignments/new`, `/teacher/whole-class`)
- [x] Inside the split view's teacher iframe the frame fills the iframe with no document overflow
- [x] eslint, tsc, vitest, `next build` pass
- [x] Architecture note and `ARCHITECTURE.md` row
