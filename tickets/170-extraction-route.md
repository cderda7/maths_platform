# 170: Problem extraction: one API route turns typed text, images and PDFs into problem drafts, streamed

**What to build:** The one model call behind every way of adding a question to an assignment: an API route (`app/api/extract/route.ts`) and its lib (`lib/extract.ts`) that take one or more sources (a typed line or pasted list, a screenshot, a PDF) and stream back problem drafts, one JSON line per problem, each a stem and its TeX. No screen changes in this ticket; ticket 171 puts the route behind the create screen. A fixture mode behind an env flag makes the route deterministic for the click-throughs.

**Blocked by:** nothing.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "i need to set up a better system for assignment upload. for one, i want to have a setting where a teacher can take a screenshot elsewhere & drag & drop to the box to upload … (also a traditional click, upload via finder setting). in addition, the type a question doesn't really work. like i have it rn as needing to type in python, but that won't work in practice … ALSO want an option to drag & drop a whole doc (or upload a whole doc) with the idea that the program can auto split it into problems."

The interview (2026-09-12/13, see `DECISION_LOG.md` "One extraction funnel") settled that typed text, pasted images, dropped files and Finder uploads are four ways into one extractor whose output is always a list of problem drafts. Today the only model call in the app is the help chat (`app/api/help-chat/route.ts`); the create screen's "python" contract is the local shorthand parser `lib/mathInput.ts`, and nothing typed or uploaded has any model behind it.

## Solution

- **Route.** `POST /api/extract`, `runtime = "nodejs"`, modelled on the help chat route: `new Anthropic()`, credentials from `ANTHROPIC_API_KEY` or an `ant auth login` profile, the first stream event awaited before the response is committed so a failure is an HTTP status the client can read. Failures typed as the help chat's: `"bad-request"` (400), `"not-configured"` (503), `"busy"` (429), `"unavailable"` (502), plus `"too-large"` (413).
- **Request.** JSON: `{ sources: Source[] }` with `Source = { kind: "text", name?, text } | { kind: "image", name, mime, data } | { kind: "pdf", name, data }`, `data` base64. Caps enforced server-side as well as on the client: ten MB per file, twenty images or five PDFs per request, ten pages per PDF. Images go to the model as image blocks, PDFs as document blocks (native PDF input; no rasterising on the server), text as text.
- **Response.** `application/x-ndjson` newline-delimited JSON, one event per line, in the model's reading order: `{ type: "draft", source, page?, label?, stem, tex, figure? }` (`source` the index into the request, `page` 1-based for PDFs, `label` the worksheet's own numbering such as `"4(a)"`, `figure` a box `{ page?, x0, y0, x1, y1 }` normalised 0..1 on the page when a diagram belongs to the problem), `{ type: "done", source }`, `{ type: "error", source, reason }`. The client (ticket 171) parses lines as they complete; a malformed line is dropped and counted, never fatal.
- **Prompt.** `extractSystem()` in `lib/extract.ts`: one JSON object per line per problem, in reading order; sub-parts (a), (b), (c) one draft each with the shared stem repeated and the label carrying the part; the stem plain prose, the TeX in KaTeX-supported syntax; a typed line in calculator shorthand, plain English or TeX all normalised to the same shape; a pasted list split into one draft per problem; a figure's box only when a diagram is part of the problem; no solutions, no answers (see `ASSUMPTIONS.md`: a symbolic grading engine sits behind every problem). The prompt text is unit-tested for the rules it must state.
- **Model.** `EXTRACT_MODEL` and `EXTRACT_MAX_TOKENS` in `lib/extract.ts`, separate from the help chat's constants and initialised to its model; check the API reference (the `claude-api` skill) for the model and the document-input limits when building, not from memory.
- **Fixture mode.** `EXTRACT_FIXTURES=1` makes the route skip the model: each source is matched by the SHA-256 of its bytes (text by its exact string) against `data/extract-fixtures.ts` and its drafts stream back one per 120 ms, so the client's streaming path is exercised. An unmatched source in fixture mode returns a draft that says so, so a wrong fixture is visible. The fixtures are rendered from the demo set (`data/draft-seed.ts`) by `scripts/render-extract-fixtures.mjs` (headless Chrome + KaTeX): `fixtures/extract/one-problem.png`, `fixtures/extract/worksheet.png` (four problems, one with a small axes figure), `fixtures/extract/worksheet.pdf` (three pages, ten problems, one with sub-parts). No copyrighted textbook pages in the repo; a real worksheet can be added later.
- **Tests (vitest).** Request validation (shape, caps, base64), the NDJSON line parser shared with the client (`lib/extract.ts` `parseExtractLine`), the fixture lookup by hash, the system prompt's rules, the error mapping from SDK errors to the typed failures.
- **Docs.** This ticket, `architecture/170.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md` (the env flag and key).

## Acceptance

- [x] with no key and no flag, `POST /api/extract` answers 503 `not-configured` before any stream; a bad body 400; a source over ten MB or a sixth PDF 413
- [x] with `EXTRACT_FIXTURES=1`, each of the three fixtures streams its drafts one per line in reading order with `page` and `label` set where they apply, and `done` last; a typed text fixture returns its one draft; an unknown source returns the "no fixture" draft
- [ ] with a key, the one-problem fixture returns one draft whose TeX typesets in KaTeX (checked by hand once, recorded in the architecture note) — **not run**: this machine has no `ANTHROPIC_API_KEY` and no `ant` profile; open until someone with a key runs it once
- [x] vitest (475), eslint, tsc, `next build`, a node script against the running route in fixture mode and without it (`extract170.mjs`, 13 checks)
