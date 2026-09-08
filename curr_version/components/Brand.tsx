import Link from "next/link";

export function BrandMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="5" cy="12" r="2.2" fill="#5b4ae8" />
      <circle cx="12" cy="5" r="2.2" fill="#5b4ae8" />
      <circle cx="12" cy="19" r="2.2" fill="#5b4ae8" />
      <circle cx="19" cy="12" r="2.2" fill="#5b4ae8" />
      <circle cx="12" cy="12" r="1.6" fill="#14123a" />
      <path d="M6.6 10.8 10.6 6.6M13.4 6.6l4 4.2M6.6 13.2l4 4.2M13.4 17.4l4-4.2M7 12h3.4M13.6 12H17M12 7v3.4M12 13.6V17" stroke="#5b4ae8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function Brand({ href = "/", sub = "Maths" }: { href?: string; sub?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-accent font-medium tracking-tight">
      <BrandMark />
      <span className="text-[17px] text-accent-deep">Edexia</span>
      <span className="text-ink-muted text-[13px] font-normal ml-1">· {sub}</span>
    </Link>
  );
}
