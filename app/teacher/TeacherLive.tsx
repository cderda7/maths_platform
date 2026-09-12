"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TeacherChrome from "./TeacherChrome";
import DiagnosticCard from "./DiagnosticCard";
import ForceSubmit from "./ForceSubmit";
import GroupProgressCard from "./GroupProgressCard";
import WholeClassCard from "./WholeClassCard";
import { RowDrill, type ColumnBox, type RowMode } from "@/components/HierarchyDrill";
import FitText from "@/components/FitText";
import StatusKey from "@/components/StatusKey";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { DOT_COLOR, StatusDot, STATUS_WORD } from "@/components/Tag";
import { ASSIGNMENT, DEMO_STUDENT, unitLabel } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { categoryLabel, categoryName, categoryOf, isFlat, type CategoryId, type LeafId } from "@/data/taxonomy";
import { confidenceLabel, confidenceLines } from "@/lib/report";
import { BEFORE_HAND_IN_STAGES, type Confidence } from "@/data/types";
import { currentSlide } from "@/lib/classroom";
import { useAssignment, useClassroom } from "@/lib/classroom-store";
import { classStages } from "@/lib/classStage";
import { classmateEvidence, hierarchyFor, problemsStarted, restrictTo, sessionEvidence, type Evidence } from "@/lib/hierarchy";
import { historyFor } from "@/lib/history";
import type { Status } from "@/data/types";
import { useBatchedSession, useNow } from "@/lib/store";

/** How long a second click may follow the first and still count as a double-click. */
const DOUBLE_MS = 350;

/**
 * How long after the pointer last left a marker (a category pill, or a group or skill dot in the drill
 * under it) the row's buttons stay away (tickets 131, 133). A teacher moving between markers is using
 * them; the buttons are for one who would not think to, and come back once the pointer has sat off
 * every marker this long. The grace is for the gaps between markers: the moment the pointer is left of
 * the row's leftmost pill (into the name cell, where the buttons sit) it is over, and they show at once
 * (ticket 180).
 */
const PILL_GRACE_MS = 1000;

/** The markers: the category pill buttons in the row, and the drill's group and skill nodes under it. */
const MARKER = "[data-dot], [data-node]";

/** The grey uppercase label beside a category pill: the category name in a column view, the unit beside the Unit pill in a drill. */
const LABEL = "pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted";
/**
 * Every header cell of the roster (ticket 167): it sticks to the top of the teacher frame's scroll region
 * (`main[data-teacher-scroll]`, whose top is the bar's bottom edge), so the category names stay in view as
 * a sub-header of the bar while the teacher scrolls to later students. Paper behind it so the rows pass
 * under, above the rows' own positioned marks (`z-20`); its bottom line is an inset shadow rather than the
 * row's collapsed border, which would stay behind with the table when the cells stick.
 */
const HEAD = "sticky top-0 z-20 bg-paper shadow-[inset_0_-1px_0_var(--color-line)]";

/** The stacked pair of small buttons beside a student's name and over a column header: light blue, dark indigo text, one width. */
const STACK_BUTTON = "w-[96px] rounded-md px-2 py-[3px] text-[11px] font-medium leading-snug transition-colors";
const STACK_IDLE = `${STACK_BUTTON} bg-standout-soft text-accent-deep hover:bg-standout-line`;
const STACK_ACTIVE = `${STACK_BUTTON} bg-accent text-white hover:bg-accent-deep`;
/** The lone "close" over an open full breakdown: as tall as the two-button stack it stands in for (two 11 px × 1.375 lines with 3 px above and below, and the 4 px gap). */
const STACK_TALL = `${STACK_ACTIVE} grid h-[calc(2*(1.375*11px_+_6px)_+_4px)] place-items-center`;

/**
 * The row's three stacked buttons (see dot skills · student report · see history, ticket 175): the same
 * width and type as the header's, with the line at the text's own height and 2 px above and below, so three
 * (3 × 15.5 px and two 3 px gaps: 52.5 px). Ticket 175 fit them in the two-button stack's 46 px at 11 px with 1.5 px;
 * ticket 177 made them a pinch bigger and further apart, so every roster row is 6.5 px taller (81.5) than before.
 */
const ROW_BUTTON = "w-[96px] whitespace-nowrap rounded-md px-1 py-[2px] text-[11.5px] font-medium leading-none transition-colors";
const ROW_IDLE = `${ROW_BUTTON} bg-standout-soft text-accent-deep hover:bg-standout-line`;
const ROW_ACTIVE = `${ROW_BUTTON} bg-accent text-white hover:bg-accent-deep`;

/** The history pill's text (the category's name on today's pill, the date on each earlier one): 9 px semibold uppercase, white on a coloured pill, muted on a hollow one. */
const HISTORY_TEXT = "text-[9px] font-semibold uppercase leading-none tracking-[0.06em]";

/** The five history pills, 13 px each, stacked with 2 px between and 2 px above today's pill: 75 px above today's pill top. */
const HISTORY_STACK_PX = 5 * 13 + 5 * 2;

/**
 * The least cream between the stacks' top and the cut pill above (ticket 177): a pill whose midline sits
 * within this of the stacks' top is covered whole and the cut moves up to the next pill (or the heads),
 * so the half pill never touches the oldest date. With 81.5 px rows the row above's midline falls exactly
 * on the stacks' top, so without it every mid-roster cut would.
 */
const HISTORY_CLEAR_PX = 6;

/**
 * A category column's width in px: its header chip (11 px uppercase, 0.06 em tracking, 10 px padding a side: about
 * 20 px plus 8 a letter, so Algebra 75, Graphing 83, Functions and Reasoning 91, New skills 93, Communication 126)
 * with 2 px clear each side, in 8 px steps (ticket 141; ticket 136 gave every column 96 or 132).
 */
function columnWidth(c: CategoryId): number {
  const letters = categoryName(c).short.replace(/\s/g, "").length;
  return letters <= 7 ? 80 : letters <= 8 ? 88 : letters <= 10 ? 96 : 132;
}

/** The roster's other columns, px: student (avatar 32 + 12 + name slot 142 + pill 82 + 12 + buttons 96, inside px-5), Confidence, Set, the closing avatar. */
const STUDENT_COL = 420;
const CONFIDENCE_COL = 84;
const SET_COL = 64;
const AVATAR_COL = 48;

/** The roster's minimum width: the sum of its columns, which at 1280 × 800 is the card's 1208 px less 4 (`scripts/laptop-check.mjs` forbids the card scrolling). */
function rosterMinWidth(columns: CategoryId[]): number {
  return STUDENT_COL + columns.reduce((w, c) => w + columnWidth(c), 0) + CONFIDENCE_COL + SET_COL + AVATAR_COL;
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

const HANDED_IN = BEFORE_HAND_IN_STAGES;

/**
 * "Where the class is": one row per student, one column per category the assignment touches
 * (canonical order), each a pill in the worst status beneath it (ticket 125; groups and skills are dots). Clicking a pill expands that row into
 * the category → group → leaf → work drill; hovering a student's block (their row and any drill
 * open under it) shows three buttons beside the name: the row's full breakdown (every group open to its skills; "close" while
 * the row is open), the student's individual view and history mode (ticket 175: the pills named, their last five results stacked above). The
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
  /**
   * History mode (ticket 175): one student whose category pills widen to carry their names, every other row
   * faded; `open` lists the categories whose last five results stand stacked above the pill. Independent of
   * `open` (a drill under the same student stays), exclusive of `column`.
   */
  const [history, setHistory] = useState<{ student: string; open: CategoryId[] } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const rosterRef = useRef<HTMLDivElement>(null);
  const dueRef = useRef<HTMLParagraphElement>(null);
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
   * The grace ends early on the way out to the left (ticket 180): once the pointer is left of the row's
   * leftmost pill button (the name cell, or the first column's padding before the pill), the teacher has
   * left the markers behind and the buttons come back at once. The row's own leftmost pill is the line,
   * so a move from one row's pill down into another's name cell counts too. Off every marker: on a marker
   * the :has rules hide the buttons and the leave restarts the clock as before.
   */
  const markerMove = (e: React.PointerEvent<HTMLTableSectionElement>) => {
    if (pillQuiet || (e.target as Element).closest(MARKER)) return;
    const first = e.currentTarget.querySelector<HTMLElement>("tr[data-row] [data-dot]");
    if (!first || e.clientX >= first.getBoundingClientRect().left) return;
    window.clearTimeout(pillTimer.current);
    setPillQuiet(true);
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
    if (leaveHistory(student)) return;
    const now = e.timeStamp;
    const again = lastClick.current?.student === student && now - lastClick.current.at < DOUBLE_MS;
    lastClick.current = { student, at: now };
    if (again) return;
    if (open?.student === student) setOpen(null);
    else openRow(student, "groups");
  };
  const rowDouble = (student: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    if (history && history.student !== student) return;
    openRow(student, "expanded");
  };
  /**
   * History mode is one student's: a click anywhere on another student's row (or on the cream that hides the
   * rows above) leaves it, every history closed, and does nothing else. Returns true when the click was that.
   */
  const leaveHistory = (student?: string): boolean => {
    if (!history || history.student === student) return false;
    setHistory(null);
    return true;
  };
  /** "see history": this student's pills widen and name themselves; a column view closes, another student's drill closes, this student's own drill stays. */
  const openHistory = (student: string) => {
    setColumn(null);
    if (open && open.student !== student) setOpen(null);
    setHistory({ student, open: [] });
  };
  /** A widened pill: its five earlier results stack above it; again, they go. Several can stand at once. */
  const toggleHistory = (c: CategoryId) => {
    setHistory((h) => (h ? { ...h, open: h.open.includes(c) ? h.open.filter((x) => x !== c) : [...h.open, c] } : h));
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
        </div>
      </div>
      <p ref={dueRef} className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-ink-muted" data-due-line>
        <span>
          {title} · due {ASSIGNMENT.due}
          <span data-assignment-status>{status}</span>
        </span>
      </p>

      <div className="mt-10 grid grid-cols-[1fr_320px] gap-6">
        {/* `overflow-clip`, not `overflow-x-auto` (ticket 167): a scroll container would be the header row's nearest scroller, so the heads could only stick within the card, which never scrolls; `clip` still rounds the card's corners over the heads' paper backgrounds and is no scroller, so the heads stick to the top of the teacher frame's scroll region instead. A window narrower than the roster (below the 1280 laptop, where it is 1204 of 1208 px) now scrolls the frame sideways rather than the card. */}
        {/* The roster and, beside it in the same box, the history blocker (ticket 175): the cream that hides the rows above an open history is drawn outside the card, so it can rise past the card's clipped top edge over the "due" line when the history is a top row's. */}
        <div ref={rosterRef} className="relative">
        {history && history.open.length > 0 && <HistoryBlocker student={history.student} tableRef={tableRef} rosterRef={rosterRef} dueRef={dueRef} onClick={() => setHistory(null)} />}
        <Card className="overflow-clip">
          {/* Columns 420 · one per category sized to its chip (80–132, `columnWidth`) · 84 · 64 · 48 (ticket 141; 380 · 96/132 · 92 · 64 · 56 in ticket 136), the minimum their sum. The student column holds the avatar, the name slot, the live pill and, on hover, the two stacked action buttons side by side; the avatar again closes the row in the last column. */}
          <table ref={tableRef} className="w-full table-fixed text-left text-[14px]" style={{ minWidth: rosterMinWidth(columns) }} data-grid data-pill-quiet={pillQuiet || undefined} data-history={history?.student}>
            <colgroup>
              <col style={{ width: STUDENT_COL }} />
              {columns.map((c) => (
                <col key={c} style={{ width: columnWidth(c) }} />
              ))}
              <col style={{ width: CONFIDENCE_COL }} />
              <col style={{ width: SET_COL }} />
              <col style={{ width: AVATAR_COL }} />
            </colgroup>
            <thead>
              {/* In history mode the heads' contents fade with the other rows (the th keeps its paper, which the rows scroll under) and their buttons go inert. */}
              <tr className={`text-[10px] uppercase tracking-[0.06em] text-ink-muted ${history ? "pointer-events-none [&>th>*]:opacity-30" : ""}`} data-faded={history ? "" : undefined}>
                <th className={`${HEAD} px-5 py-4 font-semibold`}>Student</th>
                {columns.map((c) => {
                  const openHere = column?.category === c;
                  const all: { level: "groups" | "expanded"; word: string }[] = isFlat(c) ? [{ level: "groups", word: "see skills" }] : [{ level: "groups", word: "see skills" }, { level: "expanded", word: "full breakdown" }];
                  // The full breakdown open: one button, "close", filling the stack's height.
                  const tall = openHere && column.level === "expanded";
                  const levels = tall ? all.filter((l) => l.level === "expanded") : all;
                  return (
                    <th key={c} className={`${HEAD} group/head select-none px-0 py-4 text-center font-semibold leading-tight ${openHere ? "text-ink" : ""}`} data-column={c} data-column-open={openHere ? column.level : undefined}>
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
                <th className={`${HEAD} px-3 py-4 text-center font-semibold`}>Confidence</th>
                <th className={`${HEAD} px-3 py-4 text-center font-semibold`} data-set-head>
                  Set
                </th>
                <th className={`${HEAD} px-3 py-4`} aria-label="Student, again" />
              </tr>
            </thead>
            {rows.map((r, i) => {
                const isOpen = open?.student === r.id;
                const h = isOpen && open.keep ? restrictTo(results[i], open.keep) : results[i];
                const showDrill = isOpen || !!column;
                const inHistory = history?.student === r.id;
                const faded = !!history && !inHistory;
                return (
                  <RowGroup key={r.id} onPointerOver={markerOver} onPointerOut={markerOut} onPointerMove={markerMove} faded={faded}>
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
                          <Avatar initials={r.initials} />
                          <div className="min-w-0">
                            <div className="flex items-center">
                              {/* The name sits in a fixed slot (the widest name on the roster, Ruby Castellanos at 16 px, plus 10 px), so the live pill of every in-progress student starts at the same x instead of staggering with the name's length (ticket 136). A longer name pushes its own pill right; the slot's padding keeps the 10 px. */}
                              <span className="box-border min-w-[142px] whitespace-nowrap pr-2.5 text-[16px] font-medium leading-6 text-ink" data-student-name={r.id}>
                                {r.name}
                              </span>
                              {r.live && (
                                <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-accent-line bg-paper px-1.5 py-0.5 text-[11px] font-medium text-accent-deep" data-live-pill>
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
                          {/* Shown while the pointer is in the student's block, except over a marker (a category pill, ticket 128, or a drill dot, ticket 133: each is its own way in) and for PILL_GRACE_MS after it last left one (ticket 131), unless the pointer has gone left of the row's first pill, which ends the grace at once (ticket 180). The CSS :has rules hide at once; the state carries the grace. */}
                          {/* Three buttons (ticket 175): the third opens history mode and reads "close history" while it is on; the stack stays in view for the student in history mode, and never shows on a faded row. */}
                          <div className={`ml-auto flex shrink-0 flex-col gap-[3px] ${inHistory ? "visible" : "invisible"} ${pillQuiet && !faded ? "group-hover/row:visible group-focus-within/row:visible group-has-[[data-dot]:hover]/row:invisible group-has-[[data-node]:hover]/row:invisible" : ""}`} data-row-actions={r.id}>
                            <button type="button" onClick={() => (isOpen ? setOpen(null) : openRow(r.id, "expanded"))} className={isOpen ? ROW_ACTIVE : ROW_IDLE} data-see-skills={r.id} aria-pressed={isOpen}>
                              {isOpen ? "close" : "see dot skills"}
                            </button>
                            <Link href={`/teacher/report?student=${r.id}`} className={`${ROW_IDLE} text-center`} data-student-link={r.id}>
                              student report
                            </Link>
                            <button type="button" onClick={() => (inHistory ? setHistory(null) : openHistory(r.id))} className={inHistory ? ROW_ACTIVE : ROW_IDLE} data-see-history={r.id} aria-pressed={inHistory}>
                              {inHistory ? "close history" : "see history"}
                            </button>
                          </div>
                        </div>
                      </td>
                      {columns.map((c) => {
                        const st = h.categories[c] ?? "unseen";
                        const half = h.half.categories.includes(c);
                        const on = isOpen && open.mode === "category" && open.category === c;
                        const blanked = !!column && column.category !== c; // a column view shows only its own column's dots
                        const historyOpen = inHistory && history.open.includes(c);
                        return (
                          <td key={c} className="relative px-1 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => (leaveHistory(r.id) ? undefined : inHistory ? toggleHistory(c) : on && !column ? setOpen(null) : openRow(r.id, "category", c))}
                              onDoubleClick={() => (history ? undefined : openRow(r.id, "category", c, undefined, true))}
                              aria-label={inHistory ? `${categoryLabel(c, unit).name}: ${STATUS_WORD[st]}; ${historyOpen ? "hide" : "show"} the last five results` : `${categoryLabel(c, unit).name}: ${STATUS_WORD[st]}${half ? ", some problems not attempted" : ""}`}
                              aria-expanded={inHistory ? historyOpen : on}
                              className={`inline-grid h-7 place-items-center rounded-md transition-colors hover:bg-cream-deep ${inHistory ? "w-auto px-1.5" : "w-10"} ${on ? "bg-cream-deep ring-1 ring-ink" : ""} ${blanked ? "invisible" : ""}`}
                              data-dot={c}
                              data-blanked={blanked || undefined}
                              data-history-open={historyOpen || undefined}
                            >
                              {inHistory ? <HistoryPill student={r.id} category={c} status={st} open={historyOpen} /> : <StatusDot status={st} half={half} shape="pill" />}
                            </button>
                            {column?.category === c && (
                              <span className={`${LABEL} right-[calc(50%+20px)]`} data-column-label>
                                {categoryLabel(c, unit).name}
                              </span>
                            )}
                            {/* Not in history mode: the widened pill would cover it, and it names itself. */}
                            {!column && isOpen && isFlat(c) && !inHistory && (
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
                      {/* The avatar again, closing the row so the eye can find its student after crossing the skill columns (tickets 136, 141). */}
                      <td className="px-2 py-3.5">
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
          <div className={`flex items-center justify-end border-t border-line px-5 py-2.5 text-[12px] text-ink-muted ${history ? "opacity-30" : ""}`}>
            <span>
              every {Math.round(everyMs / 1000)}s · updated {ago(updatedAt, now)}
            </span>
          </div>
        </Card>
        </div>

        <div className="space-y-6">
          {/* "New assignment" heads the column, right above the Pathway card (ticket 176; it was the bar's white pill): a light indigo pill, deep indigo text and border. */}
          <div className="flex">
            <Link href="/teacher/assignments/create" className="rounded-full border border-accent-deep bg-accent-soft px-3 py-1 text-[13.5px] font-medium text-accent-deep transition-colors hover:bg-accent-line" data-new-assignment>
              New assignment
            </Link>
          </div>
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
                    {/* Beside the current pill (ticket 145): force submit for the stage, the count right under it. */}
                    {stage.state === "current" && stage.done !== null && (
                      <span className="absolute left-full top-1/2 ml-3 flex -translate-y-1/2 flex-col items-start whitespace-nowrap text-left text-[12.5px] leading-snug text-ink-muted" style={{ fontFamily: "var(--font-sans)" }} data-stage-note>
                        <ForceSubmit stage={stage.id} session={live} />
                        <span data-stage-count>
                          <span className="tabular-nums">
                            {stage.done}/{stage.total}
                          </span>{" "}
                          done
                        </span>
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
          <GroupProgressCard session={live} />
          {!wcInUse && <WholeClassCard />}

          <DiagnosticCard />

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
function RowGroup({ children, onPointerOver, onPointerOut, onPointerMove, faded }: { children: React.ReactNode; onPointerOver: React.PointerEventHandler<HTMLTableSectionElement>; onPointerOut: React.PointerEventHandler<HTMLTableSectionElement>; /** Ends the grace once the pointer is left of the row's first pill (ticket 180). */ onPointerMove: React.PointerEventHandler<HTMLTableSectionElement>; /** Another student is in history mode (ticket 175): the block fades to 30 %; a click on it still lands, and leaves history mode. */ faded: boolean }) {
  return (
    <tbody className={`group/row ${faded ? "opacity-30" : ""}`} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onPointerMove={onPointerMove} data-faded={faded ? "" : undefined}>
      {children}
    </tbody>
  );
}

/**
 * A category pill in history mode (ticket 175): today's pill, as wide as the category's name in white on
 * it (at least double the 28 px pill; a hollow pill takes muted text), and, when open, the student's last
 * five results in that category stacked above it, oldest at the top, each 13 px with 2 px between, dated
 * in the same text. The stack is absolutely placed over whatever is above and sized by the pill's own
 * width, so the dates' pills match the name's exactly; it draws above the sticky heads (z-30) and above
 * the cream blocker (z-25), and swallows clicks so one on a date does not leave history mode.
 */
function HistoryPill({ student, category, status, open }: { student: string; category: CategoryId; status: Status; open: boolean }) {
  const paint = (s: Status) => (s === "unseen" ? "border-line-strong text-ink-muted" : "text-white");
  const style = (s: Status) => (s === "unseen" ? undefined : { backgroundColor: DOT_COLOR[s], borderColor: DOT_COLOR[s] });
  const points = open ? historyFor(student, category, status) : [];
  return (
    <span className="relative inline-flex flex-col items-stretch">
      {open && (
        <span className="absolute inset-x-0 bottom-[calc(100%+2px)] z-30 flex flex-col gap-[2px]" role="img" aria-label={`${categoryName(category).short}, last five: ${points.map((p) => `${p.date} ${STATUS_WORD[p.status]}`).join(", ")}`} onClick={(e) => e.stopPropagation()} data-history-stack={category}>
          {points.map((p) => (
            <span key={p.date} className={`inline-grid h-[13px] place-items-center whitespace-nowrap rounded border ${HISTORY_TEXT} ${paint(p.status)}`} style={style(p.status)} data-history-point={p.date} data-status={p.status}>
              {p.date}
            </span>
          ))}
        </span>
      )}
      <span className={`inline-grid h-[13px] min-w-[56px] place-items-center whitespace-nowrap rounded border px-1 [interpolate-size:allow-keywords] transition-[width] duration-150 ${HISTORY_TEXT} ${paint(status)}`} style={style(status)} aria-hidden data-status={status} data-shape="pill" data-history-pill>
        {categoryName(category).short}
      </span>
    </span>
  );
}

/**
 * The cream that hides the rows above an open history (ticket 175): one rectangle from the first category
 * column to the Set column, from 2 px above the student's pills up to the midline of the nearest pill
 * above the stacks that would otherwise show in part (so the cut is visibly through a pill, never a
 * clean edge on a gap). When that midline would be in the heads, the heads are covered whole and the
 * cream rises past the card over the "due" line to that line's midline instead. Measured from the table
 * (relative to the roster box, in layout px: the teacher frame is zoomed) whenever the table's size
 * changes (a drill opening under the student, the window resizing), by a ResizeObserver, which also
 * fires once when it starts observing. Clicking the cream leaves history mode, like a click on any other
 * student's row.
 */
function HistoryBlocker({ student, tableRef, rosterRef, dueRef, onClick }: { student: string; tableRef: React.RefObject<HTMLTableElement | null>; rosterRef: React.RefObject<HTMLDivElement | null>; dueRef: React.RefObject<HTMLParagraphElement | null>; onClick: () => void }) {
  const [box, setBox] = useState<{ left: number; top: number; width: number; height: number; cut: "pill" | "due"; apron: { left: number; top: number; width: number; height: number } } | null>(null);
  useEffect(() => {
    const table = tableRef.current;
    const roster = rosterRef.current;
    if (!table || !roster) return;
    const measure = () => {
      const R = roster.getBoundingClientRect();
      const scale = R.width / (roster.offsetWidth || R.width);
      const x = (v: number) => (v - R.left) / scale;
      const y = (v: number) => (v - R.top) / scale;
      const heads = [...table.querySelectorAll<HTMLElement>("th[data-column]")].map((el) => el.getBoundingClientRect());
      const setHead = table.querySelector<HTMLElement>("th[data-set-head]")?.getBoundingClientRect();
      const row = table.querySelector<HTMLElement>(`tr[data-row="${student}"]`)?.getBoundingClientRect();
      const pill = table.querySelector<HTMLElement>(`tr[data-row="${student}"] [data-history-pill]`)?.getBoundingClientRect();
      if (heads.length === 0 || !setHead || !row || !pill) return;
      const firstHead = heads[0];
      const lastHead = heads[heads.length - 1];
      // The wide part stops at the student's own row's top edge, so nothing of theirs (the confidence word, the set count) is hidden; the apron carries the cream on down to 2 px above the pills, over the category columns only, so the whole stack stands on cream.
      const rowTop = y(row.top);
      const bottom = y(pill.top) - 2;
      const stackTop = y(pill.top) - HISTORY_STACK_PX;
      // The rows' own pills (a StatusDot directly in its button; not the history pills or their dates), their midlines in layout px: the nearest one at or above the stacks' top is where the cream stops.
      const mids = [...table.querySelectorAll<HTMLElement>("tr[data-row] [data-dot] > [data-status]")].map((el) => el.getBoundingClientRect()).map((r) => y(r.top + r.height / 2)).filter((m) => m <= stackTop - HISTORY_CLEAR_PX);
      const due = dueRef.current?.getBoundingClientRect();
      const top = mids.length > 0 ? Math.max(...mids) : due ? y(due.top + due.height / 2) : y(R.top) - 20;
      setBox({
        left: x(firstHead.left),
        top,
        width: x(setHead.right) - x(firstHead.left),
        height: rowTop - top,
        cut: mids.length > 0 ? "pill" : "due",
        apron: { left: x(firstHead.left), top: rowTop, width: x(lastHead.right) - x(firstHead.left), height: bottom - rowTop },
      });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(table);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [student, tableRef, rosterRef, dueRef]);
  if (!box) return null;
  return (
    <>
      <div className="absolute z-[25] cursor-default bg-cream-deep" style={{ left: box.left, top: box.top, width: box.width, height: box.height }} onClick={onClick} role="presentation" data-history-blocker data-cut={box.cut} />
      <div className="absolute z-[25] cursor-default bg-cream-deep" style={box.apron} onClick={onClick} role="presentation" data-history-apron />
    </>
  );
}
