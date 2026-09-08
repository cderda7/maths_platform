import type { ReactNode } from "react";
import Brand from "@/components/Brand";
import { Avatar } from "@/components/ui";
import ResetDemo from "@/components/ResetDemo";
import { ASSIGNMENT } from "@/data/assignment";

/** The teacher side's top bar and page frame. */
export default function TeacherChrome({ children, tab = "Class" }: { children: ReactNode; tab?: string }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-paper/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Brand href="/teacher" />
            <span className="rounded-full bg-accent-soft px-3 py-1 text-[13.5px] font-medium text-accent-deep">{tab}</span>
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
