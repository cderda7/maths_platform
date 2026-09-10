## Git
Commit after each screen is completed and verified working — message names the screen (e.g. "class dashboard complete").
    Won't go through, but then at the end of one of your work sessions, you can send them to me via chat & I'll run them all.

Parallel work follows the global worktree policy (one worktree per agent under `.claude/worktrees/`, the main checkout only receives merges). In this repo the install is `npm ci` at the repo root, and each worktree needs its own; a `node_modules` symlink breaks the Next build.

## Layout
The Next app is the repo root: run npm, vitest and next from here. Tickets in `tickets/`, per-ticket notes in `architecture/`, specs in `specs/`.
The Sept 7 design mockup (`roughdraft_sept7/`) was deleted on 10 Sep 2026; its last commit is `e40040c` if it is ever needed.

## Future features policy
Maintain `FUTURE_FEATURES.md` at the repo root. Every time an idea is scoped out, deferred, or mentioned as "later", append it there with the date and why it was deferred. Err on the side of putting too much in rather than too little.
