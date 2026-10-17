"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "./logo";
const links = [
  ["Collection", "/properties"],
  ["Our approach", "/about"],
  ["Amenities", "/amenities"],
  ["Journal", "/journal"],
  ["Saved homes", "/saved"],
];
export function Header() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenPath(null);
        toggle.current?.focus();
      }
    }
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  if (pathname.startsWith("/admin")) return null;
  return (
    <header className="print:hidden relative z-30 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-6 lg:px-10">
        <Logo />
        <nav aria-label="Main navigation" className="hidden items-center gap-5 xl:gap-8 lg:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
              className={`text-xs transition-colors hover:text-brand ${pathname.startsWith(href) ? "text-brand" : "text-muted"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className="hidden items-center gap-5 border border-ink px-5 py-3 text-xs transition-colors hover:bg-ink hover:text-paper lg:inline-flex"
        >
          Start a conversation
          <ArrowUpRight size={15} />
        </Link>
        <button
          ref={toggle}
          type="button"
          className="p-2 lg:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpenPath(open ? null : pathname)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-line px-6 py-5 lg:hidden"
        >
          {[...links, ["Contact", "/contact"]].map(([label, href]) => (
            <Link
              onClick={() => setOpenPath(null)}
              key={href}
              href={href}
              className="block py-3 text-sm"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
