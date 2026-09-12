# 172 · Drop or upload a whole PDF; it splits into problems, one tile each, with the page on the tile

Route: `/teacher/assignments/create`, the same drop target, paste and Upload as ticket 171, now taking PDFs.

## Files touched

| File | What it does |
|---|---|
| `lib/pdfPages.ts` | `pdfjs-dist` (new dependency, 6.3) loaded on first use only (`import("pdfjs-dist")`), its worker the package's own bundled by Next through `new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url)` (it lands in `.next/static/media`). `openPdf(blob)` → `{ doc, pages, close }`; `pageCount`; `renderPage(doc, page, { scale | side })` to a canvas; `pageThumb` (a 160 px JPEG data URL); `fitScale` the pure scaling. |
| `lib/upload.ts` | `partitionDrop` takes PDFs (by type, or by `.pdf` name when the browser gave none) up to five per drop, its own cap beside the images' twenty, ten MB each; a Word file (`.doc`, `.docx`, or its mime) is left out as `docx`; `isPdfFile` exported. `dropNote`: "Twenty pictures at a time; N not added" · "Five PDFs at a time; a.pdf, b.pdf not added" · "chapter2.docx: export it as a PDF" · "x.txt: not a picture or PDF". `ReadFailure` gains `too-many-pages`; `failureMessage(reason, name, pages)` words it "worksheet.pdf has 14 pages; 10 at most" (no Try again). |
| `lib/extractClient.ts` | `fileToSource` sends a PDF as a `{ kind: "pdf" }` source (the route's native document block, ticket 170), an image as before. |
| `app/teacher/assignments/create/CreateAssignment.tsx` | A PDF's marker carries its first page as its thumbnail (`firstPageThumb`). `run` opens a PDF once in the browser: over ten pages, the marker becomes the page-count message before anything is sent; otherwise each draft's page is drawn once (`thumbFor`, memoised per page) and becomes that tile's thumbnail, so tiles from one page share a picture and pages differ; the document is closed at the end. The file input accepts `application/pdf`. Several files still run in parallel, each into its own group in drop order. |
| `app/teacher/assignments/create/QuestionTile.tsx` | The ghost reads "Type a question, or drop a picture or PDF". The tile's source label ("4(a) · p. 2", from ticket 171) now has pages to show. |
| `lib/upload.test.ts`, `lib/extractClient.test.ts`, `lib/pdfPages.test.ts` | The PDF cap and the images' cap each their own, a `.pdf` with no type, `.doc` as Word, the note's wording for every reason, the page-count message; a PDF source by type and by name; `fitScale` on an A4 page. Page drawing is proved in the browser (the click-through), not in Node. |
| `package.json`, `package-lock.json` | `pdfjs-dist@^6.3.289`. |

## How it connects

```
 worksheet.pdf dropped / pasted / picked
        │ partitionDrop: ≤ 5 PDFs and ≤ 20 pictures per drop, ≤ 10 MB each; .docx → "export it as a PDF"
        ▼
 addFiles ── putSource (IndexedDB) ── openPdf ▶ pageThumb(1) ──▶ PendingItem (the first page in its corner) before the ghost, in drop order
        │
        ▼
 run ── openPdf ──┬── pages > 10 ──▶ MessageTile "worksheet.pdf has 14 pages; 10 at most" (never sent)
                  └── fileToSource → { kind: "pdf", data } ──▶ POST /api/extract (a native document block; the model reads the PDF itself)
                        │ draft {page, label, stem, tex} ──▶ thumbFor(page) (pdfjs draws the page once, 160 px) ──▶ draftItem ──▶ an unconfirmed tile "Q13  4(a) · p. 2" with that page in its corner
                        │ done ──▶ the marker goes · close() the document
                        ▼
 the grid: ten tiles for the three-page fixture, 1 · p. 1 … 9(a) · p. 3, 9(b) · p. 3 (prose only); the bar "Discard 10 · Add 10 · Continue"
```

The API and the browser each do what they are good at: the document block goes to the model untouched, and `pdfjs-dist` draws pages only for the thumbnails (and, in ticket 173, the figure crops). The worker is a separate bundle fetched the first time a PDF is opened; no other screen loads it.

Was: a PDF was named "not yet" in the bar's note and never sent.

## Verified by

vitest (501), eslint, tsc, `next build` (the pdfjs worker at `.next/static/media/pdf.worker.min.*.mjs`); `pdf172.mjs` (session `28d378ac-…`'s scratchpad, app on 3313 / CDP 9613), 19 checks in fixture mode at 1400×1000: the ghost's new placeholder and the input's `accept`; `worksheet.pdf` dropped → a pending tile "Reading worksheet.pdf…" with a JPEG page thumbnail → ten unconfirmed tiles labelled "1 · p. 1" … "8 · p. 3", "9(a) · p. 3", "9(b) · p. 3" (9(b) prose only), every thumbnail a drawn page titled with the file, tiles on one page sharing it and pages differing, the bar "Add 10"; two PDFs dropped together show two pending tiles at once and twenty tiles arrive with the first file's ten before the second's; six PDFs → "Five PDFs at a time; chapter5.pdf not added" and five read; a hand-written 14-page PDF → "chapter.pdf has 14 pages; 10 at most" with Dismiss and no Try again; a docx → "chapter2.docx: export it as a PDF" and nothing added; an image and a PDF in one drop both extract with the image's tile first; the file input reads a PDF; at 1280×800 the bar sits inside the window with no sideways overflow. Screenshots `172-pending.png`, `172-worksheet.png`, `172-two-pending.png`, `172-pages.png`, `172-mixed.png`, `172-1280.png` read by eye.
