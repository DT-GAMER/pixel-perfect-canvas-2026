// Placeholder logo mark: open interlocking arcs. Replace with /logo.svg when supplied.
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none" strokeWidth="5" strokeLinecap="round">
      <path d="M24 6a18 18 0 1 0 18 18" className="stroke-paper" />
      <path d="M24 15a9 9 0 1 1-9 9" className="stroke-digital-lime" />
    </svg>
  );
}

export function Arcs({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" fill="none" strokeLinecap="round">
      <path d="M200 20a180 180 0 1 0 180 180" strokeWidth="28" className="stroke-paper/15" />
      <path d="M200 90a110 110 0 1 1-110 110" strokeWidth="24" className="stroke-digital-lime" />
      <path d="M200 150a50 50 0 1 0 50 50" strokeWidth="18" className="stroke-digital-teal" />
    </svg>
  );
}
