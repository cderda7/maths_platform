"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TeacherChrome from "./TeacherChrome";
import DiagnosticPush from "./DiagnosticPush";
import ForceSubmit from "./ForceSubmit";
import GroupProgressCard from "./GroupProgressCard";
import GroupStart from "./GroupStart";
import WholeClassCard from "./WholeClassCard";
import { RowDrill, type ColumnBox, type RowMode } from "@/components/HierarchyDrill";
import FitText from "@/components/FitText";
import StatusKey from "@/components/StatusKey";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { StatusDot, STATUS_WORD } from "@/components/Tag";
import { ASSIGNMENT, DEMO_STUDENT, unitLabel } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { categoryLabel, categoryName, categoryOf, isFlat, type CategoryId, type LeafId } from "@/data/taxonomy";
import { confidenceLabel, confidenceLines } from "@/lib/report";
import type { Confidence } from "@/data/types";
import { currentSlide } from "@/lib/classroom";
import { useAssignment, useClassroom } from "@/lib/classroom-store";
import { classStages } from "@/lib/classStage";
import { classmateEvidence, hierarchyFor, problemsStarted, restrictTo, sessionEvidence, type Evidence } from "@/lib/hierarchy";
import { useBatchedSession, useNow } from "@/lib/store";

/** How long a second click may follow the first and still count as a double-click. */
const DOUBLE_MS = 350;

/**
 * How long after the pointer last left a marker (a category pill, or a group or skill dot in the drill
 * under it) the row's buttons stay away (tickets 131, 133). A teacher moving between markers is using
 * them; the buttons are for one who would not think to, and come back once the pointer has sat off
 * every marker this long.
 */
const PILL_GRACE_MS = 1000;

/** The markers: the category pill buttons in the row, and the drill's group and skill nodes under it. */
const MARKER = "[data-dot], [data-node]";

/** The grey uppercase label beside a category pill: the category name in a column view, the unit beside the Unit pill in a drill. */
const LABEL = "pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted";

/** The stacked pair of small buttons beside a student's name and over a column header: light blue, dark indigo text, one width. */
const STACK_BUTTON = "w-[96px] rounded-md px-2 py-[3px] text-[11px] font-medium leading-snug transition-colors";
const STACK_IDLE = `${STACK_BUTTON} bg-standout-soft text-accent-deep hover:bg-standout-line`;
const STACK_ACTIVE = `${STACK_BUTTON} bg-accent text-white hover:bg-accent-deep`;
/** The lone "close" over an open full breakdown: as tall as the two-button stack it stands in for (two 11 px × 1.375 lines with 3 px above and below, and the 4 px gap). */
const STACK_TALL = `${STACK_ACTIVE} grid h-[calc(2*(1.375*11px_+_6px)_+_4px)] place-items-center`;

/**
 * A category column's width: the header chip (11 px uppercase, 0.06 em tracking, 10 px padding a side) must sit inside
 * it with its neighbours' chips clear, and "Communication" is 126 px where every other chip is under 94 (ticket 136).
 */
function columnWidth(c: CategoryId): string {
  return categoryName(c).short.length > 10 ? "w-[132px]" : "w-[96px]";
}

function confidenceWord(c: Confidence | null): { text: string; tone: string } {
  const text = confidenceLabel(c);
  return { text, tone: !c ? "text-ink-muted" : text === "confident" ? "text-secure" : "text-accent-deep" };
}

function ago(ms: number | null, now: number): string {
  if (ms === null || now === 0) return "";
  const s = Math.max(0, Math.round((now - ms) / 1000));
  return s <= 1 ? "just now" : `${s}s ago`;
}

const HANDED_IN = ["overview", "confidence", "warmup-chat", "practice", "working"];

/**
 * "Where the class is": one row per student, one column per category the assignment touches
 * (canonical order), each a pill in the worst status beneath it (ticket 125; groups and skills are dots). Clicking a pill expands that row into
 * the category → group → leaf → work drill; hovering a student's block (their row and any drill
 * open under it) shows two buttons beside the name: the row's full breakdown (every group open to its skills; "close" while
 * the row is open) and the student's individual view. The
 * demo student's row is live (in batches); classmates come through the same evidence path from
 * their scripted attempts.
 */
export default function TeacherLive() {
  const { session, updatedAt, everyMs } = useBatchedSession(3000);
  const live = session ?? null;
  const now = useNow();
  const { title, problems, unit } = useAssignment();
  const classroom = useClassroom();
  const wc = classroom.wholeClass;
  const status = wc?.status === "active" ? " · in class review" : wc?.status === "ended" ? " · complete" : "";
  const [open, setOpen] = useState<{ student: string; mode: RowMode; category?: CategoryId; leaf?: LeafId; columns: ColumnBox[]; nonce: number; expandAll?: boolean; keep?: LeafId[] } | null>(null);
  /** A column view: one category open under every student's dot, at group level or with skills too. */
  const [column, setColumn] = useState<{ category: CategoryId; level: "groups" | "expanded"; boxes: Record<string, ColumnBox[]>; nonce: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const lastClick = useRef<{ student: string; at: number } | null>(null);
  const nonce = useRef(0);
  /** True once the pointer has been off every marker (pill or drill dot) for PILL_GRACE_MS; the row buttons need it. One timer for the grid: markers in any row count. */
  const [pillQuiet, setPillQuiet] = useState(true);
  const pillTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(pillTimer.current), []);
  /**
   * Delegated from each student's tbody, so the drill's nodes count without threading handlers through
   * HierarchyDrill. A move between two elements inside the same marker is neither an enter nor a leave.
   */
  const markerCrossing = (e: React.PointerEvent) => {
    const marker = (e.target as Element).closest(MARKER);
    return marker && !(e.relatedTarget instanceof Node && marker.contains(e.relatedTarget));
  };
  const markerOver = (e: React.PointerEvent) => {
    if (!markerCrossing(e)) return;
    window.clearTimeout(pillTimer.current);
    setPillQuiet(false);
  };
  const markerOut = (e: React.PointerEvent) => {
    if (!markerCrossing(e)) return;
    window.clearTimeout(pillTimer.current);
    pillTimer.current = window.setTimeout(() => setPillQuiet(true), PILL_GRACE_MS);
  };
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
  /**
   * The header's stacked buttons: "see skills" (the groups) and "full breakdown" (the leaves; a
   * two-layer category has only "see skills"). Choosing a level opens that column for every
   * student at that level. The open level's button reads "close" and closes the column; with the
   * full breakdown open, "close" is the only button.
   */
  const setColumnLevel = (c: CategoryId, level: "groups" | "expanded") => {
    setOpen(null);
    setColumn((cur) => {
      if (cur?.category === c && cur.level === level) return null;
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

  const rows: { id: string; name: string; initials: string; live: boolean; missing: boolean; evidence: Evidence; sub: string; confidence: { text: string; tone: string }; set: string; setSub: string }[] = [
    {
      id: DEMO_STUDENT.id,
      name: DEMO_STUDENT.name,
      initials: DEMO_STUDENT.initials,
      live: true,
      missing: false,
      evidence: live ? sessionEvidence(live) : { lines: {}, submitted: false, caution: [] },
      sub: "",
      confidence: confidenceWord(live?.confidence ?? null),
      set: `${live ? problemsStarted(live) : 0}/${problems.length}`,
      setSub: live && !HANDED_IN.includes(live.stage) ? "handed in" : live && problemsStarted(live) > 0 ? "in progress" : "",
    },
    ...CLASSMATES.map((c) => ({
      id: c.id,
      name: c.name,
      initials: c.initials,
      live: false,
      missing: c.done === 0,
      evidence: classmateEvidence(c, problems),
      sub: "",
      confidence: c.done === 0 ? confidenceWord(null) : { text: c.confidence, tone: c.confidence === "confident" ? "text-secure" : "text-accent-deep" },
      set: `${Math.min(c.done, problems.length)}/${problems.length}`,
      setSub: "",
    })),
  ];
  const results = rows.map((r) => hierarchyFor(r.evidence, problems));
  const columns = results[0]?.columns ?? [];
  const caution = live?.escalation.caution ?? [];
  const stages = classStages(classroom, live, now, problems.length);
  const wcInUse = !!currentSlide(classroom);

  return (
    <TeacherChrome>
      <Eyebrow>
        {ASSIGNMENT.className} · {unitLabel(ASSIGNMENT.unit)}
      </Eyebrow>
      <div className="mt-3 grid grid-cols-[1fr_320px] gap-6">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <H1>Class View</H1>
          <ForceSubmit session={live} />
        </div>
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-ink-muted">
        <span>
          {title} · due {ASSIGNMENT.due}
          <span data-assignment-status>{status}</span>
        </span>
      </p>

      <div className="mt-10 grid grid-cols-[1fr_320px] gap-6">
        <Card className="overflow-x-auto">
          {/* Columns 380 · 96 per category (132 under a long chip) · 92 · 64 · 56 (ticket 136), the min the sum for the six categories the demo assignment touches. The student column holds the name slot, the live pill and, on hover, the two stacked action buttons side by side; the avatar closes the row in the last column. */}
          <table ref={tableRef} className="w-full min-w-[1204px] table-fixed text-left text-[14px]" data-grid data-pill-quiet={pillQuiet || undefined}>
            <colgroup>
              <col className="w-[380px]" />
              {columns.map((c) => (
                <col key={c} className={columnWidth(c)} />
              ))}
              <col className="w-[92px]" />
              <col className="w-[64px]" />
              <col className="w-[56px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-[0.06em] text-ink-muted">
                <th className="px-5 py-4 font-semibold">Student</th>
                {columns.map((c) => {
                  const openHere = column?.category === c;
                  const all: { level: "groups" | "expanded"; word: string }[] = isFlat(c) ? [{ level: "groups", word: "see skills" }] : [{ level: "groups", word: "see skills" }, { level: "expanded", word: "full breakdown" }];
                  // The full breakdown open: one button, "close", filling the stack's height.
                  const tall = openHere && column.level === "expanded";
                  const levels = tall ? all.filter((l) => l.level === "expanded") : all;
                  return (
                    <th key={c} className={`group/head relative select-none px-0 py-4 text-center font-semibold leading-tight ${openHere ? "text-ink" : ""}`} data-column={c} data-column-open={openHere ? column.level : undefined}>
                      <span className="relative inline-block">
                        <span className={`inline-block whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] group-hover/head:invisible group-focus-within/head:invisible ${openHere ? "bg-accent text-white" : "bg-standout-soft text-standout"}`}>{categoryName(c).short}</span>
                        <span className="invisible absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-1 normal-case tracking-normal group-hover/head:visible group-focus-within/head:visible" data-column-controls={c}>
                          {levels.map(({ level, word }) => {
                            const active = openHere && column.level === level;
                            return (
                              <button
                                type="button"
                                key={level}
                                onClick={() => setColumnLevel(c, level)}
                                className={`${active ? (tall ? STACK_TALL : STACK_ACTIVE) : STACK_IDLE} shadow-sm`}
                                data-expand={c}
                                data-level={level}
                                aria-pressed={active}
                                aria-label={active ? `Close ${categoryName(c).short} for every student` : `${word} under ${categoryName(c).short} for every student`}
                              >
                                {active ? "close" : word}
                              </button>
                            );
                          })}
                        </span>
                      </span>
                    </th>
                  );
                })}
                <th className="px-3 py-4 text-center font-semibold">Confidence</th>
                <th className="px-3 py-4 text-center font-semibold">Set</th>
                <th className="px-3 py-4" aria-label="Student, again" />
              </tr>
            </thead>
            {rows.map((r, i) => {
                const isOpen = open?.student === r.id;
                const h = isOpen && open.keep ? restrictTo(results[i], open.keep) : results[i];
                const showDrill = isOpen || !!column;
                return (
                  <RowGroup key={r.id} onPointerOver={markerOver} onPointerOut={markerOut}>
                    <tr
                      className={`border-b border-line ${r.live ? "bg-accent-soft/30" : ""} ${showDrill ? "border-b-0" : ""}`}
                      data-missing={r.missing || undefined}
                      data-live={r.live || undefined}
                      data-row={r.id}
                      data-open={isOpen ? open.mode : undefined}
                      onClick={(e) => rowClick(r.id, e)}
                      onDoubleClick={(e) => rowDouble(r.id, e)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center">
                              {/* The name sits in a fixed slot (the widest name on the roster, Ruby Castellanos at 16 px, plus 10 px), so the live pill of every in-progress student starts at the same x instead of staggering with the name's length (ticket 136). A longer name pushes its own pill right; the slot's padding keeps the 10 px. */}
                              <span className="box-border min-w-[142px] whitespace-nowrap pr-2.5 text-[16px] font-medium leading-6 text-ink" data-student-name={r.id}>
                                {r.name}
                              </span>
                              {r.live && (
                                <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-accent-line bg-paper px-2 py-0.5 text-[11px] font-medium text-accent-deep" data-live-pill>
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
                                  {live ? "in progress" : "not started"}
                                </span>
                              )}
                            </div>
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
                          {/* Shown while the pointer is in the student's block, except over a marker (a category pill, ticket 128, or a drill dot, ticket 133: each is its own way in) and for PILL_GRACE_MS after it last left one (ticket 131). The CSS :has rules hide at once; the state carries the grace. */}
                          <div className={`invisible ml-auto flex shrink-0 flex-col gap-1 ${pillQuiet ? "group-hover/row:visible group-focus-within/row:visible group-has-[[data-dot]:hover]/row:invisible group-has-[[data-node]:hover]/row:invisible" : ""}`} data-row-actions={r.id}>
                            <button type="button" onClick={() => (isOpen ? setOpen(null) : openRow(r.id, "expanded"))} className={isOpen ? STACK_ACTIVE : STACK_IDLE} data-see-skills={r.id} aria-pressed={isOpen}>
                              {isOpen ? "close" : "see dot skills"}
                            </button>
                            <Link href={`/teacher/report?student=${r.id}`} className={`${STACK_IDLE} text-center`} data-student-link={r.id}>
                              student report
                            </Link>
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
                              className={`inline-grid h-7 w-10 place-items-center rounded-md transition-colors hover:bg-cream-deep ${on ? "bg-cream-deep ring-1 ring-ink" : ""} ${blanked ? "invisible" : ""}`}
                              data-dot={c}
                              data-blanked={blanked || undefined}
                            >
                              <StatusDot status={st} half={half} shape="pill" />
                            </button>
                            {column?.category === c && (
                              <span className={`${LABEL} right-[calc(50%+20px)]`} data-column-label>
                                {categoryLabel(c, unit).name}
                              </span>
                            )}
                            {!column && isOpen && isFlat(c) && (
                              <span className={`${LABEL} left-[calc(50%+20px)]`} data-unit-label>
                                {categoryLabel(c, unit).name}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className={`px-2 py-3.5 text-center text-[13px] leading-snug ${r.confidence.tone}`} data-confidence>
                        <ConfidenceCell label={r.confidence.text} />
                      </td>
                      <td className="px-2 py-3.5 text-center leading-snug text-ink-soft">
                        {r.missing ? (
                          <Missing />
                        ) : (
                          <>
                            {r.set}
                            {r.setSub && <div className="text-[12px] text-ink-muted">{r.setSub}</div>}
                          </>
                        )}
                      </td>
                      {/* The avatar closes the row so the eye can find its student again after crossing the skill columns (ticket 136). */}
                      <td className="px-3 py-3.5">
                        <div className="flex justify-center" data-row-avatar={r.id}>
                          <Avatar initials={r.initials} />
                        </div>
                      </td>
                    </tr>
                    {isOpen && open && (
                      <tr className="border-b border-line bg-cream/60" data-drill-row={r.id}>
                        <td colSpan={columns.length + 4} className="px-5 py-4">
                          <RowDrill key={`${r.id}-${open.mode}-${open.category ?? ""}-${open.leaf ?? ""}-${open.nonce}`} mode={open.mode} result={h} lines={r.evidence.lines} problems={problems} columns={open.columns} category={open.category} initialLeaf={open.leaf ?? null} expandAll={open.expandAll} onNavigate={(leaf) => jump(r.id, leaf)} />
                        </td>
                      </tr>
                    )}
                    {!isOpen && column && (
                      <tr className="border-b border-line bg-cream/60" data-drill-row={r.id} data-column-drill={column.category}>
                        <td colSpan={columns.length + 4} className="px-5 py-3">
                          <RowDrill key={`${r.id}-col-${column.category}-${column.level}-${column.nonce}`} mode="category" result={h} lines={r.evidence.lines} problems={problems} columns={column.boxes[r.id] ?? []} category={column.category} expandAll={column.level === "expanded"} onNavigate={(leaf) => jump(r.id, leaf)} />
                        </td>
                      </tr>
                    )}
                  </RowGroup>
                );
              })}
          </table>
          <div className="flex items-center justify-end border-t border-line px-5 py-2.5 text-[12px] text-ink-muted">
            <span>
              every {Math.round(everyMs / 1000)}s · updated {ago(updatedAt, now)}
            </span>
          </div>
        </Card>

        <div className="space-y-6">
          {/* Class review in use: its card leads the column (ticket 129). */}
          {wcInUse && <WholeClassCard />}
          <Card className="p-6" data-pathway-card>
            <Eyebrow className="inline-block rounded-md bg-accent px-2 py-1 text-white">Pathway</Eyebrow>
            {/* At the card's left (not centred as before ticket 129) so the note beside the current pill has the rest of the card's width. */}
            <ol className="mt-3 flex w-fit flex-col items-center font-display text-[22px] leading-snug text-ink" data-pathway-chip>
              {stages.map((stage, i) => (
                <li key={stage.id} className="flex flex-col items-center text-center" data-stage={stage.id} data-stage-state={stage.state}>
                  {i > 0 && (
                    <svg viewBox="0 0 12 18" className="my-0.5 h-[18px] w-3 text-ink-muted/70" aria-hidden>
                      <path d="M6 1v15M2.5 12.5 6 16l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <span className="relative inline-block">
                    {/* Over: the blue of a lit skill button on the student's warm-up (ticket 134). Current: a purple ring (a shadow, so nothing moves). */}
                    <span className={`inline-block rounded-xl px-5 py-1.5 ${stage.state === "over" ? "bg-standout text-white" : "bg-standout-soft"} ${stage.state === "current" ? "ring-2 ring-accent" : ""}`}>{stage.word}</span>
                    {stage.state === "current" && stage.done !== null && (
                      <span className="absolute left-full top-1/2 ml-3 flex -translate-y-1/2 flex-col items-start whitespace-nowrap text-left text-[12.5px] leading-snug text-ink-muted" style={{ fontFamily: "var(--font-sans)" }} data-stage-count>
                        <span>
                          <span className="tabular-nums">
                            {stage.done}/{stage.total}
                          </span>{" "}
                          done
                        </span>
                        <GroupStart />
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
          <GroupProgressCard session={live} />
          {!wcInUse && <WholeClassCard />}

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

/** The confidence word, split so a named skill never breaks across two lines: shrunk to fit instead. */
function ConfidenceCell({ label }: { label: string }) {
  const { head, skills } = confidenceLines(label);
  if (skills.length === 0) return <>{head}</>;
  return (
    <div>
      <div>{head}</div>
      {skills.map((skill) => (
        <FitText key={skill}>{skill}</FitText>
      ))}
    </div>
  );
}

/** A student with nothing handed in: a light blue caution triangle over a small grey MISSING. */
function Missing() {
  return (
    <div className="flex flex-col items-center gap-0.5" data-missing-mark role="img" aria-label="Nothing submitted">
      <svg viewBox="0 0 24 22" className="h-[26px] w-[28px]" aria-hidden>
        <path d="M10.3 2.1a2 2 0 0 1 3.4 0l9 15.6a2 2 0 0 1-1.7 3H3a2 2 0 0 1-1.7-3z" fill="var(--color-standout-line)" stroke="var(--color-standout)" strokeOpacity="0.45" strokeWidth="0.8" strokeLinejoin="round" />
        <text x="12" y="17.5" textAnchor="middle" fontSize="13" fontWeight="800" fill="#000" fontFamily="inherit">
          !
        </text>
      </svg>
      <span className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">missing</span>
    </div>
  );
}

/**
 * A student's block: their row and, under it, any open drill. One `tbody` per student so a hover
 * anywhere in the block (the drill row included) shows the buttons beside the name. The pointer
 * handlers watch for the markers inside it (the pills and the drill's dots) on the grid's behalf.
 */
function RowGroup({ children, onPointerOver, onPointerOut }: { children: React.ReactNode; onPointerOver: React.PointerEventHandler; onPointerOut: React.PointerEventHandler }) {
  return (
    <tbody className="group/row" onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {children}
    </tbody>
  );
}
