"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import TeacherChrome from "../TeacherChrome";
import { BackToClassroom } from "../AssignmentContext";
import { recallTilesScroll, rememberTilesScroll } from "./tilesScroll";
import { Avatar, Eyebrow, H1 } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { useClassroom } from "@/lib/classroom-store";
import { holisticTiles, type HolisticTile, type TileTag } from "@/lib/holisticTiles";
import { useBatchedSession, useNow } from "@/lib/store";

/**
 * Holistic Assessment (ticket 252), from Edexia Classroom: every student as a tile, in the class order. A tile
 * reads the story sheet's line for the student, their strengths (first, ticket 341), then their patterns as tags under their category (each with the
 * sets it shows on; only recent patterns surface, ticket 276); the whole tile opens the student's page (ticket 251), whose Back
 * returns here at the scroll the teacher left (`tilesScroll.ts`).
 *
 * The tiles are `lib/holisticTiles` over the classroom, Sam's session in its 3 s batches and the clock, the
 * inputs the student's page reads, so a tile never says what that page does not; they wait for those to arrive.
 * Three to a row; a row's tiles are one height (the grid stretches them).
 */
export default function HolisticTiles() {
  const classroom = useClassroom();
  const { session, updatedAt } = useBatchedSession(3000);
  const now = useNow();
  const ready = updatedAt !== null && now > 0;
  const tiles = holisticTiles({ classroom, session, now });
  const listRef = useRef<HTMLUListElement>(null);

  // Back from a student: the tiles as the teacher left them. A DOM write, before paint, once the tiles are drawn.
  useLayoutEffect(() => {
    if (!ready) return;
    const top = recallTilesScroll();
    const scroller = listRef.current?.closest("[data-teacher-scroll]");
    if (top !== null && scroller) scroller.scrollTop = top;
  }, [ready]);

  return (
    <TeacherChrome>
      <div data-holistic-tiles data-holistic-tiles-ready={ready || undefined}>
        <BackToClassroom />
        <Eyebrow className="mt-3">{ASSIGNMENT.className} · Edexia Classroom</Eyebrow>
        <H1 className="mt-3">Holistic Assessment</H1>
        {ready && (
          <ul ref={listRef} className="mt-9 grid grid-cols-3 gap-6" aria-label="Students">
            {tiles.map((tile) => (
              <li key={tile.student.id} className="min-w-0">
                <Tile tile={tile} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </TeacherChrome>
  );
}

function Tile({ tile }: { tile: HolisticTile }) {
  const empty = tile.signatures.length === 0 && tile.patterns.length === 0 && tile.strengths.length === 0;
  return (
    <Link
      href={tile.href}
      onClick={(e) => {
        const scroller = e.currentTarget.closest("[data-teacher-scroll]");
        if (scroller) rememberTilesScroll(scroller.scrollTop);
      }}
      className="group flex h-full flex-col rounded-2xl border border-line bg-paper px-7 pt-6 pb-7 shadow-card transition-[border-color,box-shadow] duration-150 hover:border-accent-line hover:shadow-lift focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/20 focus-visible:outline-none"
      data-tile={tile.student.id}
    >
      <div className="flex items-center gap-3.5">
        <Avatar initials={tile.student.initials} size="h-11 w-11 text-[14px]" />
        <h2 className="min-w-0 flex-1 font-display text-[27px] leading-tight text-ink" data-tile-name>
          {tile.student.name}
        </h2>
        <span aria-hidden className="shrink-0 text-[24px] leading-none text-accent-deep transition-transform duration-150 group-hover:translate-x-1 group-focus-visible:translate-x-1">
          →
        </span>
      </div>
      <p className="mt-3 text-[16px] leading-relaxed text-ink-soft" data-tile-summary>
        {tile.summary}
      </p>
      {empty ? (
        <p className="mt-5 border-t border-line pt-4 text-[15px] text-ink-muted" data-tile-nothing>
          Nothing to note
        </p>
      ) : (
        <div className="mt-5 space-y-3.5 border-t border-line pt-4">
          {/* Strengths first (ticket 341), then the issues. */}
          {tile.strengths.length > 0 && (
            <div data-tile-strengths>
              <Eyebrow>Strengths</Eyebrow>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tile.strengths.map((s) => (
                  <span key={s.category} className="rounded-lg border border-secure-line bg-secure-soft px-2.5 py-1 text-[15.5px] leading-snug font-medium text-secure" data-tile-strength={s.category}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Error signatures lead the issues (ticket 303): one kind of error across sets, the patterns it covers not repeated below. */}
          {tile.signatures.length > 0 && (
            <div data-tile-signatures>
              <Eyebrow>Across sets</Eyebrow>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tile.signatures.map((t) => (
                  <PatternTag key={t.label} tag={t} signature />
                ))}
              </div>
            </div>
          )}
          {tile.patterns.map((g) => (
            <div key={g.category} data-tile-patterns={g.category}>
              <Eyebrow>{g.name}</Eyebrow>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {g.tags.map((t) => (
                  <PatternTag key={t.label} tag={t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}

/** "signs in the wrong brackets · 2 sets" (or "· 1 set", ticket 276): the pattern's tag and how many sets it shows on (which ones on hover); a signature's tag (ticket 303) in the same colours, set in bold. */
function PatternTag({ tag, signature = false }: { tag: TileTag; signature?: boolean }) {
  return (
    <span
      className={`max-w-full rounded-lg border border-wrong-line bg-wrong-soft px-2.5 py-1 text-[15.5px] leading-snug text-wrong-deep ${signature ? "font-semibold" : ""}`}
      title={tag.sets.join(", ")}
      data-tile-tag={tag.label}
      data-tile-sets={tag.sets.join(" ")}
      data-tile-signature={signature || undefined}
    >
      {tag.label}
      <span className="whitespace-nowrap text-wrong-deep/70"> · {tag.sets.length} {tag.sets.length === 1 ? "set" : "sets"}</span>
    </span>
  );
}
