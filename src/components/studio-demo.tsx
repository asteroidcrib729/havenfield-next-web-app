"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { properties } from "@/content/properties";
import { formatPrice } from "@/lib/property-types";
const draft = {
  title: "A quieter kind of arrival",
  excerpt:
    "A sheltered threshold, useful storage and a clear route indoors can make an ordinary arrival feel considered.",
  category: "Design notes",
  seoTitle: "A quieter kind of arrival | Havenfield",
  seoDescription:
    "A fictional editorial sample about thresholds, daily routines and a useful place to pause.",
  body: "Arrival sets the rhythm of a home. Imagine carrying shopping through the door: a sheltered step, a place for bags and a clear route to the kitchen make the transition easier. This fixed sample introduces the editorial workflow without reading any private article.",
};
const steps = ["Properties", "Journal", "Media", "Inquiries"];
const descriptions = [
  "Maintain a home from private draft to public listing. Version checks protect edits; earlier revisions can be deliberately restored.",
  "Prepare stories, review search metadata and publish when ready. The private studio also supports scheduling and recovery drafts.",
  "Organize owned images, describe them for readers and adjust the focal point. Reference tracking protects images still used by content.",
  "Review requests, record internal notes and track the conversation. The private inbox supports filters, export and retention.",
];
export function StudioDemo() {
  const [step, setStep] = useState(0),
    [homeId, setHomeId] = useState(properties[0].id),
    [preview, setPreview] = useState(false);
  const home = properties.find((p) => p.id === homeId)!;
  return (
    <div className="mx-auto max-w-7xl space-y-9 px-5 py-12 sm:px-8 lg:py-20">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-brand">Inside Havenfield</p>
        <h1 className="mt-4 font-display text-4xl sm:text-6xl">A considered editorial desk.</h1>
        <p className="mt-5 leading-7 text-muted">
          Explore how homes, stories and conversations are managed behind the collection.
        </p>
      </div>
      <p className="rounded-xl border border-line bg-soft p-5 text-sm leading-6">
        Read-only demonstration. All records below are fictional samples, separate from the private
        studio. Nothing you explore here changes the website or submits an inquiry.
      </p>
      <nav aria-label="Studio tour sections" className="flex flex-wrap gap-3">
        {steps.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-current={step === i ? "step" : undefined}
            onClick={() => {
              setStep(i);
              setPreview(false);
            }}
            className={`rounded-full border px-5 py-3 text-sm ${step === i ? "border-ink bg-ink text-paper" : "border-line hover:bg-soft"}`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </nav>
      <section
        aria-labelledby="tour-heading"
        className="grid min-w-0 gap-8 lg:grid-cols-[.7fr_1.3fr]"
      >
        <div>
          <p role="status" className="text-xs text-brand">
            Step {step + 1} of {steps.length}
          </p>
          <h2 id="tour-heading" className="mt-3 font-display text-3xl">
            {steps[step]}
          </h2>
          <p className="mt-4 leading-7 text-muted">{descriptions[step]}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((n) => n - 1)}
              className="rounded-full border border-line px-5 py-3 text-sm disabled:opacity-40"
            >
              Previous section
            </button>
            <button
              type="button"
              disabled={step === 3}
              onClick={() => setStep((n) => n + 1)}
              className="rounded-full border border-line px-5 py-3 text-sm disabled:opacity-40"
            >
              Next section
            </button>
          </div>
        </div>
        <div className="min-w-0 space-y-5 rounded-2xl border border-line bg-white p-5 sm:p-8">
          {step === 0 && (
            <>
              <label className="block text-sm">
                Sample home
                <select
                  className="mt-2 w-full rounded-lg border border-line bg-paper p-3"
                  value={homeId}
                  onChange={(e) => setHomeId(e.target.value)}
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
                <Image
                  src={home.image}
                  alt={home.name + " architectural concept"}
                  fill
                  sizes="(max-width:1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
              <h3 className="font-display text-2xl">{home.name}</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted">Sample visibility</dt>
                  <dd>Published</dd>
                </div>
                <div>
                  <dt className="text-muted">Illustrative price</dt>
                  <dd>{formatPrice(home.price)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Bedrooms / bathrooms</dt>
                  <dd>
                    {home.bedrooms} / {home.bathrooms}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Gallery</dt>
                  <dd>{home.gallery.length} concept views</dd>
                </div>
              </dl>
              <p className="text-sm leading-6 text-muted">{home.description}</p>
              <details className="border-t border-line pt-4">
                <summary className="cursor-pointer text-sm">How version protection works</summary>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Each private save checks the version you opened. If another edit has already been
                  saved, the studio asks you to reload instead of silently overwriting it.
                </p>
              </details>
            </>
          )}
          {step === 1 && (
            <>
              <p className="text-xs uppercase tracking-widest text-brand">Sample editorial draft</p>
              <h3 className="font-display text-3xl">{draft.title}</h3>
              <p className="text-sm leading-6 text-muted">{draft.excerpt}</p>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted">Category</dt>
                  <dd>{draft.category}</dd>
                </div>
                <div>
                  <dt className="text-muted">Search title</dt>
                  <dd>{draft.seoTitle}</dd>
                </div>
                <div>
                  <dt className="text-muted">Search description</dt>
                  <dd>{draft.seoDescription}</dd>
                </div>
              </dl>
              <button
                type="button"
                aria-expanded={preview}
                onClick={() => setPreview((v) => !v)}
                className="rounded-full border border-line px-5 py-3 text-sm"
              >
                {preview ? "Hide sample excerpt" : "Preview sample excerpt"}
              </button>
              {preview && (
                <div className="rounded-xl bg-paper p-5">
                  <p className="text-sm leading-7">{draft.body.split("\\n")[0]}</p>
                  <p className="mt-4 text-xs text-muted">
                    Sample excerpt only. The private editor renders the complete Markdown article.
                  </p>
                </div>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <h3 className="font-display text-2xl">A coherent home, four views.</h3>
              <div className="grid grid-cols-2 gap-3">
                {home.gallery.map((src, i) => (
                  <div key={src}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Image
                        src={src}
                        alt={home.name + " concept view " + (i + 1)}
                        fill
                        sizes="(max-width:1024px) 45vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      Concept view {i + 1} · repository image
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-sm leading-6 text-muted">
                The private library offers alt text, collections, focal points, crop previews and
                reference-aware deletion. Repository images remain read-only.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-xs uppercase tracking-widest text-brand">
                Synthetic sample · viewing requested
              </p>
              <h3 className="font-display text-2xl">Alex Example</h3>
              <p className="text-sm wrap-anywhere">alex@example.test · The Courtyard House</p>
              <blockquote className="border-l-2 border-brand pl-4 text-sm leading-7">
                I would like to understand the courtyard layout and how the living spaces connect.
              </blockquote>
              <div className="rounded-xl bg-paper p-5">
                <h4 className="text-sm">Sample internal note</h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Prepare the illustrative brochure and floor plan for the next conversation.
                </p>
              </div>
              <p className="text-xs leading-6 text-muted">
                No appointment has been booked. This fixed example has no connection to real inquiry
                records.
              </p>
            </>
          )}
        </div>
      </section>
      <Link href="/properties" className="inline-block border-b border-ink pb-2 text-sm">
        Explore the public collection →
      </Link>
    </div>
  );
}
