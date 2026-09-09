"use client";

import { Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { useAssignment } from "@/lib/classroom-store";

/** Handed in, nothing to do until the teacher starts the next stage (whole-class review). */
export default function WaitingScreen() {
  const { title } = useAssignment();
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-9 py-9 text-center" data-waiting>
      <Eyebrow>{title}</Eyebrow>
      <h1 className="font-display mt-3 text-[34px] leading-tight text-ink">Handed in</h1>
      <p className="mt-3 flex items-center gap-2 text-[14px] text-ink-muted">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
        Waiting for {ASSIGNMENT.teacher}
      </p>
    </div>
  );
}
