"use client";

import Link from "next/link";
import TeacherChrome from "../../../TeacherChrome";
import QuestionView from "@/components/QuestionView";
import { Eyebrow, H1 } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { useClassroom } from "@/lib/classroom-store";
import { parseQuestion } from "@/lib/mathInput";

/**
 * Step two of a new assignment, as a stub (ticket 119): it reads the draft the create screen
 * saved (`classroom.draft`) and lists the questions in the same tiles, so the screen that
 * replaces it, where the unit, the pathway and the rest are decided, starts from a wired route
 * with the data in hand. Nothing here is final.
 */
export default function ReviewStub() {
  const draft = useClassroom().draft;
  const questions = draft?.questions ?? [];
  return (
    <TeacherChrome>
      <Eyebrow>{ASSIGNMENT.className} · review</Eyebrow>
      <H1 className="mt-3">{draft?.title || "Untitled assignment"}</H1>
      {questions.length === 0 ? (
        <p className="mt-8 text-[14px] text-ink-muted" data-empty>
          Nothing drafted yet.{" "}
          <Link href="/teacher/assignments/create" className="font-medium text-accent-deep hover:underline">
            Type the questions
          </Link>
        </p>
      ) : (
        <ol className="mt-8 grid grid-cols-5 gap-4" data-questions>
          {questions.map((q, i) => (
            <li key={q.id} className="aspect-square min-h-0 rounded-2xl border border-line bg-paper p-5 shadow-card" data-question={i + 1}>
              <span className="font-display text-[20px] text-ink">Q{i + 1}</span>
              <div className="mt-2.5">
                <QuestionView parsed={parseQuestion(q.text)} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </TeacherChrome>
  );
}
