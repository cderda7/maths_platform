"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import M from "@/components/Math";
import { Button, Eyebrow } from "@/components/ui";
import { DEMO_STUDENT, PROBLEM_MAP } from "@/data/assignment";
import { CLASSMATE_MAP } from "@/data/classmates";
import { branchesOf } from "@/lib/branches";
import { dispatchClassroom } from "@/lib/classroom-store";
import { debriefPrompt, groupRework, holdOver, holdProgress, markedVersions, PROMPT_TEXT } from "@/lib/debrief";
import type { GroupRun } from "@/lib/groupReview";
import type { LineMark } from "@/lib/examples";
import type { SessionAction, StudentSession } from "@/lib/session";
import { useNow } from "@/lib/store";

const first = (id: string) => (id === DEMO_STUDENT.id ? "you" : CLASSMATE_MAP[id]?.name.split(" ")[0] ?? id);

/**
 * After the group's rework checks correct: the student's handed-in and reworked versions beside
 * the group's, unmarked, with one prompt from their own history; then, once they have written,
 * the same three with full marks (blue standouts on the group's rework) and a ten-second hold
 * before Next. The note stays editable throughout. Next moves the group on if it is still on
 * this problem; otherwise the student simply rejoins the live board.
 */
export default function GroupDebrief({ session, dispatch, run, problem }: { session: StudentSession; dispatch: (a: SessionAction) => void; run: GroupRun; problem: string }) {
  const now = useNow();
  const p = PROBLEM_MAP[problem];
  const own = { lines: (session.lines[problem] ?? []).map((l) => l.tex), rework: (session.rework[problem] ?? []).map((l) => l.tex) };
  const group = groupRework(run, problem)?.lines ?? [];
  const note = session.debrief[problem];
  const prompt = note?.prompt ?? debriefPrompt(problem, own);
  const text = note?.text ?? "";
  const marked = note?.markedAt !== null && note?.markedAt !== undefined;
  const versions = markedVersions(problem, own, group);
  const progress = holdProgress(note?.markedAt ?? null, now);
  const canNext = holdOver(note?.markedAt ?? null, now);
  const holder = run.pen[problem];
  const groupStillHere = run.problems[run.index] === problem;
  const last = run.index >= run.problems.length - 1;

  const next = () => {
    dispatch({ type: "debrief/done", problem });
    if (groupStillHere) dispatchClassroom({ type: "group/next", at: Date.now() });
  };

  return (
    <div className="flex h-full min-h-0 flex-col px-8 py-5" data-debrief={problem} data-phase={marked ? "marked" : "note"}>
      <div className="flex items-center gap-4">
        <span className="font-display text-[26px] text-ink">{p.label}</span>
        <span className="math-lg text-ink">
          <M tex={p.tex} />
        </span>
        <span className="rounded-full border border-secure-line bg-secure-soft px-3 py-1 text-[12.5px] font-medium text-ink" data-correct>
          the group got it · {first(holder)} wrote it
        </span>
      </div>

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

      <div className="mt-4 rounded-2xl border border-line bg-paper p-4" data-note>
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-medium text-ink">{PROMPT_TEXT[prompt]}</span>
          <span className="text-[12px] text-ink-muted">only your teacher reads this</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => dispatch({ type: "debrief/note", problem, prompt, text: e.target.value })}
          rows={2}
          placeholder="one or two sentences…"
          aria-label={PROMPT_TEXT[prompt]}
          data-note-text
          className="mt-2 w-full resize-none rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-[14.5px] text-ink placeholder:text-ink-muted focus:border-ink-muted focus:outline-none"
        />
        <div className="mt-3 flex items-center justify-end gap-3">
          {!marked ? (
            <Button variant="accent" disabled={text.trim() === ""} onClick={() => dispatch({ type: "debrief/marks", problem, at: Date.now() })} data-show-marks>
              show me the marks
            </Button>
          ) : (
            <>
              {!canNext && <span className="text-[12.5px] text-ink-muted">take a moment to reflect</span>}
              <HoldRing progress={progress}>
                <Button variant="accent" disabled={!canNext} onClick={next} data-next>
                  {last && groupStillHere ? "finish" : "next"}
                </Button>
              </HoldRing>
            </>
          )}
        </div>
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
 * a fixed viewBox would keep a circle and let it drift off a wide button.
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
      {box.w > 0 && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="pointer-events-none absolute" style={{ left: -gap, top: -gap }} aria-hidden data-ring>
          <rect x={stroke / 2} y={stroke / 2} width={w - stroke} height={h - stroke} rx={r} fill="none" stroke="var(--color-accent-line)" strokeWidth={stroke} />
          <rect x={stroke / 2} y={stroke / 2} width={w - stroke} height={h - stroke} rx={r} fill="none" stroke="var(--color-accent)" strokeWidth={stroke} pathLength={100} strokeDasharray={100} strokeDashoffset={100 - progress * 100} style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
      )}
      {children}
    </span>
  );
}
