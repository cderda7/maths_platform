"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "./Brand";

const STUDENT_LINKS = [
  { href: "/student", label: "Practice" },
  { href: "/student/work", label: "Working through" },
  { href: "/student/tutor", label: "Tutor" },
  { href: "/student/check-in", label: "Check-in" },
  { href: "/student/teacher-view", label: "What your teacher sees" },
];

const TEACHER_LINKS = [
  { href: "/teacher", label: "Class" },
  { href: "/teacher/assignments/new", label: "New assignment" },
  { href: "/teacher/students/jordan", label: "Student detail" },
];

export default function Nav() {
  const path = usePathname();
  const role = path.startsWith("/teacher") ? "teacher" : path.startsWith("/student") ? "student" : null;
  const links = role === "teacher" ? TEACHER_LINKS : role === "student" ? STUDENT_LINKS : [];

  const isActive = (href: string) =>
    href === "/student" || href === "/teacher" ? path === href : path.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Brand />
          {links.length > 0 && (
            <nav className="hidden md:flex items-center gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                    isActive(l.href)
                      ? "bg-accent-soft text-accent-deep font-medium"
                      : "text-ink-soft hover:text-ink hover:bg-cream-deep"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-line-strong p-0.5 bg-paper text-[12px]">
            <Link
              href="/student"
              className={`px-3 py-1 rounded-full ${role === "student" ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`}
            >
              Student
            </Link>
            <Link
              href="/teacher"
              className={`px-3 py-1 rounded-full ${role === "teacher" ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`}
            >
              Teacher
            </Link>
          </div>
          <div className="h-8 w-8 rounded-full bg-accent-soft border border-accent-line text-accent-deep text-[11px] font-semibold grid place-items-center">
            {role === "teacher" ? "MO" : "JW"}
          </div>
        </div>
      </div>
      {links.length > 0 && (
        <nav className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-[12px] ${
                isActive(l.href) ? "bg-accent-soft text-accent-deep font-medium" : "text-ink-soft"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
