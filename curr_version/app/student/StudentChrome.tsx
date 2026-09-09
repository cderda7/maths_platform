import type { ReactNode } from "react";
import Brand from "@/components/Brand";
import { Avatar } from "@/components/ui";
import { DEMO_STUDENT } from "@/data/assignment";

/**
 * The persistent frame inside the iPad screen: a thin iPadOS-style status strip and the
 * product's top bar. Everything a student screen renders sits below it.
 */
export default function StudentChrome({ children, crumb, frozen = false }: { children: ReactNode; crumb?: string; frozen?: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-6 items-center justify-between px-6 text-[11px] font-medium text-ink-soft select-none">
        <span>9:41</span>
        <span className="flex items-center gap-2 text-ink-soft" aria-hidden>
          <svg viewBox="0 0 18 12" className="h-3 w-[18px]" fill="currentColor">
            <rect x="0" y="8" width="3" height="4" rx="0.8" />
            <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
            <rect x="10" y="3" width="3" height="9" rx="0.8" />
            <rect x="15" y="0" width="3" height="12" rx="0.8" />
          </svg>
          <svg viewBox="0 0 16 12" className="h-3 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M1.5 4.2a9.5 9.5 0 0 1 13 0" />
            <path d="M4 6.8a6 6 0 0 1 8 0" />
            <path d="M6.4 9.3a2.6 2.6 0 0 1 3.2 0" />
          </svg>
          <span className="relative inline-block h-[11px] w-[24px] rounded-[3px] border border-current/70">
            <span className="absolute inset-[2px] right-[3px] rounded-[1px] bg-current" />
            <span className="absolute -right-[3px] top-[3px] h-[5px] w-[1.5px] rounded-r bg-current/60" />
          </span>
        </span>
      </div>
      <header className={`flex h-14 items-center justify-between border-b border-line bg-paper/70 px-7 backdrop-blur ${frozen ? "pointer-events-none" : ""}`} aria-disabled={frozen || undefined}>
        <div className="flex items-center gap-5">
          <Brand />
          {crumb && <span className="text-[13px] text-ink-muted">{crumb}</span>}
        </div>
        <div className="flex items-center gap-3 text-[13px] text-ink-soft">
          <span>{DEMO_STUDENT.name}</span>
          <Avatar initials={DEMO_STUDENT.initials} />
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
