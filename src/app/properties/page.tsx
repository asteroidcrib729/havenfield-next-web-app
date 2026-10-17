import { getPublicProperties } from "@/server/properties";
import { propertySummary } from "@/lib/property-types";
import { Suspense } from "react";
import CollectionPending from "@/components/collection-pending";
import type { Metadata } from "next";
import { PropertyBrowser } from "@/components/property-browser";

export const metadata: Metadata = {
  title: "The collection",
  description:
    "Explore Havenfield’s fictional collection of considered homes, from coastal villas to city residences.",
  alternates: { canonical: "/properties" },
};

export default function PropertiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
      <div className="mb-12 max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand">The collection</p>
        <h1 className="mt-4 font-display text-5xl leading-tight sm:text-7xl">
          Places to make
          <br className="hidden sm:block" /> a life of your own.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          A small collection with a wide sense of possibility. Discover spaces shaped by light,
          landscape, and the everyday rituals that matter.
        </p>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Portfolio demonstration: every property, location, and guide price is fictional. No homes
          are offered for sale.
        </p>
      </div>
      <Suspense fallback={<CollectionPending />}>
        <CollectionResults />
      </Suspense>
    </div>
  );
}

async function CollectionResults() {
  const properties = (await getPublicProperties()).map(propertySummary);
  return <PropertyBrowser properties={properties} />;
}
