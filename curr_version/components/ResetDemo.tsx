"use client";

import { resetSession } from "@/lib/store";
import { Button } from "./ui";

/** Clears the shared demo session in every tab. */
export default function ResetDemo({ className = "" }: { className?: string }) {
  return (
    <Button variant="ghost" className={className} onClick={() => resetSession()}>
      Reset
    </Button>
  );
}
