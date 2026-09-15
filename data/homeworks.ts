import { dayLabel, type IsoDay } from "@/lib/dueDate";

/**
 * The class's homeworks (ticket 290): weekly, each with a due date, covering the in-class sets due since the previous
 * homework's due date (`coveredSetIds` in `lib/homeworks.ts`). Only the past ones live here: Homework 1 and 2 need a
 * name, a due date and Sam's record, not problems. Homework 3 is created and sent through the create flow (ticket 291)
 * and lives in the classroom (`ClassroomState.homeworks`); `classHomeworks` reads both as one list.
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
  /** The same day with its year (ticket 291), which the next homework's earliest due date counts from (`nextHomework`). */
  day: IsoDay;
  /**
   * The sets it covers, frozen when it opened to the students (ticket 292): a set created afterwards goes to the next homework
   * whatever its due date (`homeworkForSet`). Absent while it has not opened, when the date rule alone says which sets it covers.
   */
  setIds?: readonly string[];
}

const homework = (n: number, day: IsoDay, setIds: readonly string[]): HomeworkDef => ({ kind: "homework", id: `hw-${n}`, n, name: `Homework ${n}`, due: dayLabel(day), day, setIds });

/** Oldest due first, both opened long ago, so their sets are frozen: Homework 1 covers Problem Sets 1–2, Homework 2 Problem Sets 3–4 (the date rule's, tested). */
export const HOMEWORKS: readonly HomeworkDef[] = [homework(1, "2026-09-01", ["pset-1", "pset-2"]), homework(2, "2026-09-07", ["pset-3", "pset-4"])];

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
