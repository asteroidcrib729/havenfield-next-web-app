import { getPublicProperties } from "@/server/properties";
import { PropertyCard } from "@/components/property-card";
import { headers } from "next/headers";
import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getPublishedPostBySlug, getPublishedPosts, getSlugRedirect } from "@/server/blog";
import { absoluteUrl, site } from "@/lib/site";
import { ArticleBody } from "@/components/article-body";

export const dynamic = "force-dynamic";
const findPost = cache(async function findPost(slug: string) {
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    const updated = await getSlugRedirect(slug);
    if (updated) permanentRedirect(`/journal/${updated}`);
    notFound();
  }
  return post;
});
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPost(slug);
  const canonical = post.canonicalUrl || absoluteUrl(`/journal/${post.slug}`);
  return {
    title: { absolute: post.seoTitle || `${post.title} | ${site.name}` },
    description: post.seoDescription || post.excerpt,
    alternates: { canonical },
    robots: { index: !post.noindex, follow: true },
    openGraph: {
      type: "article",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      url: canonical,
      images: [{ url: absoluteUrl(post.coverImage || "/media/interior.jpg"), alt: post.coverAlt }],
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: [absoluteUrl(post.coverImage || "/media/interior.jpg")],
    },
  };
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await findPost(slug);
  const related = (await getPublishedPosts({ category: post.category, limit: 4 })).posts
    .filter((item) => item.id !== post.id)
    .slice(0, 3);
  const homes = (await getPublicProperties()).filter((home) =>
    home.relatedStories?.includes(post.slug),
  );
  const canonical = post.canonicalUrl || absoluteUrl(`/journal/${post.slug}`);
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl(post.coverImage || "/media/interior.jpg"),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/brand/mark.svg") },
    },
    mainEntityOfPage: canonical,
    articleSection: post.category,
    keywords: post.tags.join(", "),
  };
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-20">
      <script
        nonce={(await headers()).get("x-nonce") || undefined}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <Link
        href="/journal"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand"
      >
        <ArrowLeft size={16} />
        Back to the journal
      </Link>
      <header className="mx-auto my-12 max-w-4xl text-center">
        <Link
          href={`/journal?category=${encodeURIComponent(post.category)}`}
          className="text-xs uppercase tracking-[0.2em] text-brand"
        >
          {post.category}
        </Link>
        <h1 className="mt-5 font-display text-4xl leading-tight sm:text-6xl lg:text-7xl">
          {post.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">{post.excerpt}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted">
          <span>By {post.author}</span>
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(
                new Date(post.publishedAt),
              )}
            </time>
          )}
          <span>{Math.max(1, Math.ceil(post.body.split(/\s+/).length / 220))} min read</span>
        </div>
      </header>
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-line">
        <Image
          src={post.coverImage || "/media/interior.jpg"}
          alt={post.coverAlt || "Concept illustration of a considered home interior"}
          unoptimized={post.coverImage.startsWith("https://")}
          fill
          priority
          quality={60}
          fetchPriority="high"
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover"
        />
      </div>
      <article className="mx-auto mt-12 max-w-3xl">
        <ArticleBody body={post.body} />
        {post.tags.length > 0 && (
          <nav
            aria-label="Article topics"
            className="mt-10 flex flex-wrap gap-2 border-t border-line pt-7"
          >
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/journal?tag=${encodeURIComponent(tag)}`}
                className="rounded-full border border-line px-4 py-2 text-xs hover:border-brand hover:text-brand"
              >
                {tag}
              </Link>
            ))}
          </nav>
        )}
        <p className="mt-8 text-xs leading-relaxed text-muted">
          Havenfield is a fictional portfolio concept. This article explores home and design ideas;
          it is not professional property or investment advice.
        </p>
      </article>
      {homes.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="font-display text-4xl">See the idea at home.</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Related fictional homes from the collection.
          </p>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {homes.map((home) => (
              <PropertyCard key={home.id} property={home} headingLevel={3} />
            ))}
          </div>
        </section>
      )}
      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-10">
          <h2 className="font-display text-4xl">Keep exploring.</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {related.map((item) => (
              <Link key={item.id} href={`/journal/${item.slug}`} className="group">
                <p className="text-xs text-brand">{item.category}</p>
                <h3 className="mt-3 font-display text-2xl group-hover:text-brand">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm">
                  Read story
                  <ArrowUpRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
