import type { HTMLAttributes } from "react";

/**
 * A student's progress pill, the purple dot and its words ("Q4 in progress", "warming up"): the Class view's roster beside a
 * name (ticket 185) and the question a student is on in the student panel on Where students are (ticket 316), one look.
 */
export default function ProgressPill({ tag, className = "", ...rest }: { tag: string } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-[3px] whitespace-nowrap rounded-full border border-accent-line bg-paper px-[5px] py-0.5 text-[11px] font-medium text-accent-deep ${className}`} data-progress-tag={tag} {...rest}>
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
      {tag}
    </span>
  );
}
