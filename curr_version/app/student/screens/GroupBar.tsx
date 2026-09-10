"use client";

import { GROUP_HEX } from "@/data/groups";
import { useClassroom } from "@/lib/classroom-store";
import type { StudentSession } from "@/lib/session";
import { ownStanding } from "@/lib/standings";

/** The student's own group's progress, and nothing about any other group: a small bar and the number in the whiteboard's header. */
export default function GroupBar({ session }: { session: StudentSession }) {
  const s = ownStanding(useClassroom(), session);
  if (!s) return null;
  return (
    <span className="flex items-center gap-2" data-group-bar data-percent={s.percent} title="Your group's progress">
      <span className="relative h-2 w-[140px] overflow-hidden rounded-full bg-cream-deep">
        <span className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500" style={{ width: `${s.percent}%`, backgroundColor: GROUP_HEX[s.colour].fill }} />
      </span>
      <span className="text-[12.5px] tabular-nums text-ink-soft">{s.percent}%</span>
    </span>
  );
}
