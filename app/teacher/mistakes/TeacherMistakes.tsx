"use client";

import { useState } from "react";
import Link from "next/link";
import TeacherChrome from "../TeacherChrome";
import M from "@/components/Math";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { DifficultyTag, SlipChip } from "@/components/Tag";
import { ASSIGNMENT } from "@/data/assignment";
import { groupBySlip, mistakesByProblem } from "@/lib/mistakes";
import { useBatchedSession } from "@/lib/store";
import { useAssignment } from "@/lib/classroom-store";

// The same button as the class view's row actions ("see dot skills" / "close").
const ACTION = "w-[96px] rounded-md px-2 py-[3px] text-[11px] font-medium leading-snug transition-colors";
const ACTION_IDLE = `${ACTION} bg-standout-soft text-accent-deep hover:bg-standout-line`;
const ACTION_ACTIVE = `${ACTION} bg-accent text-white hover:bg-accent-deep`;

/**
 * Mistakes by problem. Under each problem the students who slipped sit side by side, those who
 * slipped on the same step next to each other under one pill that spans them. Any number of
 * problems can be open at once: clicking the problem's header, any student, or the "expand"
 * button that shows on hover opens every student's working for that problem in columns, the
 * wrong line in red. An open problem carries a "close" button; once pressed, the button reads
 * "close all" (while other problems are still open) until the pointer leaves the card.
 */
export default function TeacherMistakes() {
  const { session } = useBatchedSession(3000);
  const problems = mistakesByProblem(session);
  const [open, setOpen] = useState<string[]>([]);
  /** The problem just closed by hand: its button offers "close all" until the pointer leaves it. */
  const [armed, setArmed] = useState<string | null>(null);

  const show = (id: string) => setOpen((o) => (o.includes(id) ? o : [...o, id]));
  const hide = (id: string) => {
    setOpen((o) => o.filter((x) => x !== id));
    setArmed(id);
  };
  const toggle = (id: string) => (open.includes(id) ? hide(id) : show(id));

  return (
    <TeacherChrome>
      <Eyebrow>
        {ASSIGNMENT.className} · {useAssignment().title}
      </Eyebrow>
      <H1 className="mt-3">Where it went wrong</H1>

      <div className="mt-10 space-y-6">
        {problems.map(({ problem, rows }) => {
          const isOpen = open.includes(problem.id);
          const othersOpen = open.some((id) => id !== problem.id);
          const groups = groupBySlip(rows);
          const ordered = groups.flatMap((g) => g.rows);
          const column = (i: number) => (i === 0 ? "" : "border-l border-line");
          // Hover shows "expand"; open shows "close" until pressed; just closed shows "close all" while others are open.
          const action: { word: "expand" | "close" | "close all"; cls: string; visible: boolean } = isOpen
            ? { word: "close", cls: ACTION_ACTIVE, visible: true }
            : armed === problem.id && othersOpen
              ? { word: "close all", cls: ACTION_ACTIVE, visible: true }
              : { word: "expand", cls: ACTION_IDLE, visible: false };
          const act = () => {
            if (action.word === "close all") {
              setOpen([]);
              setArmed(null);
            } else toggle(problem.id);
          };
          return (
            <Card
              key={problem.id}
              className="group/q overflow-hidden"
              data-problem={problem.id}
              data-open={isOpen || undefined}
              onMouseLeave={() => armed === problem.id && setArmed(null)}
            >
              <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4" onClick={() => toggle(problem.id)} data-problem-header={problem.id}>
                <div className="flex items-center gap-4">
                  <span className="font-display text-[24px] text-ink">{problem.label}</span>
                  <span className="math-lg text-ink">
                    <M tex={problem.tex} />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // A mouse click leaves focus on the button, which would keep it visible after the pointer leaves; keyboard activation (detail 0) keeps it.
                      if (e.detail) e.currentTarget.blur();
                      act();
                    }}
                    className={`${action.cls} ${action.visible ? "" : "invisible group-hover/q:visible group-focus-within/q:visible"}`}
                    aria-expanded={isOpen}
                    data-problem-action={problem.id}
                  >
                    {action.word}
                  </button>
                </div>
                <DifficultyTag d={problem.difficulty} />
              </div>
              <div className="overflow-x-auto">
                <div className="grid" style={{ gridTemplateColumns: `repeat(${ordered.length}, minmax(230px, 1fr))` }} data-students>
                  {ordered.map((r, i) => {
                    const key = `${problem.id}:${r.id}`;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggle(problem.id)}
                        aria-expanded={isOpen}
                        className={`row-start-1 flex min-w-0 items-center gap-3 px-5 pt-4 pb-3.5 text-left transition-colors hover:bg-cream-deep/40 ${column(i)} ${isOpen ? "bg-accent-soft/30" : ""}`}
                        style={{ gridColumn: i + 1 }}
                        data-row={key}
                      >
                        <Avatar initials={r.initials} />
                        <span className="truncate font-medium text-ink">{r.name}</span>
                        {r.live && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent-line bg-paper px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-deep">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden /> live
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {groups.map((g) => (
                    <div
                      key={g.slips.join("|")}
                      className={`row-start-2 flex min-w-0 items-start gap-1.5 pr-5 pb-4 pl-5 ${column(g.start)} ${isOpen ? "bg-accent-soft/30" : ""}`}
                      style={{ gridColumn: `${g.start + 1} / span ${g.rows.length}` }}
                      data-slip-group={g.rows.map((r) => r.id).join(",")}
                    >
                      {g.slips.map((id) => (
                        <SlipChip key={id} id={id} className="min-w-0 flex-1 justify-start" />
                      ))}
                    </div>
                  ))}
                  {isOpen &&
                    ordered.map((r, i) => (
                      <div key={r.id} className={`row-start-3 min-w-0 border-t border-line bg-cream/60 px-5 py-4 ${column(i)}`} style={{ gridColumn: i + 1 }} data-expanded={`${problem.id}:${r.id}`}>
                        <ol className="space-y-2">
                          {r.lines.map((l, j) => {
                            const wrong = l.verdict.verdict === "wrong";
                            return (
                              <li key={j} className={`rounded-xl border px-4 py-2.5 text-[17px] text-ink ${wrong ? "border-wrong-line bg-wrong-soft" : "border-line bg-paper"}`} data-wrong={wrong || undefined}>
                                <M tex={l.tex} />
                              </li>
                            );
                          })}
                        </ol>
                        {r.live && (
                          <div className="mt-3 flex items-center justify-between text-[12.5px] text-ink-muted">
                            <span>As handed in</span>
                            <Link href="/teacher/compare" className="text-accent-deep hover:underline" data-compare-link>
                              Original vs final →
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          );
        })}
        {problems.length === 0 && <Card className="p-6 text-[14px] text-ink-muted">No slips yet</Card>}
      </div>
    </TeacherChrome>
  );
}
