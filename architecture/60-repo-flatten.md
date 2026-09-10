# 60 · Repo flatten: the app is the repo root

No routes, no product change. A layout move: `curr_version/*` → `/`, `roughdraft_sept7/` gone.

## Files touched

| File | What it does |
|---|---|
| everything under `curr_version/` | Renamed one level up with `git mv` (281 tracked paths). `app/`, `components/`, `lib/`, `data/`, `public/`, `scripts/`, `specs/`, `tickets/`, `architecture/`, the Next/TS/ESLint/PostCSS/vitest configs, `package.json`, `package-lock.json` |
| `roughdraft_sept7/**` | Deleted. Last present at `e40040c` |
| root `package.json` | The delegator (`npm --prefix curr_version …`, `*:roughdraft`) removed; the app's `package.json` takes its place, scripts unchanged (`dev`, `build`, `start`, `lint`, `test`, `check:laptop`) |
| `README.md` | The app's README, now the only one: `cd curr_version` dropped from "Run it"; a paragraph on `ARCHITECTURE.md` / `DECISION_LOG.md` / `FUTURE_FEATURES.md` / `tickets/` / `specs/` and the mockup's removal added above it |
| `.gitignore` | The app's list plus `.claude/worktrees/` from the old root file |
| `CLAUDE.md` | Layout section: the app is the root; install is `npm ci` here; the mockup is gone and where to find it |
| `ARCHITECTURE.md` | Title and intro no longer name a folder; all 59 note links are `architecture/…`; row 60 |
| `DECISION_LOG.md` | Intro points at the mockup's last commit; a 2026-09-10 entry for the flatten |
| `specs/spec2.md`, `scripts/laptop-check.mjs`, `architecture/01`, `/17`, `/25`, `tickets/01`, `/25` | Path mentions rewritten to root-relative or to "the app folder, since flattened" |

## How it connects

```
   before                                         after
   maths_platform/                                maths_platform/
   ├── package.json  (delegator) ─┐                ├── package.json   (the app's)
   ├── README.md     (orientation)│                ├── README.md      (merged)
   ├── .gitignore                 │                ├── .gitignore     (merged)
   ├── ARCHITECTURE.md            │                ├── ARCHITECTURE.md · DECISION_LOG.md · FUTURE_FEATURES.md · CLAUDE.md
   ├── DECISION_LOG.md            │                ├── app/ components/ lib/ data/ public/ scripts/
   ├── FUTURE_FEATURES.md         │                ├── specs/ tickets/ architecture/
   ├── CLAUDE.md                  │  npm --prefix  ├── next.config.ts tsconfig.json eslint.config.mjs
   ├── mock_inspo_photos/         │                │   postcss.config.mjs vitest.config.mts package-lock.json
   ├── curr_version/  ◀───────────┘                ├── mock_inspo_photos/
   │   ├── package.json README.md .gitignore       └── .claude/worktrees/   (gitignored, per-agent checkouts)
   │   ├── app/ components/ lib/ data/ …
   │   └── tickets/ architecture/ specs/           roughdraft_sept7/ ──▶ git history only (e40040c)
   └── roughdraft_sept7/  (Sept 7 mockup)

   Dependency rule unchanged: app ──▶ components ──▶ data ──▶ types.
   Worktrees under .claude/worktrees/<branch> now check out the app at their own root; `npm ci` there.
```

## Verified by

vitest, eslint, `tsc --noEmit` and `next build` run from the repo root against the moved
`node_modules` (no reinstall); a grep for `curr_version` and `roughdraft_sept7` outside
`node_modules`/`.next` finds only the deliberate history notes listed above.
