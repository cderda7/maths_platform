import { notFound } from "next/navigation";
import AssignmentProvider from "../../AssignmentProvider";
import { isAssignmentId } from "@/lib/assignments";

/** An assignment's pages (ticket 185): the id in the URL names the set every tab under it shows. An id no set has is a 404. */
export default async function Layout({ children, params }: LayoutProps<"/teacher/a/[id]">) {
  const { id } = await params;
  if (!isAssignmentId(id)) notFound();
  return <AssignmentProvider id={id}>{children}</AssignmentProvider>;
}
