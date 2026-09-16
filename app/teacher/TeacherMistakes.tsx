"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import TeacherChrome from "./TeacherChrome";
import { useAssignmentBundle } from "./AssignmentContext";
import BackLine from "./BackLine";
import M from "@/components/Math";
import ProblemQuestion from "@/components/ProblemQuestion";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { EscapeLayer } from "@/components/useEscape";
import { DifficultyTag, SlipChip } from "@/components/Tag";
import { arriving, EMPTY_HOLD, holdAbovePointer, holdKey } from "@/lib/arrivals";
import { assignmentStages, classSize, currentStageOf } from "@/lib/assignments";
import { groupBySlip, mistakesByProblem, type WorkColumn } from "@/lib/mistakes";
import { useBatchedSession, useNow } from "@/lib/store";
import { useClassroom } from "@/lib/classroom-store";
import { liveDiagnostic, questionFor } from "@/lib/diagnostic";
import DiagnosticFocus from "./DiagnosticFocus";
import DiagnosticPush, { DiagnosticChip, DiagnosticFootprint, DiagnosticOverlay, PROBLEM_HEADER } from "./DiagnosticPush";
import { setStudentOpen, useOpenFlyout, useOpenStudent } from "./diagnosticFlyout";
import StageSplit from "./StageSplit";
import StudentWorkPanel from "./StudentWorkPanel";
import { reviewWorkAt, studentWorkAt } from "@/lib/studentWork";
import { reviewPlaces, reviewRows, stillToFix } from "@/lib/reviewPlaces";
import { PlaceTable, ReviewTable, useWhereRows } from "./WhereStudentsAre";
import { GroupChip, GroupGrid } from "./WhereGroupsAre";
import { countParts, everyGroupSolved, gridAt, groupCounts, groupsNotSolved } from "@/lib/groupGrid";
import { movedInSetOrder } from "@/lib/splitReview";
import type { GroupColour } from "@/data/groups";

// The same button as the class view's row actions ("see dot skills" / "close").
const ACTION = "w-[96px] rounded-md px-2 py-[3px] text-[11px] font-medium leading-snug transition-colors";
const ACTION_IDLE = `${ACTION} bg-standout-soft text-accent-deep hover:bg-standout-line`;
const ACTION_ACTIVE = `${ACTION} bg-accent text-white hover:bg-accent-deep`;

/**
 * The narrowest a column goes (ticket 135). Columns share the card evenly; a problem with more
 * columns (distinct workings, ticket 138) than fit at this width scrolls sideways. The working shrinks to fit: a
 * problem's lines are set at 17 px, or smaller by the one factor (`--fit`, measured by
 * `FitGrid`) that puts its widest line on one row inside its box, never under 13 px; under
 * 260 px of column the padding inside tightens too (`@max-[260px]`, a container query on the
 * cell). The floor is measured so the widest line in the fixtures (Q7's pair check,
 * 2 × 4 = 8, 2 + 4 = 6, at 13 px) sits on one row inside the box's edge cell, whose margin
 * takes 10 px of the column.
 */
const COLUMN_FLOOR = 186;
/** The two count tags beside a problem card: "15/20 correct" level with the header, "3/20 skipped" right under it (tickets 140, 143). Tabular figures, so a count's digits never change its width. */
const COUNT = "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md border border-line bg-cream-deep px-2 py-1 text-[12px] leading-none tabular-nums";
/**
 * The count column's width, layout px: the widest the tags can be ("20/20 skipped" in tabular figures, 103), so every
 * problem card starts at the same x whatever its counts (ticket 187: "11/20" left its card 2 px left of "18/20"'s).
 */
const COUNT_COLUMN = 103;
/** A count tag's height: 12 px text on its own line, 4 px padding and 1 px border each side. The column's top padding centres the first tag on the header row. */
const COUNT_H = 22;
const LINE = "rounded-xl border px-4 py-2.5 text-[clamp(13px,calc(17px*var(--fit,1)),17px)] whitespace-nowrap text-ink @max-[260px]:px-2 @max-[260px]:py-1.5";
/** A mistake group's label (ticket 245): its wrong line(s) in the working's red, set at 17 px or smaller by the problem's `--label-fit`, never under 13 px. */
const LABEL = "rounded-xl border border-wrong-line bg-wrong-soft px-4 py-2.5 text-[clamp(13px,calc(17px*var(--label-fit,1)),17px)] whitespace-nowrap text-ink @max-[260px]:px-2 @max-[260px]:py-1.5";
/** The working's and the labels' smallest size over their largest: `--fit` and `--label-fit` stop here. */
const FIT_FLOOR = 13 / 17;

/** A box's width for its content, layout px (the teacher chrome is zoomed, so client rects would be in other units). */
const contentWidth = (box: HTMLElement) => {
  const cs = getComputedStyle(box);
  return box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
};
/**
 * The width a pill needs for its words on one line, layout px: its text's own width plus its padding and border. A flex
 * pill's scrollWidth leaves out its end padding when the words overflow, so a misconception chip measured by it came out
 * up to its right padding too narrow, its last word against the border (seen on ticket 319's narrower group-chip columns).
 */
const pillNeeds = (pill: HTMLElement) => {
  const range = document.createRange();
  range.selectNodeContents(pill);
  const zoom = pill.getBoundingClientRect().width / pill.offsetWidth || 1;
  const cs = getComputedStyle(pill);
  return Math.ceil(range.getBoundingClientRect().width / zoom + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth));
};
/** The widest typeset line inside an element, layout px (offsetWidth rounds down). */
const widestMaths = (el: HTMLElement) => Math.max(0, ...[...el.querySelectorAll<HTMLElement>(".katex")].map((k) => k.offsetWidth + 1));
const template = (mins: number[]) => mins.map((m) => `minmax(${m}px, 1fr)`).join(" ");

/**
 * The students' grid of one problem, which measures its own maths before paint, whenever the grid's size changes (the
 * window, a panel opening beside the card) and once the maths fonts have loaded, writing straight to the element: no
 * state, no re-render.
 * First the labels (ticket 245): with `--label-fit` at 1 and every column at the floor, the tightest label's overshoot
 * of its box sets the factor all the problem's labels are scaled by, down to 13 px; a label still wider than its box
 * at that size widens its group's columns, equally, until it fits (the card scrolls sideways when they no longer fit
 * the card). A misconception pill (ticket 299) is never scaled and never wraps a word, so one wider than its cell widens
 * its pill group's columns the same way. Then the working, on the columns the labels settled: the widest line's overshoot sets `--fit` the same way
 * (KaTeX scales with the font size, so one measurement is enough). Opening a problem only adds the working, so the
 * labels, and with them the columns, come out the same: nothing moves.
 */
function FitGrid({ columns, children, ...rest }: { columns: number } & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const mins = Array<number>(columns).fill(COLUMN_FLOOR);
      el.style.gridTemplateColumns = template(mins);
      el.style.setProperty("--label-fit", "1");
      const labels = [...el.querySelectorAll<HTMLElement>("[data-label-box]")];
      let labelScale = 1;
      for (const box of labels) labelScale = Math.min(labelScale, contentWidth(box) / widestMaths(box));
      labelScale = Math.max(FIT_FLOOR, labelScale);
      el.style.setProperty("--label-fit", labelScale.toFixed(4));
      // What must fit on one row, with the cell it sits in: each label's maths in its box, each pill group's widest pill in its cell.
      const fits = [
        ...labels.map((box) => ({ box, cell: box.parentElement!, over: () => widestMaths(box) - contentWidth(box) })),
        ...[...el.querySelectorAll<HTMLElement>("[data-slip-group]")].map((box) => ({ box, cell: box, over: () => Math.max(0, ...[...box.querySelectorAll<HTMLElement>("[data-slip]")].map(pillNeeds)) - contentWidth(box) })),
      ];
      // Widening one group's columns can take width from its neighbours' flexible share, so check again until everything fits (a few passes at most).
      for (let pass = 0; pass < 6; pass++) {
        let widened = false;
        for (const { box, cell, over: overOf } of fits) {
          const over = overOf();
          if (over <= 0) continue;
          const start = Number(box.dataset.start);
          const span = Number(box.dataset.span);
          const each = cell.offsetWidth / span + over / span + 1;
          for (let c = start; c < start + span; c++) mins[c] = Math.max(mins[c], Math.ceil(each));
          widened = true;
        }
        if (!widened) break;
        el.style.gridTemplateColumns = template(mins);
      }
      el.style.setProperty("--fit", "1");
      let scale = 1;
      for (const li of el.querySelectorAll<HTMLElement>("li[data-line]")) {
        const w = widestMaths(li);
        const avail = contentWidth(li);
        if (w > avail) scale = Math.min(scale, avail / w);
      }
      el.style.setProperty("--fit", scale.toFixed(4));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  });
  return (
    <div ref={ref} {...rest} style={{ ...rest.style, gridTemplateColumns: template(Array<number>(columns).fill(COLUMN_FLOOR)) }}>
      {children}
    </div>
  );
}

/**
 * How many of the list's problem rows have their top at or above the pointer (ticket 189), 0 while the pointer is off
 * the list: the cards `holdAbovePointer` keeps still. Measured on pointer moves and scrolls, outside render; the view
 * re-renders only when the number changes.
 */
function usePointerGuard(listRef: RefObject<HTMLElement | null>): number {
  const [store] = useState(() => {
    let count = 0;
    let x = -1;
    let y = -1;
    let overList = false;
    const listeners = new Set<() => void>();
    const measure = () => {
      const list = listRef.current;
      let next = 0;
      if (list && y >= 0) {
        const r = list.getBoundingClientRect();
        // Over the list's box, or over something of the list's that hangs out of it (a diagnostic flyout).
        if (overList || (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)) {
          for (const row of list.querySelectorAll<HTMLElement>("[data-problem-row]")) {
            if (row.getBoundingClientRect().top > y) break;
            next++;
          }
        }
      }
      if (next !== count) {
        count = next;
        for (const l of listeners) l();
      }
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      overList = e.target instanceof Node && !!listRef.current?.contains(e.target);
      measure();
    };
    const leave = () => {
      x = -1;
      y = -1;
      overList = false;
      measure();
    };
    return {
      subscribe(cb: () => void) {
        listeners.add(cb);
        if (listeners.size === 1) {
          document.addEventListener("pointermove", move, { passive: true });
          document.addEventListener("scroll", measure, { capture: true, passive: true });
          document.documentElement.addEventListener("pointerleave", leave);
        }
        return () => {
          listeners.delete(cb);
          if (listeners.size === 0) {
            document.removeEventListener("pointermove", move);
            document.removeEventListener("scroll", measure, { capture: true });
            document.documentElement.removeEventListener("pointerleave", leave);
          }
        };
      },
      get: () => count,
    };
  });
  return useSyncExternalStore(store.subscribe, store.get, () => 0);
}

/** The Mistakes page's scroll when a chain was sent from it, so done brings the teacher back to the same place (ticket 260). Module state: it outlives a switch to Class and back mid-chain. */
let scrollBeforeFocus: number | null = null;

/**
 * While a diagnostic chain is out the focused view takes the page from the top (ticket 260); when it ends the page's own
 * content comes back scrolled where the teacher left it. The problems stay mounted underneath (hidden), so what was
 * expanded is still expanded. Runs before paint, so neither jump is seen.
 */
function useScrollAroundFocus(focused: boolean, ready: boolean) {
  const was = useRef<boolean | null>(null);
  // The page's scroll as the teacher left it: by the time the send's render commits, the problems are hidden and the browser has already clamped the scroll.
  const last = useRef(0);
  useLayoutEffect(() => {
    const main = document.querySelector<HTMLElement>("[data-teacher-scroll]");
    if (!main) return;
    const onScroll = () => {
      if (!document.querySelector("[data-diagnostic-focus]")) last.current = main.scrollTop;
    };
    last.current = main.scrollTop;
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, []);
  useLayoutEffect(() => {
    const main = document.querySelector<HTMLElement>("[data-teacher-scroll]");
    const before = was.current;
    was.current = focused;
    if (!main) return;
    if (focused && before === false) {
      scrollBeforeFocus = last.current;
      main.scrollTop = 0;
    } else if (!focused && ready && scrollBeforeFocus !== null) {
      // Back on the page (done here, or on Mistakes again after done elsewhere) once its problems are on it: the first tick of a fresh mount has none yet.
      main.scrollTop = scrollBeforeFocus;
      scrollBeforeFocus = null;
    }
  });
}

/**
 * A student's name in a mistake column (ticket 189): one that has just arrived glows faintly and fades (`.arrive`,
 * background and ring only, so nothing moves). The fade is placed on the arrival time when the name first renders, so a
 * name that arrived before the view opened (a reload) is already part-way through, or done.
 */
function ArrivingName({ arrivedAt, now, children, ...rest }: { arrivedAt: number | undefined; now: number; children: ReactNode } & React.HTMLAttributes<HTMLSpanElement>) {
  const [since] = useState(() => (arrivedAt === undefined ? null : Math.max(0, now - arrivedAt)));
  const glow = since !== null && arriving(arrivedAt, now);
  return (
    <span {...rest} className={`${rest.className ?? ""} ${glow ? "arrive" : ""}`} style={glow ? { animationDelay: `-${since}ms` } : undefined} data-arriving={glow || undefined} data-arrived-at={arrivedAt}>
      {children}
    </span>
  );
}

/**
 * Mistakes by problem. Under each problem the students who slipped sit side by side, those who
 * slipped on the same step next to each other under one pill that spans them, and inside a
 * pill those who made the exact same mistake (the same wrong line, whatever the lines around
 * it) next to each other. Students whose working is identical line for line share one column
 * (ticket 138): their names sit together over the one copy of the work, so a problem twelve
 * students got wrong in three ways takes three columns. Over the names of each group on the same exact mistake sits its
 * label (ticket 245): the wrong line they all wrote, in the working's red, across the group's columns, collapsed or open,
 * so the clusters say what they are before anything is expanded. Any number of problems can be open at
 * once: clicking the problem's header, any student, or the "expand" button that shows on hover
 * opens the working for that problem, one column each, the wrong line in red, and one box in
 * the pill's red around the working of every group of students on the same exact mistake (a
 * student alone on theirs boxed alone). An open problem carries a "close" button; once pressed, the button reads
 * "close all" (while other problems are still open) until the pointer leaves the card.
 * To the right of each problem sits its live diagnostic (ticket 127): the "Live diagnostic" chip
 * alone until clicked, then the push panel with the problem's step questions (ticket 240) as a flyout from the chip, down and to the right (ticket 132); the card
 * keeps its width either way, and a little clear of the card so the open flyout never touches
 * it (ticket 142). Left of the card, level with its header row, a small box counts the class who
 * got it correct, "14/20 correct" (ticket 140; outside the card since 142), its tooltip splitting the
 * rest into the wrong (the rows) and the skipped, and under it a second box with the skipped
 * count, "3/20 skipped" (143): stopped before the problem, or handed in without an answer. The difficulty tag sits after
 * the maths, not at the header's far end (142); no live pill on a name here (142).
 * While a diagnostic chain is out (ticket 260) the page is the chain's focused view (`DiagnosticFocus`) under the same
 * chrome, tabs and eyebrow; the problems stay mounted, hidden, and come back where they were once the teacher's done.
 */
export default function TeacherMistakes() {
  const assignment = useAssignmentBundle();
  const { session: liveSession } = useBatchedSession(3000);
  // A finished set's work is its own; only the live set reads Sam's session.
  const session = assignment.kind === "live" ? liveSession : null;
  const classroom = useClassroom();
  const now = useNow();
  const stage = currentStageOf(assignmentStages(assignment, classroom, session, now));
  /** Individual review on the live set (ticket 318): the split shows where each student is in their corrections, and the cards only what is still to fix. */
  const review = assignment.kind === "live" && now > 0 && stage?.id === "individual";
  const students = review ? reviewPlaces(assignment, classroom, session, now) : [];
  /** Group review on the live set (ticket 319): the split shows where each group is on each question, and the cards count groups. */
  const groupStage = assignment.kind === "live" && now > 0 && stage?.id === "group";
  // The questions the teacher moved to class review (ticket 337) are a grey band across the grid: no group works them.
  const movedToClass = movedInSetOrder(classroom, assignment.problems);
  const grid = groupStage ? gridAt(classroom, session, now, assignment.problems, movedToClass) : [];
  const countsOf = new Map(groupStage ? assignment.problems.map((p) => [p.id, groupCounts(grid, p.id)]) : []);
  /** The group each student in group review sits in: a card names groups, never students. */
  const groupOf = new Map<string, GroupColour>(grid.flatMap((g) => g.members.map((m) => [m, g.colour] as const)));
  // The live set's classmates stream in from its start (ticket 189): nothing to show until the clock has its first tick.
  const firstFound = assignment.kind === "live" && now === 0 ? [] : mistakesByProblem(session, assignment, now);
  // In group review a question some group has in its union has a card even with no wrong line on it (unfinished or not attempted), in set order.
  const found = groupStage
    ? assignment.problems.flatMap((problem) => {
        const had = firstFound.find((f) => f.problem.id === problem.id);
        return had ? [had] : (countsOf.get(problem.id)?.groups.length ?? 0) > 0 ? [{ problem, rows: [], right: 0, pending: 0 }] : [];
      })
    : firstFound;
  // In individual review a card keeps the students still to fix its problem; one everyone has fixed stays as a thin line (ticket 318).
  const fixedOf = new Map(found.map((p) => [p.problem.id, review ? p.rows.filter((r) => !stillToFix(students, r.id, p.problem.id)).length : 0]));
  const notSolvedOf = (problem: string) => groupsNotSolved(countsOf.get(problem) ?? { problem, groups: [], solved: 0, left: 0, unsolved: 0, toGo: 0 }).map((g) => g.colour);
  const latest = review
    ? found.map((p) => ({ ...p, rows: p.rows.filter((r) => stillToFix(students, r.id, p.problem.id)) }))
    : groupStage
      ? found.map((p) => ({ ...p, rows: p.rows.filter((r) => notSolvedOf(p.problem.id).includes(groupOf.get(r.id)!)) }))
      : found;
  const listRef = useRef<HTMLDivElement>(null);
  const guarded = usePointerGuard(listRef);
  const [hold, setHold] = useState(EMPTY_HOLD);
  const shown = holdAbovePointer(
    latest,
    hold,
    guarded,
    assignment.problems.map((p) => p.id),
    now,
  );
  // Remember what is on screen, so the cards above the pointer can keep it while new work arrives.
  if (holdKey(shown) !== holdKey(hold)) setHold(shown);
  const problems = shown.problems;
  /** The class the counts are over: twenty, less anyone marked absent on the set (ticket 250). */
  const size = classSize(assignment);
  const [open, setOpen] = useState<string[]>([]);
  /** The problem just closed by hand: its button offers "close all" until the pointer leaves it. */
  const [armed, setArmed] = useState<string | null>(null);

  const show = (id: string) => setOpen((o) => (o.includes(id) ? o : [...o, id]));
  const hide = (id: string) => {
    setOpen((o) => o.filter((x) => x !== id));
    setArmed(id);
  };
  const toggle = (id: string) => (open.includes(id) ? hide(id) : show(id));
  /** The chain out with the class, if one is (ticket 260): the focused view takes the page's place until done or a withdraw. */
  const chain = assignment.kind === "live" ? liveDiagnostic(classroom) : null;
  const focused = !!chain;
  useScrollAroundFocus(focused, assignment.kind !== "live" || now > 0);
  const chainProblemId = chain ? questionFor(chain.steps[0])?.problemId : undefined;
  /** Individual working on the live set (ticket 315): the tab splits into Where students are and Where students went wrong. */
  const split = assignment.kind === "live" && (stage?.id === "working" || review || groupStage);
  /**
   * The rows stay on screen while the cards scroll (ticket 346), on the three stages that have them: individual working,
   * individual review and group review. Class review (tickets 320, 344) is named out rather than left to `split`, so its
   * own rows keep the plain split until they are settled.
   */
  const stickyLeft = assignment.kind === "live" && (stage?.id === "working" || review || groupStage);
  const working = useWhereRows(assignment, session, now);
  const inReview = review ? reviewRows(students, assignment.problems, assignment.classmates, now) : [];
  const places = review ? inReview : working;
  const flyout = useOpenFlyout();
  const flyoutProblem = split ? problems.find((p) => p.problem.id === flyout) : undefined;
  /** The student whose work panel is open over the rows (ticket 316): their pill, for the place it stands for. */
  const openStudent = useOpenStudent();
  const studentPill = split && !focused && openStudent ? places.flatMap((r) => r.pills).find((p) => p.id === openStudent) : undefined;
  const pressPill = (id: string) => setStudentOpen(openStudent === id ? null : id);
  const list = (
    <div ref={listRef} className={`${split ? "" : "mt-10"} space-y-6`} data-problem-list>
      {problems.map(({ problem, rows, right, wrong, pending }) => {
        const isOpen = open.includes(problem.id);
        const othersOpen = open.some((id) => id !== problem.id);
        /** Neither correct, wrong nor still working on the set: stopped before the problem, or handed it in without an answer (tickets 143, 189). */
        const skipped = size - right - wrong - pending;
        // Individual review (ticket 318): a problem everyone has fixed stays in its place as one thin line.
        const counted = countsOf.get(problem.id);
        // Group review (ticket 319): a problem every group that had it has solved stays in its place as one thin line.
        const thin = review ? rows.length === 0 : groupStage && !!counted && everyGroupSolved(counted);
        if (thin)
          return (
            <div key={problem.id} className="flex items-center gap-3 rounded-xl border border-line px-6 py-2" data-problem-row={problem.id} data-problem-fixed={problem.id}>
              <span className="font-display text-[20px] leading-none text-ink-soft">{problem.label}</span>
              <span className="text-[14px] text-ink-muted">{review ? "everyone fixed" : counted!.groups.length > 0 ? "every group solved" : "fixed in individual review"}</span>
            </div>
          );
        /** Groups still to go on the problem with nobody's wrong line left on the card: their members left it unfinished or never reached it. */
        const unwritten = groupStage ? notSolvedOf(problem.id).filter((colour) => !rows.some((r) => groupOf.get(r.id) === colour)) : [];
        const groups = groupBySlip(rows);
        // One grid column per identical working (ticket 138); boxes and pills span columns.
        const columns = groups.flatMap((g) => g.columns);
        const boxes = groups.flatMap((g) => g.mistakes);
        const boxOf = (i: number) => boxes.find((m) => i >= m.start && i < m.start + m.columns.length)!;
        const ids = (c: WorkColumn) => c.rows.map((r) => r.id).join(",");
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
        const counts = (
          <>
            <span className={COUNT} title={`${right} of ${size} got it correct · ${wrong} wrong · ${skipped} skipped${pending ? ` · ${pending} still working` : ""}`} data-right={`${problem.id}:${right}`}>
              <span className="font-semibold text-ink">
                {right}/{size}
              </span>
              <span className="text-ink-muted">correct</span>
            </span>
            <span className={COUNT} title="Stopped before this problem, or handed it in without an answer; a student still working on the set is not counted" data-skipped={`${problem.id}:${skipped}`}>
              <span className="font-semibold text-ink">
                {skipped}/{size}
              </span>
              <span className="text-ink-muted">skipped</span>
            </span>
          </>
        );
        const fixed = fixedOf.get(problem.id) ?? 0;
        const reviewCounts = (
          <span className="text-[14px] whitespace-nowrap text-ink-muted tabular-nums" data-review-counts={`${problem.id}:${fixed}:${rows.length}`}>
            <span className="font-semibold text-ink">{fixed}</span> fixed · <span className="font-semibold text-ink">{rows.length}</span> still to fix
          </span>
        );
        const groupWords = counted ? countParts(counted) : [];
        const groupHeaderCounts = (
          <span className="text-[14px] whitespace-nowrap text-ink-muted tabular-nums" data-group-counts={`${problem.id}:${groupWords.map((w) => `${w.n} ${w.words}`).join(" · ")}`}>
            {groupWords.map((w, i) => (
              <span key={w.words}>
                {i > 0 && " · "}
                <span className="font-semibold text-ink">{w.n}</span> {w.words}
              </span>
            ))}
          </span>
        );
        return (
          <div key={problem.id} className="flex items-start gap-4" data-problem-row={problem.id}>
          {/* Escape closes the problem opened last first (ticket 247), without arming "close all" the way a press of close does. */}
          <EscapeLayer active={isOpen && !focused} onEscape={() => setOpen((o) => o.filter((x) => x !== problem.id))} />
          {/* The correct count level with the header row (the card's 1 px border, then the header), the skipped count 6 px under it; the two the same width. On the split the counts sit inside the card's header instead (ticket 315). */}
          {!split && (
            <div className="flex shrink-0 flex-col items-stretch gap-1.5" style={{ width: COUNT_COLUMN, paddingTop: (PROBLEM_HEADER + 2 - COUNT_H) / 2 }}>
              {counts}
            </div>
          )}
          <Card
            className={`group/q min-w-0 flex-1 overflow-hidden ${split && flyout === problem.id ? "ring-2 ring-accent" : ""}`}
            data-problem={problem.id}
            data-open={isOpen || undefined}
            onMouseLeave={() => armed === problem.id && setArmed(null)}
          >
            <div className="flex items-center gap-4 border-b border-line px-6 py-4" onClick={() => toggle(problem.id)} data-problem-header={problem.id}>
              <div className={`flex min-w-0 items-center gap-4 ${split ? "flex-1" : ""}`}>
                {/* On the split the live diagnostic is the card's own, at its top left (ticket 315). */}
                {split && !review && !groupStage && <DiagnosticChip problemId={problem.id} />}
                <span className="shrink-0 font-display text-[24px] text-ink">{problem.label}</span>
                <p className="min-w-0 text-[17px] leading-snug text-ink" data-problem-question={problem.id}>
                  <ProblemQuestion problem={problem} mathClass="math-lg" />
                </p>
                {/* At half width the question takes the tag's room (ticket 315, as the agreed mockup has it). */}
                {!split && <DifficultyTag d={problem.difficulty} />}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // A mouse click leaves focus on the button, which would keep it visible after the pointer leaves; keyboard activation (detail 0) keeps it.
                    if (e.detail) e.currentTarget.blur();
                    act();
                  }}
                  className={`${action.cls} ${split ? "ml-auto shrink-0" : ""} ${action.visible ? "" : "invisible group-hover/q:visible group-has-[:focus-visible]/q:visible"}`}
                  aria-expanded={isOpen}
                  data-problem-action={problem.id}
                >
                  {action.word}
                </button>
              </div>
              {split && !review && !groupStage && (
                <div className="flex shrink-0 flex-col items-stretch gap-1.5" style={{ width: COUNT_COLUMN }} data-header-counts>
                  {counts}
                </div>
              )}
              {review && (
                <div className="shrink-0" data-header-counts>
                  {reviewCounts}
                </div>
              )}
              {groupStage && (
                <div className="shrink-0" data-header-counts>
                  {groupHeaderCounts}
                </div>
              )}
            </div>
            {columns.length > 0 && (
            <div className="overflow-x-auto">
              <FitGrid className="grid" columns={columns.length} data-students>
                {boxes.map((m) => (
                  // Over its names, what every student in the group wrote wrong (ticket 245): one label across the group's columns, both lines stacked when they got two wrong. A press opens the problem, like a name.
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => toggle(problem.id)}
                    aria-expanded={isOpen}
                    className={`@container row-start-1 flex min-w-0 flex-col justify-start px-5 pt-4 text-left transition-colors hover:bg-cream-deep/40 ${column(m.start)} ${isOpen ? "bg-accent-soft/30" : ""}`}
                    style={{ gridColumn: `${m.start + 1} / span ${m.columns.length}` }}
                    data-label={`${problem.id}:${m.rows.map((r) => r.id).join(",")}`}
                  >
                    <div className={`${LABEL} flex flex-col gap-1.5`} data-label-box data-start={m.start} data-span={m.columns.length}>
                      {m.wrongLines.map((tex) => (
                        <div key={tex} data-label-line>
                          <M tex={tex} />
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
                {columns.map((c, i) => (
                  // Every student who wrote this column's working, their names flowing across the column and wrapping as it narrows; the first name in every column on one line.
                  // Keyed on the column's first student, who stays first as others join it (ticket 189), so a name mid-glow is never re-created.
                  <button
                    key={c.rows[0].id}
                    type="button"
                    onClick={() => toggle(problem.id)}
                    aria-expanded={isOpen}
                    className={`row-start-2 flex min-w-0 flex-wrap content-start items-center gap-x-5 gap-y-2 px-5 pt-3 pb-3.5 text-left transition-colors hover:bg-cream-deep/40 ${column(i)} ${isOpen ? "bg-accent-soft/30" : ""}`}
                    style={{ gridColumn: i + 1 }}
                    data-column={`${problem.id}:${ids(c)}`}
                  >
                    {groupStage
                      ? // Group review (ticket 319): the column's groups, once each in seating order, never its students' names.
                        grid
                          .filter((g) => c.rows.some((r) => groupOf.get(r.id) === g.colour))
                          .map((g) => (
                            <span key={g.colour} className="flex" data-row={`${problem.id}:${g.colour}`}>
                              <GroupChip colour={g.colour} />
                            </span>
                          ))
                      : c.rows.map((r) => (
                          <ArrivingName key={r.id} arrivedAt={r.arrivedAt} now={now} className="flex max-w-full items-center gap-3 whitespace-nowrap" data-row={`${problem.id}:${r.id}`}>
                            <Avatar initials={r.initials} />
                            <span className="truncate font-medium text-ink">{r.name}</span>
                          </ArrivingName>
                        ))}
                  </button>
                ))}
                {groups.map((g) => (
                  <div
                    key={g.misconceptions.join("|")}
                    className={`row-start-3 flex min-w-0 flex-wrap items-start gap-1.5 pr-5 pb-4 pl-5 ${column(g.start)} ${isOpen ? "bg-accent-soft/30" : ""}`}
                    style={{ gridColumn: `${g.start + 1} / span ${g.columns.length}` }}
                    data-slip-group={g.rows.map((r) => r.id).join(",")}
                    data-start={g.start}
                    data-span={g.columns.length}
                  >
                    {/* Two misconceptions in one narrow column wrap chip by chip, never a word inside a chip (tickets 213, 299). */}
                    {g.misconceptions.map((id) => (
                      <SlipChip key={id} id={id} className="min-w-0 max-w-full flex-[1_1_auto] justify-start whitespace-nowrap" />
                    ))}
                  </div>
                ))}
                {/* The working row's ground: the divider under the pills and the cream behind the boxes, across every column. */}
                {isOpen && <div className="row-start-4 border-t border-line bg-cream/60" style={{ gridColumn: "1 / -1" }} aria-hidden />}
                {isOpen &&
                  columns.map((c, i) => {
                    // One box per exact mistake: every cell in it carries the top and bottom edge; the first the left edge and corners, the last the right; between cells a plain divider.
                    const box = boxOf(i);
                    const first = i === box.start;
                    const last = i === box.start + box.columns.length - 1;
                    const edges = `${first ? "ml-2.5 rounded-l-xl border-l border-wrong-deep" : "border-l border-line"} ${last ? "mr-2.5 rounded-r-xl border-r border-wrong-deep" : ""}`;
                    // The grid cell is the container (its width is the column's, the same for every cell); the box edges sit on the div inside it.
                    return (
                      <div
                        key={c.rows[0].id}
                        className="@container row-start-4 min-w-0 py-4"
                        style={{ gridColumn: i + 1 }}
                        data-expanded={`${problem.id}:${ids(c)}`}
                        data-mistake-group={box.rows.map((x) => x.id).join(",")}
                        data-box-start={first || undefined}
                        data-box-end={last || undefined}
                      >
                        <div className={`h-full border-y border-wrong-deep px-2.5 py-3 @max-[260px]:px-2 ${edges}`}>
                          <ol className="space-y-2">
                            {c.lines.map((l, j) => {
                              const wrong = l.verdict.verdict === "wrong";
                              return (
                                <li
                                  key={j}
                                  className={`${LINE} ${wrong ? "border-wrong-line bg-wrong-soft" : "border-line bg-paper"}`}
                                  data-line
                                  data-wrong={wrong || undefined}
                                >
                                  <M tex={l.tex} />
                                </li>
                              );
                            })}
                          </ol>
                          {c.live && (
                            <div className="mt-3 flex items-center justify-between text-[12.5px] whitespace-nowrap text-ink-muted @max-[260px]:flex-col @max-[260px]:items-start @max-[260px]:gap-0.5 @max-[260px]:text-[11px]">
                              <span>As handed in</span>
                              <Link href="/teacher/compare" className="text-accent-deep hover:underline" data-compare-link>
                                Original vs final →
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </FitGrid>
            </div>
            )}
            {unwritten.length > 0 && (
              <div className={`flex flex-wrap items-center gap-2 px-5 py-3 ${columns.length > 0 ? "border-t border-line" : ""}`} data-unwritten={`${problem.id}:${unwritten.join(",")}`}>
                {unwritten.map((colour) => (
                  <GroupChip key={colour} colour={colour} />
                ))}
                <span className="text-[13px] text-ink-muted">unfinished or not attempted</span>
              </div>
            )}
          </Card>
          {/* The extra margin keeps the open flyout (laid 25 px left of the chip) clear of the card. A finished set has no live class to push to (ticket 187). */}
          {assignment.kind === "live" && !split && <DiagnosticPush problemId={problem.id} rows={rows} className="ml-5 shrink-0" />}
          </div>
        );
      })}
      {problems.length === 0 && (assignment.kind !== "live" || now > 0) && <Card className="p-6 text-[14px] text-ink-muted">No slips yet</Card>}
    </div>
  );

  return (
    <TeacherChrome>
      {/* The pathway strip on the back button's line (ticket 334), where Class View has it; the eyebrow's line and the title row no longer carry a stage pill. */}
      <BackLine session={session} />
      <div className="mt-3" data-eyebrow-row>
        <Eyebrow>
          {assignment.className} · {assignment.title}
        </Eyebrow>
      </div>
      {chain && (
        <DiagnosticFocus
          run={chain}
          problem={assignment.problems.find((p) => p.id === chainProblemId)}
          rows={latest.find((p) => p.problem.id === chainProblemId)?.rows ?? []}
          className="mt-3"
        />
      )}
      <div hidden={focused} data-mistakes-page>
      {/* The title row mirrors a problem row (ticket 195), its diagnostic column held by the chip's unseen footprint; its stage pill and force submit moved to the pathway strip (ticket 334). */}
      {!split && (
      <div className="mt-3 flex items-center gap-4">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-10">
          <H1>Where students went wrong</H1>
        </div>
        {assignment.kind === "live" && <DiagnosticFootprint className="ml-5 shrink-0" />}
      </div>
      )}

      {split ? (
        <StageSplit
          className="mt-4"
          stickyLeft={stickyLeft}
          leftTitle={groupStage ? "Where groups are" : "Where students are"}
          left={
            groupStage ? (
              <GroupGrid columns={grid} problems={assignment.problems} classmates={assignment.classmates} />
            ) : review ? (
              <ReviewTable rows={inReview} now={now} onPress={pressPill} open={studentPill?.id ?? null} />
            ) : (
              <PlaceTable rows={working} now={now} onPress={pressPill} open={studentPill?.id ?? null} />
            )
          }
          rightTitle={groupStage ? "Where groups went wrong" : "Where students went wrong"}
          right={list}
          overlay={
            flyoutProblem ? (
              <DiagnosticOverlay key={flyoutProblem.problem.id} problem={flyoutProblem.problem} rows={flyoutProblem.rows} />
            ) : (
              studentPill && (
                <StudentWorkPanel
                  key={studentPill.id}
                  pill={studentPill}
                  work={review ? reviewWorkAt(assignment, session, students.find((s) => s.id === studentPill.id)!) : studentWorkAt(assignment, session, now, studentPill.id, studentPill.place)}
                />
              )
            )
          }
        />
      ) : (
        list
      )}
      </div>
    </TeacherChrome>
  );
}
