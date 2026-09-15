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

const rec = (hw1: string | null, hw2: string | null): Readonly<Record<string, HomeworkRecord>> => ({ "hw-1": { finishedOn: hw1 }, "hw-2": { finishedOn: hw2 } });

/**
 * The whole class's homework history (ticket 305), the demo's simulation data beside Sam's: Homework 1 (due Tue 1 Sep) and
 * Homework 2 (due Mon 7 Sep) for all twenty, keyed by student id, Sam's record his own story's. Each follows the student's arc
 * in `STORY` (`data/story.ts`): the students whose sets end short (Liam hands in about half, Grace starts late and does not
 * reach the last problems, Tomas's and Jordan's work ends before the worded problems, Oliver's drops on the factorising sets)
 * miss, some finishing a day or two late (still missed: `homeworkStatus`); everyone who hands in every set finishes on time.
 * Nobody has finished Homework 3, which is not yet due. Homework 1: 17 of 20 on time; Homework 2: 14 of 20.
 */
export const CLASS_HOMEWORK_STORY: Readonly<Record<string, Readonly<Record<string, HomeworkRecord>>>> = {
  sam: SAM_HOMEWORK_STORY,
  priya: rec("Sat 29 Aug", "Sat 5 Sep"),
  jordan: rec("Tue 1 Sep", "Tue 8 Sep"),
  amelia: rec("Mon 31 Aug", "Sun 6 Sep"),
  tomas: rec("Wed 2 Sep", null),
  zara: rec("Sun 30 Aug", "Sun 6 Sep"),
  liam: rec(null, null),
  aiden: rec("Mon 31 Aug", "Mon 7 Sep"),
  mia: rec("Sun 30 Aug", "Sun 6 Sep"),
  noah: rec("Mon 31 Aug", "Sat 5 Sep"),
  chloe: rec("Tue 1 Sep", "Mon 7 Sep"),
  ethan: rec("Tue 1 Sep", "Mon 7 Sep"),
  isla: rec("Mon 31 Aug", "Sun 6 Sep"),
  lucas: rec("Sun 30 Aug", "Mon 7 Sep"),
  grace: rec("Thu 3 Sep", "Wed 9 Sep"),
  harper: rec("Mon 31 Aug", "Sun 6 Sep"),
  oliver: rec("Tue 1 Sep", null),
  ruby: rec("Mon 31 Aug", "Mon 7 Sep"),
  finn: rec("Sun 30 Aug", "Sun 6 Sep"),
  sofia: rec("Mon 31 Aug", "Sun 6 Sep"),
};
