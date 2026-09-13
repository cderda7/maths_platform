"use client";

import type { DragEvent } from "react";
import QuestionTile, { type TileHandlers } from "./QuestionTile";
import { BackToClassroom } from "../../AssignmentContext";
import { Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { GOAL_MAX } from "@/lib/classroom";

const nothing = () => {};
const INERT_HANDLERS: TileHandlers = { onChange: nothing, onFocus: nothing, onBlur: nothing, onNext: nothing, onBackspaceEmpty: nothing, onRemove: nothing, onPasteLines: nothing, onKeep: nothing, onUpload: nothing, onRead: nothing, onFix: nothing };

/** A file dragged over the blank start is refused (no drop target), and a drop never opens the file in the tab. */
const refuse = (e: DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "none";
};

/**
 * The create screen before anything is generated (ticket 188): what starting from scratch looks
 * like, shown, not usable. The title's placeholder, the goal box and one ghost Q1 tile ("Type a
 * question, or drop a picture or PDF", Upload) sit exactly where the editor puts them, greyed and
 * `inert` (no focus, no click, no typing, no drop). Centred over the tile grid, the one live control:
 * a pulsing "Generate simulated assignment", which fills the screen with the demo teacher's set.
 * No Continue until then. The typing, upload and Fix paths (tickets 119, 171–173) stay in the editor,
 * which the generated screen still is; see FUTURE_FEATURES.
 */
export default function BlankStart({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="pb-24" onDragOver={refuse} onDrop={refuse} data-blank-start>
      <BackToClassroom />
      <Eyebrow className="mt-3">{ASSIGNMENT.className}</Eyebrow>
      <div inert className="select-none" data-blank-inert>
        <input
          value=""
          readOnly
          tabIndex={-1}
          placeholder="Untitled assignment"
          aria-label="Title"
          className="mt-3 w-full bg-transparent font-display text-[40px] leading-[1.05] text-ink outline-none placeholder:text-ink-muted/35 md:text-[48px]"
          data-title
        />

        <div className="mt-6 max-w-3xl opacity-60" data-goal>
          <label htmlFor="goal" className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-muted">
            Goal for the class
          </label>
          <p className="mt-1 text-[13.5px] text-ink-muted">Write a goal-oriented message for the class. This will be displayed on student screens before they start the assignment.</p>
          <textarea
            id="goal"
            value=""
            readOnly
            tabIndex={-1}
            rows={3}
            placeholder="By the end of this set I want you to…"
            className="mt-2 w-full resize-none rounded-xl border border-line bg-cream-deep/60 px-4 py-3 text-[15px] leading-[1.45] text-ink outline-none placeholder:text-ink-muted/50"
            data-goal-input
          />
          <p className="mt-1 text-right text-[12px] tabular-nums text-ink-muted" data-goal-count>
            0 / {GOAL_MAX}
          </p>
        </div>
      </div>

      <div className="relative mt-6" data-blank-grid>
        <ol inert className="pointer-events-none grid select-none grid-cols-5 gap-4 opacity-60" data-questions>
          <li className="aspect-square min-h-0" data-question={1}>
            <QuestionTile index={0} item={{ id: "blank-ghost", text: "" }} ghost focused={false} h={INERT_HANDLERS} />
          </li>
        </ol>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <Button variant="accent" size="lg" hit onClick={onGenerate} className="pulse-loop pointer-events-auto shadow-lift" data-generate>
            Generate simulated assignment
          </Button>
        </div>
      </div>
    </div>
  );
}
