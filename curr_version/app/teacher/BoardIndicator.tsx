"use client";

import { boardContent, boardWord } from "@/lib/board";
import { useClassroom } from "@/lib/classroom-store";
import type { StudentSession } from "@/lib/session";

/**
 * What the smartboard is showing right now, for the teacher's laptop: "Board · blank",
 * "Board · holding", "Board · Q3 · 2 of 3 · marks". The same rule the board itself draws from.
 */
export default function BoardIndicator({ session, className = "" }: { session: StudentSession | null; className?: string }) {
  const content = boardContent(useClassroom(), session);
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-paper px-3 py-1 text-[12.5px] text-ink-soft ${className}`} data-board-indicator data-board-kind={content.kind}>
      <svg viewBox="0 0 16 13" className="h-[13px] w-4 shrink-0 text-ink-muted" aria-hidden>
        <rect x="0.6" y="0.6" width="14.8" height="9" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5.5 12.4h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span>Board · {boardWord(content)}</span>
    </span>
  );
}
