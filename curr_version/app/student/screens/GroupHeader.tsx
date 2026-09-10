"use client";

import type { ReactNode } from "react";
import M from "@/components/Math";
import type { StudentSession } from "@/lib/session";
import GroupBar from "./GroupBar";

/**
 * The header row the group whiteboard and the group debrief share: the problem on the left, the
 * group's progress bar in the middle, the pen chip (or nothing) on the right. Three grid columns
 * of fixed proportion, not a flex row, so the bar sits at exactly the same spot on both screens
 * whatever stands beside it; a minimum height keeps the row the same height when the pen chip
 * gives way to "the group got it".
 */
export default function GroupHeader({ session, label, tex, children, right }: { session: StudentSession; label: string; tex: string; children?: ReactNode; right?: ReactNode }) {
  return (
    <div className="grid min-h-9 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4" data-group-header>
      <div className="flex min-w-0 items-center gap-4">
        <span className="font-display text-[26px] text-ink">{label}</span>
        <span className="math-lg text-ink">
          <M tex={tex} />
        </span>
        {children}
      </div>
      <GroupBar session={session} />
      <div className="flex items-center justify-end">{right}</div>
    </div>
  );
}
