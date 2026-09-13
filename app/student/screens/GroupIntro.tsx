"use client";

import { useState } from "react";
import ProblemCard from "@/components/ProblemCard";
import { PROBLEM_MAP } from "@/data/assignment";
import { runStartedAt, type GroupRun } from "@/lib/groupReview";
import { GROUP_INTRO_MS, GROUP_INTRO_PARAGRAPHS, introProgress, tileColumns } from "@/lib/groupIntro";

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * The read before the whiteboard (ticket 220): "Group review", two paragraphs on
 * working as a team, and the problems the group will work as the start screen's tiles, with no
 * marks and no names, so nothing says who got what wrong. No button: a bar drains over the read
 * and the board opens on its own, for every group at once.
 */
export default function GroupIntro({ run, now }: { run: GroupRun; now: number }) {
  const opensAt = runStartedAt(run);
  return (
    <div className="flex h-full min-h-0 flex-col px-10 pt-6 pb-5" data-group-intro>
      <h1 className="font-display shrink-0 text-[30px] leading-[1.1] text-ink">Group review</h1>

      <div className="mt-4 max-w-[900px] shrink-0 space-y-3 text-[18px] leading-[1.55] text-ink" data-intro-text>
        {GROUP_INTRO_PARAGRAPHS.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {/* At most two even rows (six tiles are three and three, never five and an orphan); each row as tall as its tallest tile. */}
      <ol className="mt-6 grid shrink-0 gap-3" style={{ gridTemplateColumns: `repeat(${tileColumns(run.problems.length)}, minmax(0, 1fr))` }} data-intro-problems>
        {run.problems.map((id) => (
          <li key={id} className="min-h-0" data-problem={id}>
            <ProblemCard problem={PROBLEM_MAP[id]} chips={false} compact />
          </li>
        ))}
      </ol>

      {/* In the corner the other screens' button is in, clear of the demo's skip strip. */}
      <div className="mt-auto flex shrink-0 items-center justify-end gap-3 pt-4" data-intro-timer>
        <div className="h-1.5 w-60 overflow-hidden rounded-full bg-cream-deep" aria-hidden>
          {/* Not before the clock's first tick: the hydration render reads 0, which would start a reloaded bar full. */}
          {now > 0 && <Drain run={run} now={now} />}
        </div>
        <span className="w-10 text-right text-[13px] text-ink-muted tabular-nums" data-intro-left>
          {now > 0 ? mmss(Math.min(GROUP_INTRO_MS, opensAt - now)) : ""}
        </span>
      </div>
    </div>
  );
}

/** The bar itself. Its clock is set once, on mount, from the time already read, so the ticks of `now` never restart it. */
function Drain({ run, now }: { run: GroupRun; now: number }) {
  const [delay] = useState(() => -introProgress(run, now) * GROUP_INTRO_MS);
  return <div className="intro-drain h-full rounded-full bg-accent" style={{ animationDuration: `${GROUP_INTRO_MS}ms`, animationDelay: `${delay}ms` }} />;
}
