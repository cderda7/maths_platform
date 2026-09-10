"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import TeacherChrome from "./TeacherChrome";
import DiagnosticPush from "./DiagnosticPush";
import ForceSubmit from "./ForceSubmit";
import GroupProgressCard from "./GroupProgressCard";
import WholeClassCard from "./WholeClassCard";
import BoardIndicator from "./BoardIndicator";
import { RowDrill, type ColumnBox, type RowMode } from "@/components/HierarchyDrill";
import StatusKey from "@/components/StatusKey";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { StatusDot, STATUS_WORD } from "@/components/Tag";
import { ASSIGNMENT, DEMO_STUDENT, unitLabel } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { categoryLabel, categoryName, categoryOf, isFlat, type CategoryId, type LeafId } from "@/data/taxonomy";
import { confidenceLabel } from "@/lib/report";
import type { Confidence } from "@/data/types";
import { pathwayOf } from "@/lib/classroom";
import { useAssignment, useClassroom } from "@/lib/classroom-store";
import { classmateEvidence, hierarchyFor, leavesBehind, problemsStarted, restrictTo, sessionEvidence, type Evidence } from "@/lib/hierarchy";
import { pathwayChip } from "@/lib/pathway";
import { useBatchedSession, useNow } from "@/lib/store";

/** How long a second click may follow the first and still count as a double-click. */
const DOUBLE_MS = 350;

/** The grey uppercase label beside a dot: the category name in a column view, the unit beside the Unit dot in a drill. */
const LABEL = "pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted";

function confidenceWord(c: Confidence | null): { text: string; tone: string } {
  const text = confidenceLabel(c);
  return { text, tone: !c ? "text-ink-muted" : text === "confident" ? "text-secure" : "text-accent-deep" };
}

function ago(ms: number | null, now: number): string {
  if (ms === null || now === 0) return "";
  const s = Math.max(0, Math.round((now - ms) / 1000));
  return s <= 1 ? "just now" : `${s}s ago`;
}

const HANDED_IN = ["overview", "confidence", "warmup-pick", "practice", "working"];

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
  const { title, problems, unit } = useAssignment();
  const classroom = useClassroom();
  const wc = classroom.wholeClass;
  const status = wc?.status === "active" ? " · in whole-class review" : wc?.status === "ended" ? " · complete" : "";
  const [open, setOpen] = useState<{ student: string; mode: RowMode; category?: CategoryId; leaf?: LeafId; columns: ColumnBox[]; nonce: number; expandAll?: boolean; comment?: number; keep?: LeafId[] } | null>(null);
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
    const dots = columns.map((c) => table.querySelector<HTMLElement>(`[data-row="${student}"] [data-dot="${c}"] [data-status]`)?.getBoundingClientRect());
    return columns.map((c, i) => {
      const dot = dots[i];
      const next = dots[i + 1];
      // The tree starts under its dot and may run until the next column's dot (the space its neighbour never uses); the last until its column's edge.
      const left = dot ? (dot.left - rect.left) / scale - 20 : 0;
      // The last tree has no neighbour tree: it may run to the grid's edge (the drill row is empty there).
      const end = next ? next.left - 10 : rect.right - 20 * scale;
      const width = dot ? Math.round((end - dot.left) / scale) : 80;
      return { category: c, left, width };
    });
  };
  const openRow = (student: string, mode: RowMode, category?: CategoryId, leaf?: LeafId, expandAll = false) => {
    setColumn(null);
    setOpen({ student, mode, category, leaf, columns: columnBoxes(student), nonce: ++nonce.current, expandAll });
  };
  /** A comment opens everything for that student with only the comment's skills coloured; the same comment again closes. */
  const commentClick = (student: string, index: number, keep: LeafId[], e: React.MouseEvent) => {
    e.stopPropagation();
    if (open?.student === student && open.comment === index) {
      setOpen(null);
      return;
    }
    setColumn(null);
    setOpen({ student, mode: "expanded", columns: columnBoxes(student), nonce: ++nonce.current, comment: index, keep });
  };
  /** Double-click a header: the column opens for everyone at group level, then with skills, then closes. */
  const headerCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** A click closes the column view, unless it turns out to be the first half of a double-click. */
  const headerClick = () => {
    if (!column) return;
    if (headerCloseTimer.current) clearTimeout(headerCloseTimer.current);
    headerCloseTimer.current = setTimeout(() => setColumn(null), DOUBLE_MS);
  };
  const headerDouble = (c: CategoryId) => {
    if (headerCloseTimer.current) clearTimeout(headerCloseTimer.current);
    headerCloseTimer.current = null;
    setOpen(null);
    setColumn((cur) => {
      if (cur?.category === c && (cur.level === "expanded" || isFlat(c))) return null; // a two-layer category has no skills view to open
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
    const again = lastClick.current?.student === student && now - lastClick.current.at < DOUBLE_MS;
    lastClick.current = { student, at: now };
    if (again) return;
    if (open?.student === student) setOpen(null);
    else openRow(student, "groups");
  };
  const rowDouble = (student: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    openRow(student, "expanded");
  };

  const rows: { id: string; name: string; initials: string; live: boolean; evidence: Evidence; sub: string; notes: { text: string; problems: string[] }[]; confidence: { text: string; tone: string }; set: string; setSub: string }[] = [
    {
      id: DEMO_STUDENT.id,
      name: DEMO_STUDENT.name,
      initials: DEMO_STUDENT.initials,
      live: true,
      evidence: live ? sessionEvidence(live) : { lines: {}, submitted: false, caution: [] },
      sub: "",
      notes: [] as { text: string; problems: string[] }[],
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
      sub: "",
      notes: c.notes,
      confidence: { text: c.confidence, tone: c.confidence === "confident" ? "text-secure" : "text-accent-deep" },
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
      <H1 className="mt-3">Class View</H1>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-ink-muted">
        <span>
          {title} · due {ASSIGNMENT.due}
          <span data-assignment-status>{status}</span>
        </span>
        <BoardIndicator session={live} />
      </p>

      <div className="mt-10 grid grid-cols-[1fr_320px] gap-6">
        <Card className="overflow-x-auto">
          <table ref={tableRef} className="w-full min-w-[980px] table-fixed text-left text-[14px]" data-grid>
            <colgroup>
              <col className="w-[190px]" />
              {columns.map((c) => (
                <col key={c} className="w-[112px]" />
              ))}
              <col className="w-[80px]" />
              <col className="w-[60px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-[0.06em] text-ink-muted">
                <th className="px-5 py-4 font-semibold">Student</th>
                {columns.map((c) => (
                  <th
                    key={c}
                    className={`cursor-pointer select-none px-1 py-4 text-center font-semibold leading-tight transition-colors hover:text-ink ${column?.category === c ? "text-ink" : ""}`}
                    data-column={c}
                    data-column-open={column?.category === c ? column.level : undefined}
                    onClick={headerClick}
                    onDoubleClick={() => headerDouble(c)}
                    title="Double-click to open this category for every student; click to close"
                  >
                    <span className="inline-block rounded-md bg-standout-soft px-2 py-1 text-standout">{categoryName(c).short}</span>
                  </th>
                ))}
                <th className="px-3 py-4 text-center font-semibold">Confidence</th>
                <th className="px-3 py-4 text-center font-semibold">Set</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const isOpen = open?.student === r.id;
                const h = isOpen && open.keep ? restrictTo(results[i], open.keep) : results[i];
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
                          <div className="group/name relative min-w-0">
                            <div className="whitespace-nowrap font-medium text-ink">{r.name}</div>
                            {r.notes.length > 0 && !column && (
                              <div className="pointer-events-none absolute left-0 top-full z-30 hidden w-max max-w-[300px] pt-1 group-hover/name:block" data-notes-bubble>
                                <div className="pointer-events-auto rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[12.5px] leading-snug text-ink-soft shadow-lift">
                                  <div className="flex flex-col items-start gap-1">
                                    {r.notes.map((note, n) => {
                                      const active = isOpen && open.comment === n;
                                      return (
                                        <button
                                          key={n}
                                          type="button"
                                          onClick={(e) => commentClick(r.id, n, leavesBehind(note.problems, r.evidence.lines, problems), e)}
                                          className={`text-left lowercase transition-colors hover:text-ink ${active ? "text-ink underline decoration-line-strong underline-offset-2" : ""}`}
                                          title="Show only the skills behind this comment"
                                          data-comment={n}
                                        >
                                          {note.text}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                            {r.live && (
                              <span className="mt-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-accent-line bg-paper px-2 py-0.5 text-[11px] font-medium text-accent-deep" data-live-pill>
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
                                {live ? "in progress" : "not started"}
                              </span>
                            )}
                            <div className={`flex items-start gap-2 text-[12.5px] leading-snug text-ink-muted ${!column && (r.sub || (r.live && (caution.length > 0 || live?.reportSent))) ? "" : "hidden"}`} data-commentary>
                              {r.live && caution.length > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-gap-line bg-gap-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gap" data-caution>
                                  <span className="h-1.5 w-1.5 rounded-full bg-gap" aria-hidden /> caution
                                </span>
                              )}
                              {r.sub && <span className="-indent-3 pl-3">{r.sub}</span>}
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
                        const on = isOpen && open.mode === "category" && open.category === c;
                        const blanked = !!column && column.category !== c; // a column view shows only its own column's dots
                        return (
                          <td key={c} className="relative px-1 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => (on && !column ? setOpen(null) : openRow(r.id, "category", c))}
                              onDoubleClick={() => openRow(r.id, "category", c, undefined, true)}
                              aria-label={`${categoryLabel(c, unit).name}: ${STATUS_WORD[st]}${half ? ", some problems not attempted" : ""}`}
                              aria-expanded={on}
                              className={`inline-grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-cream-deep ${on ? "bg-cream-deep ring-1 ring-ink" : ""} ${blanked ? "invisible" : ""}`}
                              data-dot={c}
                              data-blanked={blanked || undefined}
                            >
                              <StatusDot status={st} half={half} size="h-[15px] w-[15px]" />
                            </button>
                            {column?.category === c && (
                              <span className={`${LABEL} right-[calc(50%+12px)]`} data-column-label>
                                {categoryLabel(c, unit).name}
                              </span>
                            )}
                            {!column && isOpen && isFlat(c) && (
                              <span className={`${LABEL} left-[calc(50%+12px)]`} data-unit-label>
                                {categoryLabel(c, unit).name}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className={`px-3 py-3.5 text-center text-[13px] leading-snug ${r.confidence.tone}`}>{r.confidence.text}</td>
                      <td className="px-3 py-3.5 text-center leading-snug text-ink-soft">
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
            <Eyebrow className="inline-block rounded-md bg-accent px-2 py-1 text-white">Pathway</Eyebrow>
            <ol className="mx-auto mt-3 flex w-fit flex-col items-center font-display text-[22px] leading-snug text-ink" data-pathway-chip>
              {pathwayChip(pathwayOf(classroom))
                .split(" → ")
                .map((stage, i) => (
                  <li key={stage} className="flex flex-col items-center text-center">
                    {i > 0 && (
                      <svg viewBox="0 0 12 18" className="my-0.5 h-[18px] w-3 text-ink-muted/70" aria-hidden>
                        <path d="M6 1v15M2.5 12.5 6 16l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    <span className="rounded-xl bg-standout-soft px-5 py-1.5">{stage}</span>
                  </li>
                ))}
            </ol>
          </Card>
          <ForceSubmit session={live} />
          <GroupProgressCard session={live} />
          <WholeClassCard />

          <DiagnosticPush session={live} />

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
