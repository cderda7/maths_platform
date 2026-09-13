import TeacherCompare from "./TeacherCompare";
import AssignmentProvider from "../AssignmentProvider";
import { LIVE_ASSIGNMENT_ID } from "@/lib/assignments";

export default function Page() {
  return (
    <AssignmentProvider id={LIVE_ASSIGNMENT_ID}>
      <TeacherCompare />
    </AssignmentProvider>
  );
}
