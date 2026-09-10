# 60: Repo flatten: the app is the repo root, the Sept 7 mockup deleted

**What to build:** No product change. The Next app that lived in `curr_version/` moves up one level so the repo root *is* the app (`app/`, `components/`, `lib/`, `data/`, `tickets/`, `architecture/`, `specs/`, `scripts/`, `public/`, the configs, `package.json` and lockfile). The delegating root `package.json` goes; the two READMEs and two `.gitignore` files merge into one each. `roughdraft_sept7/` is deleted outright. Every `curr_version/` and `roughdraft_sept7/` path in the docs becomes root-relative or a note of what used to be.

**Blocked by:** —

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-10): "rn there's roughdraft_sept7 & curr_version a layer down. i'd like to delete everything in roughdraft_sept7. i want curr_version to be moved out of its hidden layer & be one layer up." Two apps in one repo was a transitional state from ticket 01 (see the 2026-09-08 decision "Fresh app in `curr_version/`"); the mockup has not been touched since 8 Sep and every root script was a one-line delegation.

## Solution

`git rm -r roughdraft_sept7`; `git mv` of every tracked item in `curr_version/` to the root (281 renames, history intact); untracked `node_modules/`, `.next/`, `tsconfig.tsbuildinfo`, `next-env.d.ts` moved with them so nothing reinstalls. Collisions resolved as agreed in the grill: the app's `README.md` wins (its "Run it" block loses the `cd`, and it gains the orientation paragraph from the old root README minus the roughdraft bullet); the app's `.gitignore` wins with `.claude/worktrees/` appended; the delegating `package.json` is dropped. `CLAUDE.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `specs/spec2.md`, `scripts/laptop-check.mjs` and the tickets/notes that named the folder are rewritten. Nothing from the mockup's own logs is carried over; the decision log names the last commit that still holds it (`e40040c`). The three stale worktrees under `.claude/worktrees/` (category-chips, split-view, warmup-hint-links) are to be removed with their branches; none had commits ahead of main.

## Acceptance

- [x] `ls` at the root shows the app, no `curr_version/`, no `roughdraft_sept7/`
- [x] `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build` pass from the root with the moved `node_modules`
- [x] `grep -r "curr_version\|roughdraft_sept7"` outside `node_modules`/`.next` hits only deliberate history notes
- [x] Architecture note, `ARCHITECTURE.md` row and header, `DECISION_LOG.md` entry
