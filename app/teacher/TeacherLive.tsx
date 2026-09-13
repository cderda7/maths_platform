"use client";

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import TeacherChrome from "./TeacherChrome";
import { BackToClassroom, useAssignmentBundle } from "./AssignmentContext";
import DiagnosticCard from "./DiagnosticCard";
import ForceSubmit from "./ForceSubmit";
import GroupProgressCard from "./GroupProgressCard";
import WholeClassCard from "./WholeClassCard";
import { RowDrill, type ColumnBox, type RowMode } from "@/components/HierarchyDrill";
import StatusKey from "@/components/StatusKey";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { StatusDot, STATUS_WORD } from "@/components/Tag";
import { DEMO_STUDENT, unitLabel } from "@/data/assignment";
import type { Classmate } from "@/data/classmates";
import { CATEGORY_ORDER, categoryName, isFlat, type CategoryId, type LeafId } from "@/data/taxonomy";
import { confidenceForms, confidenceLabel, type ConfidenceForm } from "@/lib/report";
import { BEFORE_HAND_IN_STAGES, type Confidence } from "@/data/types";
import { assignmentReportHref, assignmentStages, rosterProgress } from "@/lib/assignments";
import { currentSlide } from "@/lib/classroom";
import { useClassroom } from "@/lib/classroom-store";
import { progressTag } from "@/lib/progress";
import { classmatesAt } from "@/lib/stream";
import { classmateEvidence, columnOf, hierarchyFor, problemsStarted, restrictTo, sessionEvidence, type Evidence } from "@/lib/hierarchy";
import { pillLabel, type HistoryPoint } from "@/lib/history";
import { categoryHistory, hasEarlierSets, historyReportHref } from "@/lib/setHistory";
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

/** The grey uppercase label beside a category pill: the category name in a column view. (Until ticket 209 it also named the unit beside the Unit pill in a drill; the New skills column's header names it now.) */
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

/** A history pill's height, layout px, and the least space above each (2 px, the last above today's pill). */
const HISTORY_PILL_PX = 13;
const HISTORY_PILL_GAP_PX = 2;

/**
 * The least room `n` history pills need above today's pill: 13 px each with 2 px above each (five: 75 px). The white
 * sheet rises at least this far for the tallest open stack, and further to the next pill midline; its pills then spread
 * evenly over whatever height that gives (ticket 181), and a shorter stack keeps the same spacing from today's pill up (ticket 237).
 */
const historyStackPx = (n: number) => n * (HISTORY_PILL_PX + HISTORY_PILL_GAP_PX);

/**
 * The least sheet between the stacks' least top and the cut pill above (ticket 177): a pill whose midline
 * sits within this of it is covered whole and the cut moves up to the next pill (or the heads), so the
 * half pill never crowds the oldest date. With 81.5 px rows the row above's midline falls exactly on the
 * least top, so without it every mid-roster cut would.
 */
const HISTORY_CLEAR_PX = 6;

/**
 * A history pill (ticket 215): the stack's full width, so every pill in a column is one width whatever its label,
 * with no side padding or tracking, so "MON 7 SEP" (ticket 237; "PS5 · MON 7 SEP", 73 layout px at 9 px, before it) fits the narrowest column's pill
 * (Algebra's 80 px column less 1 px a side: 78, 76 inside its border).
 */
const HISTORY_PILL = "w-full! px-0! tracking-normal!";
/** In history mode a category cell's pill fills its column less 1 px a side (ticket 215), so today's named pill is as wide as the stack above it needs. */
const HISTORY_CELL = "px-px";
/** A history pill's link: the pill's own box, a pointer, a lift on hover and a visible ring on keyboard focus (ticket 215). */
const HISTORY_LINK = "flex rounded outline-none transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-paper";

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
 * History mode from a link (tickets 215, 237; since 237 the way back from a history pill's report): `?history=<student>&open=<category>`, read by the page and handed in as `init`, kept only when the
 * set has that student and the category is one the taxonomy knows (a category the set does not show opens no stack).
 */
export interface ClassViewInit {
  /** `?history=<student>`: open history mode on this student. */
  history: string | null;
  /** `?open=<category>`: with that category's stack standing. */
  open: string | null;
}

function historyFromQuery(init: ClassViewInit | undefined, set: { classmates: readonly Classmate[] }): { student: string; open: CategoryId[] } | null {
  const student = init?.history;
  if (!student || !(student === DEMO_STUDENT.id || set.classmates.some((c) => c.id === student))) return null;
  return { student, open: CATEGORY_ORDER.filter((c) => c === init.open) };
}

/**
 * "Where the class is": one row per student, one column per category the assignment touches
 * (canonical order), each a pill in the worst status beneath it (ticket 125; groups and skills are dots). Clicking a pill expands that row into
 * the category → group → leaf → work drill; hovering a student's block (their row and any drill
 * open under it) shows three buttons beside the name: the row's full breakdown (every group open to its skills; "close" while
 * the row is open), the student's individual view and history mode (ticket 175: the pills named, their earlier sets' results stacked above; not on the first set, ticket 237). The
 * demo student's row is live (in batches); classmates come through the same evidence path from
 * their scripted attempts.
 */
export default function TeacherLive({ init }: { init?: ClassViewInit }) {
  const assignment = useAssignmentBundle();
  const { session, updatedAt, everyMs } = useBatchedSession(3000);
  // Only the live set is Sam's session; a finished set's row is its own record (ticket 187).
  const live = assignment.kind === "live" ? (session ?? null) : null;
  const now = useNow();
  const { title, problems } = assignment;
  const classroom = useClassroom();
  const wc = classroom.wholeClass;
  // Class review is the live lesson's; a finished set's stages are all over (ticket 187).
  const finished = assignment.kind === "finished";
  const status = finished ? " · complete" : wc?.status === "active" ? " · in class review" : wc?.status === "ended" ? " · complete" : "";
  const [open, setOpen] = useState<{ student: string; mode: RowMode; category?: CategoryId; leaf?: LeafId; columns: ColumnBox[]; nonce: number; expandAll?: boolean; keep?: LeafId[] } | null>(null);
  /** A column view: one category open under every student's dot, at group level or with skills too. */
  const [column, setColumn] = useState<{ category: CategoryId; level: "groups" | "expanded"; boxes: Record<string, ColumnBox[]>; nonce: number } | null>(null);
  /**
   * History mode (ticket 175): one student whose category pills widen to carry their names, every other row
   * faded; `open` lists the categories whose earlier results stand stacked above the pill. Independent of
   * `open` (a drill under the same student stays), exclusive of `column`. The way back from a history pill's report
   * links here with `?history=<student>&open=<category>` (tickets 215, 237): the page opens in history mode on that student
   * with that category's stack standing, scrolls the row into view and drops the query, so a reload is the plain view.
   */
  const [history, setHistory] = useState<{ student: string; open: CategoryId[] } | null>(() => historyFromQuery(init, assignment));
  const fromQuery = useRef(history?.student ?? null);
  useEffect(() => {
    const student = fromQuery.current;
    if (!student) return;
    fromQuery.current = null;
    document.querySelector(`tr[data-row="${CSS.escape(student)}"]`)?.scrollIntoView({ block: "center" });
    window.history.replaceState(null, "", window.location.pathname);
  }, []);
  const tableRef = useRef<HTMLTableElement>(null);
  const rosterRef = useRef<HTMLDivElement>(null);
  const sideTopRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<HTMLDivElement>(null);
  useSideColumnPins(sideTopRef, keyRef, finished);
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
  const jump = (student: string, leaf: LeafId) => openRow(student, "category", columnOf(leaf, assignment.newSkills), leaf);
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
  /** The first set has nothing before it (ticket 237): no row offers "see history". */
  const offersHistory = hasEarlierSets(assignment.id);

  const progress = rosterProgress(assignment, live, now);
  /** Each classmate's record as far as the live stream has reached (ticket 189): what they have answered so far; the whole record once handed in, and on a finished set. */
  const records = new Map(classmatesAt(assignment, live, now).map((m) => [m.record.id, m.record]));
  /** Nothing handed in yet: the row's pills stay not-seen until the student submits (ticket 185). */
  const NO_EVIDENCE: Evidence = { lines: {}, submitted: false, caution: [] };
  /**
   * A row still on the set carries its progress beside the name, in the pill that read "in progress" (ticket 185):
   * "Q4 in progress" or "warming up"; the live student before his first screen keeps "not started", and once handed in "in progress" as before.
   */
  type Row = { id: string; name: string; initials: string; live: boolean; missing: boolean; evidence: Evidence; sub: string; confidence: { text: string; tone: string }; set: string; setSub: string; tag: string | null };
  /** A student with a fixed record on the set: a classmate, or Sam on a finished set (ticket 187). */
  const recordRow = (c: Classmate): Row => ({
    id: c.id,
    name: c.name,
    initials: c.initials,
    live: false,
    missing: progress[c.id].kind === "not-started",
    evidence: progressTag(progress[c.id]) ? NO_EVIDENCE : classmateEvidence(c, problems),
    sub: "",
    confidence: progress[c.id].kind === "not-started" ? confidenceWord(null) : { text: c.confidence, tone: c.confidence === "confident" ? "text-secure" : "text-accent-deep" },
    set: `${Math.min(c.done, problems.length)}/${problems.length}`,
    setSub: "",
    tag: progressTag(progress[c.id]),
  });
  const rows: Row[] = [
    assignment.sam ? recordRow(assignment.sam) : {
      id: DEMO_STUDENT.id,
      name: DEMO_STUDENT.name,
      initials: DEMO_STUDENT.initials,
      live: true,
      missing: false,
      evidence: live && !progressTag(progress[DEMO_STUDENT.id]) ? sessionEvidence(live) : NO_EVIDENCE,
      sub: "",
      confidence: confidenceWord(live?.confidence ?? null),
      set: `${live ? problemsStarted(live) : 0}/${problems.length}`,
      setSub: live && !HANDED_IN.includes(live.stage) ? "handed in" : "",
      tag: progressTag(progress[DEMO_STUDENT.id]) ?? (progress[DEMO_STUDENT.id].kind === "not-started" ? "not started" : "in progress"),
    },
    ...assignment.classmates.map((c) => recordRow(records.get(c.id) ?? c)),
  ];
  const results = rows.map((r) => hierarchyFor(r.evidence, assignment));
  const columns = results[0]?.columns ?? [];
  const caution = live?.escalation.caution ?? [];
  const stages = assignmentStages(assignment, classroom, live, now);
  const wcInUse = !!currentSlide(classroom);
  /** The history student's pills over each shown category: only earlier sets that assessed it, so a category may have none (ticket 237). */
  const stacks = history ? columns.map((c) => ({ category: c, points: categoryHistory(assignment.id, history.student, c) })) : [];
  const openStacks = stacks.filter((s) => history?.open.includes(s.category) && s.points.length > 0);

  return (
    <TeacherChrome>
      <BackToClassroom />
      <Eyebrow className="mt-3">
        {assignment.className} · {unitLabel(assignment.unit)}
      </Eyebrow>
      <div className="mt-3 grid grid-cols-[1fr_320px] gap-6">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <H1>Class View</H1>
        </div>
      </div>
      <p ref={dueRef} className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-ink-muted" data-due-line>
        <span>
          {title} · due {assignment.due}
          <span data-assignment-status>{status}</span>
        </span>
      </p>

      <div className="mt-10 grid grid-cols-[1fr_320px] gap-6">
        {/* `overflow-clip`, not `overflow-x-auto` (ticket 167): a scroll container would be the header row's nearest scroller, so the heads could only stick within the card, which never scrolls; `clip` still rounds the card's corners over the heads' paper backgrounds and is no scroller, so the heads stick to the top of the teacher frame's scroll region instead. A window narrower than the roster (below the 1280 laptop, where it is 1204 of 1208 px) now scrolls the frame sideways rather than the card. */}
        {/* The roster and, beside it in the same box, the history blocker (ticket 175): the cream that hides the rows above an open history is drawn outside the card, so it can rise past the card's clipped top edge over the "due" line when the history is a top row's. */}
        <div ref={rosterRef} className="relative">
        {history && openStacks.length > 0 && (
          <HistoryBlocker
            student={history.student}
            setId={assignment.id}
            stacks={openStacks}
            tableRef={tableRef}
            rosterRef={rosterRef}
            dueRef={dueRef}
            onClick={() => setHistory(null)}
          />
        )}
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
                              {/* The name sits in a fixed slot (the widest name on the roster, Ruby Castellanos at 16 px (132.2), plus 8 px), so the progress pill of every student still on the set starts at the same x instead of staggering with the name's length (ticket 136). A longer name pushes its own pill right; the slot's padding keeps the 8 px. Slot and pill were trimmed a few px in ticket 185 so the longest pill, "Q10 in progress", keeps clear of the row's buttons at 1280 and 1400. */}
                              <span className="box-border min-w-[141px] whitespace-nowrap pr-2 text-[16px] font-medium leading-6 text-ink" data-student-name={r.id}>
                                {r.name}
                              </span>
                              {r.tag && (
                                <span className="inline-flex shrink-0 items-center gap-[3px] whitespace-nowrap rounded-full border border-accent-line bg-paper px-[5px] py-0.5 text-[11px] font-medium text-accent-deep" data-live-pill={r.live || undefined} data-progress-tag={r.tag}>
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
                                  {r.tag}
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
                            <button type="button" onClick={() => (isOpen ? setOpen(null) : openRow(r.id, "expanded"))} className={`${isOpen ? ROW_ACTIVE : ROW_IDLE}`} data-see-skills={r.id} aria-pressed={isOpen}>
                              {isOpen ? "close" : "see dot skills"}
                            </button>
                            <Link href={assignmentReportHref(assignment.id, r.id)} className={`${ROW_IDLE} text-center`} data-student-link={r.id}>
                              student report
                            </Link>
                            {offersHistory && (
                              <button type="button" onClick={() => (inHistory ? setHistory(null) : openHistory(r.id))} className={`${inHistory ? ROW_ACTIVE : ROW_IDLE}`} data-see-history={r.id} aria-pressed={inHistory}>
                                {inHistory ? "close history" : "see history"}
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      {columns.map((c) => {
                        const st = h.categories[c] ?? "unseen";
                        const half = h.half.categories.includes(c);
                        const on = isOpen && open.mode === "category" && open.category === c;
                        const blanked = !!column && column.category !== c; // a column view shows only its own column's dots
                        const earlierCount = inHistory ? (stacks.find((s) => s.category === c)?.points.length ?? 0) : 0;
                        const historyOpen = inHistory && earlierCount > 0 && history.open.includes(c);
                        return (
                          <td key={c} className={`relative py-3.5 text-center ${inHistory ? HISTORY_CELL : "px-1"}`}>
                            <button
                              type="button"
                              onClick={() => (leaveHistory(r.id) ? undefined : inHistory ? (earlierCount > 0 ? toggleHistory(c) : undefined) : on && !column ? setOpen(null) : openRow(r.id, "category", c))}
                              onDoubleClick={() => (history ? undefined : openRow(r.id, "category", c, undefined, true))}
                              aria-label={inHistory ? `${categoryName(c).name}: ${STATUS_WORD[st]}; ${earlierCount === 0 ? "no earlier set assessed it" : `${historyOpen ? "hide" : "show"} the earlier results`}` : `${categoryName(c).name}: ${STATUS_WORD[st]}${half ? ", some problems not attempted" : ""}`}
                              aria-expanded={inHistory ? (earlierCount > 0 ? historyOpen : undefined) : on}
                              className={`inline-grid h-7 place-items-center rounded-md transition-colors hover:bg-cream-deep ${inHistory ? "w-full px-0" : "w-10"} ${on ? "bg-cream-deep ring-1 ring-ink" : ""} ${blanked ? "invisible" : ""}`}
                              data-dot={c}
                              data-blanked={blanked || undefined}
                              data-history-open={historyOpen || undefined}
                              data-history-count={inHistory ? earlierCount : undefined}
                            >
                              {/* One element either way (ticket 181): in history mode the same StatusDot carries the category's name and grows to its column less 1 px a side (ticket 215); its earlier results (up to five) are drawn by HistoryBlocker over it. The half fill gives way to the name. */}
                              <StatusDot status={st} half={half && !inHistory} shape="pill" label={inHistory ? categoryName(c).short : undefined} className={inHistory ? "w-full!" : ""} />
                            </button>
                            {column?.category === c && (
                              <span className={`${LABEL} right-[calc(50%+20px)]`} data-column-label>
                                {categoryName(c).name}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className={`px-1 py-3.5 text-center text-[13px] leading-snug ${r.confidence.tone}`} data-confidence>
                        <ConfidenceCell label={r.confidence.text} />
                      </td>
                      <td className="px-2 py-3.5 text-center leading-snug text-ink-soft">
                        {r.missing ? (
                          <Missing />
                        ) : (
                          <>
                            {r.set}
                            {r.setSub && <div className="-mx-2 whitespace-nowrap text-[12px] text-ink-muted" data-set-sub>{r.setSub}</div>}
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
          {/* A finished set's rows never update (ticket 187): no refresh line under them. */}
          {!finished && (
            <div className={`flex items-center justify-end border-t border-line px-5 py-2.5 text-[12px] text-ink-muted ${history ? "opacity-30" : ""}`}>
              <span>
                every {Math.round(everyMs / 1000)}s · updated {ago(updatedAt, now)}
              </span>
            </div>
          )}
        </Card>
        </div>

        {/* The column stretches to the roster's height (ticket 192): the cards above the key stay at its top, the key rides the bottom of the view. */}
        <div className="flex flex-col gap-6">
          {/* A finished set's column holds only the key: the stages are over (ticket 191) and the live cards are Problem Set 6's (ticket 187). */}
          {!finished && (
          <div ref={sideTopRef} className="sticky top-12 z-10 flex flex-col gap-6" data-side-top>
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
          </div>
          )}

          {/* The key sticks to the bottom of the teacher frame's scroll region as the roster scrolls (ticket 192). Its own box takes the rest of the column, so it can never rise over the cards above. `bottom-12` is the frame's own bottom padding (`py-12`), so where it rides is where it comes to rest on the table card's bottom at the end of the roster (no jump), and it clears Reset demo at 1280. */}
          <div className="flex flex-1 flex-col justify-end">
            <div ref={keyRef} className="sticky bottom-12">
              <Card className="p-6" data-key-card>
                <Eyebrow>Key</Eyebrow>
                <StatusKey className="mt-3" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TeacherChrome>
  );
}

/** The side column's pinned offsets, layout px: `top-12` on the cards above the key, `bottom-12` on the key, and the column's `gap-6` between them. */
const PIN_TOP = 48;
const PIN_BOTTOM = 48;
const PIN_GAP = 24;

/**
 * Keeps the side column's two pinned groups from overlapping (ticket 196). The cards above the key stick
 * to the top of the teacher frame's scroll region and the key to its bottom; when the region is too short
 * for both (a short window, or class review and group progress cards joining the pathway), the cards above
 * scroll away with the roster and only the key stays pinned, if it fits on its own. Styles are set on the nodes from a ResizeObserver (on the
 * region and both groups, so a card appearing re-checks), not through state. Heights are offsetHeight /
 * clientHeight: layout px under the chrome's zoom.
 */
function useSideColumnPins(topRef: React.RefObject<HTMLDivElement | null>, keyRef: React.RefObject<HTMLDivElement | null>, finished: boolean) {
  useLayoutEffect(() => {
    const key = keyRef.current;
    const scroller = key?.closest<HTMLElement>("[data-teacher-scroll]");
    if (!key || !scroller) return;
    const check = () => {
      const top = topRef.current;
      const room = scroller.clientHeight;
      const topHeight = top ? top.offsetHeight : 0;
      const both = PIN_TOP + (top ? topHeight + PIN_GAP : 0) + key.offsetHeight + PIN_BOTTOM <= room;
      // Too short for both: the cards above scroll away as before ticket 196 (pinned, they would ride down onto a key resting at the column's end); the key still pins while it fits alone.
      const topPins = !!top && both;
      const keyPins = both || key.offsetHeight + PIN_BOTTOM <= room;
      if (top) {
        top.style.position = topPins ? "" : "static";
        top.dataset.pinned = String(topPins);
      }
      key.style.position = keyPins ? "" : "static";
      key.dataset.pinned = String(keyPins);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(scroller);
    ro.observe(key);
    if (topRef.current) ro.observe(topRef.current);
    return () => ro.disconnect();
  }, [topRef, keyRef, finished]);
}

/** The most lines a confidence label takes: three at 13 px on a 17 px leading (51 px) fit the row's height without growing it; leading-snug's 53.6 px grew a row by a pixel (ticket 190). */
const CONFIDENCE_LINES = 3;

/**
 * The confidence label at the column's own size, "confident"'s 13 px: the first of its forms
 * (`confidenceForms`) whose words fit the cell's width and three lines. Every form is laid out
 * unseen inside the cell to measure it, again whenever the cell's width changes; a form that
 * leaves skills out shows "+1" and carries the whole label on hover and for screen readers.
 * See DECISION_LOG.md, "A confidence label too long for its column names what fits and counts the rest".
 */
function ConfidenceCell({ label }: { label: string }) {
  const forms = useMemo(() => confidenceForms(label), [label]);
  const ref = useRef<HTMLSpanElement>(null);
  const [fitted, setFitted] = useState<{ label: string; index: number }>({ label, index: 0 });
  useLayoutEffect(() => {
    const box = ref.current;
    if (!box || forms.length < 2) return;
    const fit = () => {
      const room = parseFloat(getComputedStyle(box).lineHeight) * CONFIDENCE_LINES + 0.5;
      const probes = [...box.querySelectorAll<HTMLElement>("[data-confidence-probe]")];
      const index = probes.findIndex((p) => p.scrollWidth <= p.clientWidth && p.offsetHeight <= room);
      setFitted({ label, index: index < 0 ? forms.length - 1 : index });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [forms, label]);
  if (forms.length < 2) return <>{label}</>;
  const form = forms[fitted.label === label ? fitted.index : 0];
  return (
    <span ref={ref} className="relative block overflow-hidden leading-[17px]" title={form.hidden ? label : undefined} data-confidence-label={label} data-confidence-hidden={form.hidden}>
      <span aria-hidden={form.hidden > 0 || undefined}>
        <ConfidenceWords form={form} />
      </span>
      {form.hidden > 0 && <span className="sr-only">{label}</span>}
      {forms.map((f, k) => (
        <span key={k} aria-hidden className="invisible absolute inset-x-0 top-0 block" data-confidence-probe>
          <ConfidenceWords form={f} />
        </span>
      ))}
    </span>
  );
}

/** A form's words, each unbroken, wrapping only at the spaces between them; the count of skills left out last. */
function ConfidenceWords({ form }: { form: ConfidenceForm }) {
  return (
    <>
      {form.words.map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="whitespace-nowrap">{w}</span>
        </Fragment>
      ))}
      {form.hidden > 0 && (
        <>
          {" "}
          <span className="whitespace-nowrap text-ink-muted" data-confidence-more>
            +{form.hidden}
          </span>
        </>
      )}
    </>
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
 * The white sheet that hides the rows above an open history, and the histories themselves (tickets 175,
 * 181): one rectangle over the category columns (the first head's left to the last head's right; the
 * Confidence and Set columns stay clear), from 2 px above the student's pills up to the midline of the
 * nearest pill above the five's least room that would otherwise show in part (so the cut is visibly
 * through a pill, never a clean edge on a gap). When that midline would be in the heads, the heads are
 * covered whole and the sheet rises past the card over the "due" line to that line's midline instead.
 * Over the sheet, one column per open category: its dated pills (up to five, ticket 237: only earlier sets that
 * assessed it), oldest at the top. The tallest open stack spreads evenly from the sheet's top to today's pill (equal
 * space above the first, between each, and below the last); a shorter one keeps that spacing, sitting on today's
 * pill. Each is the same element and width as today's named pill; a click opens the student's report on that set. Measured from the table (relative to the
 * roster box, in layout px: the teacher frame is zoomed) whenever the table's size changes (a drill
 * opening under the student, the window resizing), by a ResizeObserver, which also fires once when it
 * starts observing; the named pills are measured then too, after their width has settled. Clicking the
 * sheet leaves history mode, like a click on any other student's row.
 */
function HistoryBlocker({ student, setId, stacks, tableRef, rosterRef, dueRef, onClick }: { student: string; setId: string; stacks: { category: CategoryId; points: HistoryPoint[] }[]; tableRef: React.RefObject<HTMLTableElement | null>; rosterRef: React.RefObject<HTMLDivElement | null>; dueRef: React.RefObject<HTMLParagraphElement | null>; onClick: () => void }) {
  const tallest = Math.max(...stacks.map((s) => s.points.length));
  const [box, setBox] = useState<{ left: number; top: number; width: number; height: number; cut: "pill" | "due"; pillTop: number; pills: Partial<Record<CategoryId, { left: number; width: number }>> } | null>(null);
  useEffect(() => {
    const table = tableRef.current;
    const roster = rosterRef.current;
    if (!table || !roster) return;
    const measure = () => {
      const R = roster.getBoundingClientRect();
      const scale = R.width / (roster.offsetWidth || R.width);
      const x = (v: number) => (v - R.left) / scale;
      const y = (v: number) => (v - R.top) / scale;
      const heads = [...table.querySelectorAll<HTMLElement>("th[data-column]")];
      const pillEls = heads.map((h) => table.querySelector<HTMLElement>(`tr[data-row="${student}"] [data-dot="${h.dataset.column}"] > [data-status]`));
      const pill = pillEls[0]?.getBoundingClientRect();
      if (heads.length === 0 || !pill) return;
      const firstHead = heads[0].getBoundingClientRect();
      const lastHead = heads[heads.length - 1].getBoundingClientRect();
      const pillTop = y(pill.top);
      const leastTop = pillTop - historyStackPx(tallest);
      // The rows' own pills (a StatusDot directly in its button), their midlines in layout px: the nearest one far enough above the five's least room is where the sheet stops.
      const mids = [...table.querySelectorAll<HTMLElement>("tr[data-row] [data-dot] > [data-status]")].map((el) => el.getBoundingClientRect()).map((r) => y(r.top + r.height / 2)).filter((m) => m <= leastTop - HISTORY_CLEAR_PX);
      const due = dueRef.current?.getBoundingClientRect();
      const top = mids.length > 0 ? Math.max(...mids) : due ? y(due.top + due.height / 2) : y(R.top) - 20;
      const pills: Partial<Record<CategoryId, { left: number; width: number }>> = {};
      heads.forEach((h, i) => {
        const r = pillEls[i]?.getBoundingClientRect();
        if (r) pills[h.dataset.column as CategoryId] = { left: x(r.left), width: r.width / scale };
      });
      setBox({ left: x(firstHead.left), top, width: x(lastHead.right) - x(firstHead.left), height: pillTop - 2 - top, cut: mids.length > 0 ? "pill" : "due", pillTop, pills });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(table);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [student, tallest, tableRef, rosterRef, dueRef]);
  if (!box) return null;
  // The tallest stack's even spacing, which every stack keeps from today's pill up.
  const space = (box.pillTop - box.top - tallest * HISTORY_PILL_PX) / (tallest + 1);
  return (
    <>
      <div className="absolute z-[25] cursor-default bg-paper" style={{ left: box.left, top: box.top, width: box.width, height: box.height }} onClick={onClick} role="presentation" data-history-blocker data-cut={box.cut} />
      {stacks.map(({ category, points }) => {
        const pill = box.pills[category];
        if (!pill) return null;
        return (
          <div
            key={category}
            className="absolute z-30 flex flex-col items-stretch justify-end"
            style={{ left: pill.left, width: pill.width, top: box.top, height: box.pillTop - box.top, gap: space, paddingBottom: space }}
            role="list"
            aria-label={`${categoryName(category).short}, earlier sets: ${points.map((p) => `${p.set.name}, ${p.date} ${STATUS_WORD[p.status]}`).join("; ")}`}
            data-history-stack={category}
          >
            {/* Each pill opens the student's report on that set, inside this set's Class View (ticket 237). */}
            {points.map((p) => (
              <Link key={p.set.id} href={historyReportHref(setId, p.set.id, student, category)} role="listitem" className={HISTORY_LINK} aria-label={`${p.set.name}, ${p.date}: ${STATUS_WORD[p.status]}. Open the student's report on it`} data-history-point={p.set.id}>
                <StatusDot status={p.status} shape="pill" label={pillLabel(p)} className={HISTORY_PILL} />
              </Link>
            ))}
          </div>
        );
      })}
    </>
  );
}
