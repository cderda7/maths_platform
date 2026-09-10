/**
 * A line that branches ("x = -2 or x = 1") is shown as two boxes side by side, the way a student
 * writes the two cases of the null factor law. The stored line keeps its "or" (evaluation keys on
 * the exact text); only the rendering splits. A line whose "or" follows a "⇒" stays whole: the
 * implication is one statement.
 */
const OR = /\s*\\;\\text\{or\}\\;\s*/;

export function branchesOf(tex: string): string[] {
  const parts = tex.split(OR);
  if (parts.length !== 2 || parts.some((p) => p.trim() === "" || p.includes("\\Rightarrow"))) return [tex];
  return parts.map((p) => p.trim());
}
