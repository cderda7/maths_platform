"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import TeacherChrome from "./TeacherChrome";
import DiagnosticPush from "./DiagnosticPush";
import ForceSubmit from "./ForceSubmit";
import WholeClassCard from "./WholeClassCard";
import { RowDrill, type ColumnBox, type RowMode } from "@/components/HierarchyDrill";
import StatusKey from "@/components/StatusKey";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { StatusDot, STATUS_WORD } from "@/components/Tag";
import { ASSIGNMENT, DEMO_STUDENT, unitLabel } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { categoryName, categoryOf, groupName, leafName, type CategoryId, type LeafId } from "@/data/taxonomy";
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
  const [open, setOpen] = useState<{ student: string; mode: RowMode; category?: CategoryId; leaf?: LeafId; columns: ColumnBox[]; nonce: number; expandAll?: boolean } | null>(null);
  /** A column view: one category open under every student's dot, at group level or with skills too. */
  const [column, setColumn] = useState<{ category: CategoryId; level: "groups" | "expanded"; boxes: Record<string, ColumnBox[]>; nonce: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const lastClick = useRef<{ student: string; at: number } | null>(null);
  const nonce = useRef(0);
  /**
   * Where each category's dots sit, relative to the drill cell's content edge (td px-5 = 20px),
   * in CSS px: rects are scaled by the page's zoom, margins are not, so divide by the scale.
   */
  const columnBoxes = (student: string): ColumnBox[] => {
    const table = tableRef.current;
    const rect = table?.getBoundingClientRect();
    if (!table || !rect) return [];
    const scale = rect.width / (table.offsetWidth || rect.width);
    return columns.map((c) => {
      const th = table.querySelector<HTMLElement>(`thead [data-column="${c}"]`)?.getBoundingClientRect();
      const dot = table.querySelector<HTMLElement>(`[data-row="${student}"] [data-dot="${c}"] [data-status]`)?.getBoundingClientRect();
      // The tree starts under the dot and must end inside the column: dots are left-aligned in their columns for this.
      const left = dot ? (dot.left - rect.left) / scale - 20 : 0;
      const width = th && dot ? Math.round((th.right - dot.left) / scale) - 6 : 80;
      return { category: c, left, width };
    });
  };
  const openRow = (student: string, mode: RowMode, category?: CategoryId, leaf?: LeafId, expandAll = false) => {
    setColumn(null);
    setOpen({ student, mode, category, leaf, columns: columnBoxes(student), nonce: ++nonce.current, expandAll });
  };
  /** Double-click a header: the column opens for everyone at group level, then with skills, then closes. */
  const headerDouble = (c: CategoryId) => {
    setOpen(null);
    setColumn((cur) => {
      if (cur?.category === c && cur.level === "expanded") return null;
      const level = cur?.category === c ? "expanded" : "groups";
      const boxes = Object.fromEntries(rows.map((r) => [r.id, columnBoxes(r.id)]));
      return { category: c, level, boxes, nonce: ++nonce.current };
    });
  };
  /** A blamed line asks for another category: re-open this student's drill there, on that skill. */
  const jump = (student: string, leaf: LeafId) => openRow(student, "category", categoryOf(leaf), leaf);
  /**
   * A tap on the row (not a dot) acts at once: close if open, else every category's groups. The
   * second tap of a double-tap is ignored so the row doesn't flicker shut before the double-tap
   * opens everything.
   */
  const rowClick = (student: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    const now = e.timeStamp;
    const again = lastClick.current?.student === student && now - lastClick.current.at < 350;
    lastClick.current = { student, at: now };
    if (again) return;
    if (open?.student === student) setOpen(null);
    else openRow(student, "groups");
  };
  const rowDouble = (student: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    openRow(student, "expanded");
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
      <p className="mt-3 text-[14px] text-ink-muted">
        {title} · due {ASSIGNMENT.due}
        <span data-assignment-status>{status}</span>
      </p>

      <div className="mt-10 grid grid-cols-[1fr_320px] gap-6">
        <Card className="overflow-hidden">
          <table ref={tableRef} className="w-full table-fixed text-left text-[14px]" data-grid>
            <colgroup>
              <col className="w-[212px]" />
              {columns.map((c) => (
                <col key={c} className="w-[104px]" />
              ))}
              <col className="w-[86px]" />
              <col className="w-[66px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-[0.06em] text-ink-muted">
                <th className="px-5 py-4 font-semibold">Student</th>
                {columns.map((c) => (
                  <th
                    key={c}
                    className={`cursor-pointer select-none py-4 pl-2 pr-1 text-left font-semibold leading-tight transition-colors hover:text-ink ${column?.category === c ? "text-ink" : ""}`}
                    data-column={c}
                    data-column-open={column?.category === c ? column.level : undefined}
                    onDoubleClick={() => headerDouble(c)}
                    title="Double-click to open this category for every student"
                  >
                    {categoryName(c).short}
                  </th>
                ))}
                <th className="px-3 py-4 font-semibold">Confidence</th>
                <th className="px-3 py-4 font-semibold">Set</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const h = results[i];
                const isOpen = open?.student === r.id;
                const expanded = isOpen && open.mode === "category" ? open.category : column ? column.category : null;
                const showDrill = isOpen || !!column;
                return (
                  <RowGroup key={r.id}>
                    <tr
                      className={`cursor-pointer border-b border-line ${r.live ? "bg-accent-soft/30" : ""} ${showDrill ? "border-b-0" : ""}`}
                      data-live={r.live || undefined}
                      data-row={r.id}
                      data-open={isOpen ? open.mode : undefined}
                      onClick={(e) => rowClick(r.id, e)}
                      onDoubleClick={(e) => rowDouble(r.id, e)}
                    >
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
                            <div className="flex items-start gap-2 text-[12.5px] leading-snug text-ink-muted">
                              {r.live && caution.length > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-gap-line bg-gap-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gap" data-caution>
                                  <span className="h-1.5 w-1.5 rounded-full bg-gap" aria-hidden /> caution
                                </span>
                              )}
                              <span className="flex flex-col">
                                {r.sub.split(";").map((part, n) => (
                                  <span key={n} className={`${r.live ? "" : "lowercase"} -indent-3 pl-3`}>
                                    {part.trim().replace(/\.$/, "")}
                                  </span>
                                ))}
                              </span>
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
                          <td key={c} className="py-3.5 pl-1 pr-1 text-left">
                            <button
                              type="button"
                              onClick={() => (on && !column ? setOpen(null) : openRow(r.id, "category", c))}
                              onDoubleClick={() => openRow(r.id, "category", c, undefined, true)}
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
                    {isOpen && open && (
                      <tr className="border-b border-line bg-cream/60" data-drill-row={r.id}>
                        <td colSpan={columns.length + 3} className="px-5 py-4">
                          <RowDrill key={`${r.id}-${open.mode}-${open.category ?? ""}-${open.leaf ?? ""}-${open.nonce}`} mode={open.mode} result={h} lines={r.evidence.lines} problems={problems} columns={open.columns} category={open.category} initialLeaf={open.leaf ?? null} expandAll={open.expandAll} onNavigate={(leaf) => jump(r.id, leaf)} />
                        </td>
                      </tr>
                    )}
                    {!isOpen && column && (
                      <tr className="border-b border-line bg-cream/60" data-drill-row={r.id} data-column-drill={column.category}>
                        <td colSpan={columns.length + 3} className="px-5 py-3">
                          <RowDrill key={`${r.id}-col-${column.category}-${column.level}-${column.nonce}`} mode="category" result={h} lines={r.evidence.lines} problems={problems} columns={column.boxes[r.id] ?? []} category={column.category} expandAll={column.level === "expanded"} onNavigate={(leaf) => jump(r.id, leaf)} />
                        </td>
                      </tr>
                    )}
                  </RowGroup>
                );
              })}
            </tbody>
          </table>
          <div className="flex items-center justify-end border-t border-line px-5 py-2.5 text-[12px] text-ink-muted">
            <span>
              every {Math.round(everyMs / 1000)}s · updated {ago(updatedAt, now)}
            </span>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6" data-pathway-card>
            <Eyebrow>Pathway</Eyebrow>
            <ol className="mt-2 font-display text-[22px] leading-snug text-ink" data-pathway-chip>
              {pathwayChip(pathwayOf(classroom))
                .split(" → ")
                .map((stage, i) => (
                  <li key={stage} className="flex flex-col items-center text-center">
                    {i > 0 && (
                      <svg viewBox="0 0 12 18" className="h-[18px] w-3 text-ink-muted/70" aria-hidden>
                        <path d="M6 1v15M2.5 12.5 6 16l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    <span>{stage}</span>
                  </li>
                ))}
            </ol>
          </Card>
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

          <Card className="p-6">
            <Eyebrow>Key</Eyebrow>
            <StatusKey className="mt-3" />
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
