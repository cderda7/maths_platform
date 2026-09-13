"use client";

import { useState, type CSSProperties } from "react";
import M from "@/components/Math";
import PadSection from "@/components/PadSection";
import HintCard from "@/components/HintCard";
import ReadAs from "@/components/ReadAs";
import { Avatar, Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT, DEMO_STUDENT, PROBLEM_MAP } from "@/data/assignment";
import { CLASSMATE_MAP } from "@/data/classmates";
import { GROUP_HEX } from "@/data/groups";
import type { Stroke } from "@/data/types";
import { branchesOf } from "@/lib/branches";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { attemptsOn, boardHint, closedCurrent, comingBack, currentVisit, HINT_RING_MS, hintRingAt, lastAttempt, leaving, markFirstMistake, ownAttemptScript, TRY_AGAIN_MS, tryAgainAt, tryAgainShowing, type MarkedLine } from "@/lib/groupReview";
import { nextLine, type RevealedLine } from "@/lib/recognition";
import { assignmentGroupsOf, groupOfStudent } from "@/lib/seating";
import type { SessionAction, StudentSession } from "@/lib/session";
import GroupDebrief from "./GroupDebrief";
import { pendingDebrief } from "@/lib/debrief";
import GroupHeader from "./GroupHeader";
import GroupIntro from "./GroupIntro";
import { introShowing } from "@/lib/groupIntro";
import { useFrameNow, useNow } from "@/lib/store";

const first = (id: string) => (id === DEMO_STUDENT.id ? "You" : CLASSMATE_MAP[id]?.name.split(" ")[0] ?? id);

/**
 * Group review on one shared whiteboard: the board on the left two thirds while the pen-holder
 * writes (a live mirror for the other three), the "Read as" column on the right filling in one
 * line per burst, on every member's iPad, as on the working screen (ticket 162). Check for the
 * pen-holder only. A wrong check puts the whole attempt, its first mistake red, at the top of the
 * column and wipes the board, so the next attempt starts clean and reads in beneath (ticket 235);
 * from the second wrong check a hint for the latest first mistake sits under it (ticket
 * 221). The third wrong check holds a moment and leaves the problem for now; the members' row says
 * which problems come back, and the return is the problem's last try (ticket 222). A wrong check the
 * board goes on from pops "Try again" mid-screen, one pulse, and after the second the hint sends out
 * one purple ring as the pill fades (ticket 238). A correct check,
 * or a wrong one on the return, opens the debrief.
 */
export default function GroupBoardScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const classroom = useClassroom();
  const run = classroom.group ?? null;
  const [recognising, setRecognising] = useState(false);
  const now = useNow();
  // During the intro the bar and its time left move every frame, in step (ticket 232); the board itself keeps the one-second clock.
  const frame = useFrameNow(!!run && introShowing(run, now));
  if (!run) return <p className="mt-16 text-center text-[15px] text-ink-muted">Setting up the whiteboard…</p>;
  // Before the board opens, the whole group reads why they are working together (ticket 220).
  if (introShowing(run, Math.max(now, frame))) return <GroupIntro run={run} now={Math.max(now, frame)} />;
  // A resolved problem the student has not yet moved on from: their debrief, whether or not the group has moved on.
  const debriefing = pendingDebrief(run, session.debrief);
  if (debriefing) return <GroupDebrief session={session} dispatch={dispatch} run={run} problem={debriefing} />;
  const visit = currentVisit(run)!;
  const pid = visit.problem;
  const problem = PROBLEM_MAP[pid];
  const holder = visit.pen;
  const mine = holder === DEMO_STUDENT.id;
  const resolved = closedCurrent(run);
  const moving = leaving(run);
  const last = lastAttempt(run);
  const wrongShown = last && !last.correct && !resolved ? markFirstMistake(pid, last.lines) : null;
  const later = comingBack(run).map((p) => PROBLEM_MAP[p]?.label ?? p);
  // Where the problems left for now come back: after the union's last problem, or next once the board is past it.
  const whenBack = (fromIndex: number) => (fromIndex < run.problems.length - 1 ? `after ${PROBLEM_MAP[run.problems.at(-1)!]?.label}` : "next");
  const colour = groupOfStudent(assignmentGroupsOf(classroom, ASSIGNMENT.id), DEMO_STUDENT.id) ?? "sky";
  const attemptNo = attemptsOn(run).length;
  const hint = boardHint(run);
  // Keyed by the check's moment so each wrong check pops its own pill; the time guard keeps a reload from replaying it.
  const tryAgain = tryAgainShowing(run, now) ? tryAgainAt(run) : null;
  const ringAt = hintRingAt(run);
  // The ring's class stays a beat past its end (the clock ticks once a second); its CSS delay is the pill's life.
  const ringing = ringAt !== null && now < ringAt + HINT_RING_MS + 1_000;
  // The board's transcription so far, shared by every member: what the column shows and what the next burst reads on from.
  const revealed: RevealedLine[] = run.lines.map((tex, i) => ({ tex, strokeCount: i + 1 }));

  const addStroke = (next: Stroke[]) => dispatchClassroom({ type: "group/stroke", stroke: next[next.length - 1] });
  const onBurstEnd = (strokeCount: number) => {
    setRecognising(false);
    const line = nextLine(ownAttemptScript(pid, attemptNo), revealed, strokeCount);
    if (line) dispatchClassroom({ type: "group/line", tex: line.tex });
  };
  const undo = () => {
    setRecognising(false);
    dispatchClassroom({ type: "group/undo" });
  };
  const clear = () => {
    setRecognising(false);
    dispatchClassroom({ type: "group/clear" });
  };

  return (
    <div
      className="relative flex h-full min-h-0 flex-col px-8 py-5"
      style={{ "--try-again-ms": `${TRY_AGAIN_MS}ms`, "--hint-ring-ms": `${HINT_RING_MS}ms` } as CSSProperties}
      data-group-board
      data-problem={pid}
      data-holder={holder}
      data-resolved={resolved || undefined}
    >
      <GroupHeader
        session={session}
        label={problem.label}
        tex={problem.tex}
        right={
          <span className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${mine ? "bg-ink text-white" : "border border-line bg-paper text-ink"}`} data-pen>
            {mine ? "you have the pen" : `${first(holder)} has the pen`}
          </span>
        }
      >
        <span className="text-[13px] text-ink-muted" data-visit={visit.returning ? "return" : "first"}>
          {visit.returning ? "last try" : `${run.index + 1} of ${run.problems.length}`}
        </span>
      </GroupHeader>
      <div className="mt-2 flex items-center justify-between gap-3">
      <ul className="flex gap-1.5" aria-label="Group">
        {run.members.map((id) => (
          <li
            key={id}
            className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[12px] ${id === holder ? "border-ink bg-ink text-white" : "text-ink"}`}
            style={id === holder ? undefined : { borderColor: GROUP_HEX[colour].fill, backgroundColor: GROUP_HEX[colour].soft }}
            data-group-colour={colour}
          >
            <Avatar initials={id === DEMO_STUDENT.id ? DEMO_STUDENT.initials : CLASSMATE_MAP[id].initials} size="h-4 w-4 text-[8px]" />
            {first(id)}
          </li>
        ))}
      </ul>
        {later.length > 0 && (
          <span className="rounded-full border border-line bg-paper px-2.5 py-0.5 text-[12px] text-ink-soft" data-coming-back={later.join(",")}>
            {later.join(", ")} {later.length === 1 ? "comes" : "come"} back {whenBack(run.index)}
          </span>
        )}
      </div>

      {/* The board takes two thirds, the column the third beside it (the working screen's shape without its problem column). */}
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-[2fr_1fr] gap-5" data-board-row>
        <div className="flex min-h-0 flex-col rounded-2xl border border-line bg-paper" data-board>
          <PadSection
            title={mine ? "Your working" : `${first(holder)}'s working`}
            strokes={run.strokes}
            onStrokesChange={addStroke}
            onBurstEnd={onBurstEnd}
            onPenDown={() => setRecognising(true)}
            onUndo={undo}
            onClear={clear}
            readOnly={!mine || resolved || moving}
          />
        </div>

        {/* One pixel of top padding more than the pad's, for the board's border, so the two eyebrows sit on one line. */}
        <aside className="flex min-h-0 flex-col pt-[25px] pb-6" data-read-as>
          {wrongShown && (
            <div className="shrink-0 rounded-2xl border border-wrong-line bg-wrong-soft/60 px-3.5 py-3" data-wrong-check>
              <div className="flex items-center justify-between gap-2">
                <Eyebrow>Not yet</Eyebrow>
                <span className="text-[12px] text-ink-muted">first mistake in red</span>
              </div>
              <Lines lines={wrongShown} />
            </div>
          )}
          {hint && <HintCard hint={hint} label="Hint" lit={null} onLit={() => {}} className={`relative mt-3 shrink-0 ${ringing ? "ring-out" : ""}`} />}
          <ReadAs
            lines={revealed}
            recognising={recognising}
            empty={mine ? "Lines appear here as you write." : `Lines appear here as ${first(holder)} writes.`}
            className={wrongShown || hint ? "mt-4 flex-1" : "flex-1"}
          />
        </aside>
      </div>

      <div className="mt-3 flex items-center justify-end">
        {moving && (
          <span className="rounded-full border border-ink bg-ink px-3.5 py-1.5 text-[13px] font-medium text-white" data-leaving>
            leaving {problem.label} for now · back to it {whenBack(run.index)}
          </span>
        )}
        {mine && !resolved && !moving && (
          <Button variant="accent" onClick={() => dispatchClassroom({ type: "group/check" })} disabled={run.lines.length === 0 || recognising} data-check>
            Check
          </Button>
        )}
        {!mine && !resolved && !moving && <span className="text-[12.5px] text-ink-muted">{first(holder)} checks when ready</span>}
      </div>

      {tryAgain !== null && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center" aria-live="polite">
          <span key={tryAgain} className="try-again rounded-full border-2 border-accent-dark bg-standout-soft px-6 py-2.5 text-[17px] font-semibold text-accent-dark shadow-card" data-try-again>
            Try again
          </span>
        </div>
      )}
    </div>
  );
}

/** Every line of a wrong attempt, the first mistake red. */
function Lines({ lines }: { lines: MarkedLine[] }) {
  const size = "px-2.5 py-1.5 text-[13px]";
  return (
    <ol className="mt-2 space-y-1.5" data-cut>
      {lines.map((l, i) => {
        const tone = l.mark === "wrong" ? "border-wrong-line bg-wrong-soft" : "border-line bg-paper";
        const branches = branchesOf(l.tex);
        return branches.length === 2 ? (
          <li key={i} data-mark={l.mark ?? undefined} className="grid grid-cols-2 gap-1.5">
            {branches.map((b, j) => (
              <span key={j} className={`min-w-0 overflow-x-auto rounded-xl border ${size} ${tone} text-ink`}>
                <M tex={b} />
              </span>
            ))}
          </li>
        ) : (
          <li key={i} data-mark={l.mark ?? undefined} className={`rounded-xl border ${size} ${tone} text-ink`}>
            <M tex={l.tex} />
          </li>
        );
      })}
    </ol>
  );
}
