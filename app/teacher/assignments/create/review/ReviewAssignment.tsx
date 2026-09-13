"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { assignmentHref, LIVE_ASSIGNMENT_ID, NEW_ASSIGNMENT_HREF, recentSets } from "@/lib/assignments";
import { RECENT_SETS } from "@/lib/newSkills";
import { useRouter } from "next/navigation";
import TeacherChrome from "../../../TeacherChrome";
import { BackToClassroom } from "../../../AssignmentContext";
import AssessingStep from "./AssessingStep";
import DifficultyStep from "./DifficultyStep";
import PathwayStep from "./PathwayStep";
import RecommendationsStep from "./RecommendationsStep";
import Steps, { type StepName } from "./Steps";
import { Eyebrow, H1 } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { dispatchClassroom, getClassroom, useClassroom } from "@/lib/classroom-store";
import { moveItem } from "@/lib/reorder";
import { applyReview, bankProblemsOf, reviewFor, reviewNewSkills, type ReviewState } from "@/lib/review";
import { moveStudent, seatingOf } from "@/lib/seating";

/**
 * Step two of a new assignment (ticket 120), one route with the step in the classroom store:
 * the draft labelled by difficulty, then the assessing bar, then the recommendations, then the
 * pathway, then Create. The decisions (labels, answers, the addition shown, the pathway, the
 * New skills) live in `classroom.review`, keyed to the draft they were made about, so a reload lands on
 * the same step with them intact; only the assessing run is local, and never survives a reload.
 */
export default function ReviewAssignment({ assessMs }: { assessMs: number }) {
  const router = useRouter();
  const classroom = useClassroom();
  const draft = classroom.draft;
  const questions = draft?.questions ?? [];
  const review = reviewFor(questions, classroom.review);
  const [assessing, setAssessing] = useState(false);

  const set = (patch: Partial<ReviewState>) => dispatchClassroom({ type: "review/set", review: { ...review, ...patch } });
  // The groups this assignment will seat (ticket 188): the teacher's moves on the pathway step, else the class defaults as they stand.
  const groups = review.groups ?? seatingOf(classroom.groups);

  const assess = () => {
    set({ answers: {}, addition: 0 });
    setAssessing(true);
  };
  const assessed = useCallback(() => {
    const latest = reviewFor(getClassroom().draft?.questions ?? [], getClassroom().review);
    dispatchClassroom({ type: "review/set", review: { ...latest, step: "recommendations" } });
    setAssessing(false);
  }, []);

  const create = () => {
    if (!draft) return;
    const final = applyReview(questions, review);
    dispatchClassroom({
      type: "assignment/create",
      id: LIVE_ASSIGNMENT_ID,
      groups,
      title: draft.title,
      problemIds: bankProblemsOf(final).map((p) => p.id),
      pathway: review.pathway,
      newSkills: reviewNewSkills(final, review, recentSets(LIVE_ASSIGNMENT_ID, RECENT_SETS)).chosen,
      goal: draft.goal ?? "",
      questions: final,
    });
    dispatchClassroom({ type: "draft/set", draft: null });
    dispatchClassroom({ type: "review/set", review: null });
    router.push(assignmentHref(LIVE_ASSIGNMENT_ID));
  };

  const current: StepName = assessing ? "assessment" : review.step === "difficulty" ? "difficulty" : review.step === "recommendations" ? "assessment" : "pathway";
  const back = (to: StepName) => {
    if (to === "difficulty") set({ step: "difficulty" });
    else if (to === "assessment") set({ step: "recommendations" });
  };

  return (
    <TeacherChrome>
      <BackToClassroom />
      <Eyebrow className="mt-3">{ASSIGNMENT.className} · new assignment</Eyebrow>
      <H1 className="mt-3">{draft?.title || "Untitled assignment"}</H1>
      {questions.length === 0 ? (
        <p className="mt-8 text-[14px] text-ink-muted" data-empty>
          Nothing drafted yet.{" "}
          <Link href={NEW_ASSIGNMENT_HREF} className="font-medium text-accent-deep hover:underline">
            Start the assignment
          </Link>
        </p>
      ) : (
        <>
          <Steps current={current} locked={assessing} onBack={back} />
          {assessing ? (
            <AssessingStep ms={assessMs} onDone={assessed} />
          ) : review.step === "difficulty" ? (
            <DifficultyStep
              questions={questions}
              overrides={review.labels}
              onLabel={(id, d) => set({ labels: { ...review.labels, [id]: d } })}
              // A move reorders the draft itself, so the create screen shows the new order too; the decisions are by id and the draft key leaves order out.
              onMove={(from, to) => draft && dispatchClassroom({ type: "draft/set", draft: { ...draft, questions: moveItem(questions, from, to), updatedAt: Date.now() } })}
              onAssess={assess}
            />
          ) : review.step === "recommendations" ? (
            <RecommendationsStep
              questions={questions}
              review={review}
              onAnswer={(id, answer) => {
                const answers = { ...review.answers };
                if (answer) answers[id] = answer;
                else delete answers[id];
                set({ answers });
              }}
              onTryAnother={() => set({ addition: review.addition + 1 })}
              onBack={() => set({ step: "difficulty" })}
              onFinalise={() => set({ step: "pathway" })}
            />
          ) : (
            <PathwayStep final={applyReview(questions, review)} review={review} groups={groups} onChange={set} onMoveGroup={(student, to) => set({ groups: moveStudent(groups, student, to) })} onBack={() => set({ step: "recommendations" })} onCreate={create} />
          )}
        </>
      )}
    </TeacherChrome>
  );
}
