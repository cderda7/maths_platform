"use client";

import { Eyebrow } from "@/components/ui";
import { useClassroom } from "@/lib/classroom-store";
import { classReadiness } from "@/lib/readiness";
import { useNow } from "@/lib/store";

/** Corrections handed in; the whole class starts group review together, so the count climbs here until everyone is in. */
export default function ClassWaitScreen() {
  const readiness = classReadiness(useClassroom(), useNow());
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-9 py-9 text-center" data-class-wait>
      <Eyebrow>Group review</Eyebrow>
      <h1 className="font-display mt-3 text-[34px] leading-tight text-ink">Waiting for the class</h1>
      <p className="mt-3 flex items-center gap-2 text-[15px] text-ink-soft" data-count>
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
        {readiness.handedIn} of {readiness.total} handed in
      </p>
      <div className="mt-6 h-2 w-64 overflow-hidden rounded-full bg-cream-deep" aria-hidden>
        <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${(readiness.handedIn / readiness.total) * 100}%` }} />
      </div>
    </div>
  );
}
