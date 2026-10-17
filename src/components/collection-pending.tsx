import { BrandDetail } from "@/components/brand-detail";
export default function Loading() {
  return (
    <div role="status" className="mx-auto max-w-7xl px-6 py-28">
      <BrandDetail />
      <p className="font-display text-3xl">Finding a little room…</p>
      <p className="mt-4 text-sm text-muted">Loading the collection.</p>
    </div>
  );
}
