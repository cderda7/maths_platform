"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TeacherChrome from "../../TeacherChrome";
import { useAssignmentBundle } from "../../AssignmentContext";
import { assignmentBundle, assignmentHref, landingTab } from "@/lib/assignments";
import { getClassroom } from "@/lib/classroom-store";
import { getSnapshot } from "@/lib/store";

/**
 * Opening an assignment (ticket 185): straight on to Class once everyone has handed in or the set is
 * past individual working, else Mistakes (`landingTab`). Decided once, on arrival, from the stores as
 * they stand in this browser (the classroom and Sam's session live in localStorage, so the server
 * cannot); the chrome stands meanwhile so the bar does not flash. A replace, so Back skips it.
 */
export default function AssignmentLanding() {
  const { id } = useAssignmentBundle();
  const router = useRouter();
  useEffect(() => {
    const classroom = getClassroom();
    const bundle = assignmentBundle(id, classroom);
    if (bundle) router.replace(assignmentHref(id, landingTab(bundle, classroom, getSnapshot(), Date.now())));
  }, [id, router]);
  return <TeacherChrome>{null}</TeacherChrome>;
}
