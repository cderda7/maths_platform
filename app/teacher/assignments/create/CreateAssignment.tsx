"use client";

import { useEffect, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import TeacherChrome from "../../TeacherChrome";
import QuestionTile, { type TileHandlers } from "./QuestionTile";
import { Button, Eyebrow } from "@/components/ui";
import { useReorder } from "@/components/useReorder";
import { ASSIGNMENT } from "@/data/assignment";
import { DEMO_DRAFT_GOAL, DEMO_DRAFT_TITLE, DEMO_PASTE_LINES } from "@/data/draft-seed";
import { GOAL_MAX, type AssignmentDraft, type DraftQuestion } from "@/lib/classroom";
import { dispatchClassroom, getClassroom } from "@/lib/classroom-store";
import { parseQuestion, stemText } from "@/lib/mathInput";
import { moveItem } from "@/lib/reorder";

export const REVIEW_PATH = "/teacher/assignments/create/review";

interface Q {
  id: string;
  text: string;
}

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));
const ghostOf = (): Q => ({ id: newId(), text: "" });
/** The list always ends with one empty tile, the ghost the next question is typed into. */
const withGhost = (qs: Q[]): Q[] => (qs.length && qs[qs.length - 1].text === "" ? qs : [...qs, ghostOf()]);

/** The draft as the store keeps it: the typed questions with their parsed shape, the empties dropped. */
export function draftOf(title: string, goal: string, qs: Q[], at: number): AssignmentDraft {
  const questions: DraftQuestion[] = qs
    .filter((q) => q.text.trim())
    .map((q) => {
      const p = parseQuestion(q.text);
      return { id: q.id, text: q.text, stem: stemText(p.stem), tex: p.tex };
    });
  return { title: title.trim(), goal: goal.slice(0, GOAL_MAX), questions, updatedAt: at };
}

/**
 * The create screen, step one of a new assignment (ticket 119): the title, the goal for the class
 * (ticket 154: one or two sentences the student reads between the overview and the check-in; blank
 * means no goal screen), then the questions as tiles in the five-wide grid the student's overview uses. Every tile is one question and the
 * grid is the editor; see `QuestionTile`. The draft is saved to the classroom store on every
 * change and read back on load, so a reload keeps it. Continue floats bottom right, on once a
 * question has text, and opens the review screen. The unit, the pathway, the skills and the
 * difficulty are the review screen's business, not this one's. A press held on a tile lifts it
 * to drag to another slot, the labels renumbering as the others slide (ticket 150,
 * `useReorder`); the ghost stays last and takes no drop.
 */
export default function CreateAssignment() {
  // The draft lives in localStorage, so the editor mounts on the client only and reads it as its first state.
  const client = useSyncExternalStore(noSubscribe, isClient, isServer);
  return <TeacherChrome>{client ? <Editor /> : <Eyebrow>{ASSIGNMENT.className}</Eyebrow>}</TeacherChrome>;
}

const noSubscribe = () => () => {};

/**
 * The draft in the store, or, when there is none (first visit, or after Reset demo), the demo
 * teacher's set from `data/draft-seed` so the screen opens mid-creation with the tiles filled
 * rather than blank (ticket 121). A draft the teacher has emptied is kept empty.
 */
function storedOrSeed(): { title: string; goal: string; questions: { id: string; text: string }[] } {
  const d = getClassroom().draft;
  // A draft stored before the goal existed has none; it is not re-seeded (the teacher may have emptied it on purpose).
  if (d) return { ...d, goal: d.goal ?? "" };
  return { title: DEMO_DRAFT_TITLE, goal: DEMO_DRAFT_GOAL, questions: DEMO_PASTE_LINES.map((text, i) => ({ id: `seed-${i + 1}`, text })) };
}
const isClient = () => true;
const isServer = () => false;

function Editor() {
  const router = useRouter();
  const [title, setTitle] = useState(() => storedOrSeed().title);
  const [goal, setGoal] = useState(() => storedOrSeed().goal);
  const [qs, setQs] = useState<Q[]>(() => withGhost(storedOrSeed().questions.map((q) => ({ id: q.id, text: q.text }))));
  const [focusId, setFocusId] = useState<string | null>(() => qs[qs.length - 1].id);
  const [removed, setRemoved] = useState<{ q: Q; index: number } | null>(null);

  useEffect(() => {
    dispatchClassroom({ type: "draft/set", draft: draftOf(title, goal, qs, Date.now()) });
  }, [title, goal, qs]);

  const edit = (f: (qs: Q[]) => Q[]) => {
    setRemoved(null);
    setQs((cur) => withGhost(f(cur)));
  };

  /** Remove a tile (never the ghost); Backspace steps the caret back, × leaves nothing focused. */
  const remove = (index: number, stepBack: boolean) => {
    const q = qs[index];
    if (!q || index === qs.length - 1) return;
    setRemoved({ q, index });
    setFocusId(stepBack ? (qs[index - 1]?.id ?? null) : null);
    setQs(withGhost(qs.filter((_, i) => i !== index)));
  };

  const undoRemove = () => {
    if (!removed) return;
    const { q, index } = removed;
    setRemoved(null);
    setQs((cur) => {
      const at = Math.min(index, cur.length - 1);
      return withGhost([...cur.slice(0, at), q, ...cur.slice(at)]);
    });
    setFocusId(q.id);
  };

  const gridKey = (e: KeyboardEvent<HTMLOListElement>) => {
    if (removed && (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
      e.preventDefault();
      undoRemove();
    }
  };

  const handlers = (index: number, q: Q): TileHandlers => ({
    onChange: (text) => edit((cur) => cur.map((x) => (x.id === q.id ? { ...x, text } : x))),
    onFocus: () => setFocusId(q.id),
    onBlur: () => setFocusId((cur) => (cur === q.id ? null : cur)),
    onNext: () => {
      const next = qs[index + 1];
      if (next) setFocusId(next.id);
    },
    onBackspaceEmpty: () => {
      if (index === qs.length - 1) {
        const prev = qs[index - 1];
        if (prev) setFocusId(prev.id);
      } else remove(index, true);
    },
    onRemove: () => remove(index, false),
    onPasteLines: (first, rest) => {
      const added = rest.map((text) => ({ id: newId(), text }));
      edit((cur) => cur.flatMap((x) => (x.id === q.id ? [{ ...x, text: first }, ...added] : [x])));
      setFocusId(added[added.length - 1].id);
    },
  });

  // Every tile but the ghost can be held and dropped on; a move is an edit like any other (it clears the undo line).
  const reorder = useReorder({ count: qs.length - 1, columns: 5, ignore: "button", name: (i) => `Q${i + 1}`, onMove: (from, to) => edit((cur) => moveItem(cur, from, to)) });

  const any = qs.some((q) => q.text.trim());
  const proceed = () => {
    if (!any) return;
    dispatchClassroom({ type: "draft/set", draft: draftOf(title, goal, qs, Date.now()) });
    router.push(REVIEW_PATH);
  };

  return (
    <div className="pb-24">
      <Eyebrow>{ASSIGNMENT.className}</Eyebrow>
      <input
        value={title}
        onChange={(e) => {
          setRemoved(null);
          setTitle(e.target.value);
        }}
        placeholder="Untitled assignment"
        aria-label="Title"
        className="mt-3 w-full bg-transparent font-display text-[40px] leading-[1.05] text-ink outline-none placeholder:text-ink-muted/50 md:text-[48px]"
        data-title
      />

      <div className="mt-6 max-w-3xl" data-goal>
        <label htmlFor="goal" className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-muted">
          Goal for the class
        </label>
        <p className="mt-1 text-[13.5px] text-ink-muted">Write a goal-oriented message for the class. This will be displayed on student screens before they start the assignment.</p>
        <textarea
          id="goal"
          value={goal}
          rows={3}
          maxLength={GOAL_MAX}
          onChange={(e) => {
            setRemoved(null);
            setGoal(e.target.value.slice(0, GOAL_MAX));
          }}
          placeholder="By the end of this set I want you to…"
          className="mt-2 w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-[15px] leading-[1.45] text-ink outline-none transition-colors placeholder:text-ink-muted/50 focus:border-accent"
          data-goal-input
        />
        <p className="mt-1 text-right text-[12px] tabular-nums text-ink-muted" data-goal-count>
          {goal.length} / {GOAL_MAX}
        </p>
      </div>

      <ol className="mt-6 grid grid-cols-5 gap-4" onKeyDownCapture={gridKey} data-questions data-dragging={reorder.drag ? reorder.drag.from + 1 : undefined}>
        {qs.map((q, i) => (
          <li key={q.id} className="aspect-square min-h-0" data-question={i + 1} {...reorder.item(i)}>
            <QuestionTile index={i} slot={reorder.slot(i)} text={q.text} ghost={i === qs.length - 1} focused={focusId === q.id} h={handlers(i, q)} />
          </li>
        ))}
      </ol>
      <p className="sr-only" aria-live="polite" data-announce>
        {reorder.announced}
      </p>

      {removed && (
        <p className="mt-4 text-[13px] text-ink-muted" data-removed>
          Q{removed.index + 1} removed.{" "}
          <button type="button" onClick={undoRemove} className="font-medium text-accent-deep hover:underline" data-undo>
            Undo
          </button>
        </p>
      )}

      <div className="fixed bottom-16 right-6 z-30">
        <Button size="lg" disabled={!any} onClick={proceed} className="shadow-lift" data-continue>
          Continue
        </Button>
      </div>
    </div>
  );
}
