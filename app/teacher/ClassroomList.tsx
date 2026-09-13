"use client";

import Link from "next/link";
import TeacherChrome from "./TeacherChrome";
import { Eyebrow, H1 } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { assignmentBundle, assignmentHref, assignmentIds } from "@/lib/assignments";
import { useClassroom } from "@/lib/classroom-store";

/**
 * The Classroom for now (ticket 185): a plain list of the assignments the registry holds, each
 * opening on its landing tab, and the way to create one. Ticket 186 replaces it with the cards.
 */
export default function ClassroomList() {
  const classroom = useClassroom();
  const bundles = assignmentIds(classroom).flatMap((id) => assignmentBundle(id, classroom) ?? []);
  return (
    <TeacherChrome>
      <Eyebrow>{ASSIGNMENT.className}</Eyebrow>
      <div className="mt-3 flex items-center justify-between gap-6">
        <H1>Edexia Classroom</H1>
        <Link href="/teacher/assignments/create" className="rounded-full border border-accent-deep bg-accent-soft px-3 py-1 text-[13.5px] font-medium text-accent-deep transition-colors hover:bg-accent-line" data-new-assignment>
          New assignment
        </Link>
      </div>
      <ul className="mt-8 space-y-2 text-[15px]" data-assignments>
        {bundles.map((b) => (
          <li key={b.id}>
            <Link href={assignmentHref(b.id)} className="font-medium text-accent-deep hover:underline" data-assignment-link={b.id}>
              {b.title}
            </Link>
            <span className="text-ink-muted"> · due {b.due}</span>
          </li>
        ))}
      </ul>
    </TeacherChrome>
  );
}
