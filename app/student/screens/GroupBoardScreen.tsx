"use client";

import { useState } from "react";
import M from "@/components/Math";
import PadSection from "@/components/PadSection";
import { Avatar, Button, Eyebrow } from "@/components/ui";
import { DEMO_STUDENT, PROBLEM_MAP } from "@/data/assignment";
import { CLASSMATE_MAP } from "@/data/classmates";
import { GROUP_HEX } from "@/data/groups";
import type { Stroke } from "@/data/types";
import { branchesOf } from "@/lib/branches";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { attemptsOn, cutAtFirstMistake, currentProblem, lastAttempt, ownAttemptScript, penHolder, resolvedCurrent, type CutView } from "@/lib/groupReview";
import { nextLine, type RevealedLine } from "@/lib/recognition";
import { groupOfStudent, seatingOf } from "@/lib/seating";
import type { SessionAction, StudentSession } from "@/lib/session";
import GroupDebrief from "./GroupDebrief";
import { pendingDebrief } from "@/lib/debrief";
import GroupHeader from "./GroupHeader";

const first = (id: string) => (id === DEMO_STUDENT.id ? "You" : CLASSMATE_MAP[id]?.name.split(" ")[0] ?? id);

/**
 * Group review on one shared whiteboard. The board alone while the pen-holder writes (a live
 * mirror for the other three); Check for the pen-holder only. A wrong check shows the board's
 * transcription up to the first mistake with the rest as a count, the board kept. A correct check
 * opens the debrief.
 */
export default function GroupBoardScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const classroom = useClassroom();
  const run = classroom.group ?? null;
  const [recognising, setRecognising] = useState(false);
  if (!run) return <p className="mt-16 text-center text-[15px] text-ink-muted">Setting up the whiteboard…</p>;
  // A resolved problem the student has not yet moved on from: their debrief, whether or not the group has moved on.
  const debriefing = pendingDebrief(run, session.debrief);
  if (debriefing) return <GroupDebrief session={session} dispatch={dispatch} run={run} problem={debriefing} />;
  const pid = currentProblem(run)!;
  const problem = PROBLEM_MAP[pid];
  const holder = penHolder(run)!;
  const mine = holder === DEMO_STUDENT.id;
  const resolved = resolvedCurrent(run);
  const last = lastAttempt(run);
  const wrongShown = last && !last.correct ? cutAtFirstMistake(pid, last.lines) : null;
  const colour = groupOfStudent(seatingOf(classroom.groups), DEMO_STUDENT.id) ?? "sky";
  const attemptNo = attemptsOn(run).length;

  const addStroke = (next: Stroke[]) => dispatchClassroom({ type: "group/stroke", stroke: next[next.length - 1] });
  const onBurstEnd = (strokeCount: number) => {
    setRecognising(false);
    const revealed: RevealedLine[] = run.lines.map((tex, i) => ({ tex, strokeCount: i + 1 }));
    const line = nextLine(ownAttemptScript(pid, attemptNo), revealed, strokeCount);
    if (line) dispatchClassroom({ type: "group/line", tex: line.tex });
  };

  return (
    <div className="flex h-full min-h-0 flex-col px-8 py-5" data-group-board data-problem={pid} data-holder={holder} data-resolved={resolved || undefined}>
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
        <span className="text-[13px] text-ink-muted">
          {run.index + 1} of {run.problems.length}
        </span>
      </GroupHeader>
      <ul className="mt-2 flex gap-1.5" aria-label="Group">
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

      {wrongShown && !resolved && (
        <div className="mt-3 rounded-2xl border border-wrong-line bg-wrong-soft/60 px-4 py-3" data-wrong-check>
          <div className="flex items-center justify-between">
            <Eyebrow>Not yet · read as</Eyebrow>
            <span className="text-[12px] text-ink-muted">up to the first mistake</span>
          </div>
          <Lines view={wrongShown} />
        </div>
      )}

      <div className="mt-3 flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-paper" data-board>
        <PadSection
          title={mine ? "Your working" : `${first(holder)}'s working`}
          strokes={run.strokes}
          onStrokesChange={addStroke}
          onBurstEnd={onBurstEnd}
          onPenDown={() => setRecognising(true)}
          onUndo={() => dispatchClassroom({ type: "group/undo" })}
          onClear={() => dispatchClassroom({ type: "group/clear" })}
          readOnly={!mine || resolved}
        />
      </div>

      <div className="mt-3 flex items-center justify-end">
        {mine && !resolved && (
          <Button variant="accent" onClick={() => dispatchClassroom({ type: "group/check" })} disabled={run.lines.length === 0 || recognising} data-check>
            Check
          </Button>
        )}
        {!mine && !resolved && <span className="text-[12.5px] text-ink-muted">{first(holder)} checks when ready</span>}
      </div>
    </div>
  );
}

/** Lines cut at the first mistake: the last shown line red, the rest a count. */
function Lines({ view, compact = false }: { view: CutView; compact?: boolean }) {
  const size = compact ? "px-2.5 py-1.5 text-[13px]" : "px-3.5 py-2 text-[15px]";
  return (
    <ol className="mt-2 space-y-1.5" data-cut>
      {view.shown.map((l, i) => {
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
      {view.hidden > 0 && (
        <li className="px-1 text-[12px] text-ink-muted" data-hidden={view.hidden}>
          {view.hidden} more {view.hidden === 1 ? "line" : "lines"}
        </li>
      )}
    </ol>
  );
}
