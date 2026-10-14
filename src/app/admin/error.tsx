"use client";
import Link from "next/link";
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="rounded-2xl border border-line bg-white p-8"><p className="mb-3 text-xs uppercase tracking-[.2em] text-brand">Editorial desk</p><h1 className="font-display text-3xl">We could not open this workspace.</h1><p role="alert" className="my-5 text-sm leading-7 text-muted">Try again in a moment. If the issue continues, ask the site owner to check the database and administrator configuration.</p><div className="flex flex-wrap gap-3"><button onClick={reset} className="rounded-full bg-ink px-5 py-3 text-sm text-white">Try again</button><Link href="/admin/login" className="rounded-full border border-line px-5 py-3 text-sm">Return to sign in</Link></div></section>;
}
