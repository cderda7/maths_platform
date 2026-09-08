import type { ReactNode } from "react";

export function Card({ children, className = "", tone = "paper" }: { children: ReactNode; className?: string; tone?: "paper" | "soft" | "plain" }) {
  const base =
    tone === "soft" ? "bg-accent-soft/60 border-accent-line" : tone === "plain" ? "bg-transparent border-line" : "bg-paper border-line shadow-card";
  return <div className={`rounded-2xl border ${base} ${className}`}>{children}</div>;
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-muted ${className}`}>{children}</div>;
}

export function H1({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h1 className={`font-display text-[40px] md:text-[48px] leading-[1.05] text-ink ${className}`}>{children}</h1>;
}

export function H2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`font-display text-[26px] leading-tight text-ink ${className}`}>{children}</h2>;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "accent"; size?: "md" | "lg" }) {
  const v =
    variant === "primary"
      ? "bg-ink text-white hover:bg-ink-soft"
      : variant === "accent"
        ? "bg-accent text-white hover:bg-accent-deep"
        : variant === "secondary"
          ? "bg-paper text-ink border border-line-strong hover:border-ink-muted"
          : "text-ink-soft hover:text-ink hover:bg-cream-deep";
  const s = size === "lg" ? "px-6 py-3 text-[15px]" : "px-4 py-2 text-[13.5px]";
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${s} ${v} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Avatar({ initials, size = "h-8 w-8 text-[11px]" }: { initials: string; size?: string }) {
  return (
    <span className={`grid place-items-center rounded-full bg-accent-soft border border-accent-line text-accent-deep font-semibold ${size}`}>
      {initials}
    </span>
  );
}
