import { redirect } from "next/navigation";

/**
 * The site's front page is the teacher's Edexia Classroom (ticket 265): `/` redirects to `/teacher`, so the
 * address bar reads `/teacher` and the teacher chrome's links and Back behave as they do there. The presenter's
 * chooser (iPad, teacher view, board, split) is at `/demo`.
 */
export default function Page() {
  redirect("/teacher");
}
