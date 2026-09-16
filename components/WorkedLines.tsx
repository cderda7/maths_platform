import M from "@/components/Math";
import type { SolutionStep } from "@/data/types";

/**
 * Q*'s working during class review (ticket 344), drawn the same way on the smartboard and on every student's iPad: the
 * lines the teacher has revealed, one per row, and nothing after them, so the class reads the board and their own screen
 * as one thing. The maths alone, as every worked example in the app shows it (`PracticeCard`): what a step does is the
 * teacher's to say out loud, not a caption. A line never wraps (`.katex` is nowrap app-wide, ticket 194), so a row
 * scrolls sideways on its own rather than breaking the maths.
 */
export default function WorkedLines({ steps, shown, size }: { steps: readonly SolutionStep[]; shown: number; size: "board" | "student" }) {
  const board = size === "board";
  return (
    <ol className={board ? "space-y-3" : "space-y-2"} data-worked-lines={shown}>
      {steps.slice(0, shown).map((st, i) => (
        <li key={i} className={`overflow-x-auto rounded-2xl border border-line bg-paper text-ink ${board ? "px-5 py-4 text-[28px]" : "px-3.5 py-2.5 text-[18px]"}`} data-worked-line={i + 1}>
          <M tex={st.tex} />
        </li>
      ))}
      {shown === 0 && (
        <li className={`rounded-2xl border border-dashed border-line-strong text-ink-muted ${board ? "px-5 py-4 text-[20px]" : "px-3.5 py-2.5 text-[13px]"}`} data-worked-waiting>
          {board ? "Watch — the first line is coming." : "Watch the board."}
        </li>
      )}
    </ol>
  );
}
