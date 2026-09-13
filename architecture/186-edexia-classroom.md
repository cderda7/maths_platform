# 186 · Edexia Classroom: every assignment on one page

Routes: `/teacher` (the Classroom), `/teacher/groups` (the class's default groups, now with the back link).

## Files touched

| File | What it does |
|---|---|
| `lib/classroomCards.ts` (new) | The Classroom's cards, pure: `mistakeCount` (every wrong answer to a problem, one per student per problem: the Mistakes tab's rows), `topGap` (the exact slip cluster with the most different students across every problem, ties to the first seen in problem order), `assignmentCard(bundle, classroom, session, now)` (name, due, landing href, section live/past, status live / in review / done, submitted of total, mistakes, top gap), `sectionCards` (live above past, each in the order given), `classroomCards` (over the registry), `CLASS_SUBJECT`. |
| `lib/assignments.ts` | A registry entry's optional `name`, the set as a teacher writes it ("Problem Set 2 — Roots of a quadratic"; the fixture's `title` stays upper-cased for the student's eyebrow); `AssignmentBundle.name` is it, else the title, or a created set's own title when it differs from the fixture's. |
| `lib/classroomCards.test.ts` (new) | Mistake count, the top gap (across problems, one student per cluster, ties, two-leaf clusters, Problem Set 2's), the live card, in review and done, a stand-in finished set (Problem Set 1's shape, ticket 187) and sectioning with no live set. |
| `app/teacher/Classroom.tsx` (new) | The page: eyebrow "11MAM2 · Mathematical Methods · 20 students", "Edexia Classroom", "+ New assignment" on the title row (to the create screen), a LIVE section (or a dashed "Nothing live right now" note) above PAST (only when it holds a set); the page on the chrome's full container (the button's right edge on the header avatar's, the cards the same width); each card one link, its title the bundle's `name` in the display serif (31 layout px), the due date and arrow centred on the card (hover lifts the border and shadow, focus ring, the arrow nudges), the live line "● live · n/20 submitted · n mistakes so far" with a breathing green dot, the past line "done / in review · n/20 submitted · top gap: <chip>". Reads the classroom store, Sam's 3 s batches and the clock; the sections wait for the first batch so the counts never flash the empty class. |
| `app/teacher/page.tsx` | Renders `Classroom`. |
| `app/teacher/ClassroomList.tsx` (deleted) | Ticket 185's plain list. |
| `app/teacher/groups/TeacherGroups.tsx` | "← Edexia Classroom" above the eyebrow on the class defaults too, not only on an assignment's Groups tab. |
| `app/globals.css` | `.live-dot`: the live card's dot breathes a 6 px green ring on its own box-shadow (nothing moves); still under reduced motion. |

`TeacherChrome` already drew the Classroom header (no assignment tabs, a Groups link to
`CLASS_GROUPS_HREF`) from ticket 185, so it is unchanged.

## How it connects

```
 /teacher ─► app/teacher/page.tsx ─► Classroom.tsx
                                        │  useClassroom()          (localStorage + BroadcastChannel)
                                        │  useBatchedSession(3000) (Sam's session)
                                        │  useNow()                (1 s clock)
                                        ▼
                     lib/classroomCards.ts  classroomCards(c, session, now)
                        │
                        ├─ assignmentIds(c) ─► assignmentBundle(id, c)          lib/assignments.ts
                        │                        (name: registry name ?? title)
                        │
                        └─ assignmentCard(bundle, c, session, now)
                             ├─ assignmentStages ─► currentStageOf ─► section live | past,
                             │                                        status live | in review | done
                             ├─ submittedCount ◄─ rosterProgress ◄─ lib/progress.ts   (189: the stream)
                             ├─ mistakesByProblem(session, bundle)                    lib/mistakes.ts
                             │     ├─ mistakeCount ─► "n mistakes so far"
                             │     └─ topGap ──────► "top gap: <leaf short names>"
                             └─ assignmentHref(id) ─► /teacher/a/<id> ─► landing (Class | Mistakes)

 Classroom.tsx ── TeacherChrome (no provider) ── header: Brand · [Groups → /teacher/groups] · Ms Okafor MO
     ├─ "+ New assignment" ─► /teacher/assignments/create
     ├─ LIVE: cards with section "live"   (none: dashed note)
     └─ PAST: cards with section "past"   (none: no section)

 /teacher/groups ─► TeacherGroups ── BackToClassroom "← Edexia Classroom" ─► /teacher
```
