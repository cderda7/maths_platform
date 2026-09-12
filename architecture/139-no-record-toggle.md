# 139 · No recorded / not-recorded switch on the diagnostic

Routes: `/teacher` (the card), `/teacher/mistakes` (the flyouts), `/student` (the modal).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/DiagnosticPush.tsx` | Header row is the chip alone; `recorded` state, the switch and the response line's "· recorded" removed; the push action carries `questionId` and the written question only. |
| `app/student/screens/DiagnosticModal.tsx` | No `recorded` prop, no pill. |
| `app/student/StudentApp.tsx` | Passes no `recorded`. |
| `lib/session.ts` | `diagnostic: { questionId, question? }`, `diagnosticAnswers[]` without the flag, `diagnostic/push` without it. |
| `lib/session.test.ts` | The three diagnostic tests follow the shape. |

## How it connects

```
 DiagnosticPush (class view card · mistake view flyout)
   [LIVE DIAGNOSTIC]                          ← the whole header row now
   example | make your own
   send to class ──▶ dispatch diagnostic/push { questionId, question? }
                                   │
                                   ▼
 lib/session.ts  diagnostic { questionId, question? } ──▶ /student DiagnosticModal (eyebrow · question · options · Send)
                 diagnosticAnswers [{ questionId, option, question? }] ◀── diagnostic/answer
                                   │
                                   ▼
 DiagnosticPush response line  "Sam · C · right"        (was "… · right · recorded")
```

## Verified by

vitest (403), eslint, tsc, `next build`; the mistake-view click-through (`mistakes.mjs`) with the switch checks removed: no switch or "recorded" text in any panel or the modal, a fixture push and a written push each answered by the student, the response lines, ownership and the flyout geometry unchanged.
