import { visualAlt } from "@/content/visuals";
import Image from "next/image";
import { HomeActions } from "./home-actions";
import Link from "next/link";
import { ArrowUpRight, BedDouble, Expand } from "lucide-react";
import { formatPrice, type Property } from "@/lib/property-types";
export function PropertyCard({
  property,
  priority = false,
  collectionQuery = "",
  headingLevel = 2,
}: {
  property: Property;
  priority?: boolean;
  collectionQuery?: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <article className="group min-w-0">
      <Link
        href={`/properties/${property.slug}${collectionQuery ? `?collection=${encodeURIComponent(collectionQuery)}` : ""}`}
        className="block overflow-hidden bg-soft"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.image}
            alt={property.imageAlt || visualAlt[property.image] || property.name}
            unoptimized={property.image.startsWith("https://")}
            style={{
              objectPosition: (property.focalX ?? 50) + "% " + (property.focalY ?? 50) + "%",
            }}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
          />
          <span className="absolute top-4 left-4 bg-paper/90 px-3 py-1.5 text-[9px] tracking-widest uppercase backdrop-blur-sm">
            {property.type}
          </span>
        </div>
      </Link>
      <div className="flex items-start justify-between gap-3 pt-5">
        <div>
          <p className="mb-2 text-[10px] tracking-widest uppercase text-muted">
            {property.location} · {property.region}
          </p>
          <Heading>
            {" "}
            <Link
              href={`/properties/${property.slug}${collectionQuery ? `?collection=${encodeURIComponent(collectionQuery)}` : ""}`}
              className="font-display text-2xl"
            >
              {property.name}
            </Link>
          </Heading>
        </div>
        <Link
          href={`/properties/${property.slug}${collectionQuery ? `?collection=${encodeURIComponent(collectionQuery)}` : ""}`}
          className="mt-3 rounded-full border border-line p-2 transition-colors group-hover:bg-ink group-hover:text-paper"
          aria-label={`View ${property.name}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <span className="text-sm">{formatPrice(property.price)}</span>
        <div className="flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <BedDouble size={14} />
            {property.bedrooms} beds
          </span>
          <span className="flex items-center gap-1.5">
            <Expand size={13} />
            {property.area} m²
          </span>
        </div>
      </div>
      <div className="mt-4">
        <HomeActions id={property.id} name={property.name} />
      </div>
    </article>
  );
}
