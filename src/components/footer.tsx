"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./logo";
export function Footer() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <footer className="print:hidden mt-24 bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 border-b border-paper/20 pb-14 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-7 max-w-sm text-sm leading-7 text-paper/65">
              Thoughtful spaces. Unhurried stories. A fresh perspective on what it means to feel at
              home.
            </p>
          </div>
          <div>
            <p className="mb-5 text-[10px] tracking-[0.2em] uppercase text-paper/70">Explore</p>
            {[
              ["The collection", "/properties"],
              ["Our approach", "/about"],
              ["The journal", "/journal"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="block py-2 text-sm">
                {label}
              </Link>
            ))}
          </div>
          <div>
            <p className="mb-5 text-[10px] tracking-[0.2em] uppercase text-paper/70">Let’s talk</p>
            <Link href="/contact" className="flex items-center gap-4 text-sm">
              Make room for something new
              <ArrowUpRight size={16} />
            </Link>
            <p className="mt-6 text-xs leading-6 text-paper/55">
              Havenfield is an independent portfolio concept. All properties, places and prices are
              illustrative.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-6 pt-7 text-[10px] text-paper/55 sm:flex-row">
          <p>© {new Date().getFullYear()} Havenfield · A fictional property collection</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Demo terms</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/studio-demo">Studio tour</Link>
            <Link href="/admin/login">Editorial studio</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
