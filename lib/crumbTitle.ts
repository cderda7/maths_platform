/**
 * The set's title as the student header's crumb shows it (ticket 236): "PROBLEM SET 6 — ROOTS OF A QUADRATIC"
 * reads "PSET 6 — ROOTS OF A QUADRATIC", so the whole title fits beside the wordmark instead of truncating.
 * Only the leading "Problem Set N" shortens; any other title is unchanged. Screens' own headings keep the full title.
 */
export function crumbTitle(title: string): string {
  return title.replace(/^\s*problem\s+set\s+(\d+)/i, "PSET $1");
}
