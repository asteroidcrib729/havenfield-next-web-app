"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { adminApi, buttonClass, fieldClass } from "./api";
import type { ManagedProperty } from "@/lib/property-types";
export function PropertyList() {
  const [items, setItems] = useState<ManagedProperty[] | null>(null),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("");
  useEffect(() => {
    let active = true;
    adminApi<{ properties: ManagedProperty[] }>("/api/admin/properties")
      .then((data) => {
        if (active) setItems(data.properties);
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      });
    return () => {
      active = false;
    };
  }, []);
  const visible = (items || []).filter(
    (item) =>
      (!status || item.status === status) &&
      (item.name + " " + item.location).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section className="min-w-0 space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <h1 className="font-display text-4xl">Properties</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Manage the fictional collection. Draft homes stay out of public pages, search, saved
            lists and new inquiries.
          </p>
        </div>
        <Link href="/admin/properties/new" className={buttonClass}>
          New property
        </Link>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Search properties
          <input
            className={"mt-2 " + fieldClass}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="text-sm">
          Property status
          <select
            className={"mt-2 " + fieldClass}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>
      {!items && !error ? (
        <p role="status">Loading properties...</p>
      ) : (
        <>
          <p className="text-sm text-muted">{visible.length} properties</p>
          <div className="grid min-w-0 gap-5 md:grid-cols-2">
            {visible.map((item) => (
              <article
                key={item.id}
                className="min-w-0 rounded-2xl border border-line bg-white p-5"
              >
                <Image
                  src={item.galleryItems[0].url}
                  alt=""
                  width={480}
                  height={320}
                  unoptimized={item.galleryItems[0].url.startsWith("https://")}
                  className="aspect-[3/2] w-full rounded-xl object-cover"
                  style={{
                    objectPosition:
                      item.galleryItems[0].focalX + "% " + item.galleryItems[0].focalY + "%",
                  }}
                />
                <p className="mt-4 text-xs uppercase tracking-wider text-brand">
                  {item.status} · Version {item.version}
                </p>
                <h2 className="mt-3 font-display text-2xl">{item.name}</h2>
                <p className="mt-3 text-sm text-muted">{item.location}</p>
                <Link
                  className="mt-4 inline-flex min-h-11 items-center text-sm underline underline-offset-4"
                  href={"/admin/properties/" + item.id}
                >
                  Edit {item.name}
                </Link>
              </article>
            ))}
          </div>
          {!visible.length && (
            <p className="rounded-xl border border-dashed border-line p-8 text-sm">
              No properties match. Clear the filters or create a draft.
            </p>
          )}
        </>
      )}
    </section>
  );
}
