import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPropertyBySlug } from "@/server/properties";
import { formatPrice } from "@/lib/property-types";
import { FloorPlan } from "@/components/floor-plan";
import { PrintBrochure } from "@/components/print-brochure";
import { Logo } from "@/components/logo";
import { absoluteUrl } from "@/lib/site";
export const metadata: Metadata = {
  title: "Property brochure",
  robots: { index: false, follow: true },
};
export default async function Brochure({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params,
    home = await getPublicPropertyBySlug(slug);
  if (!home) notFound();
  return (
    <article className="mx-auto max-w-4xl px-5 py-10 print:max-w-none print:px-0 print:py-0">
      <nav
        aria-label="Brochure actions"
        className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden"
      >
        <Link href={`/properties/${home.slug}`} className="text-sm underline">
          Back to {home.name}
        </Link>
        <PrintBrochure />
      </nav>
      <div className="mb-7 border-b border-line pb-5">
        <Logo />
        <p className="mt-4 text-xs text-muted">
          A fictional property collection · Illustrative brochure
        </p>
      </div>
      <p className="text-xs uppercase tracking-widest text-brand">
        {home.type} · {home.location}
      </p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl print:text-3xl">{home.name}</h1>
      <p className="mt-4 text-sm">
        Fictional guide price {formatPrice(home.price)} · {home.bedrooms} bedrooms ·{" "}
        {home.bathrooms} bathrooms · {home.area} m²
      </p>
      <div className="relative mt-7 aspect-[16/8] overflow-hidden rounded-xl print:mt-4">
        <Image
          src={home.image}
          alt={home.imageAlt || home.name + " architectural concept"}
          fill
          sizes="(max-width:896px) 100vw, 896px"
          unoptimized={home.image.startsWith("https://")}
          className="object-cover"
          style={{ objectPosition: `${home.focalX ?? 50}% ${home.focalY ?? 50}%` }}
        />
      </div>
      <p className="mt-5 text-sm leading-7">{home.description}</p>
      <h2 className="mt-6 font-display text-2xl">Thoughtful details</h2>
      <ul className="mt-3 grid list-inside list-disc gap-2 text-sm sm:grid-cols-2 print:grid-cols-2">
        {home.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <FloorPlan property={home} />
      <p className="mt-7 border-t border-line pt-4 text-xs leading-6 text-muted">
        All properties, places, images, plans and prices are illustrative. No home is offered for
        sale and no appointment is booked. Current property page:{" "}
        <span className="wrap-anywhere">{absoluteUrl(`/properties/${home.slug}`)}</span>
      </p>
    </article>
  );
}
