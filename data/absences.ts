import { ASSIGNMENT } from "./assignment";

/**
 * Who is away, by assignment id, before the teacher says otherwise (ticket 250): simulation data, the demo's
 * own absences. Chloe hands nothing in on Problem Set 6 because she is not in the room that day; on every
 * other set nobody is away. The product rule is the classroom's own list (`ClassroomState.absences`, read
 * through `absentOf` in `lib/absence.ts`): the teacher marks and unmarks from the Class View roster, and a
 * set they have never touched reads this list. Reset demo returns to it.
 */
export const DEMO_ABSENCES: Readonly<Record<string, readonly string[]>> = { [ASSIGNMENT.id]: ["chloe"] };
