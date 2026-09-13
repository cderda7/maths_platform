"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import M from "@/components/Math";
import { Button, Eyebrow } from "@/components/ui";
import { DEMO_STUDENT, PROBLEM_MAP } from "@/data/assignment";
import { CLASSMATE_MAP } from "@/data/classmates";
import { branchesOf } from "@/lib/branches";
import { dispatchClassroom } from "@/lib/classroom-store";
import { groupRework, holdOver, holdProgress, markedVersions, marksAt, marksOpen } from "@/lib/debrief";
import { resolvedMoment, type GroupRun } from "@/lib/groupReview";
import type { LineMark } from "@/lib/examples";
import type { SessionAction, StudentSession } from "@/lib/session";
import { useNow } from "@/lib/store";
import GroupHeader from "./GroupHeader";

const first = (id: string) => (id === DEMO_STUDENT.id ? "you" : CLASSMATE_MAP[id]?.name.split(" ")[0] ?? id);

/**
 * After the group's rework checks correct: the student's handed-in and reworked versions beside
 * the group's, unmarked, for two seconds; then, on their own, the same three with full marks
 * (blue standouts on the group's rework) and Next, which waits out a ten-second hold. Nothing to
 * write (ticket 218). Both clocks run from the group's check, so a reload keeps the moment. Next
 * moves the group on if it is still on this problem; otherwise the student rejoins the live board.
 */
export default function GroupDebrief({ session, dispatch, run, problem }: { session: StudentSession; dispatch: (a: SessionAction) => void; run: GroupRun; problem: string }) {
  const now = useNow();
  const p = PROBLEM_MAP[problem];
  const own = { lines: (session.lines[problem] ?? []).map((l) => l.tex), rework: (session.rework[problem] ?? []).map((l) => l.tex) };
  const group = groupRework(run, problem)?.lines ?? [];
  const checkedAt = resolvedMoment(run, problem);
  const marked = marksOpen(checkedAt, now);
  const markedAt = marked ? marksAt(checkedAt) : null;
  const versions = markedVersions(problem, own, group);
  const progress = holdProgress(markedAt, now);
  const canNext = holdOver(markedAt, now);
  const holder = run.pen[problem];
  const groupStillHere = run.problems[run.index] === problem;
  const last = run.index >= run.problems.length - 1;

  const next = () => {
    dispatch({ type: "debrief/done", problem });
    if (groupStillHere) dispatchClassroom({ type: "group/next", at: Date.now() });
  };

  return (
    <div className="flex h-full min-h-0 flex-col px-8 py-5" data-debrief={problem} data-phase={marked ? "marked" : "unmarked"}>
      <GroupHeader
        session={session}
        label={p.label}
        tex={p.tex}
        right={
          <span className="rounded-full border border-secure-line bg-secure-soft px-3 py-1 text-[12.5px] font-medium text-ink" data-correct>
            the group got it · {first(holder)} wrote it
          </span>
        }
      />

      <div className={`mt-4 grid min-h-0 flex-1 gap-3 ${versions.length === 3 ? "grid-cols-3" : "grid-cols-2"}`} data-versions>
        {versions.map((v) => (
          <section
            key={v.label}
            className={`flex min-h-0 flex-col overflow-y-auto rounded-2xl border p-4 ${v.green ? "border-secure-line bg-secure-soft" : "border-line bg-paper"}`}
            data-version={v.label}
            data-green={v.green ? "" : undefined}
          >
            <Eyebrow>{v.label}</Eyebrow>
            <Lines lines={v.lines} marked={marked} onGreen={v.green} />
          </section>
        ))}
      </div>

      {/* The row keeps its height before the marks open, so the versions do not shrink when Next appears. */}
      <div className={`mt-4 flex items-center justify-end gap-3 ${marked ? "" : "invisible"}`} aria-hidden={!marked} data-next-row>
        {!canNext && <span className="text-[12.5px] text-ink-muted">take a moment to reflect</span>}
        <HoldRing progress={progress}>
          <Button variant="accent" disabled={!canNext} onClick={next} data-next>
            {last && groupStillHere ? "finish" : "next"}
          </Button>
        </HoldRing>
      </div>
    </div>
  );
}

/** The lines of one version; on a green pane (the group's rework, or an own version that matches it) a plain line box sits on green rather than white. */
function Lines({ lines, marked, onGreen }: { lines: { tex: string; mark: LineMark }[]; marked: boolean; onGreen: boolean }) {
  if (lines.length === 0) return <p className="mt-2 text-[12.5px] text-ink-muted">not attempted</p>;
  return (
    <ol className="mt-2 space-y-1.5">
      {lines.map((l, i) => {
        const mark = marked ? l.mark : null;
        const tone = mark === "wrong" ? "border-wrong-line bg-wrong-soft" : mark === "standout" ? "border-standout-line bg-standout-soft" : onGreen ? "border-secure-line bg-paper/70" : "border-line bg-cream/40";
        const box = `rounded-xl border px-3 py-2 text-[14.5px] text-ink ${tone}`;
        const branches = branchesOf(l.tex);
        return branches.length === 2 ? (
          <li key={i} data-mark={mark ?? undefined} className="grid grid-cols-2 gap-1.5">
            {branches.map((b, j) => (
              <span key={j} className={`min-w-0 overflow-x-auto ${box}`}>
                <M tex={b} />
              </span>
            ))}
          </li>
        ) : (
          <li key={i} data-mark={mark ?? undefined} className={box}>
            <M tex={l.tex} />
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The hold's ring: a pill drawn in pixels around whatever it wraps, 4 px out, filling clockwise
 * with `progress`. Sized from the child by a ResizeObserver, so it fits "next" and "finish" alike;
 * a fixed viewBox would keep a circle and let it drift off a wide button. Once the hold is over
 * (`progress` 1, the same moment `holdOver` enables the button) the ring is not drawn at all.
 */
function HoldRing({ progress, children }: { progress: number; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const gap = 4;
  const stroke = 2;
  const w = box.w + gap * 2;
  const h = box.h + gap * 2;
  const r = (h - stroke) / 2;
  return (
    <span ref={ref} className="relative inline-flex">
      {box.w > 0 && progress < 1 && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="pointer-events-none absolute" style={{ left: -gap, top: -gap }} aria-hidden data-ring>
          <rect x={stroke / 2} y={stroke / 2} width={w - stroke} height={h - stroke} rx={r} fill="none" stroke="var(--color-accent-line)" strokeWidth={stroke} />
          <rect x={stroke / 2} y={stroke / 2} width={w - stroke} height={h - stroke} rx={r} fill="none" stroke="var(--color-accent)" strokeWidth={stroke} pathLength={100} strokeDasharray={100} strokeDashoffset={100 - progress * 100} style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
      )}
      {children}
    </span>
  );
}
