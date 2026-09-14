import type { ReactNode } from "react";
import StudentShell from "./StudentShell";

/** Sam's iPad around every student route (ticket 264): his Classroom and the set he opens from it share one device. */
export default function StudentLayout({ children }: { children: ReactNode }) {
  return <StudentShell>{children}</StudentShell>;
}
