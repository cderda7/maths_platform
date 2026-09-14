# 265: The site's front page is the teacher's Edexia Classroom

## Files touched

| File | What it does |
| --- | --- |
| `app/page.tsx` | Now a server `redirect("/teacher")`. Prerendered by Next as a 307 with `location: /teacher`, so the address bar reads `/teacher` and Back skips `/`. |
| `app/page.test.ts` | Pins the redirect target (`next/navigation` mocked). |
| `app/demo/page.tsx` | The presenter's chooser, moved from `app/page.tsx`: the Student, Teacher and Smartboard cards (`data-board-link`), the one-tab split link (`data-split-link`) and Reset demo. Two small fixes: each card's "Open …" line sits at the card's foot, so all three line up, and the intro names the set in sentence case (`DEMO_DRAFT_TITLE`) instead of the student eyebrow's upper-cased title. |
| `README.md` | "Run it" says `/` opens the Classroom and the chooser is `/demo`; Reset demo sits on `/demo`; "Where things are" lists `app/page.tsx` and `app/demo/`. |
| `ARCHITECTURE.md` | The system diagram's app box: `app/page.tsx` redirects, `app/demo/` is the chooser. The ticket row. |
| `tickets/265-root-is-classroom.md` | The ticket, done. |

Nothing else pointed at `/` as the chooser. No component links to `/`: the `Brand` wordmark is a label rather than a link (ticket 184), the split view's panes are `/student`, `/teacher` and `/board`, and the assignment pages' "← Edexia Classroom" goes to `/teacher`. The scripts (`laptop-check.mjs`, `hint-box-sweep.mjs`) only open `/teacher…` and `/student…` routes.

## How it connects

```
 cold visitor                                presenter
      │ GET /                                     │ GET /demo
      ▼                                           ▼
 app/page.tsx ◄265                          app/demo/page.tsx ◄265 (was app/page.tsx)
 redirect("/teacher")                       ┌──────────────┬──────────────┬──────────────┐
 (static 307, Back skips /)                 │ Student·iPad │ Teacher      │ Smartboard   │
      │                                     │ /student     │ /teacher     │ /board       │
      │                                     └──────┬───────┴──────┬───────┴──────┬───────┘
      │                                            │              │              │
      │                                  Or see all three in one tab ─▶ /split ─▶ iframes of the three
      ▼                                            │              │
 /teacher ─▶ app/teacher/Classroom.tsx ◄───────────┼──────────────┘
   TeacherChrome: Brand (a label, no link) · Groups
   pinned: Edexia Classroom · + New assignment · LIVE (Set 6 once created)
   Past: PS5 … PS1
      │ a card
      ▼
 /teacher/a/<id>/… ── "← Edexia Classroom" ─▶ /teacher (never /)
                                                   ▼
                                           /student ─▶ StudentApp (IpadStage)
```
