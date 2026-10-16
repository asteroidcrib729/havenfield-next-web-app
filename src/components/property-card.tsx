import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BedDouble, Expand } from "lucide-react";
import { formatPrice, type Property } from "@/content/properties";
export function PropertyCard({
  property,
  priority = false,
  collectionQuery = "",
}: {
  property: Property;
  priority?: boolean;
  collectionQuery?: string;
}) {
  return (
    <article className="group min-w-0">
      <Link
        href={`/properties/${property.slug}${collectionQuery ? `?collection=${encodeURIComponent(collectionQuery)}` : ""}`}
        className="block overflow-hidden bg-soft"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.image}
            alt={`${property.name}, an illustrative ${property.type.toLowerCase()} concept`}
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
          <Link
            href={`/properties/${property.slug}${collectionQuery ? `?collection=${encodeURIComponent(collectionQuery)}` : ""}`}
            className="font-display text-2xl"
          >
            {property.name}
          </Link>
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
    </article>
  );
}
