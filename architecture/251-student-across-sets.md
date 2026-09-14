# 251: A student across every set: the holistic assessment page

> Since ticket 269 the grid has sets down and categories across; since ticket 276 (`architecture/276-patterns.md`) habits are called patterns, only patterns with an occurrence on the class's five most recent sets show (with every set they occurred on), the section has no header and Sam's live set no live pill.

## Files touched

| File | What it does |
| --- | --- |
| `lib/holistic.ts` | `holisticView(student, { classroom, session, now })`: the student's name, initials and the story sheet's line; one column per set the Classroom holds (PS1–PS5, and PS6 once created), oldest first; a row per category with a status per set (`HolisticStatus`: the four colours, `unseen`, `absent`, `none`; a student in the set's `absent` list, ticket 250, reads absent in every category the set assesses, with no patterns); the patterns behind every result short of secure, grouped by category in canonical order, the same words on several sets one pattern with a ref per set (set, result, problems). Finished sets read `data/story.ts`; the live set reads `rosterEvidence`, and keeps a sheet pattern only on the problems the teacher has seen. `isHolisticStudent`. |
| `lib/holistic.test.ts` | Priya (secure, no patterns), Sam (PS6 live, equal to his Class View row), Liam (missing sets), Chloe (absent on PS6), the absence toggle both ways on live and finished sets, the grid equal to the sheet for all twenty, every sheet pattern on the page, a repeated pattern collapsing, mid-stream, the links. |
| `lib/assignments.ts` | `rosterEvidence(bundle, session, now)`: each student's evidence as the Class View reads it (moved out of `TeacherLive`); `NO_EVIDENCE`; `holisticHref(student, set?)`, `HOLISTIC_HREF` (`/teacher/students`, ticket 252), `isHolisticHref`; `assignmentReportHref` takes `{ work, from }`. |
| `app/teacher/TeacherLive.tsx` | Rows take their evidence from `rosterEvidence` (no behaviour change). |
| `app/teacher/students/HolisticPage.tsx` | The page: Back, eyebrow, avatar and name, the summary line; the grid card (set headers link to the report); the patterns in two columns, each ref "● PS4 · Q1, Q2" with each Q linking to that working. Waits for the session batch and the clock before drawing the grid. |
| `app/teacher/students/[id]/page.tsx` | Route from Holistic Assessment; Back → `/teacher/students`. 404 for an unknown student. |
| `app/teacher/a/[id]/students/[student]/page.tsx` | Route under a set (its layout, its tabs); Back → that set's Class View. |
| `app/teacher/a/[id]/report/page.tsx` | Reads `?work=` and `?from=` (a holistic path, else ignored). |
| `app/teacher/report/TeacherReport.tsx` | `ReportBody` opens on `work`'s problem working; with `from` its back button (ticket 266) reads "← Holistic Assessment" back to it. |
| `app/teacher/AssignmentContext.tsx` | `BackButton` takes a valued data attribute (the holistic Back names its origin). |
| `scripts/laptop-check.mjs` | Both routes (Tomas, Sam) and a pattern's working added: 72 route/size checks. |

## How it connects

```
 data/story.ts  STORY[student]: arc · cells[category][set] { status, patterns[{ text, problems }] }
      │
      │            lib/assignments.ts
      │              assignmentBundle(id, classroom) ── which sets the Classroom holds (PS6 once created)
      │              rosterEvidence(bundle, session, now) ◄── also TeacherLive's rows (one reading of the live set)
      │                     │
      ▼                     ▼
 lib/holistic.ts  holisticView(student, { classroom, session, now })
      │   absent on the set (bundle.absent, lib/absence.ts, 250) ─► absent in every assessed category, no patterns
      │   finished set ─► the sheet's cell and patterns
      │   live set     ─► hierarchyFor(rosterEvidence[student]) ; sheet patterns on seen problems only
      │   { student, summary, columns[], rows[category → status per set], patterns[category → text → refs] }
      ▼
 app/teacher/students/HolisticPage.tsx  (useClassroom · useBatchedSession 3 s · useNow)
      ▲                                      ▲
 /teacher/students/<id>                 /teacher/a/<set>/students/<id>   (AssignmentProvider: that set's tabs)
   Back ─► /teacher/students (252)        Back ─► /teacher/a/<set>/class
      │
      ├── set header ───────► /teacher/a/<set>/report?student=<id>&from=<this page>
      └── pattern "PS4 · Q1" ─► /teacher/a/pset-4/report?student=<id>&work=ps4-q1&from=<this page>
                                   │
                                   ▼
                       app/teacher/a/[id]/report/page.tsx ─ isHolisticHref(from)
                                   ▼
                       TeacherReport ▶ ReportBody(work, from)
                         working open on Q1 · "← Holistic Assessment" ─► from
```
