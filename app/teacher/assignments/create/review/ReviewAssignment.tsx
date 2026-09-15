"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { assignmentHref, CLASSROOM_HREF, LIVE_ASSIGNMENT_ID } from "@/lib/assignments";
import { useRouter } from "next/navigation";
import TeacherChrome from "../../../TeacherChrome";
import { BackToClassroom } from "../../../AssignmentContext";
import AssessingStep from "./AssessingStep";
import DifficultyStep from "./DifficultyStep";
import PathwayStep from "./PathwayStep";
import RecommendationsStep from "./RecommendationsStep";
import Steps from "./Steps";
import { Eyebrow, H1 } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { draftFor, reviewStateFor, type AssignmentDraft, type ClassroomState } from "@/lib/classroom";
import { dispatchClassroom, getClassroom, useClassroom } from "@/lib/classroom-store";
import { moveItem } from "@/lib/reorder";
import { clearDraft, createAction, homeworkSendAction } from "@/lib/create";
import { CREATE_ROUTES, currentStep, hasPathway, PIPELINES, SEND_LIGHT_MS, type CreateKind, type StepName } from "@/lib/createPipeline";
import { applyReview, reviewFor, type ReviewState } from "@/lib/review";
import { moveStudent, seatingOf } from "@/lib/seating";
import { setSession } from "@/lib/store";
import { INITIAL_SESSION } from "@/lib/session";

/**
 * Step two of a new assignment (ticket 120), one route with the step in the classroom store:
 * the draft labelled by difficulty, then the assessing bar, then the recommendations, then the
 * pathway, then Create, which lights Send on the strip for `SEND_LIGHT_MS` before sending (ticket 288). The decisions (labels, answers, the addition shown, the pathway, the
 * New skills) live in `classroom.review`, keyed to the draft they were made about, so a reload lands on
 * the same step with them intact; only the assessing run is local, and never survives a reload.
 *
 * A homework (ticket 291, `kind`) takes the same steps with no pathway: Refine's last button is Create, which lights Send,
 * sends the homework into the class's list (`homeworkSendAction`) and lands on the Classroom, where its card is. Sending a
 * homework starts no lesson and leaves Sam's session alone.
 */
export default function ReviewAssignment({ kind, assessMs }: { kind: CreateKind; assessMs: number }) {
  const router = useRouter();
  const classroom = useClassroom();
  // Once sent, the page keeps showing the draft it sent until the route changes, so clearing the draft never flashes
  // "Nothing drafted yet" under the teacher on the way out (ticket 288).
  const [sent, setSent] = useState<{ draft: AssignmentDraft | null; review: ReviewState | null } | null>(null);
  const draft = sent ? sent.draft : draftFor(classroom, kind);
  const questions = draft?.questions ?? [];
  const review = reviewFor(questions, sent ? sent.review : reviewStateFor(classroom, kind));
  // Homework has no pathway step: a review stored at one reads as Refine's recommendations.
  const step = !hasPathway(kind) && review.step === "pathway" ? "recommendations" : review.step;
  const [assessing, setAssessing] = useState(false);

  const set = (patch: Partial<ReviewState>) => dispatchClassroom({ type: "review/set", review: { ...review, ...patch }, kind });
  // The groups this assignment will seat (ticket 188): the teacher's moves on the pathway step, else the class defaults as they stand.
  const groups = review.groups ?? seatingOf(classroom.groups);

  const assess = () => {
    set({ answers: {}, addition: 0 });
    setAssessing(true);
  };
  const assessed = useCallback(() => {
    const c = getClassroom();
    const latest = reviewFor(draftFor(c, kind)?.questions ?? [], reviewStateFor(c, kind));
    dispatchClassroom({ type: "review/set", review: { ...latest, step: "recommendations" }, kind });
    setAssessing(false);
  }, [kind]);

  // Create lights Send (ticket 288): the strip's last label goes to ink and the strip locks, then the set is sent and the
  // page moves on as before. The draft stays in the store until the send itself, so the page under the light is unchanged.
  const [sending, setSending] = useState(false);
  const sendTimer = useRef<number | null>(null);
  useEffect(() => () => {
    if (sendTimer.current !== null) window.clearTimeout(sendTimer.current);
  }, []);
  /** What Create sends for this kind, or null while it would send nothing. */
  const actionFor = (c: ClassroomState) => (kind === "homework" ? homeworkSendAction(c, Date.now()) : createAction(c));
  const send = () => {
    sendTimer.current = null;
    // Read again at the send: another tab may have changed the draft under the light.
    const latest = getClassroom();
    const action = actionFor(latest);
    if (!action) return setSending(false);
    flushSync(() => setSent({ draft: draftFor(latest, kind), review: reviewStateFor(latest, kind) }));
    dispatchClassroom(action);
    for (const clear of clearDraft(kind)) dispatchClassroom(clear);
    if (kind === "homework") {
      // Sent: Homework 3 is on the Classroom among the sets; no lesson starts and Sam's session stays as it is (ticket 291).
      router.push(CLASSROOM_HREF);
      return;
    }
    // Sent: the set is in Sam's To do with his run at its start (ticket 264), whatever an earlier run left in the session.
    setSession(INITIAL_SESSION);
    router.push(assignmentHref(LIVE_ASSIGNMENT_ID));
  };
  const create = () => {
    // An undecided pathway never creates (ticket 246): the pathway step's Create answers by pointing at the card instead.
    // A homework's Create waits for every recommendation's answer, as Finalise set does (the button nudges the cards instead).
    if (sending || !actionFor(getClassroom())) return;
    setSending(true);
    sendTimer.current = window.setTimeout(send, SEND_LIGHT_MS);
  };

  const current = currentStep({ step, assessing, sending });
  const back = (to: StepName) => {
    if (sending) return;
    if (to === "difficulty") set({ step: "difficulty" });
    else if (to === "assessment") set({ step: "recommendations" });
  };

  return (
    <TeacherChrome>
      <BackToClassroom />
      <Eyebrow className="mt-3">{ASSIGNMENT.className}</Eyebrow>
      <H1 className="mt-3">{draft?.title || "Untitled assignment"}</H1>
      {questions.length === 0 ? (
        <p className="mt-8 text-[14px] text-ink-muted" data-empty>
          Nothing drafted yet.{" "}
          <Link href={CREATE_ROUTES[kind].questions} className="font-medium text-accent-deep hover:underline">
            Start the assignment
          </Link>
        </p>
      ) : (
        <>
          <Steps steps={PIPELINES[kind]} questionsHref={CREATE_ROUTES[kind].questions} current={current} locked={assessing || sending} onBack={back} />
          {assessing ? (
            <AssessingStep ms={assessMs} onDone={assessed} />
          ) : step === "difficulty" ? (
            <DifficultyStep
              backHref={CREATE_ROUTES[kind].questions}
              questions={questions}
              overrides={review.labels}
              onLabel={(id, d) => set({ labels: { ...review.labels, [id]: d } })}
              // A move reorders the draft itself, so the create screen shows the new order too; the decisions are by id and the draft key leaves order out.
              onMove={(from, to) => draft && dispatchClassroom({ type: "draft/set", draft: { ...draft, questions: moveItem(questions, from, to), updatedAt: Date.now() }, kind })}
              onAssess={assess}
            />
          ) : step === "recommendations" ? (
            <RecommendationsStep
              kind={kind}
              questions={questions}
              review={review}
              onAnswer={(id, answer) => {
                const answers = { ...review.answers };
                if (answer) answers[id] = answer;
                else delete answers[id];
                set({ answers });
              }}
              onTryAnother={() => set({ addition: review.addition + 1 })}
              onBack={() => !sending && set({ step: "difficulty" })}
              // An in-class set goes on to its pathway; a homework has none, so Refine's last button is Create (ticket 291).
              onFinalise={hasPathway(kind) ? () => set({ step: "pathway" }) : create}
            />
          ) : (
            <PathwayStep final={applyReview(questions, review)} review={review} groups={groups} onChange={set} onMoveGroup={(student, to) => set({ groups: moveStudent(groups, student, to) })} onBack={() => back("assessment")} onCreate={create} />
          )}
        </>
      )}
    </TeacherChrome>
  );
}
