import logoDark from "@/assets/c8-logo-dark.svg.asset.json";

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return <img src={logoDark.url} alt="" className={`${className} rounded-sm object-cover`} width={48} height={48} />;
}

export function Arcs({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" fill="none" strokeLinecap="round">
      <path d="M198 30a170 170 0 1 0 0 340" strokeWidth="30" className="arc-draw stroke-paper/15" />
      <path d="M225 92a108 108 0 1 1-65 195" strokeWidth="26" className="arc-draw arc-delay stroke-digital-lime" />
      <path d="M232 154a52 52 0 1 0 0 92" strokeWidth="20" className="arc-draw arc-delay-long stroke-paper" />
    </svg>
  );
}
