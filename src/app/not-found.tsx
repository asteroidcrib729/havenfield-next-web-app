import { BrandDetail } from "@/components/brand-detail";
import Link from "next/link";
export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-28 text-center">
      <p className="text-xs tracking-widest text-brand uppercase">404 · A different path</p>
      <div className="flex justify-center">
        <BrandDetail />
      </div>
      <h1 className="mt-6 font-display text-5xl">This space isn’t here.</h1>
      <p className="mt-6 text-muted">The page may have moved, or the address may be incomplete.</p>
      <Link href="/" className="mt-10 inline-block bg-ink px-6 py-3 text-sm text-paper">
        Back to Havenfield
      </Link>
    </section>
  );
}
