"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "@/components/Brand";
import { Avatar } from "@/components/ui";
import ResetDemo from "@/components/ResetDemo";
import { ASSIGNMENT } from "@/data/assignment";
import type { ReviewStage } from "@/data/types";
import { pathwayOf } from "@/lib/classroom";
import { useClassroom } from "@/lib/classroom-store";

/** Tabs; a tab tied to a review stage is offered only when the pathway includes that stage. The individual view (`/teacher/report`) has no tab: it opens from a name on the class view. */
export const TEACHER_TABS: { href: string; label: string; stage?: ReviewStage }[] = [
  { href: "/teacher", label: "Class" },
  { href: "/teacher/mistakes", label: "Mistakes" },
  { href: "/teacher/groups", label: "Groups", stage: "group" },
];

/**
 * The teacher side's top bar (tabs gated by the pathway, plus the pathway chip) and page frame.
 * The frame is the viewport: the bar sits in it and only the region beneath scrolls (ticket 68).
 * The window itself never scrolls, so the rubber-band at the end of a page moves the content,
 * never the bar; a sticky bar rode the bounce with the page. The outer div takes the viewport
 * height unzoomed: a `100vh` inside the zoomed frame shrinks to 72% of the window with it, a
 * percentage of an unzoomed parent does not. The zoom is 0.72 (ticket 142: the user's browser at
 * 90% of the old 0.8 was the size wanted at 100%), so a 1280 px laptop lays out at 1778 px.
 */
export default function TeacherChrome({ children }: { children: ReactNode }) {
  const path = usePathname();
  const pathway = pathwayOf(useClassroom());
  const tabs = TEACHER_TABS.filter((t) => !t.stage || pathway.includes(t.stage));
  return (
    <div className="h-screen">
    <div className="flex h-full flex-col [zoom:0.72]" data-teacher-root>
      <header className="z-30 shrink-0 border-b border-line bg-paper/70 backdrop-blur">
        <div className="mx-auto flex max-w-[1640px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Brand />
            <nav className="flex items-center gap-1">
              {tabs.map((t) => {
                const active = path === t.href;
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-3 py-1 text-[13.5px] font-medium transition-colors ${active ? "bg-accent-soft text-accent-deep" : "text-ink-soft hover:bg-cream-deep hover:text-ink"}`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-ink-soft">
            <Link href="/teacher/assignments/create" className={`rounded-full px-3 py-1 text-[13.5px] font-medium transition-colors ${path.startsWith("/teacher/assignments/") ? "bg-accent-soft text-accent-deep" : "text-ink-soft hover:bg-cream-deep hover:text-ink"}`} data-new-assignment>
              New assignment
            </Link>
            <span>{ASSIGNMENT.teacher}</span>
            <Avatar initials="MO" />
          </div>
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto" data-teacher-scroll>
        <div className="mx-auto max-w-[1640px] px-6 py-12">{children}</div>
      </main>
      <ResetDemo />
    </div>
    </div>
  );
}
