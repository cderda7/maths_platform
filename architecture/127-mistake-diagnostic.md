# 127 · A live diagnostic beside every problem on the mistake view

Routes: `/teacher/mistakes` (the panels), `/teacher` (the same card, the new switch labels), `/student` (the modal the push opens).

## Files touched

| File | What it does |
|---|---|
| `data/diagnostic.ts` | `Diagnostic.problemId`; ten fixtures, one per problem, each aimed at that problem's slip. `DIAGNOSTICS[0]` stays the class view's example. |
| `lib/diagnostic.ts` | `diagnosticFor(problemId)`; `pushBelongsTo(push, example, problemId)`, which panel a waiting or answered push belongs to; `customQuestion(…, problemId)` files a written question under its problem. |
| `app/teacher/DiagnosticPush.tsx` | The push panel, now with `example`, `problemId`, `collapsible`. Closed: the chip alone (button, chevron, waiting badge). Open: the 380 px card. Pending band, Withdraw and response only in the owning panel; other panels' send off while a push waits. Switch: "respond online" / "not recorded". |
| `app/teacher/mistakes/TeacherMistakes.tsx` | Each problem a flex row: the card `flex-1 min-w-0`, the panel `shrink-0` beside it. |
| `lib/diagnostic.test.ts` | Fixtures per problem, the fallback, ownership of a push, the problem a written question carries. |

## How it connects

```
 /teacher/mistakes  TeacherMistakes
 ┌──────────────────────────────────────────────┐  ┌───────────────────────────────────┐
 │ Card  Q3 (x-3)(x+2)=6 · students · slips     │  │ DiagnosticPush (collapsible)      │
 │ flex-1 min-w-0                               │  │ closed: [LIVE DIAGNOSTIC ›] chip  │
 └──────────────────────────────────────────────┘  │ open:   card 380px                │
                                                   │   example ← diagnosticFor("q3")   │
                                                   │   make your own → customQuestion  │
                                                   │        (…, problemId "q3")        │
                                                   │   send to class ─┐                │
                                                   └──────────────────┼────────────────┘
                                                                      │ dispatch diagnostic/push
                                                                      ▼
 lib/session.ts  session.diagnostic {questionId, recorded, question?}  ── one slot ──▶ /student DiagnosticModal
                 session.diagnosticAnswers[]  ◀── diagnostic/answer ─────────────────────┘
                                │
                                ▼  pushBelongsTo(push, example, problemId)
   Q3 panel: fixture id matches → Waiting · Withdraw · response      Q2 panel / class view: send off ("Another diagnostic is waiting")
   class view (no problemId) and Q2 panel share the Q2 fixture: a fixture push shows on both

 data/diagnostic.ts  DIAGNOSTICS[q1…q10]  ──▶ diagnosticFor(problemId)  ──▶ the example tab
                     DIAGNOSTICS[0] (q2)  ──▶ /teacher DiagnosticPush (default example, not collapsible)
```

## Verified by

vitest (395), eslint, tsc, `next build`; a headless run (`mistakes.mjs`, teacher and student tabs sharing one profile): nine collapsed chips centred on their headers, every card ending at the same x; Q3's panel opening at 380 CSS px beside the card with Q3's question; the switch labels; a fixture push waiting in Q3's panel only with Q2's send off; the student answering and the response line; a written question under Q2 (band in Q2 only, the collapsed chip badged at the same width, the response on the own tab only); the class view's labels and its fixture push shared with Q2's panel; the chip back in place after collapsing.
