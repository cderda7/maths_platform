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
import { pathwayChip } from "@/lib/pathway";

/** Tabs; a tab tied to a review stage is offered only when the pathway includes that stage. */
export const TEACHER_TABS: { href: string; label: string; stage?: ReviewStage }[] = [
  { href: "/teacher", label: "Class" },
  { href: "/teacher/mistakes", label: "Mistakes" },
  { href: "/teacher/groups", label: "Groups", stage: "group" },
  { href: "/teacher/report", label: "Report" },
];

/** The teacher side's top bar (tabs gated by the pathway, plus the pathway chip) and page frame. */
export default function TeacherChrome({ children }: { children: ReactNode }) {
  const path = usePathname();
  const pathway = pathwayOf(useClassroom());
  const tabs = TEACHER_TABS.filter((t) => !t.stage || pathway.includes(t.stage));
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-paper/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Brand href="/teacher" />
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
            <span className="rounded-full border border-line bg-paper px-2.5 py-0.5 text-[11.5px] text-ink-soft" data-pathway-chip>
              {pathwayChip(pathway)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-ink-soft">
            <Link href="/teacher/assignments/new" className={`rounded-full px-3 py-1 text-[13.5px] font-medium transition-colors ${path === "/teacher/assignments/new" ? "bg-accent-soft text-accent-deep" : "text-ink-soft hover:bg-cream-deep hover:text-ink"}`} data-new-assignment>
              New assignment
            </Link>
            <ResetDemo className="mr-2" />
            <span>{ASSIGNMENT.teacher}</span>
            <Avatar initials="MO" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-12">{children}</main>
    </div>
  );
}
