# Edexia · Maths

- `curr_version/` — the current build: a demo of the live, closed-loop maths feedback product
  (student iPad in a desktop browser, teacher view and projected board in other tabs, or all of
  them in one tab at `/split`). Spec v2
  (tickets 01–16) and spec v3 (tickets 17–25: review pathways, whole-class review, detective
  feedback, force submit, persisted ink, the copy rule) are done. See `curr_version/README.md`
  for the demo script and deep links, `curr_version/specs/` for the specs, `curr_version/tickets/`
  and `curr_version/architecture/` for the per-ticket record.
- `roughdraft_sept7/` — the design-only QCE Methods mockup built on 7 Sep 2026, kept for reference.
  See its own `README.md`, `decisions_log.md` and `ARCHITECTURE.md`.

The root `package.json` delegates into `curr_version/`:

```bash
npm run install:app
npm run dev      # http://localhost:3000
npm run build
npm run lint
npm test         # vitest
```

`ARCHITECTURE.md` at the root is the running architecture record for the current build;
`DECISION_LOG.md` records significant technical decisions and their tradeoffs;
`FUTURE_FEATURES.md` collects every idea deferred along the way (project policy: err on the side
of too much).
