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

/** The wordmark. Not a link: it reads as a label, with the default cursor to say so. */
export default function Brand({ sub = "Maths" }: { sub?: string }) {
  return (
    <div className="flex cursor-default select-none items-center gap-2 font-medium tracking-tight text-accent" data-brand>
      <BrandMark />
      <span className="text-[17px] text-accent-deep">Edexia</span>
      <span className="ml-1 text-[13px] font-normal text-ink-muted">· {sub}</span>
    </div>
  );
}
