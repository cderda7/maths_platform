"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import TeacherChrome from "../TeacherChrome";
import { BackButton } from "../AssignmentContext";
import { CellDrill, SkillWork } from "./HolisticDrill";
import FitHeight from "@/components/FitHeight";
import { CategoryChip, StatusDot } from "@/components/Tag";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { useEscape } from "@/components/useEscape";
import { ASSIGNMENT } from "@/data/assignment";
import type { StoryCategory } from "@/data/story";
import { categoryName, type LeafId } from "@/data/taxonomy";
import type { Status } from "@/data/types";
import { assignmentHref, assignmentReportHref, HOLISTIC_HREF, holisticHref } from "@/lib/assignments";
import { useClassroom } from "@/lib/classroom-store";
import { holisticView, holisticWork, type PatternRef, type HolisticNow, type HolisticSet, type HolisticStatus, type HolisticView } from "@/lib/holistic";
import { useBatchedSession, useNow } from "@/lib/store";

/**
 * A student across every set (ticket 251): the story sheet's line for them, the set × category grid (sets down since
 * ticket 269, newest first since ticket 277), and the patterns behind every result short of secure under their category
 * (only recent ones and no header over them since ticket 276), each naming its set and problems and opening that working on the set's report. A set's row head opens the student's
 * report on that set.
 *
 * Ticket 277: the patterns run down a side column beside the header and grid, as tall as the screen and zoomed to fit it,
 * so a laptop sees every line without scrolling. A coloured cell opens its category's whole tree on that set as a
 * flyout (`HolisticDrill.tsx`); a skill picked there puts its problems in the side column in the patterns' place. A press
 * outside the flyout and the problems, or Escape (the problems first), closes them.
 *
 * One page, two routes: `/teacher/students/<id>` (Back to Holistic Assessment's tiles, ticket 252) and
 * `/teacher/a/<set>/students/<id>` (`set`: Back to that set's Class View, under its tabs). Only Back differs.
 * The live set is read as its Class View reads it (`lib/holistic.ts`): the classroom, Sam's session in its 3 s
 * batches and the clock; until those have arrived the grid and patterns wait, so the live row never flashes in.
 */
export default function HolisticPage({ student, set }: { student: string; set?: string }) {
  const classroom = useClassroom();
  const { session, updatedAt } = useBatchedSession(3000);
  const now = useNow();
  const ready = updatedAt !== null && now > 0;
  const at: HolisticNow = { classroom, session, now };
  const view = holisticView(student, at);
  if (!view) return <TeacherChrome>{null}</TeacherChrome>;
  const here = holisticHref(student, set);
  return (
    <TeacherChrome>
      <div data-holistic={student} data-holistic-ready={ready || undefined}>
        {set ? (
          <BackButton href={assignmentHref(set, "class")} data-holistic-back={assignmentHref(set, "class")}>
            Class View
          </BackButton>
        ) : (
          <BackButton href={HOLISTIC_HREF} data-holistic-back={HOLISTIC_HREF}>
            Holistic Assessment
          </BackButton>
        )}
        {ready ? (
          <Body key={student} view={view} at={at} from={here} />
        ) : (
          <div className="mt-3 min-w-0" style={{ marginRight: SIDE_COL + SIDE_GAP }}>
            <Header view={view} />
          </div>
        )}
      </div>
    </TeacherChrome>
  );
}

/** The side column's width and its gap from the grid, layout px: a pattern's words and two sets of refs on one row. */
const SIDE_COL = 500;
const SIDE_GAP = 40;
/** The scroll region's bottom padding (`TeacherChrome`'s py-12), which the side column stops above. */
const PAGE_BOTTOM = 48;

type Open = { set: string; category: StoryCategory };

function Body({ view, at, from }: { view: HolisticView; at: HolisticNow; from: string }) {
  const [open, setOpen] = useState<Open | null>(null);
  const [picked, setPicked] = useState<LeafId | null>(null);
  const sideRef = useRef<HTMLElement>(null);
  const openSet = open ? view.sets.find((s) => s.id === open.set) : undefined;
  const work = open && openSet ? holisticWork(view.student.id, open.set, at) : null;
  const shown = open && openSet && work ? { ...open, set: openSet, work } : null;

  const close = () => {
    setOpen(null);
    setPicked(null);
  };
  useEscape(shown !== null, close);
  useEscape(shown !== null && picked !== null, () => setPicked(null));

  // A press anywhere but the flyout, the problems or another cell closes both (a cell's own press toggles or moves them).
  const isShown = shown !== null;
  useEffect(() => {
    if (!isShown) return;
    const onDown = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest("[data-holistic-drill], [data-holistic-work], [data-cell-pill]")) return;
      setOpen(null);
      setPicked(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [isShown]);

  useFillHeight(sideRef);

  const toggle = (setId: string, category: StoryCategory) => {
    setPicked(null);
    setOpen((o) => (o && o.set === setId && o.category === category ? null : { set: setId, category }));
  };

  return (
    <div className="mt-3 flex items-start" style={{ gap: SIDE_GAP }}>
      <div className="min-w-0 flex-1" data-holistic-main>
        <Header view={view} />
        <Grid view={view} from={from} open={open} onCell={toggle}>
          {(wrapRef) => shown && <CellDrill work={shown.work} set={shown.set} category={shown.category} picked={picked} onPick={(l) => setPicked((p) => (p === l ? null : l))} wrapRef={wrapRef} />}
        </Grid>
      </div>
      <aside ref={sideRef} className="flex shrink-0 flex-col" style={{ width: SIDE_COL }} data-holistic-side={shown && picked ? "work" : "patterns"}>
        {shown && picked ? <SkillWork work={shown.work} set={shown.set} category={shown.category} leaf={picked} onClose={() => setPicked(null)} /> : <Patterns view={view} from={from} />}
      </aside>
    </div>
  );
}

/**
 * Sizes the side column to run from where it starts to the bottom of the scroll region (less the page's bottom
 * padding), whatever the window: its content is fitted to that height, and the page never scrolls for it.
 */
function useFillHeight(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current;
    const scroller = el?.closest<HTMLElement>("[data-teacher-scroll]");
    if (!el || !scroller) return;
    const fill = () => {
      const s = scroller.getBoundingClientRect();
      const z = s.height / scroller.clientHeight || 1;
      const top = (el.getBoundingClientRect().top - s.top) / z + scroller.scrollTop;
      el.style.height = `${Math.max(320, scroller.clientHeight - top - PAGE_BOTTOM)}px`;
    };
    fill();
    const ro = new ResizeObserver(fill);
    ro.observe(scroller);
    return () => ro.disconnect();
  }, [ref]);
}

function Header({ view }: { view: HolisticView }) {
  return (
    <>
      <Eyebrow>{ASSIGNMENT.className} · Holistic Assessment</Eyebrow>
      <div className="mt-3 flex items-center gap-4">
        <Avatar initials={view.student.initials} size="h-14 w-14 text-[17px]" />
        <H1>{view.student.name}</H1>
      </div>
      <p className="mt-4 text-[19px] leading-relaxed text-ink-soft" data-holistic-summary>
        {view.summary}
      </p>
    </>
  );
}

/** The set column's width, layout px: "PS6 Thu 10 Sep" on one line and the longest topic in two. */
const SET_COL = 256;
/** An empty last column, layout px: the last result's 8 px pad plus this matches "PS6"'s 24 px from the card's left edge (ticket 283). */
const GUTTER = 16;

/**
 * Sets down, newest first (ticket 277; oldest first in ticket 269), categories across. Each category heads its column
 * with the Class View's chip, centred over its cells; every cell pads 8 px a side, so every result is one width. A
 * set's head pads 18 px left and its link 6 inside, so "PS6" starts where "SET" does, 24 px in; an empty `GUTTER`
 * column ends the last result 24 px from the right edge too (ticket 283). The grid sits in a positioned box
 * the cell flyout lays over (the card clips its corners, so the flyout cannot live inside it).
 */
function Grid({ view, from, open, onCell, children }: { view: HolisticView; from: string; open: Open | null; onCell: (set: string, category: StoryCategory) => void; children: (wrapRef: RefObject<HTMLDivElement | null>) => React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rows = view.sets.map((set, j) => ({ set, j })).reverse();
  return (
    <div ref={wrapRef} className="relative mt-7">
      <Card className="overflow-clip" data-holistic-grid>
        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col style={{ width: SET_COL }} />
            {view.categories.map((c) => (
              <col key={c.category} />
            ))}
            <col style={{ width: GUTTER }} />
          </colgroup>
          <thead>
            <tr className="border-b border-line">
              <th className="px-6 py-3.5 align-middle">
                <Eyebrow>Set</Eyebrow>
              </th>
              {view.categories.map((c) => (
                <th key={c.category} className="px-1 py-3.5 text-center align-middle" data-category-head={c.category}>
                  {/* A flex box, so the chip centres on the row as a block does, level with "SET", not on a text baseline. */}
                  <div className="flex justify-center">
                    <CategoryChip>{categoryName(c.category).short}</CategoryChip>
                  </div>
                </th>
              ))}
              <th aria-hidden data-grid-gutter />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ set, j }) => (
              <tr key={set.id} className="border-b border-line last:border-b-0" data-holistic-row={set.id}>
                <th scope="row" className="py-1 pr-3 pl-4.5 align-middle font-normal">
                  <SetHead set={set} href={assignmentReportHref(set.id, view.student.id, { from })} />
                </th>
                {view.categories.map((c) => (
                  <td key={c.category} className="px-2 py-2" data-cell={`${c.category}:${set.id}`} data-cell-status={c.cells[j]}>
                    <Cell status={c.cells[j]} set={set} category={c.category} open={open?.set === set.id && open.category === c.category} onOpen={() => onCell(set.id, c.category)} />
                  </td>
                ))}
                <td aria-hidden data-grid-gutter />
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {children(wrapRef)}
    </div>
  );
}

/** A set's head: its label and day, its topic in two lines (held at two, so every row is one height; no live pill since ticket 276); the whole head opens the student's report on the set. */
function SetHead({ set, href }: { set: HolisticSet; href: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-xl px-1.5 py-2 transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent"
      aria-label={`${set.label}, ${set.topic}: open the report on this set`}
      data-set-head={set.id}
    >
      <span className="flex items-baseline gap-2 whitespace-nowrap">
        <span className="font-display text-[23px] leading-none text-accent-deep">{set.label}</span>
        <span className="text-[13.5px] text-ink-muted">{set.due}</span>
      </span>
      <span className="mt-1 line-clamp-2 min-h-[2lh] text-[13.5px] leading-snug text-ink-soft group-hover:text-ink">{set.topic}</span>
    </Link>
  );
}

const CELL_WORD: Record<HolisticStatus, string> = { secure: "secure", solid: "solid", developing: "developing", gap: "gap", unseen: "not seen", absent: "absent", none: "—" };
const CELL_TONE: Record<HolisticStatus, string> = {
  secure: "bg-secure text-white",
  solid: "bg-solid text-white",
  developing: "bg-developing text-white",
  gap: "bg-gap text-white",
  unseen: "border border-line-strong text-ink-muted",
  absent: "bg-cream-deep text-ink-muted",
  none: "text-ink-muted",
};
const OPENS: readonly HolisticStatus[] = ["secure", "solid", "developing", "gap"];

/**
 * A result as a word on its colour; not seen hollow; absent (ticket 250) grey on the cream the Class View greys a row
 * to; "—" bare where the set does not assess the category. A coloured result is a button that opens the skills behind
 * it (ticket 277), ringed in ink while they are open.
 */
function Cell({ status, set, category, open, onOpen }: { status: HolisticStatus; set: HolisticSet; category: StoryCategory; open: boolean; onOpen: () => void }) {
  const face = `grid h-9 w-full place-items-center rounded-lg text-[15px] font-semibold ${CELL_TONE[status]}`;
  if (!OPENS.includes(status)) return <span className={face}>{CELL_WORD[status]}</span>;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={open}
      aria-label={`${categoryName(category).name} on ${set.label}: ${CELL_WORD[status]}. Show the skills behind it`}
      className={`${face} cursor-pointer transition-[filter,box-shadow] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${open ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : ""}`}
      data-cell-pill
      data-open={open || undefined}
    >
      {CELL_WORD[status]}
    </button>
  );
}

/** A pattern's refs column, layout px: "PS4 · Q1, Q2, Q4" on a line, a second set wrapping under. */
const REFS_COL = 176;

/** The patterns down the side column, zoomed down to its height when there are more than fit (never scrolled); no header over them (ticket 276), the category names head them. */
function Patterns({ view, from }: { view: HolisticView; from: string }) {
  return (
    <section className="flex h-full min-h-0 flex-col" aria-label="Patterns" data-holistic-patterns>
      {view.patterns.length === 0 ? (
        <p className="text-[17px] text-ink-muted" data-no-patterns>
          No patterns to note
        </p>
      ) : (
        <FitHeight className="flex-1" fitKey={view.patterns.map((g) => g.patterns.length).join(",")} data-patterns-fit>
          {view.patterns.map((g) => (
            <div key={g.category} className="mb-5 last:mb-0" data-pattern-group={g.category}>
              <h2 className="font-display text-[22px] leading-tight text-ink">{g.name}</h2>
              <ul className="mt-1">
                {g.patterns.map((h) => (
                  <li key={h.text} className="flex items-baseline gap-4 border-b border-line py-2 last:border-b-0" data-pattern={h.text} data-pattern-tag={h.tag}>
                    <span className="min-w-0 flex-1 text-[16px] leading-snug text-ink">{h.text}</span>
                    {/* The refs in a column of their own, so every row's first set starts on one line down the list. */}
                    <span className="flex shrink-0 flex-col gap-y-1" style={{ width: REFS_COL }}>
                      {h.refs.map((ref) => (
                        <Ref key={ref.set} student={view.student.id} ref_={ref} from={from} />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </FitHeight>
      )}
    </section>
  );
}

/** "● PS4 · Q1, Q2": the set's result there, the set, and each problem opening the student's working on it. */
function Ref({ student, ref_, from }: { student: string; ref_: PatternRef; from: string }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-[14.5px] leading-snug text-ink-soft" data-pattern-ref={ref_.set} data-ref-status={ref_.status}>
      <StatusDot status={ref_.status as Status} shape="pill" />
      <span>
        {ref_.label} ·{" "}
        {ref_.problems.map((p, i) => (
          <span key={p.id}>
            {i > 0 && ", "}
            <Link href={assignmentReportHref(ref_.set, student, { work: p.id, from })} className="font-medium text-accent-deep hover:underline" data-work-link={p.id}>
              {p.label}
            </Link>
          </span>
        ))}
      </span>
    </span>
  );
}
