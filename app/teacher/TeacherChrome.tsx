"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "@/components/Brand";
import { Avatar } from "@/components/ui";
import ResetDemo from "@/components/ResetDemo";
import TeacherSkipTo from "./TeacherSkipTo";
import { LessonEnds } from "./EndLesson";
import PresentBoard from "./PresentBoard";
import DecisionHost from "./DecisionCard";
import { ASSIGNMENT } from "@/data/assignment";
import { assignmentTabs, CLASS_GROUPS_HREF } from "@/lib/assignments";
import { decisionScreen } from "@/lib/decision";
import { useOptionalAssignment } from "./AssignmentContext";

/**
 * The teacher side's top bar and page frame. The brand and the tabs form the left group. On an
 * assignment's pages (under an `AssignmentProvider`, ticket 185) the tabs are that assignment's Class ·
 * Mistakes · Groups (Groups only when its pathway has group review); on a Classroom page there are no
 * assignment tabs, only a Groups link to the class's default groups. The individual view
 * (`/teacher/a/<id>/report`) has no tab: it opens from a row's "student report" button on the class view. The tabs sit directly
 * right of the wordmark at the student header's gap (ticket 165); the teacher's name and avatar
 * form one row at the right. The tabs are indigo pills (the current page filled deep, the others
 * soft, ticket 163). "New assignment" left the bar (ticket 176) and then the class view (185): it
 * is on the Classroom.
 * The frame is the viewport: the bar sits in it and only the region beneath scrolls (ticket 68).
 * The window itself never scrolls, so the rubber-band at the end of a page moves the content,
 * never the bar; a sticky bar rode the bounce with the page. The outer div takes the viewport
 * height unzoomed: a `100vh` inside the zoomed frame shrinks to 72% of the window with it, a
 * percentage of an unzoomed parent does not. The zoom is 0.72 (ticket 142: the user's browser at
 * 90% of the old 0.8 was the size wanted at 100%), so a 1280 px laptop lays out at 1778 px. A page
 * may ask for its own (`zoom`): the whole frame, bar included, as a browser zoom would. The frame's zoom is also
 * `--frame-zoom` and `--back-zoom`, for the back button's place (`BACK_LEFT`, ticket 267, which mirrors the column below).
 * The presenter's controls, zoomed with the frame, sit in a strip of their own under the scroll region (ticket 263): SKIP TO
 * bottom-left, Reset demo bottom-right. A fixed overlay covered whatever control scrolled beneath it (a roster row at
 * rest on the Class View); the strip costs about 40 px of height at 1280 x 800 and covers nothing.
 * Every teacher screen stamps the lesson's end when "end lesson"'s minute runs out (`LessonEnds`, ticket 273).
 * The strip is the same size on every page (ticket 282): a page at its own zoom draws it back at `TEACHER_ZOOM`, since it is
 * the presenter's, not the page's. A page that fills the frame to the strip (`fill`, the student report) keeps a short
 * bottom padding instead of the frame's 48 px: the strip under it already separates it from the window's edge, and the
 * report fits 1280 x 800 with nothing to scroll (ticket 243's rule, broken by the strip's height).
 * The lesson's decision card (ticket 335, `DecisionHost`) is mounted here once, on Edexia Classroom and the live set's Class View
 * and Mistakes (`decisionScreen`), laid over the bottom-right corner of the scroll region: the region sits in a positioned box of
 * its own size, so the card rides above the page and the presenter's strip, and nothing in the page moves when it comes or goes.
 */
export const TEACHER_ZOOM = 0.72;

export default function TeacherChrome({ children, zoom = TEACHER_ZOOM, fill = false }: { children: ReactNode; zoom?: number; fill?: boolean }) {
  const path = usePathname();
  const assignment = useOptionalAssignment();
  const tabs = assignment ? assignmentTabs(assignment) : [{ label: "Groups", href: CLASS_GROUPS_HREF }];
  return (
    <div className="h-screen">
    <LessonEnds />
    <div className="flex h-full flex-col" style={{ zoom, "--frame-zoom": zoom, "--back-zoom": zoom } as CSSProperties} data-teacher-root>
      <header className="z-30 shrink-0 border-b border-line bg-paper/70 backdrop-blur">
        <div className="mx-auto flex max-w-[1640px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-5">
            <Brand />
            <nav className="flex items-center gap-1.5" data-teacher-tabs={assignment ? assignment.id : "classroom"}>
              {tabs.map((t) => {
                const active = path === t.href;
                return (
                  <Link
                    key={t.label}
                    href={t.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full border border-transparent px-3 py-1 text-[13.5px] font-medium transition-colors ${active ? "bg-accent-deep text-white" : "bg-accent-soft text-accent-deep hover:bg-accent-line"}`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-ink-soft">
            {/* The board is the laptop's second display, opened from here (ticket 333). */}
            <PresentBoard />
            <span>{ASSIGNMENT.teacher}</span>
            <Avatar initials="MO" />
          </div>
        </div>
      </header>
      <div className="relative flex min-h-0 flex-1 flex-col" data-teacher-body>
        <main className="min-h-0 flex-1 overflow-y-auto" data-teacher-scroll>
          <div className={`mx-auto max-w-[1640px] px-6 pt-12 ${fill ? "pb-4" : "pb-12"}`}>{children}</div>
        </main>
        {decisionScreen(path, ASSIGNMENT.id) && <DecisionHost />}
      </div>
      {/* The presenter's strip (ticket 263): its own row under the scroll region, so no teacher control ever sits beneath SKIP TO or Reset demo. */}
      <footer className="flex shrink-0 items-center justify-between gap-4 px-4 py-2.5" style={{ zoom: TEACHER_ZOOM / zoom }} data-presenter-strip>
        <TeacherSkipTo />
        <ResetDemo inline />
      </footer>
    </div>
    </div>
  );
}
