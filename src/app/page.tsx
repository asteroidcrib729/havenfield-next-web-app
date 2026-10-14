import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Compass, Leaf, Sun } from "lucide-react";
import { HeroFilm } from "@/components/hero-film";
import { PropertyCard } from "@/components/property-card";
import { SectionHeading } from "@/components/section-heading";
import { properties } from "@/content/properties";
import { getPublishedPosts } from "@/server/blog";
import type { BlogPost } from "@/lib/blog-types";
export const dynamic = "force-dynamic";
export default async function Home() {
  let posts: BlogPost[] = [];
  let journalUnavailable = false;
  try { posts = (await getPublishedPosts({limit:3})).posts; } catch { journalUnavailable=true; }
  return <>
    <section className="relative isolate min-h-[610px] overflow-hidden bg-ink text-white lg:min-h-[690px]">
      <HeroFilm/><div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/65 via-black/25 to-black/10"/>
      <div className="relative mx-auto flex max-w-7xl flex-col px-6 pt-24 pb-24 sm:pt-28 lg:px-10 lg:pt-32">
        <p className="mb-7 flex items-center gap-3 text-[10px] tracking-[0.24em] uppercase"><span className="h-px w-8 bg-white/70"/> A collection of considered homes</p>
        <h1 className="max-w-3xl font-display text-[54px] leading-[1.09] tracking-tight sm:text-7xl lg:text-[88px]">Room for a<br/><span className="italic">different rhythm.</span></h1>
        <p className="mt-7 max-w-sm text-sm leading-7 text-white/90">Places that bring you closer to what matters. Explore a fresh perspective on architecture, landscape, and everyday life.</p>
        <Link href="/properties" className="mt-9 inline-flex w-fit items-center gap-8 bg-paper px-6 py-4 text-xs text-ink transition-colors hover:bg-white">Explore the collection<ArrowUpRight size={17}/></Link>
        <div className="mt-16 flex items-center gap-4 text-[9px] tracking-[0.16em] uppercase text-white/75"><span className="h-px w-10 bg-white/50"/> Fictional homes. Real design curiosity.</div>
      </div>
    </section>
    <div className="border-b border-line"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-6 text-xs text-muted sm:flex-row lg:px-10"><p>Architecture with intention. Living with perspective.</p><Link href="/about" className="flex items-center gap-3 text-ink">Get to know Havenfield<ArrowRight size={14}/></Link></div></div>
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28"><div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><SectionHeading eyebrow="The collection · 01" title="Find your kind of quiet." description="A small collection of imagined places, each with its own character. Discover the space that speaks to your way of living."/><Link href="/properties" className="flex shrink-0 items-center gap-4 border-b border-ink pb-2 text-xs">View all homes<ArrowUpRight size={16}/></Link></div><div className="grid gap-x-7 gap-y-12 md:grid-cols-3">{properties.slice(0,3).map(property=><PropertyCard key={property.id} property={property}/>)}</div><p className="mt-8 text-[10px] text-muted">Illustrative properties and USD prices for this portfolio concept. No listings are offered for sale.</p></section>
    <section className="border-y border-line bg-soft/65"><div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 lg:py-24"><div className="flex flex-col justify-center"><SectionHeading eyebrow="Our perspective · 02" title="Good spaces make room for living." description="We look beyond the floor plan. The way daylight moves, a place to pause, the connection between inside and out—small decisions shape how a home feels."/><Link href="/about" className="mt-8 flex w-fit items-center gap-7 text-xs">Discover our approach<ArrowUpRight size={16}/></Link></div>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2"><div className="relative min-h-72 overflow-hidden sm:row-span-2"><Image src="/media/interior.jpg" alt="Original imagined living room with natural materials and generous daylight" fill sizes="(max-width: 1024px) 100vw, 35vw" className="object-cover"/><div className="absolute right-4 bottom-4 left-4 bg-paper/90 p-4 backdrop-blur-sm"><p className="text-[9px] tracking-widest uppercase text-brand">Spaces with soul</p><p className="mt-2 font-display text-2xl">Less noise. More life.</p></div></div>
      <div className="bg-paper p-7"><Sun size={22} strokeWidth={1}/><h3 className="mt-6 font-display text-2xl">Light, naturally.</h3><p className="mt-3 text-xs leading-6 text-muted">Welcoming spaces that follow the rhythm of the day.</p></div><div className="bg-ink p-7 text-paper"><Leaf size={22} strokeWidth={1}/><h3 className="mt-6 font-display text-2xl">Rooted in place.</h3><p className="mt-3 text-xs leading-6 text-paper/70">Materials and landscapes that belong together.</p></div></div>
    </div></section>
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28"><div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><SectionHeading eyebrow="The journal · 03" title="A little more perspective." description="Stories about thoughtful architecture, the places we share, and the rituals that make a home."/><Link href="/journal" className="flex shrink-0 items-center gap-4 border-b border-ink pb-2 text-xs">Read the journal<ArrowUpRight size={16}/></Link></div>
      {posts.length ? <div className="grid gap-9 md:grid-cols-3">{posts.map(post=><article key={post.id}><Link href={`/journal/${post.slug}`} className="group"><div className="relative aspect-[16/10] overflow-hidden bg-soft"><Image src={post.coverImage || '/media/interior.jpg'} alt={post.coverAlt || 'Havenfield architecture concept'} fill unoptimized={post.coverImage.startsWith('https://')} sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"/></div><p className="mt-5 text-[10px] tracking-widest uppercase text-brand">{post.category}</p><h3 className="mt-3 font-display text-2xl leading-snug">{post.title}</h3><p className="mt-3 text-xs leading-6 text-muted">{post.excerpt}</p><span className="mt-5 inline-flex items-center gap-3 text-xs">Read the story<ArrowUpRight size={14}/></span></Link></article>)}</div> : <div className="border border-line p-10 text-sm text-muted">{journalUnavailable?'The journal is temporarily unavailable. Please check back soon.':'The journal is taking shape. New perspectives will appear here.'}</div>}
    </section>
    <section className="mx-auto grid max-w-7xl gap-8 border-y border-line px-6 py-12 md:grid-cols-[auto_1fr_auto] md:items-center lg:px-10"><Compass size={36} strokeWidth={1}/><div><p className="font-display text-3xl">What does home mean to you?</p><p className="mt-3 text-xs leading-6 text-muted">Tell us about the space you have in mind. This demo saves your inquiry without sending email.</p></div><Link href="/contact" className="inline-flex w-fit items-center gap-7 bg-ink px-6 py-4 text-xs text-paper">Start a conversation<ArrowUpRight size={16}/></Link></section>
  </>;
}
