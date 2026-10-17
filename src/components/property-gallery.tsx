"use client";

import Image from "next/image";
import { visualAlt } from "@/content/visuals";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function PropertyGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;

  return (
    <div
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          setActive(
            (current) =>
              (current + (event.key === "ArrowRight" ? 1 : -1) + images.length) % images.length,
          );
        }
      }}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-line">
        <Image
          src={images[active]}
          alt={visualAlt[images[active]] || `${name}, concept view ${active + 1}`}
          fill
          priority={active === 0}
          sizes="(max-width: 768px) 100vw, 75vw"
          className="object-cover"
        />
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-5 flex items-center justify-between px-5">
            <button
              aria-label="Previous photograph"
              className="rounded-full bg-paper p-3 text-ink shadow-sm"
              onClick={() => setActive((active + images.length - 1) % images.length)}
            >
              <ArrowLeft size={20} />
            </button>
            <p aria-live="polite" className="rounded-full bg-ink/80 px-4 py-2 text-xs text-white">
              {active + 1} / {images.length}
            </p>
            <button
              aria-label="Next photograph"
              className="rounded-full bg-paper p-3 text-ink shadow-sm"
              onClick={() => setActive((active + 1) % images.length)}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs leading-6 text-muted">
        Four AI-generated views explore the same fictional home. They are design concepts, not
        photographs of a real property.
      </p>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {images.map((source, index) => (
            <button
              key={`${source}-${index}`}
              onClick={() => setActive(index)}
              aria-label={`Show photograph ${index + 1} of ${name}`}
              aria-pressed={active === index}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 ${active === index ? "border-brand" : "border-transparent"}`}
            >
              <Image src={source} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
