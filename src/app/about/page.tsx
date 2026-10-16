import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Our perspective",
  description:
    "The Havenfield concept: considered homes, meaningful surroundings, and architecture for everyday life.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand">Our perspective</p>
          <h1 className="mt-4 font-display text-5xl leading-tight sm:text-7xl">
            A good home makes room for living.
          </h1>
          <p className="mt-7 text-lg leading-relaxed text-muted">
            Havenfield begins with a simple question: what makes a place feel like it belongs to
            you? Sometimes it is morning light across a kitchen table. Sometimes it is the quiet of
            a sheltered courtyard.
          </p>
          <p className="mt-5 leading-relaxed text-muted">
            This fictional property studio explores homes through those small, lasting experiences.
            Each concept puts everyday comfort alongside the character of its surroundings.
          </p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Image
            src="/media/courtyard.jpg"
            alt="Concept illustration of a sunlit courtyard and quiet contemporary home"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <p className="absolute bottom-5 left-5 rounded-full bg-paper/95 px-4 py-2 text-xs">
            A fictional studio. A considered point of view.
          </p>
        </div>
      </section>
      <section className="border-y border-line bg-white/40">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-brand">What we value</p>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Room to breathe",
                text: "Useful proportions, a clear connection to the outdoors, and places to pause. Comfort is measured in how a room feels through a whole day.",
              },
              {
                number: "02",
                title: "Materials with meaning",
                text: "Warm timber, tactile stone, and a restrained palette. We explore finishes that bring depth to a space without asking it to shout.",
              },
              {
                number: "03",
                title: "An everyday kind of beauty",
                text: "A home should welcome muddy shoes, shared meals, and a book left open. Our concepts leave space for the life that comes after the photograph.",
              },
            ].map((item) => (
              <article key={item.number}>
                <p className="text-sm text-brand">{item.number}</p>
                <h2 className="mt-5 font-display text-3xl">{item.title}</h2>
                <p className="mt-4 leading-relaxed text-muted">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <h2 className="font-display text-4xl sm:text-5xl">An original portfolio concept.</h2>
        <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-muted">
          Havenfield is a software and design demonstration, created to explore a contemporary
          property experience and an editorial publishing workflow. It is not a real estate
          business. Its identity, stories, homes, and locations are invented, and its visual assets
          are concept illustrations.
        </p>
        <Link
          href="/properties"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-sm text-paper hover:bg-brand"
        >
          Explore the collection
          <ArrowUpRight size={17} />
        </Link>
      </section>
    </div>
  );
}
