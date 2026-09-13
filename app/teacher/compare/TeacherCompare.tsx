"use client";

import Link from "next/link";
import { assignmentHref, LIVE_ASSIGNMENT_ID } from "@/lib/assignments";
import TeacherChrome from "../TeacherChrome";
import M from "@/components/Math";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { DifficultyTag, LeafChip } from "@/components/Tag";
import { DEMO_STUDENT } from "@/data/assignment";
import { evaluateLine } from "@/lib/evaluate";
import { useBatchedSession } from "@/lib/store";
import { useAssignmentBundle } from "../AssignmentContext";
import { alignVersions, changedRowCount, rowChanged, versionsOf } from "@/lib/versions";

const time = (ms: number) => (ms > 0 ? new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—");

/** The demo student's handed-in working beside their final working, changed lines called out. */
export default function TeacherCompare() {
  const assignment = useAssignmentBundle();
  const { session } = useBatchedSession(3000);
  const versions = session ? versionsOf(session) : null;
  const aligned = versions ? alignVersions(versions[0], versions[1]) : [];
  const changed = changedRowCount(aligned);
  const reworked = session ? Object.keys(session.rework).filter((id) => (session.rework[id]?.length ?? 0) > 0).length : 0;

  return (
    <TeacherChrome>
      <Eyebrow>
        {assignment.className} · {assignment.title}
      </Eyebrow>
      <div className="mt-3 flex items-end justify-between">
        <div className="flex items-center gap-4">
          <Avatar initials={DEMO_STUDENT.initials} size="h-12 w-12 text-[15px]" />
          <H1>Before and after</H1>
        </div>
        <Link href={assignmentHref(LIVE_ASSIGNMENT_ID, "mistakes")} className="text-[13.5px] text-accent-deep hover:underline">
          ← Where it went wrong
        </Link>
      </div>

      {!session || reworked === 0 ? (
        <Card className="mt-8 border-dashed p-6 text-[14px] text-ink-soft">
          {session ? "No rework yet" : "Nothing yet"}
        </Card>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-6">
            {versions!.map((v) => (
              <div key={v.id} className="flex items-baseline justify-between px-1">
                <span className="text-[14px] font-medium text-ink">{v.label}</span>
                <span className="text-[12.5px] text-ink-muted">{time(v.at)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-4" data-compare>
            {aligned.map((a) => (
              <Card key={a.problem.id} className="overflow-hidden" data-problem={a.problem.id}>
                <div className="flex items-center justify-between border-b border-line px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-[20px] text-ink">{a.problem.label}</span>
                    <DifficultyTag d={a.problem.difficulty} />
                    <span className="ml-1 text-[17px] text-ink">
                      <M tex={a.problem.tex} />
                    </span>
                  </div>
                  <span className={`text-[12.5px] ${a.changed ? "text-accent-deep" : "text-ink-muted"}`}>
                    {a.changed ? `${a.rows.filter(rowChanged).length} lines changed` : "unchanged"}
                  </span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-line">
                  {(["left", "right"] as const).map((side) => (
                    <ol key={side} className="space-y-2 px-5 py-4">
                      {a.rows.map((r, i) => {
                        const l = side === "left" ? r.left : r.right;
                        const v = l ? evaluateLine(a.problem.id, l.tex) : null;
                        const wrong = side === "left" && v?.verdict === "wrong";
                        const diff = side === "right" && rowChanged(r) && l;
                        const cls = !l
                          ? "border-transparent"
                          : wrong
                            ? "border-wrong-line bg-wrong-soft"
                            : diff
                              ? "border-accent-line bg-accent-soft/40"
                              : "border-line bg-paper";
                        return (
                          <li key={i} className={`flex h-12 items-center justify-between rounded-xl border px-4 ${cls}`} data-changed={diff ? "true" : undefined}>
                            {l ? (
                              <>
                                <span className="text-[16px] text-ink">
                                  <M tex={l.tex} />
                                </span>
                                <span className="flex items-center gap-2 text-[11.5px] text-ink-muted">
                                  {v && v.verdict !== "unclear" && (
                                    <>
                                      {v.label}
                                      <LeafChip id={v.tags[0].leaf} />
                                    </>
                                  )}
                                  {diff && <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">changed</span>}
                                </span>
                              </>
                            ) : (
                              <span className="text-[12px] text-ink-muted/60">—</span>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] text-ink-muted">
            {changed} lines changed · {reworked} of {assignment.problems.length} problems reworked
          </p>
        </>
      )}
    </TeacherChrome>
  );
}
