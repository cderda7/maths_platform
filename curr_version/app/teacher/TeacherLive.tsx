"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import TeacherChrome from "./TeacherChrome";
import DiagnosticPush from "./DiagnosticPush";
import ForceSubmit from "./ForceSubmit";
import WholeClassCard from "./WholeClassCard";
import HierarchyDrill from "@/components/HierarchyDrill";
import StatusKey from "@/components/StatusKey";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { StatusDot, STATUS_WORD } from "@/components/Tag";
import { ASSIGNMENT, DEMO_STUDENT, unitLabel } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { categoryName, groupName, leafName, type CategoryId } from "@/data/taxonomy";
import type { Confidence } from "@/data/types";
import { pathwayOf } from "@/lib/classroom";
import { useAssignment, useClassroom } from "@/lib/classroom-store";
import { classmateEvidence, hierarchyFor, problemsStarted, sessionEvidence, type Evidence } from "@/lib/hierarchy";
import { pathwayChip } from "@/lib/pathway";
import type { StudentSession } from "@/lib/session";
import { useBatchedSession, useNow } from "@/lib/store";

function confidenceWord(c: Confidence | null): { text: string; tone: string } {
  if (!c) return { text: "—", tone: "text-ink-muted" };
  if (c.level === "confident") return { text: "confident", tone: "text-secure" };
  if (c.level === "low") return { text: "low", tone: "text-standout" };
  return { text: `low: ${categoryName(c.category).short.toLowerCase()}`, tone: "text-standout" };
}

function stageWord(s: StudentSession): string {
  if (s.overlay) return `Practising ${leafName(s.overlay).short}`;
  if (s.prompt) return `Offered ${leafName(s.prompt.leaf).short} practice`;
  switch (s.stage) {
    case "overview":
      return "Reading the set";
    case "practice":
      return "Warming up";
    case "confidence":
      return "Confidence check";
    case "working":
      return `On ${ASSIGNMENT.problems[s.problemIndex]?.label ?? ""}`;
    case "feedback":
      return "Handed in";
    case "waiting":
      return "Handed in · waiting";
    case "frozen":
      return "Frozen · whole-class review";
    case "rework":
      return "Reworking on their own";
    case "group-pass":
    case "group-discuss":
      return "In group review";
    case "report":
      return s.reportSent ? "Report sent" : "Writing their reflection";
    case "peers":
      return "Reading class patterns";
    case "history":
      return "Looking back at their working";
    default:
      return s.stage;
  }
}

function ago(ms: number | null, now: number): string {
  if (ms === null || now === 0) return "";
  const s = Math.max(0, Math.round((now - ms) / 1000));
  return s <= 1 ? "just now" : `${s}s ago`;
}

const HANDED_IN = ["overview", "practice", "confidence", "working"];

/**
 * "Where the class is": one row per student, one column per category the assignment touches
 * (canonical order), each dot the worst status beneath it. Clicking a dot expands that row into
 * the category → group → leaf → work drill. The demo student's row is live (in batches);
 * classmates come through the same evidence path from their scripted attempts.
 */
export default function TeacherLive() {
  const { session, updatedAt, everyMs } = useBatchedSession(3000);
  const live = session ?? null;
  const now = useNow();
  const { title, problems } = useAssignment();
  const classroom = useClassroom();
  const wc = classroom.wholeClass;
  const status = wc?.status === "active" ? " · in whole-class review" : wc?.status === "ended" ? " · complete" : "";
  const [open, setOpen] = useState<{ student: string; category: CategoryId; left: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  /** Where the tree's dots go: the clicked dot's left edge, relative to the drill cell's content edge (td px-5 = 20px). */
  const dotOffset = (btn: HTMLButtonElement) => {
    const table = tableRef.current?.getBoundingClientRect();
    const dot = btn.querySelector("[data-status]")?.getBoundingClientRect();
    return table && dot ? dot.left - table.left - 20 : 0;
  };

  const rows: { id: string; name: string; initials: string; live: boolean; evidence: Evidence; sub: string; confidence: { text: string; tone: string }; set: string; setSub: string }[] = [
    {
      id: DEMO_STUDENT.id,
      name: DEMO_STUDENT.name,
      initials: DEMO_STUDENT.initials,
      live: true,
      evidence: live ? sessionEvidence(live) : { lines: {}, submitted: false, caution: [] },
      sub: live ? stageWord(live) : "Not started",
      confidence: confidenceWord(live?.confidence ?? null),
      set: `${live ? problemsStarted(live) : 0}/${problems.length}`,
      setSub: live && !HANDED_IN.includes(live.stage) ? "handed in" : live && problemsStarted(live) > 0 ? "in progress" : "",
    },
    ...CLASSMATES.map((c) => ({
      id: c.id,
      name: c.name,
      initials: c.initials,
      live: false,
      evidence: classmateEvidence(c, problems),
      sub: c.note ?? "",
      confidence: { text: c.confidence, tone: c.confidence === "confident" ? "text-secure" : "text-standout" },
      set: `${Math.min(c.done, problems.length)}/${problems.length}`,
      setSub: c.when,
    })),
  ];
  const results = rows.map((r) => hierarchyFor(r.evidence, problems));
  const columns = results[0]?.columns ?? [];
  const caution = live?.escalation.caution ?? [];

  return (
    <TeacherChrome>
      <Eyebrow>
        {ASSIGNMENT.className} · {unitLabel(ASSIGNMENT.unit)}
      </Eyebrow>
      <H1 className="mt-3">Where the class is</H1>
      <p className="mt-3 flex items-center gap-3 text-[14px] text-ink-muted">
        <span>
          {title} · due {ASSIGNMENT.due}
          <span data-assignment-status>{status}</span>
        </span>
        <span className="rounded-full border border-line bg-paper px-2.5 py-0.5 text-[11.5px] text-ink-soft" data-pathway-chip>
          {pathwayChip(pathwayOf(classroom))}
        </span>
      </p>

      <div className="mt-10 grid grid-cols-[1fr_300px] gap-6">
        <Card className="overflow-hidden">
          <table ref={tableRef} className="w-full table-fixed text-left text-[14px]" data-grid>
            <colgroup>
              <col className="w-[230px]" />
              {columns.map((c) => (
                <col key={c} className="w-[74px]" />
              ))}
              <col className="w-[104px]" />
              <col className="w-[86px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-[0.06em] text-ink-muted">
                <th className="px-5 py-4 font-semibold">Student</th>
                {columns.map((c) => (
                  <th key={c} className="px-1 py-4 text-center font-semibold leading-tight" data-column={c}>
                    {c === "communication" ? "Comm." : categoryName(c).short}
                  </th>
                ))}
                <th className="px-3 py-4 font-semibold">Confidence</th>
                <th className="px-3 py-4 font-semibold">Set</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const h = results[i];
                const expanded = open?.student === r.id ? open.category : null;
                return (
                  <RowGroup key={r.id}>
                    <tr className={`border-b border-line ${r.live ? "bg-accent-soft/30" : ""} ${expanded ? "border-b-0" : ""}`} data-live={r.live || undefined} data-row={r.id}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar initials={r.initials} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 whitespace-nowrap font-medium text-ink">
                              {r.name}
                              {r.live && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-accent-line bg-paper px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-deep">
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden /> live
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 truncate text-[12.5px] text-ink-muted">
                              {r.live && caution.length > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-gap-line bg-gap-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gap" data-caution>
                                  <span className="h-1.5 w-1.5 rounded-full bg-gap" aria-hidden /> caution
                                </span>
                              )}
                              <span className="truncate">{r.sub}</span>
                              {r.live && live?.reportSent && (
                                <Link href="/teacher/report" className="text-accent-deep hover:underline" data-report-link>
                                  Report →
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      {columns.map((c) => {
                        const st = h.categories[c] ?? "unseen";
                        const half = h.half.categories.includes(c);
                        const on = expanded === c;
                        return (
                          <td key={c} className="px-1 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={(e) => setOpen(on ? null : { student: r.id, category: c, left: dotOffset(e.currentTarget) })}
                              aria-label={`${categoryName(c).name}: ${STATUS_WORD[st]}${half ? ", some problems not attempted" : ""}`}
                              aria-expanded={on}
                              className={`inline-grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-cream-deep ${on ? "bg-cream-deep ring-1 ring-ink" : ""}`}
                              data-dot={c}
                            >
                              <StatusDot status={st} half={half} size="h-[15px] w-[15px]" />
                            </button>
                          </td>
                        );
                      })}
                      <td className={`whitespace-nowrap px-3 py-3.5 text-[13px] ${r.confidence.tone}`}>{r.confidence.text}</td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-ink-soft">
                        {r.set}
                        <div className="text-[12px] text-ink-muted">{r.setSub}</div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="border-b border-line bg-cream/60" data-drill-row={r.id}>
                        <td colSpan={columns.length + 3} className="px-5 py-4">
                          <HierarchyDrill key={`${r.id}-${expanded}`} result={h} lines={r.evidence.lines} problems={problems} lockCategory={expanded} offsetLeft={open?.left ?? 0} />
                        </td>
                      </tr>
                    )}
                  </RowGroup>
                );
              })}
            </tbody>
          </table>
          <div className="flex items-center justify-between gap-6 border-t border-line px-5 py-2.5 text-[12px] text-ink-muted">
            <StatusKey />
            <span className="shrink-0">
              every {Math.round(everyMs / 1000)}s · updated {ago(updatedAt, now)}
            </span>
          </div>
        </Card>

        <div className="space-y-6">
          <ForceSubmit session={live} />
          <WholeClassCard />
          <Card className={`p-6 ${caution.length ? "border-gap-line" : ""}`}>
            <Eyebrow className={caution.length ? "text-gap" : ""}>Worth a look</Eyebrow>
            {caution.length === 0 ? (
              <p className="mt-3 text-[13.5px] text-ink-muted">Nothing flagged</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {caution.map((g) => (
                  <li key={g} className="rounded-xl border border-gap-line bg-gap-soft px-4 py-3">
                    <div className="flex items-center gap-2 text-[14px] font-medium text-gap">
                      <span className="h-2 w-2 rounded-full bg-gap" aria-hidden />
                      {DEMO_STUDENT.name} · {groupName(g).name}
                    </div>
                    <p className="mt-1 text-[12.5px] text-ink-soft">Practice twice</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <DiagnosticPush session={live} />

          <Card className="p-6">
            <Eyebrow>{DEMO_STUDENT.name}</Eyebrow>
            {!live || (live.practices.length === 0 && live.practice !== "taken") ? (
              <p className="mt-3 text-[13.5px] text-ink-muted">Nothing yet</p>
            ) : (
              <ul className="mt-3 space-y-2 text-[13.5px] text-ink-soft">
                {live.practice === "taken" && <li>Warm-up taken</li>}
                {live.practices.map((p, i) => (
                  <li key={i}>
                    {p.reason === "help" ? "Help" : "Practice"} · {leafName(p.leaf).short} · {ASSIGNMENT.problems.find((q) => q.id === p.problem)?.label ?? p.problem} ·{" "}
                    {p.accepted ? "taken" : "declined"}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </TeacherChrome>
  );
}

/** Two table rows that belong together (a student and their open drill). */
function RowGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
