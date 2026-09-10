import Image from "next/image";
import logo from "@/public/edexia-logo.png";

/** The Edexia mark: the real brain-network logo, served from `public/edexia-logo.png` (512 px square). */
export function BrandMark({ className = "h-6 w-6" }: { className?: string }) {
  return <Image src={logo} alt="" className={className} priority aria-hidden />;
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
