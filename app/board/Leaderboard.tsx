"use client";

import { GROUP_COLOURS, GROUP_HEX } from "@/data/groups";
import type { Medal, RankedStanding } from "@/lib/standings";

/**
 * The race on the wall: five rows, one per group, drawn in seating order and each translated to
 * its rank, so a change of order is a transform transition (no measuring, no layout thrash).
 * Each row: a medal once the group is home, the colour, the four first names, a bar as wide as
 * the wall allows with a tick every ten percent (so 75 % and 70 % end in different places), and
 * the number. No group names, no numbering, nothing to press.
 */
const METAL: Record<Medal, { rim: string; fill: string; shine: string }> = {
  gold: { rim: "#b8861b", fill: "#e6b93f", shine: "#fbe58d" },
  silver: { rim: "#8d94a3", fill: "#c6cad3", shine: "#f3f5f8" },
  bronze: { rim: "#8a4f22", fill: "#c47a45", shine: "#ebb68b" },
};

const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
/** A tick every ten percent, inside the track (none at the rounded ends). */
const TICKS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

export default function Leaderboard({ standings, live }: { standings: RankedStanding[]; live: boolean }) {
  const rows = GROUP_COLOURS.map((c) => standings.find((s) => s.colour === c)).filter((s): s is RankedStanding => !!s);
  const rowHeight = `${100 / rows.length}%`;
  return (
    <div className="relative mx-10 mb-6 min-h-0 flex-1" data-leaderboard data-live={live || undefined}>
      {rows.map((s) => (
        <div
          key={s.colour}
          className="absolute inset-x-0 top-0"
          style={{ height: rowHeight, transform: `translateY(${s.rank * 100}%)`, transition: `transform 700ms ${EASE}` }}
          data-standing={s.colour}
          data-rank={s.rank}
          data-percent={s.percent}
          data-medal={s.medal ?? undefined}
        >
          <div className="flex h-full items-center gap-7 border-b border-line">
            <div className="grid w-[72px] shrink-0 place-items-center">{s.medal && <MedalBadge medal={s.medal} />}</div>
            <span className="h-9 w-9 shrink-0 rounded-full" style={{ backgroundColor: GROUP_HEX[s.colour].fill }} aria-hidden />
            <div className="w-[370px] shrink-0 text-[26px] leading-tight font-medium text-ink" data-names>
              {s.names.join(" · ")}
            </div>
            <div className="relative h-11 min-w-0 flex-1 overflow-hidden rounded-full bg-cream-deep" data-bar>
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${s.percent}%`, backgroundColor: GROUP_HEX[s.colour].fill, transition: `width 700ms ${EASE}` }} data-fill />
              {TICKS.map((pct) => (
                <span key={pct} className="pointer-events-none absolute inset-y-0 w-[2px] bg-ink/20" style={{ left: `${pct}%` }} aria-hidden />
              ))}
            </div>
            <div className="w-[170px] shrink-0 text-right font-display text-[60px] leading-none text-ink tabular-nums" data-percent-label>
              {s.percent}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MedalBadge({ medal }: { medal: Medal }) {
  const m = METAL[medal];
  return (
    <svg viewBox="0 0 56 68" className="h-[68px] w-14" role="img" aria-label={`${medal} medal`} data-medal-badge={medal}>
      <path d="M17 0h9l4 22h-9z" fill="#c4453c" />
      <path d="M30 0h9l-4 22h-9z" fill="#8f2f28" />
      <circle cx="28" cy="44" r="23" fill={m.rim} />
      <circle cx="28" cy="44" r="18" fill={m.fill} />
      <circle cx="22" cy="37" r="6" fill={m.shine} opacity="0.7" />
    </svg>
  );
}
