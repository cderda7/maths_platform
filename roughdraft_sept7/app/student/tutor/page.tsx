import TutorScreen from "./TutorScreen";
import type { HelpKind } from "@/components/HelpPicker";

/** Deep links for review: /student/tutor?turn=5&help=example */
export default async function Page(props: PageProps<"/student/tutor">) {
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const turn = Number(one(sp.turn));
  const help = one(sp.help);
  const initialHelp: HelpKind | null = help === "example" || help === "hint" || help === "video" ? help : null;
  return <TutorScreen initialTurn={Number.isFinite(turn) ? turn : 1} initialHelp={initialHelp} />;
}
