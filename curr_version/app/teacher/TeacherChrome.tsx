"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "@/components/Brand";
import { Avatar } from "@/components/ui";
import ResetDemo from "@/components/ResetDemo";
import { ASSIGNMENT } from "@/data/assignment";

export const TEACHER_TABS: { href: string; label: string }[] = [
  { href: "/teacher", label: "Class" },
  { href: "/teacher/report", label: "Report" },
];

/** The teacher side's top bar (with tabs) and page frame. */
export default function TeacherChrome({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-paper/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Brand href="/teacher" />
            <nav className="flex items-center gap-1">
              {TEACHER_TABS.map((t) => {
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
