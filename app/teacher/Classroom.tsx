"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import TeacherChrome from "./TeacherChrome";
import { Eyebrow, H1 } from "@/components/ui";
import { CategoryChip } from "@/components/Tag";
import { ASSIGNMENT } from "@/data/assignment";
import { forgetTilesScroll } from "./students/tilesScroll";
import { HOLISTIC_HREF } from "@/lib/assignments";
import { CLASS_SUBJECT, classroomCards, gapGroups, teacherHomeworkColumn, type AssignmentCard, type TeacherHomeworkPiece } from "@/lib/classroomCards";
import { CREATE_ROUTES } from "@/lib/createPipeline";
import { flasher, HW_INSIGHT_MESSAGE } from "@/lib/hwInsight";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { CLASS_SIZE } from "@/lib/readiness";
import { useBatchedSession, useNow } from "@/lib/store";


/**
 * Edexia Classroom (ticket 186), the teacher's home: every assignment the class has, as cards, the
 * live ones (the class still working, or in review, ticket 234) above the past ones (done), each
 * newest due first, and Holistic Assessment (ticket 252), "+In-Class PSet" and "+Homework" (ticket 291) on the title row. The heading and the Live section are
 * pinned; only Past scrolls (ticket 216). A card is one link to the assignment's
 * landing (ticket 185: Class or Mistakes). The cards are `lib/classroomCards` over the classroom,
 * Sam's session in its 3 s batches and the clock, the inputs the assignment's own tabs read, so the
 * live card's counts move with the class. One class (ASSUMPTIONS.md, ONE CLASS).
 * Homework sits in a column to the right of Past (ticket 305, replacing ticket 291's homework cards): each homework's cell
 * spans the rows of the Past sets it covers and reads the class's count; a press shows the demo's "HW insight scoped in
 * FUTURE_FEATURES" placeholder over the cell for a moment (ticket 324) and opens nothing. Every section's cards sit in
 * the grid's first column, so Live and Past cards are one width.
 *
 * The page takes the chrome's full container, as the header and Class View do: "+In-Class PSet"
 * ends where the header's avatar ends, and the cards span the same width.
 */
export default function Classroom() {
  const classroom = useClassroom();
  const { session, updatedAt } = useBatchedSession(3000);
  const now = useNow();
  // Sam's session and the clock arrive a microtask after mount; until then the counts would be the empty class's.
  const ready = updatedAt !== null && now > 0;
  const { live, past } = classroomCards(classroom, session, now);
  const hasLive = ready && live.length > 0;
  const rootRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  // The pinned region's height, as a CSS variable the past cards' scroll margin reads: a card the
  // keyboard focuses (or a find-in-page match) scrolls clear of the region instead of under it.
  useEffect(() => {
    const root = rootRef.current;
    const pinned = pinnedRef.current;
    if (!root || !pinned) return;
    const sync = () => root.style.setProperty("--classroom-pinned", `${pinned.offsetHeight}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(pinned);
    return () => ro.disconnect();
  }, []);
  return (
    <TeacherChrome>
      <div ref={rootRef} data-classroom>
        {/*
          Pinned (ticket 216): the heading and the Live section stick to the top of the chrome's
          scroll region, where they sit at scroll 0; only Past scrolls, passing under the region's
          bottom edge. The region pulls itself up over the chrome's top padding (-mt-12 undoing
          py-12, pt-12 putting it back) so it sticks at top 0 and its cream ground covers the strip
          above the eyebrow too, and out over the side padding the same way (-mx-6 px-6) so a
          passing card's shadow never shows beside the region; its bottom padding is the gap Past
          used to open with, so nothing moves at scroll 0. Sticky, not an inner scroll box: the one scroll region keeps its wheel,
          trackpad, keyboard and scrollbar over the whole page (DECISION_LOG, ticket 216).
        */}
        <div ref={pinnedRef} className={`sticky top-0 z-10 -mx-6 -mt-12 bg-cream px-6 pt-12 ${hasLive ? "pb-10" : "pb-12"}`} data-classroom-pinned>
          <div data-classroom-eyebrow>
            <Eyebrow>
              {ASSIGNMENT.classCode} · {CLASS_SUBJECT} · {CLASS_SIZE} students
            </Eyebrow>
          </div>
          <div className="mt-3 flex items-center justify-between gap-6">
            <H1>Edexia Classroom</H1>
            {/* Holistic Assessment (ticket 252) beside "+In-Class PSet", one height with it, so the title row and the Live cards stay where they were. */}
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={HOLISTIC_HREF}
                onClick={forgetTilesScroll}
                className="inline-flex shrink-0 items-center rounded-full border border-line-strong bg-paper px-5 py-[9px] text-[15px] font-medium text-ink shadow-card transition-colors hover:border-accent-line hover:bg-accent-soft focus-visible:ring-4 focus-visible:ring-accent/30 focus-visible:outline-none"
                data-holistic-entry
              >
                Holistic Assessment
              </Link>
              <CreateButton href={CREATE_ROUTES.pset.questions} label="In-Class PSet" data-new-assignment />
              {/* The first press marks that the teacher started creating homework: the presenter's homework jumps show from then on (ticket 295). */}
              <CreateButton href={CREATE_ROUTES.homework.questions} label="Homework" onClick={() => dispatchClassroom({ type: "homework/start", at: Date.now() })} data-new-homework />
            </div>
          </div>

          {/* Before Create nothing is live: no Live section at all, Past opens where it would sit (ticket 216). */}
          {hasLive && (
            <Section label="Live" id="live" className="mt-12">
              {live.map((card, i) => (
                <Card key={card.id} card={card} row={i + 1} />
              ))}
            </Section>
          )}
        </div>

        {ready && past.length > 0 && (
          <Section label="Past" id="past" column={<HomeworkColumn pieces={teacherHomeworkColumn(past, classroom)} />}>
            {past.map((card, i) => (
              <Card key={card.id} card={card} row={i + 1} />
            ))}
          </Section>
        )}
      </div>
    </TeacherChrome>
  );
}

/** A create button on the title row: "+In-Class PSet" (ticket 288) and "+Homework" (ticket 291), one look. */
function CreateButton({ href, label, onClick, ...data }: { href: string; label: string; onClick?: () => void } & Record<`data-${string}`, boolean>) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink py-2.5 pr-5 pl-4 text-[15px] font-medium text-white shadow-card transition-colors hover:bg-ink-soft focus-visible:ring-4 focus-visible:ring-accent/30 focus-visible:outline-none"
      {...data}
    >
      <span aria-hidden className="grid h-5 w-5 place-items-center text-[20px] leading-none font-normal">
        +
      </span>
      {label}
    </Link>
  );
}

/**
 * A section of cards: a two-column grid, the cards in the first column and the homework column's width kept in the second
 * (ticket 305), filled beside Past only, so every card on the page is one width and its arrow and due date line up.
 */
function Section({ label, id, className = "", column, children }: { label: string; id: "live" | "past"; className?: string; column?: ReactNode; children: ReactNode }) {
  return (
    <section className={className} aria-label={label} data-section={id}>
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_214px] gap-x-4 gap-y-3" data-card-grid>
        <ul className="contents">{children}</ul>
        {column}
      </div>
    </section>
  );
}

const Dot = () => (
  <span aria-hidden className="row-start-2 self-center text-ink-muted/60">
    ·
  </span>
);

/** One assignment: the whole card is the link, its title and status on the left, the due date and an arrow on the right. */
function Card({ card, row }: { card: AssignmentCard; /** Its row in the section's grid, first column. */ row: number }) {
  return (
    <li className="col-start-1 min-w-0" style={{ gridRow: row }}>
      <Link
        href={card.href}
        className="group flex scroll-mt-(--classroom-pinned) items-center gap-8 rounded-2xl set-card-edge bg-paper px-9 py-7 shadow-card outline-set-border transition-[outline-color,box-shadow] duration-150 hover:shadow-lift hover:outline-accent-line focus-visible:ring-4 focus-visible:ring-accent/20 focus-visible:outline-accent"
        data-assignment-card={card.id}
        data-status={card.status}
      >
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[31px] leading-tight text-ink" data-card-title>
            {card.name}
          </h3>
          {/*
            The status line is a grid (ticket 323): its 28 px row carries the words and pills, the 22 px row above carries the top
            gaps' skill tags over their pills. The tag row is kept when no tag shows, so a live card is one height before and after
            its first mistake and every card is one height.
          */}
          <p className="mt-2.5 grid grid-rows-[22px_28px] justify-start gap-x-3 gap-y-1.5 text-[17px] leading-7 whitespace-nowrap text-ink-soft" data-status-line>
            {card.status === "live" ? <LiveLine card={card} /> : <PastLine card={card} />}
          </p>
        </div>
        <span className="shrink-0 text-[16px] whitespace-nowrap text-ink-muted" data-due>
          due {card.due}
        </span>
        <span aria-hidden className="shrink-0 text-[26px] leading-none text-accent-deep transition-transform duration-150 group-hover:translate-x-1 group-focus-visible:translate-x-1">
          →
        </span>
      </Link>
    </li>
  );
}

/**
 * The homework column beside Past (ticket 305, `teacherHomeworkColumn`): a homework's cell runs from its first covered card's
 * top to its last's bottom and reads its name, its due date and the class's count ("14/20 done"), or, sent and not yet open,
 * "sent · opens after Problem Set 6" behind a dashed line. A Past set no homework covers keeps an empty space. An open cell's
 * line is the homework cell border tokens (ticket 321); the sent cell's dashes are its own.
 * Every cell is a button (ticket 324, a demo placeholder): a press lays "HW insight scoped in FUTURE_FEATURES" over the cell,
 * white on dark grey, for `HW_INSIGHT_MS`, standing in for the homework insight view FUTURE_FEATURES scopes. The message is an
 * overlay inside the cell's own box, so no cell or card moves; a polite live region beside the cells announces it.
 */
function HomeworkColumn({ pieces }: { pieces: TeacherHomeworkPiece[] }) {
  const [shown, setShown] = useState<string | null>(null);
  // Lazy state: one flasher for the column's life; its timer is set from the press and cleared on unmount.
  const [flash] = useState(() => flasher<string>(setShown));
  useEffect(() => () => flash.dispose(), [flash]);
  return (
    <div className="contents" data-hw-column>
      {pieces.map((p) => {
        const gridRow = `${p.row + 1} / span ${p.span}`;
        const rows = p.setIds.join(" ");
        if (p.kind === "empty") return <div key={`empty-${rows}`} className="col-start-2" style={{ gridRow }} data-hw-empty={rows} aria-hidden />;
        const sent = p.state === "sent";
        const insight = shown === p.id;
        // An open cell's line is an outline (ticket 321's hw-card-edge), so focus shows as the ring and the outline stays; the sent
        // cell has a real dashed border and no outline to keep. Pressed, the line and the ground turn ink-soft.
        const edge = sent
          ? `border border-dashed focus-visible:outline-none ${insight ? "border-ink-soft bg-ink-soft" : "border-line-strong hover:border-accent-line"}`
          : `hw-card-edge ${insight ? "bg-ink-soft outline-ink-soft" : "bg-paper/70 outline-hw-border hover:outline-accent-line"}`;
        return (
          <button
            type="button"
            key={p.id}
            onClick={() => flash.press(p.id)}
            className={`relative col-start-2 flex flex-col justify-center rounded-2xl px-6 py-3 text-left transition-colors select-none focus-visible:ring-4 focus-visible:ring-accent/30 ${edge}`}
            style={{ gridRow }}
            data-hw-cell={p.id}
            data-hw-state={p.state}
            data-hw-rows={rows}
            data-hw-insight={insight || undefined}
          >
            <span className={`font-display text-[25px] leading-tight ${sent ? "text-ink-muted" : "text-ink"}`} data-hw-name>
              {p.name}
            </span>
            <span className="mt-1 text-[16px] whitespace-nowrap text-ink-muted" data-due>
              due {p.due}
            </span>
            {sent ? (
              <span className="mt-2 text-[15px] leading-5 text-balance text-ink-muted" data-hw-sent>
                {p.opensAfter ? `sent · opens after ${p.opensAfter}` : "sent"}
              </span>
            ) : (
              <span className="mt-2.5 text-[17px] leading-7 text-ink-soft" data-hw-count>
                <Count n={p.done} of={p.total} /> done
              </span>
            )}
            {/* The tile's own border and ground turn ink-soft too, so the whole tile is dark grey with no sliver of line at its edge. */}
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-0 grid place-items-center rounded-2xl px-4 text-center text-[17px] leading-6 font-medium ${insight ? "bg-ink-soft text-white" : "opacity-0"}`}
              data-hw-insight-message
            >
              {insight ? HW_INSIGHT_MESSAGE : ""}
            </span>
          </button>
        );
      })}
      {/* The announcement: a button's children are presentational to assistive tech, so the live region sits beside the cells, absolutely positioned (sr-only) so it takes no grid cell. */}
      <span role="status" aria-live="polite" className="sr-only" data-hw-insight-live>
        {shown ? HW_INSIGHT_MESSAGE : ""}
      </span>
    </div>
  );
}

function Count({ n, of }: { n: number; of?: number }) {
  return (
    <span className="font-semibold text-ink tabular-nums">
      {n}
      {of !== undefined && `/${of}`}
    </span>
  );
}

/** An item on the status line's own row (ticket 323): the grid's second row, centred on its 28 px. */
const ON_LINE = "row-start-2 self-center";

function LiveLine({ card }: { card: AssignmentCard }) {
  return (
    <>
      <span className={`${ON_LINE} inline-flex items-center gap-2 font-medium text-secure`} data-live>
        <span aria-hidden className="live-dot h-2.5 w-2.5 rounded-full bg-secure" />
        live
      </span>
      <Dot />
      <span className={ON_LINE} data-submitted>
        <Count n={card.submitted} of={card.total} /> submitted
      </span>
      <TopGaps card={card} label="top gaps so far:" />
    </>
  );
}

function PastLine({ card }: { card: AssignmentCard }) {
  const tone = card.status === "done" ? "border-line bg-cream-deep text-ink-soft" : "border-accent-line bg-accent-soft text-accent-deep";
  return (
    <>
      {/* The chips overhang the 28 px line (-my-0.5) so a card is as tall in review as live: the Live card never grows when the class moves on (ticket 234). */}
      <span className={`${ON_LINE} -my-0.5 rounded-full border px-3 py-0.5 text-[15px] leading-6 font-medium ${tone}`} data-past-status>
        {card.status}
      </span>
      <Dot />
      <span className={ON_LINE} data-submitted>
        <Count n={card.submitted} of={card.total} /> submitted
      </span>
      <TopGaps card={card} label="top gaps:" />
    </>
  );
}

/**
 * The card's top gaps (ticket 323): "top gaps:" and up to three red misconception pills on the status line, each under the
 * blue tag of the skill it sits under (`CategoryChip`, the Class View's column head). Gaps sharing a skill sit side by side
 * under one tag spanning both (`gapGroups`), so the tag reads as their header. Nothing when nobody has slipped.
 */
function TopGaps({ card, label }: { card: AssignmentCard; label: string }) {
  if (card.topGaps.length === 0) return null;
  const groups = gapGroups(card.topGaps);
  // Each group's first column: after the status, a dot, submitted, a dot and the label, then the groups before it.
  const starts = groups.map((_, i) => 6 + groups.slice(0, i).reduce((n, g) => n + g.gaps.length, 0));
  return (
    <>
      <Dot />
      <span className={ON_LINE} data-top-gaps>
        {label}
      </span>
      {groups.map((group, g) => {
        const start = starts[g];
        return (
          <Fragment key={group.gaps[0].misconception}>
            {group.skill !== null && (
              <CategoryChip className="row-start-1 self-end text-center" style={{ gridColumn: `${start} / span ${group.gaps.length}` }} data-gap-skill={group.skill} data-gap-span={group.gaps.length}>
                {group.skill}
              </CategoryChip>
            )}
            {group.gaps.map((gap, i) => (
              <span key={gap.misconception} className={`${ON_LINE} -my-0.5 justify-self-start rounded-full border border-wrong-line bg-wrong-soft px-3 py-0.5 text-[15px] leading-6 font-medium whitespace-nowrap text-wrong-deep`} style={{ gridColumn: start + i }} data-top-gap={gap.misconception}>
                {gap.name}
              </span>
            ))}
          </Fragment>
        );
      })}
    </>
  );
}
