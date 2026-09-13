const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/**
 * A due date's place in the (one) school year, for sorting: "Mon 7 Sep" is later than "Fri 28 Aug".
 * The sets carry their due day as it reads on the card, weekday, day and month with no year (one
 * class, one term, ASSUMPTIONS.md); a date that does not read that way sorts last (-1).
 * Ticket 216 wrote it for the Classroom's cards; ticket 210 moved it here so the registry orders its finished sets by it.
 */
export function dueOrder(due: string): number {
  const m = /(\d{1,2})\s+([A-Z][a-z]{2})/.exec(due);
  const month = m ? MONTHS.indexOf(m[2] as (typeof MONTHS)[number]) : -1;
  return m && month >= 0 ? month * 31 + Number(m[1]) : -1;
}
