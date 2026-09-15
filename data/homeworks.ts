/**
 * The class's homeworks (ticket 290): weekly, each with a due date, covering the in-class sets due since the previous
 * homework's due date (`coveredSetIds` in `lib/homeworks.ts`). Only the past ones live here: Homework 1 and 2 need a
 * name, a due date and Sam's record, not problems (ticket 291 creates Homework 3 through the create flow).
 *
 * Due dates read as the sets' do ("Tue 1 Sep", `dueOrder`): one class, one term (ASSUMPTIONS.md). Homeworks never overlap:
 * each is due before the next is created (ASSUMPTIONS.md, "HOMEWORKS NEVER OVERLAP").
 */
export interface HomeworkDef {
  kind: "homework";
  id: string;
  /** 1, 2, …: the cell's "HW1". */
  n: number;
  /** As the teacher named it: "Homework 1". */
  name: string;
  /** As on a card: "Tue 1 Sep". */
  due: string;
}

const homework = (n: number, due: string): HomeworkDef => ({ kind: "homework", id: `hw-${n}`, n, name: `Homework ${n}`, due });

/** Oldest due first. Homework 1 covers Problem Sets 1–2, Homework 2 Problem Sets 3–4. */
export const HOMEWORKS: readonly HomeworkDef[] = [homework(1, "Tue 1 Sep"), homework(2, "Mon 7 Sep")];

/**
 * What a student did on a homework: the day they finished all of it, or null while any of it is undone. Finishing after
 * the due date does not make it on time (`homeworkStatus`: missed is final).
 */
export interface HomeworkRecord {
  finishedOn: string | null;
}

/**
 * Sam's homework history, the demo's simulation data (kept apart from the rule that reads it, `homeworkStatus`):
 * Homework 1 done on time, the day before it was due; Homework 2 missed, none of it done.
 */
export const SAM_HOMEWORK_STORY: Readonly<Record<string, HomeworkRecord>> = {
  "hw-1": { finishedOn: "Mon 31 Aug" },
  "hw-2": { finishedOn: null },
};
