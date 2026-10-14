import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Leaf, Sun, Waves, Coffee, Footprints, BookOpen } from "lucide-react";

export const metadata: Metadata = {title: "Life around home", description: "Explore the fictional Havenfield approach to courtyards, shared gardens, flexible spaces, and everyday wellbeing.", alternates: { canonical: '/amenities' } };
const details = [
  { icon: Leaf, title: "A little more green", text: "Sheltered planting and shared gardens offer a softer threshold between home and the wider world." },
  { icon: Sun, title: "Light through the day", text: "Thoughtful openings and outdoor nooks explore how daylight can shape the pace of everyday routines." },
  { icon: Waves, title: "Time to reset", text: "Selected concepts include a pool or a terrace for a quiet evening. Each home lists its own imagined features." },
  { icon: Coffee, title: "Places to gather", text: "Generous kitchen tables, shared courtyards, and adaptable living areas make space for unhurried company." },
  { icon: Footprints, title: "Room to move", text: "Connected pathways and convenient storage help make walking, cycling, and getting outdoors part of the day." },
  { icon: BookOpen, title: "A corner of your own", text: "Flexible rooms can become a reading nook, a place to work, or a creative space as daily needs change." },
];
export default function AmenitiesPage() {
  return <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24"><div className="max-w-3xl"><p className="text-xs uppercase tracking-[0.2em] text-brand">Life around home</p><h1 className="mt-4 font-display text-5xl leading-tight sm:text-7xl">The spaces between<br /> the everyday.</h1><p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">A considered home extends beyond its front door. Our concepts explore the gardens, gathering places, and quiet corners that make daily life feel fuller.</p></div><div className="relative mt-12 aspect-[16/8] overflow-hidden rounded-2xl"><Image src="/media/woodland.jpg" alt="Illustrated woodland home surrounded by a green landscape" fill priority sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover" /></div><div className="my-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{details.map(({ icon: Icon, title, text }) => <article key={title}><div className="inline-flex rounded-full bg-brand/10 p-4 text-brand"><Icon size={23} strokeWidth={1.5} aria-hidden="true" /></div><h2 className="mt-5 font-display text-3xl">{title}</h2><p className="mt-4 leading-relaxed text-muted">{text}</p></article>)}</div><div className="flex flex-col justify-between gap-6 rounded-2xl border border-line bg-white/50 p-8 md:flex-row md:items-center"><div><h2 className="font-display text-3xl">Find the details that feel like you.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">Features vary across this fictional collection. The individual home pages describe each concept; these illustrations are not promises of real facilities.</p></div><Link href="/properties" className="shrink-0 self-start rounded-full bg-ink px-6 py-3 text-sm text-paper hover:bg-brand">Browse homes</Link></div></div>;
}
