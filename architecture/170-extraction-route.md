# 170 · Problem extraction: one API route turns typed text, images and PDFs into problem drafts, streamed

Route: `POST /api/extract` (no screen in this ticket; ticket 171 puts the create screen in front of it).

## Files touched

| File | What it does |
|---|---|
| `lib/extract.ts` | Pure and shared by both ends: the `Source` shape (text, image, pdf) and caps (`MAX_FILE_BYTES` 10 MB, `MAX_IMAGES` 20, `MAX_PDFS` 5, `MAX_PAGES` 10, `MAX_TEXT_CHARS`) with `parseExtractRequest`; `pdfPageCount` (page objects counted without a PDF library, null when unknown); the brief `extractSystem()` and the one user turn `extractMessages()` (an image as an image block, a PDF as a native document block, text as text, each under "Source N: name"); `parseDraftLine` (one line the model wrote → a `Draft` or null), `parseExtractEvent` and `readExtractEvents` (the route's NDJSON stream → events, for the client); `LineBuffer`; `sourceHash` (SHA-256 hex, both ends); `base64Bytes`/`base64ToBytes`. `EXTRACT_MODEL` and `EXTRACT_MAX_TOKENS` separate from the help chat's. |
| `app/api/extract/route.ts` | The route, on the help chat's pattern: body checked (400 / 413), the PDF page cap, then `EXTRACT_FIXTURES=1` → the fixture stream, else `client.beta.messages.stream` with the first event awaited before the response commits (503 `not-configured`, 429 `busy`, 502 `unavailable`); the model's text cut into lines as it arrives, each parsed and sent as `{type:"draft",…}` at once, fences and stray lines dropped and counted, then a `done` per source (or `error` "declined" for a source the model refused with nothing emitted). `application/x-ndjson`. |
| `data/extract-fixtures.ts` | What the route answers in fixture mode: the manifest's drafts keyed by the file's hash (`FILE_FIXTURES`), a `TEXT_FIXTURES` table of plain-English lines the shorthand parser cannot read, otherwise typed text through `parseQuestion` (`lib/mathInput`) one draft per pasted line, and `noFixture` for a file nothing matches (so a wrong fixture shows rather than nothing). |
| `scripts/render-extract-fixtures.mjs` | Renders the fixtures from the demo set with KaTeX in a headless Chrome (CDP, port 9611, refuses a taken port, ends the browser and deletes its profile): `one-problem.png`, `worksheet.png` (four problems, an axes figure on the third), `worksheet.pdf` (three A4 pages, ten drafts, 9(a)/9(b), figures on pages 2 and 3), and `manifest.json` with each file's SHA-256 and drafts, figure boxes normalised to the sheet or page. |
| `fixtures/extract/*` | The rendered files and the manifest, committed; `lib/extract.test.ts` fails if the files and the manifest drift apart. |
| `lib/extract.test.ts` | 21 tests: request validation and every cap, base64 sizing, the PDF page count on the real fixture, the brief's rules, the message blocks, the draft-line parser (full, minimal, defaults, everything it must drop, a bad figure dropped with the draft kept), the event parser, the line buffer across chunk and CRLF boundaries, the stream reader across a split multi-byte character, the hash, the manifest against the files on disk and its expected shape, fixture lookup by hash and by text. |

## How it connects

```
 create screen (ticket 171) ── POST /api/extract { sources: [ text | image(base64) | pdf(base64) ] }
                                       │
                                       ▼
 app/api/extract/route.ts
   parseExtractRequest ──▶ 400 bad-request · 413 too-large (a file > 10 MB, > 5 PDFs, > 20 images, > 10 pages)
   EXTRACT_FIXTURES=1 ──▶ data/extract-fixtures.ts ── sourceHash(bytes) ──▶ fixtures/extract/manifest.json drafts
   │                                                 └─ text ──▶ TEXT_FIXTURES, else lib/mathInput parseQuestion per line
   │                                                 └─ no match ──▶ "No fixture for <name>"
   └─ else new Anthropic().beta.messages.stream({ model: EXTRACT_MODEL, system: extractSystem(), messages: extractMessages(sources), fallbacks: "default" })
        first event awaited ──▶ 503 not-configured · 429 busy · 502 unavailable
        text deltas ──▶ LineBuffer ──▶ parseDraftLine per line ──▶ {"type":"draft", source, page?, label?, stem, tex, figure?}\n   (at once, in reading order)
                                                    dropped lines counted ──▶ {"type":"done", source, dropped?}\n per source
                                                    refusal with nothing emitted ──▶ {"type":"error", source, reason:"declined"}\n
                                       │
                                       ▼
 client: readExtractEvents(res.body) ──▶ one ExtractEvent per line as it arrives ──▶ tiles (ticket 171)
```

The model writes one JSON object per line and nothing else (`extractSystem`): sub-parts one line each with the stem repeated, typed shorthand / plain English / TeX all normalised, a pasted list split, no solutions or answers (ASSUMPTIONS.md: a symbolic grading engine sits behind every problem), headings and printed answers skipped, a figure box only for a diagram that is part of the problem.

Was: the help chat was the only model call; the create screen's only contract was `lib/mathInput`'s shorthand, and nothing typed or uploaded had a model or a file behind it.

## Verified by

vitest (475), eslint, tsc, `next build`; `extract170.mjs` (session `28d378ac-…`'s scratchpad, app on 3311), two runs: plain (no key, no flag) — 503 `not-configured` before any stream, 400 on a bad and on an unparseable body, 413 on a sixth PDF and on a file over ten MB (5 checks); with `EXTRACT_FIXTURES=1` — `one-problem.png` streams one draft then `done` as `application/x-ndjson`, `worksheet.png` four drafts labelled 1–4 with the figure on the third, `worksheet.pdf` ten drafts pages 1,1,1,1,2,2,2,3,3,3 with 9(a)/9(b) and figures on pages 2 and 3, every draft arriving a beat (120 ms) after the last, two sources in one request (typed text through the parser and the plain-English table as source 0, the image as source 1, a `done` each), an unknown file's "No fixture" draft, whitespace text 400 (8 checks). The fixture PNGs read by eye (`fixtures/extract/*.png`). Not run: the live model on the one-problem fixture, since this machine has no key and no CLI profile; the acceptance item stays open until someone with a key runs it once.
