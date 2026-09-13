"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import TeacherChrome from "./TeacherChrome";
import { Eyebrow, H1 } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { CLASS_SUBJECT, classroomCards, type AssignmentCard } from "@/lib/classroomCards";
import { useClassroom } from "@/lib/classroom-store";
import { CLASS_SIZE } from "@/lib/readiness";
import { useBatchedSession, useNow } from "@/lib/store";

/** The create screen "+ New assignment" opens. */
const CREATE_HREF = "/teacher/assignments/create";

/**
 * Edexia Classroom (ticket 186), the teacher's home: every assignment the class has, as cards, the
 * live ones (the class still working individually) above the past ones (in review, or done), each
 * newest due first, and "+ New assignment" on the title row. The heading and the Live section are
 * pinned; only Past scrolls (ticket 216). A card is one link to the assignment's
 * landing (ticket 185: Class or Mistakes). The cards are `lib/classroomCards` over the classroom,
 * Sam's session in its 3 s batches and the clock, the inputs the assignment's own tabs read, so the
 * live card's counts move with the class. One class (ASSUMPTIONS.md, ONE CLASS).
 *
 * The page takes the chrome's full container, as the header and Class View do: "+ New assignment"
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
            <Link
              href={CREATE_HREF}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink py-2.5 pr-5 pl-4 text-[15px] font-medium text-white shadow-card transition-colors hover:bg-ink-soft focus-visible:ring-4 focus-visible:ring-accent/30 focus-visible:outline-none"
              data-new-assignment
            >
              <span aria-hidden className="grid h-5 w-5 place-items-center text-[20px] leading-none font-normal">
                +
              </span>
              New assignment
            </Link>
          </div>

          {/* Before Create nothing is live: no Live section at all, Past opens where it would sit (ticket 216). */}
          {hasLive && (
            <Section label="Live" id="live" className="mt-12">
              {live.map((card) => (
                <Card key={card.id} card={card} />
              ))}
            </Section>
          )}
        </div>

        {ready && past.length > 0 && (
          <Section label="Past" id="past">
            {past.map((card) => (
              <Card key={card.id} card={card} />
            ))}
          </Section>
        )}
      </div>
    </TeacherChrome>
  );
}

function Section({ label, id, className = "", children }: { label: string; id: "live" | "past"; className?: string; children: ReactNode }) {
  return (
    <section className={className} aria-label={label} data-section={id}>
      <Eyebrow>{label}</Eyebrow>
      <ul className="mt-3 space-y-3">{children}</ul>
    </section>
  );
}

const Dot = () => <span aria-hidden className="text-ink-muted/60">·</span>;

/** One assignment: the whole card is the link, its title and status on the left, the due date and an arrow on the right. */
function Card({ card }: { card: AssignmentCard }) {
  return (
    <li>
      <Link
        href={card.href}
        className="group flex scroll-mt-(--classroom-pinned) items-center gap-8 rounded-2xl border border-line bg-paper px-9 py-7 shadow-card transition-[border-color,box-shadow] duration-150 hover:border-accent-line hover:shadow-lift focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/20 focus-visible:outline-none"
        data-assignment-card={card.id}
        data-status={card.status}
      >
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[31px] leading-tight text-ink" data-card-title>
            {card.name}
          </h3>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[17px] leading-7 text-ink-soft" data-status-line>
            {card.section === "live" ? <LiveLine card={card} /> : <PastLine card={card} />}
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

function Count({ n, of }: { n: number; of?: number }) {
  return (
    <span className="font-semibold text-ink tabular-nums">
      {n}
      {of !== undefined && `/${of}`}
    </span>
  );
}

function LiveLine({ card }: { card: AssignmentCard }) {
  return (
    <>
      <span className="inline-flex items-center gap-2 font-medium text-secure" data-live>
        <span aria-hidden className="live-dot h-2.5 w-2.5 rounded-full bg-secure" />
        live
      </span>
      <Dot />
      <span data-submitted>
        <Count n={card.submitted} of={card.total} /> submitted
      </span>
      <Dot />
      <span data-mistakes>
        <Count n={card.mistakes} /> {card.mistakes === 1 ? "mistake" : "mistakes"} so far
      </span>
    </>
  );
}

function PastLine({ card }: { card: AssignmentCard }) {
  const tone = card.status === "done" ? "border-line bg-cream-deep text-ink-soft" : "border-accent-line bg-accent-soft text-accent-deep";
  return (
    <>
      <span className={`rounded-full border px-3 py-0.5 text-[15px] leading-6 font-medium ${tone}`} data-past-status>
        {card.status}
      </span>
      <Dot />
      <span data-submitted>
        <Count n={card.submitted} of={card.total} /> submitted
      </span>
      {card.topGap && (
        <>
          <Dot />
          <span className="inline-flex items-center gap-2" data-top-gap>
            top gap:
            <span className="rounded-full border border-wrong-line bg-wrong-soft px-3 py-0.5 text-[15px] leading-6 font-medium text-wrong-deep" data-top-gap-name>
              {card.topGap.name}
            </span>
          </span>
        </>
      )}
    </>
  );
}
