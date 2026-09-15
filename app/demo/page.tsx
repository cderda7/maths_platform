import { redirect } from "next/navigation";

/** The chooser's address from ticket 265 to ticket 286. It lives at `/` again; `/demo` redirects there so an old link or bookmark still lands on it. */
export default function Page() {
  redirect("/");
}
