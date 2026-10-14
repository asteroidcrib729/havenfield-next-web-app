import Link from "next/link";
export function Logo({ light = false }: { light?: boolean }) {
  return <Link href="/" aria-label="Havenfield Homes & perspectives — Home" className={`inline-flex items-center gap-3 ${light ? "text-paper" : "text-ink"}`}>
    <svg width="32" height="36" viewBox="0 0 32 36" fill="none" aria-hidden="true"><path d="M3 31V12L16 3l13 9v19M3 22h26M11 31V16h10v15" stroke="currentColor" strokeWidth="1.5"/><path d="M0 35h32" stroke="currentColor"/></svg>
    <span className="text-[17px] tracking-[0.17em] uppercase">Havenfield<span className="mt-1 block text-[8px] tracking-[0.34em]">Homes & perspectives</span></span>
  </Link>;
}
