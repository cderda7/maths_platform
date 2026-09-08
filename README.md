# Edexia · Maths

- `curr_version/` — the current build: a demo of the live, closed-loop maths feedback product
  (student iPad in a desktop browser, teacher view in a second tab). Spec in `curr_version/spec.md`,
  tickets in `curr_version/tickets/`, per-ticket architecture notes in `curr_version/architecture/`.
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
`DECISION_LOG.md` records significant technical decisions and their tradeoffs.
