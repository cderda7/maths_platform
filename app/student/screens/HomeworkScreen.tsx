"use client";

import { memo, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Card } from "@/components/ui";
import SkillColumns from "@/components/SkillColumns";
import HomeworkFlight, { type Box } from "@/components/HomeworkFlight";
import { ASSIGNMENT } from "@/data/assignment";
import type { Problem } from "@/data/types";
import { useAssignment } from "@/lib/classroom-store";
import { sessionEvidence, sessionHierarchy } from "@/lib/hierarchy";
import { bankedCount, homeworkDone, homeworkProblems, tileMoment } from "@/lib/homework";
import { useFrameNow, useNow } from "@/lib/store";
import type { StudentSession } from "@/lib/session";

/** `prefers-reduced-motion`, live. */
function subscribeMotion(cb: () => void) {
  const q = window.matchMedia("(prefers-reduced-motion: reduce)");
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
}
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const useReducedMotion = () => useSyncExternalStore(subscribeMotion, reducedMotion, () => false);

/**
 * After the report is sent (ticket 256): the student's Q tiles in set order, right or wrong, beside a Homework folder,
 * over the report's skill dots. One problem at a time, each problem they ever got wrong leaves its tile (the slot stays,
 * dashed, so nothing beside it moves), expands over the screen to its question, changes into a similar question and flies
 * into the folder (`HomeworkFlight`); right tiles never move. A student with nothing wrong sees the tiles stay and a line
 * saying nothing was added. Everything is derived from when the report was sent, so a reload picks the sequence up where
 * it was. No difficulty tags here: this is the student's side.
 */
export default function HomeworkScreen({ session }: { session: StudentSession }) {
  const assignment = useAssignment();
  const { problems } = assignment;
  const banked = homeworkProblems(session, problems);
  const reduced = useReducedMotion();
  const now = useNow();
  const done = homeworkDone(banked.length, reduced);
  // Frames only while something can still move; the one-second clock says when that is over.
  const moving = now !== 0 && now - session.homeworkAt < done + 1000;
  const frame = useFrameNow(moving);
  const clock = moving && frame !== 0 ? frame : now;
  // Before the clock's first tick nothing is known: every tile in its place.
  const elapsed = clock === 0 ? -1 : clock - session.homeworkAt;

  const stage = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<{ slots: Record<string, Box>; folder: Box; width: number; height: number } | null>(null);
  useLayoutEffect(() => {
    const root = stage.current;
    if (!root) return;
    // Layout px relative to the screen: the iPad stage scales rects, so divide its scale back out.
    const measure = () => {
      const r = root.getBoundingClientRect();
      const scale = r.width / root.offsetWidth || 1;
      const box = (el: Element): Box => {
        const b = el.getBoundingClientRect();
        return { left: (b.left - r.left) / scale, top: (b.top - r.top) / scale, width: b.width / scale, height: b.height / scale };
      };
      const slots = Object.fromEntries([...root.querySelectorAll("[data-hw-tile]")].map((el) => [el.getAttribute("data-hw-tile")!, box(el)]));
      const folder = root.querySelector("[data-hw-folder-icon]");
      if (folder) setGeometry({ slots, folder: box(folder), width: root.offsetWidth, height: root.offsetHeight });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  const count = elapsed < 0 ? 0 : bankedCount(banked.length, elapsed, reduced);
  const moments = banked.map((p, i) => ({ problem: p, ...(elapsed < 0 ? { phase: "waiting" as const, p: 0 } : tileMoment(i, elapsed, reduced)) }));
  const active = moments.find((m) => m.phase !== "waiting" && m.phase !== "banked");
  const left = new Set(moments.filter((m) => m.phase !== "waiting").map((m) => m.problem.id));
  const everWrong = new Set(banked.map((p) => p.id));

  return (
    <div ref={stage} className="relative h-full" data-homework data-hw-count={count} data-hw-active={active?.problem.id ?? ""} data-hw-phase={active?.phase ?? ""}>
      <div className="flex h-full min-h-0 flex-col px-9 py-7">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display whitespace-nowrap text-[30px] leading-tight text-ink">Your next homework</h1>
          <span className="whitespace-nowrap rounded-full border border-secure-line bg-secure-soft px-3.5 py-1.5 text-[13px] text-ink" data-sent>
            Report sent to {ASSIGNMENT.teacher}
          </span>
        </div>

        <Card className="mt-4 shrink-0 px-6 py-5" data-hw-tiles>
          <div className="flex items-center justify-between gap-6">
            <ul className="flex flex-wrap gap-2" aria-label="Your problems">
              {problems.map((p) => (
                <Tile key={p.id} problem={p} wrong={everWrong.has(p.id)} gone={left.has(p.id)} />
              ))}
            </ul>
            <Folder count={count} />
          </div>
          {banked.length === 0 && (
            <p className="mt-3 text-[13.5px] text-ink-muted" data-hw-none>
              Nothing added: every problem right first time
            </p>
          )}
        </Card>

        <SkillsCard session={session} />
      </div>

      {active && geometry && geometry.slots[active.problem.id] && (
        <HomeworkFlight key={active.problem.id} problem={active.problem} phase={active.phase} p={active.p} slot={geometry.slots[active.problem.id]} folder={geometry.folder} bounds={{ width: geometry.width, height: geometry.height }} reduced={reduced} />
      )}
    </div>
  );
}

/** A Q tile in the report's look, green right or red wrong; once its problem has gone to homework, a dashed slot of the same size. */
function Tile({ problem, wrong, gone }: { problem: Problem; wrong: boolean; gone: boolean }) {
  const tint = gone ? "border-dashed border-line-strong bg-transparent" : wrong ? "border-wrong-line bg-wrong-soft" : "border-secure-line bg-secure-soft";
  return (
    <li
      className={`inline-flex h-12 min-w-[68px] items-center justify-center gap-1.5 rounded-lg border px-3 text-[15px] font-medium text-ink ${tint}`}
      data-hw-tile={problem.id}
      data-mark={wrong ? "wrong" : "right"}
      data-gone={gone || undefined}
      aria-label={`${problem.label}: ${wrong ? (gone ? "wrong, in your homework" : "wrong") : "right"}`}
    >
      {/* A slot keeps its label, faint, so the row still reads Q1 to Q10 once a problem has gone to homework. */}
      <span className={gone ? "text-ink-muted/60" : ""}>{problem.label}</span>
      <span className={`text-[12px] leading-none ${gone ? "invisible" : wrong ? "text-wrong-deep" : "text-secure"}`} aria-hidden>
        {wrong ? "✕" : "✓"}
      </span>
    </li>
  );
}

/** The Homework folder and how many problem types are in it; the count bumps each time one lands. */
function Folder({ count }: { count: number }) {
  return (
    <div className="flex shrink-0 items-center gap-3" data-hw-folder aria-live="polite" aria-label={`Homework: ${count} problem ${count === 1 ? "type" : "types"}`}>
      <div className="relative" data-hw-folder-icon>
        <svg viewBox="0 0 64 50" className="h-[50px] w-16" aria-hidden>
          <path d="M4 10a4 4 0 0 1 4-4h15l5 5h28a4 4 0 0 1 4 4v29a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#d6d0f7" />
          <path d="M4 17a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v27a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#eeebfc" stroke="#5b4ae8" strokeWidth="1.5" />
        </svg>
        <span key={count} className={`absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1.5 text-[12px] font-semibold text-white ${count > 0 ? "hw-bump" : ""}`} data-hw-folder-count>
          {count}
        </span>
      </div>
      <span className="text-[14px] font-medium text-ink">Homework</span>
    </div>
  );
}

/** The report's skill dots, fixed; memoised so the sequence's frames never re-render them. */
const SkillsCard = memo(function SkillsCard({ session }: { session: StudentSession }) {
  const assignment = useAssignment();
  const hierarchy = sessionHierarchy(session, assignment);
  const lines = sessionEvidence(session).lines;
  return (
    <Card className="mt-3 shrink-0" data-hierarchy>
      <SkillColumns result={hierarchy} lines={lines} problems={assignment.problems} mode="expanded" locked student />
    </Card>
  );
});
