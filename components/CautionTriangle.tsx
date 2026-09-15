/**
 * The caution triangle: light blue, a dark `!`. One drawing for "nothing handed in", on the Class View's Missing mark
 * (`app/teacher/TeacherLive.tsx`) and on a missed homework's cell on Sam's Classroom (ticket 290). Decorative: the caller
 * names what it means.
 */
export default function CautionTriangle({ className = "h-[26px] w-[28px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 22" className={className} aria-hidden data-caution-triangle>
      <path d="M10.3 2.1a2 2 0 0 1 3.4 0l9 15.6a2 2 0 0 1-1.7 3H3a2 2 0 0 1-1.7-3z" fill="var(--color-standout-line)" stroke="var(--color-standout)" strokeOpacity="0.45" strokeWidth="0.8" strokeLinejoin="round" />
      <text x="12" y="17.5" textAnchor="middle" fontSize="13" fontWeight="800" fill="#000" fontFamily="inherit">
        !
      </text>
    </svg>
  );
}
