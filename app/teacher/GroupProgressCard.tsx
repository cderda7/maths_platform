"use client";

import { Card, Eyebrow } from "@/components/ui";
import { PROBLEM_MAP } from "@/data/assignment";
import { GROUP_HEX } from "@/data/groups";
import { useClassroom } from "@/lib/classroom-store";
import type { StudentSession } from "@/lib/session";
import { firstName, standingsAt } from "@/lib/standings";
import { useNow } from "@/lib/store";

/**
 * Group review on the teacher's laptop: every group's bar, in seating order, and who has the pen
 * in the demo student's group. Never the leaderboard's order and never a medal: the race is for
 * the wall, the detail is for the teacher. Shown from the moment a run begins until the
 * whole-class session ends.
 */
export default function GroupProgressCard({ session }: { session: StudentSession | null }) {
  const classroom = useClassroom();
  const now = useNow();
  if (!classroom.group || classroom.wholeClass?.status === "ended") return null;
  const rows = standingsAt(classroom, session, now);
  return (
    <Card className="p-6" data-group-progress>
      <Eyebrow>Group review</Eyebrow>
      <ul className="mt-3 space-y-3.5">
        {rows.map((s) => (
          <li key={s.colour} data-group-row={s.colour} data-percent={s.percent}>
            <div className="flex items-center justify-between gap-3 text-[12.5px] leading-snug">
              <span className="flex min-w-0 items-center gap-2 text-ink">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: GROUP_HEX[s.colour].fill }} aria-hidden />
                <span className="truncate">{s.names.join(", ")}</span>
              </span>
              <span className="shrink-0 tabular-nums text-ink-soft" data-percent-label>
                {s.percent}%
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-deep">
              <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${s.percent}%`, backgroundColor: GROUP_HEX[s.colour].fill }} />
            </div>
            {s.live && s.pen && s.problem && (
              <p className="mt-1 text-[12px] text-ink-muted" data-pen-holder={s.pen}>
                {firstName(s.pen)} has the pen · {PROBLEM_MAP[s.problem]?.label ?? s.problem}
              </p>
            )}
            {s.stuck.map((p) => (
              <p key={p.problem} className="mt-1 text-[12px] text-wrong" data-stuck={p.problem} data-stuck-status={p.status}>
                {PROBLEM_MAP[p.problem]?.label ?? p.problem} {p.status === "unsolved" ? "not solved" : "left for now"} after {p.tries} {p.tries === 1 ? "try" : "tries"}
              </p>
            ))}
            {s.percent >= 100 && (
              <p className="mt-1 text-[12px] text-secure" data-group-done>
                done
              </p>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
