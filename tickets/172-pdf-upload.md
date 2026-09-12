# 172: Drop or upload a whole PDF; it splits into problems, one tile each, with the page on the tile

**What to build:** The drop target and Upload from ticket 171 accept PDFs: up to five per drop, ten pages each, ten MB each. A PDF goes to the extraction route as a native document; its drafts stream in as unconfirmed tiles in reading order, each tile carrying the worksheet's own numbering and its page ("4(a) · p. 2") and a thumbnail of that page drawn in the browser by `pdfjs-dist`. The ghost tile's prompt widens to "Type a question, or drop a picture or PDF".

**Blocked by:** 171.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "ALSO want an option to drag & drop a whole doc (or upload a whole doc) with the idea that the program can auto split it into problems." And on the caps: "only allow up to 5 pdf uploads at a time. stream".

The interview settled: PDF and images day one, docx deferred (Q6, Q13); the whole document is extracted and the teacher ticks what to keep rather than marking a region first (Q8); pages are drawn client-side with `pdfjs-dist` for thumbnails and figure crops while the API takes the PDF natively (Q27); several files run in parallel, grouped by file in drop order (Q26); sub-parts are one tile each with the stem repeated (Q20).

## Solution

- **Accept.** The file input's `accept` and the drop filter admit `application/pdf`. Per drop: five PDFs, the extras not added and named in the bar ("Five PDFs at a time; chapter2.pdf not added"); an image and PDF mix counts each cap separately. A PDF over ten pages (read client-side with `pdfjs-dist` `numPages` before anything is sent) becomes a message tile "worksheet.pdf has 14 pages; ten at most". Over ten MB, refused by name as images are.
- **Send.** Base64 in a `{ kind: "pdf" }` source (ticket 170's route already takes it as a document block). Each PDF is its own request; five at once are five shimmer tiles at once, each group streaming independently into its own position in drop order.
- **Pages in the browser.** `pdfjs-dist` added as a dependency, the worker bundled by Next (`new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url)`), loaded only on the create screen (dynamic import). `lib/pdfPages.ts`: `pageCount(blob)`, `renderPage(blob, page, scale)` to a canvas, used for the tile's thumbnail at 160 px and, in ticket 173, for figure crops at full scale. Decision log: native PDF to the API and `pdfjs-dist` in the browser, rather than rasterising on the server and sending images.
- **Tiles.** As ticket 171's, with `page` set and the corner label "4(a) · p. 2" (label from the model, page from the event); the thumbnail is the draft's page. Ten problems from the three-page fixture, in page then reading order; the sub-parts fixture gives one tile per part with the stem repeated.
- **Docx.** Not accepted: named in the bar's note as "chapter2.docx: export it as a PDF". Deferred (future features).
- **Tests.** The PDF cap and page-count refusal, the mixed-drop counting, `pdfPages` against the fixture (page count, a rendered page's size), the group ordering of parallel streams in the reducer.
- **Docs.** This ticket, `architecture/172.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] in fixture mode, dropping `worksheet.pdf` shows a shimmer tile (its first page in the corner) then ten tinted tiles in order with page thumbnails and "N · p. M" labels, 9(a) and 9(b) one tile each; Upload via the file input does the same
- [x] two PDFs dropped together stream into two groups in drop order, both shimmers visible at once
- [x] six PDFs: five added, the sixth named in the bar; a generated 14-page PDF is refused on its tile with its page count; a docx is named with "export it as a PDF"
- [x] an image and a PDF in one drop both extract, the image's tile first
- [x] the ghost tile reads "Type a question, or drop a picture or PDF"
- [x] vitest (501), eslint, tsc, `next build`, headless click-through (`pdf172.mjs`, 19 checks at 1400×1000 with the bar at 1280×800)
