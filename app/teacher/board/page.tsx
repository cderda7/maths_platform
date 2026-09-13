import BoardControls from "./BoardControls";
import AssignmentProvider from "../AssignmentProvider";
import { LIVE_ASSIGNMENT_ID } from "@/lib/assignments";

export default function Page() {
  return (
    <AssignmentProvider id={LIVE_ASSIGNMENT_ID}>
      <BoardControls />
    </AssignmentProvider>
  );
}
