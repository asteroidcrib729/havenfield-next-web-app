"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { MediaItem } from "@/lib/media-types";
import { adminApi, buttonClass, fieldClass } from "./api";
import type { repositoryAssets } from "@/content/asset-library";
type Asset = (typeof repositoryAssets)[number];
type Reference = { id: string; title: string; kind: string; href: string };
export function RepositoryLibrary({
  onSelect,
}: {
  onSelect?: (item: MediaItem, decorative: boolean) => void;
}) {
  const [items, setItems] = useState<Asset[]>([]),
    [query, setQuery] = useState(""),
    [collection, setCollection] = useState(""),
    [page, setPage] = useState(1),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [references, setReferences] = useState<Reference[]>([]),
    [inspected, setInspected] = useState("");
  useEffect(() => {
    let active = true;
    adminApi<{ items: Asset[] }>("/api/admin/assets")
      .then((data) => {
        if (active) {
          setItems(data.items);
          setLoading(false);
        }
      })
      .catch((reason) => {
        if (active) {
          setError(reason.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  const filtered = items.filter(
    (item) =>
      (!collection || item.collection === collection) &&
      (item.alt + " " + item.collection).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section className="min-w-0 space-y-5" aria-label="Repository image library">
      <h2 className="font-display text-3xl">Repository images</h2>
      <p className="text-sm leading-6 text-muted">
        Original source-controlled images. Reuse them in articles and properties; files and their
        metadata are read-only here. Upload deletion cannot remove these assets.
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Search repository images
          <input
            className={"mt-2 " + fieldClass}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="text-sm">
          Repository collection
          <select
            className={"mt-2 " + fieldClass}
            value={collection}
            onChange={(event) => {
              setCollection(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All collections</option>
            {[...new Set(items.map((item) => item.collection))].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <p role="status">Loading repository images...</p>
      ) : (
        <>
          <p className="text-xs text-muted">{filtered.length} images</p>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.slice((page - 1) * 12, page * 12).map((item) => (
              <article
                key={item.id}
                className="min-w-0 space-y-3 rounded-2xl border border-line bg-white p-4"
              >
                <Image
                  src={item.url}
                  alt={item.alt}
                  width={400}
                  height={267}
                  sizes="(max-width:640px) 100vw, 400px"
                  className="aspect-[3/2] w-full rounded-xl object-cover"
                />
                <p className="text-xs uppercase text-brand">{item.collection} · Repository</p>
                <h3 className="text-sm">{item.alt}</h3>
                <div className="flex flex-wrap gap-3">
                  {onSelect && (
                    <button
                      className={buttonClass}
                      onClick={() =>
                        onSelect(
                          {
                            ...item,
                            objectKey: item.url,
                            storage: "repository",
                            bytes: 0,
                            owner: "Havenfield",
                            createdAt: "2026-10-17",
                            state: "active",
                            references: 0,
                            cleanupEligible: false,
                            version: 1,
                          },
                          false,
                        )
                      }
                    >
                      Use image
                    </button>
                  )}
                  <button
                    className="min-h-11 px-2 text-xs underline"
                    onClick={async () => {
                      try {
                        const data = await adminApi<{ references: Reference[] }>(
                          "/api/admin/assets?url=" + encodeURIComponent(item.url),
                        );
                        setReferences(data.references);
                        setInspected(item.id);
                        setError("");
                      } catch (reason) {
                        setError(
                          reason instanceof Error ? reason.message : "Could not load usage.",
                        );
                      }
                    }}
                  >
                    View references
                  </button>
                </div>
                {inspected === item.id && (
                  <div className="text-xs">
                    {references.length ? (
                      <ul className="space-y-2">
                        {references.map((reference, index) => (
                          <li key={reference.kind + reference.id + index}>
                            <Link className="underline" href={reference.href}>
                              {reference.title}
                            </Link>{" "}
                            ({reference.kind})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No current or retained references.</p>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
          {!filtered.length && (
            <p className="rounded-xl border border-dashed border-line p-6 text-sm">
              No repository images match these filters.
            </p>
          )}
          <div className="flex gap-4">
            <button
              className={buttonClass}
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous repository images
            </button>
            <button
              className={buttonClass}
              disabled={page * 12 >= filtered.length}
              onClick={() => setPage((value) => value + 1)}
            >
              Next repository images
            </button>
          </div>
        </>
      )}
    </section>
  );
}
