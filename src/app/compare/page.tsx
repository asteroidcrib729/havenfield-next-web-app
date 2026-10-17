import { getPublicProperties } from "@/server/properties";
import { propertySummary } from "@/lib/property-types";
import type { Metadata } from "next";
import { CompareHomes } from "@/components/home-shortlist";
export const metadata: Metadata = {
  title: "Compare homes",
  description: "Compare up to three fictional Havenfield homes side by side.",
  alternates: { canonical: "/compare" },
  robots: { index: false, follow: true },
};
export default async function ComparePage() {
  const properties = (await getPublicProperties()).map(propertySummary);
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
      <p className="text-xs tracking-[0.2em] uppercase text-brand">A different perspective</p>
      <h1 className="mt-4 mb-10 font-display text-5xl sm:text-7xl">Find what matters to you.</h1>
      <CompareHomes properties={properties} />
    </div>
  );
}
