import type { BlogPost } from "@/lib/blog-types";
import { HomeActions, HomeChoiceLinks } from "@/components/home-actions";
import { getPublishedPostBySlug } from "@/server/blog";
import { collectionReturn } from "@/lib/property-filters";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bath, BedDouble, Check, Expand, MapPin } from "lucide-react";
import { getPublicProperties, getPublicPropertyBySlug } from "@/server/properties";
import { propertySummary } from "@/lib/property-types";
import { PropertyGallery } from "@/components/property-gallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);
  if (!property) notFound();
  return {
    title: property.name,
    description: property.description,
    alternates: { canonical: `/properties/${slug}` },
    openGraph: {
      title: property.name,
      description: property.description,
      images: [property.image],
    },
  };
}
export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ collection?: string }>;
}) {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);
  if (!property) notFound();
  const candidates: (BlogPost | null)[] = await Promise.all(
    (property.relatedStories || []).map((slug) => getPublishedPostBySlug(slug)),
  ).catch(() => []);
  const stories = candidates.filter((post): post is BlogPost => post !== null).slice(0, 2);
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-20">
      <Link
        href={collectionReturn((await searchParams).collection)}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand"
      >
        <ArrowLeft size={16} />
        Back to the collection
      </Link>
      <div className="my-9 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand">
            {property.type} · {property.region}
          </p>
          <h1 className="mt-3 font-display text-5xl sm:text-6xl">{property.name}</h1>
          <p className="mt-4 flex items-center gap-2 text-muted">
            <MapPin size={16} aria-hidden="true" />
            {property.location}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted">Fictional guide price</p>
          <p className="mt-1 font-display text-3xl">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(property.price)}
          </p>
        </div>
      </div>
      <div className="mb-7">
        <HomeActions id={property.id} name={property.name} />
      </div>
      <PropertyGallery
        images={property.gallery.length ? property.gallery : [property.image]}
        name={property.name}
        details={property.galleryItems}
      />
      <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex flex-wrap gap-6 border-b border-line pb-7 text-sm">
            <span className="flex items-center gap-2">
              <BedDouble size={18} />
              {property.bedrooms} bedrooms
            </span>
            <span className="flex items-center gap-2">
              <Bath size={18} />
              {property.bathrooms} bathrooms
            </span>
            <span className="flex items-center gap-2">
              <Expand size={18} />
              {property.area.toLocaleString()} m²
            </span>
          </div>
          <h2 className="mt-8 font-display text-3xl">A home with its own rhythm.</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">{property.description}</p>
          <div className="mt-9 space-y-8">
            {property.stories?.map(({ title, text }) => (
              <section key={title}>
                <h2 className="font-display text-2xl">{title}</h2>
                <p className="mt-3 leading-7 text-muted">{text}</p>
              </section>
            ))}
          </div>
          <h2 className="mt-9 font-display text-2xl">Thoughtful details</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {property.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 shrink-0 text-brand" size={16} aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <aside className="self-start rounded-2xl border border-line bg-white/60 p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-brand">Start a conversation</p>
          <h2 className="mt-4 font-display text-3xl">Curious about this space?</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Try the inquiry workflow with this home already selected. Submissions are demonstration
            records; there is no sales team or booking service.
          </p>
          <Link
            href={`/contact?property=${encodeURIComponent(property.id)}`}
            className="mt-7 inline-flex rounded-full bg-ink px-6 py-3 text-sm text-paper hover:bg-brand"
          >
            Inquire about this home
          </Link>
          <p className="mt-5 text-xs leading-relaxed text-muted">
            All specifications and images illustrate a fictional concept. They are not survey,
            valuation, or investment advice.
          </p>
        </aside>
      </div>
      <section className="mt-14 border-t border-line pt-10">
        <h2 className="font-display text-3xl">Another perspective</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {stories.map((post) => (
            <Link
              key={post.id}
              href={`/journal/${post.slug}`}
              className="rounded-xl border border-line p-6"
            >
              <p className="text-xs text-brand">{post.category}</p>
              <h3 className="mt-3 font-display text-2xl">{post.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{post.excerpt}</p>
            </Link>
          ))}
        </div>
        {!stories.length && (
          <Link href="/journal" className="mt-5 inline-block min-h-11 underline underline-offset-4">
            Explore the journal
          </Link>
        )}
      </section>
      <div className="mt-10">
        <HomeChoiceLinks properties={(await getPublicProperties()).map(propertySummary)} />
      </div>
    </div>
  );
}
