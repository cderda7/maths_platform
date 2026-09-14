import Image from "next/image";
import Link from "next/link";
import logo from "@/public/edexia-logo.png";
import { ASSIGNMENT } from "@/data/assignment";

/** The Edexia mark: the real brain-network logo, served from `public/edexia-logo.png` (512 px square). */
export function BrandMark({ className = "h-6 w-6" }: { className?: string }) {
  return <Image src={logo} alt="" className={className} priority aria-hidden />;
}

/**
 * The wordmark with the class's short name ("Edexia · 11 Methods", ticket 184). A label with the default cursor, unless
 * `href` makes it the way home: on Sam's iPad it returns to his Classroom (ticket 264).
 */
export default function Brand({ sub = ASSIGNMENT.className, href, label }: { sub?: string; href?: string; label?: string }) {
  const inner = (
    <>
      <BrandMark />
      <span className="text-[17px] text-accent-deep">Edexia</span>
      <span className="ml-1 text-[13px] font-normal text-ink-muted">· {sub}</span>
    </>
  );
  const cls = "flex shrink-0 select-none items-center gap-2 whitespace-nowrap font-medium tracking-tight text-accent";
  if (href)
    return (
      <Link href={href} className={`${cls} rounded-full focus-visible:ring-4 focus-visible:ring-accent/20 focus-visible:outline-none`} aria-label={label} data-brand data-brand-home>
        {inner}
      </Link>
    );
  return (
    <div className={`${cls} cursor-default`} data-brand>
      {inner}
    </div>
  );
}
