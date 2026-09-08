# Edexia · Maths

- `roughdraft_sept7/` — the design-only QCE Methods mockup built on 7 Sep 2026 (Next.js 16, static data,
  simulated grading). See its own `README.md`, `decisions_log.md` and `ARCHITECTURE.md`.

The root `package.json` only delegates into the mockup, so from here:

```bash
npm run dev      # → roughdraft_sept7
npm run build
npm test         # vitest, the simulated step evaluator
```

or `cd roughdraft_sept7` and use its scripts directly.
