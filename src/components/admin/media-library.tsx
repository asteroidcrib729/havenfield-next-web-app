"use client";
import { MediaDetails } from "./media-details";
import { RepositoryLibrary } from "./repository-library";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MediaItem, MediaList } from "@/lib/media-types";
import { adminApi, buttonClass, fieldClass } from "./api";
import { ConfirmationDialog } from "./confirmation-dialog";

export function MediaLibrary({
  onSelect,
}: {
  onSelect?: (item: MediaItem, decorative: boolean) => void;
}) {
  const [source, setSource] = useState<"uploads" | "repository">("uploads"),
    [collection, setCollection] = useState(""),
    [editing, setEditing] = useState<MediaItem | null>(null),
    [notice, setNotice] = useState("");
  const [data, setData] = useState<MediaList | null>(null),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [unused, setUnused] = useState(false),
    [reload, setReload] = useState(0);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [alt, setAlt] = useState(""),
    [decorative, setDecorative] = useState(false),
    [target, setTarget] = useState<MediaItem | null>(null);
  const [references, setReferences] = useState<
      { id: string; title: string; kind: string; href?: string }[]
    >([]),
    [inspected, setInspected] = useState<string | null>(null);
  const upload = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (source !== "uploads") return;
    let active = true;
    const timer = setTimeout(() => {
      adminApi<MediaList>(
        `/api/admin/media?query=${encodeURIComponent(query)}&page=${page}&unused=${unused}&collection=${encodeURIComponent(collection)}`,
      )
        .then((result) => {
          if (active) {
            setData(result);
            setError("");
          }
        })
        .catch((reason) => {
          if (active) setError(reason.message);
        });
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, page, unused, reload, collection, source]);
  async function add() {
    const file = upload.current?.files?.[0];
    if (!file) {
      setError("Choose an image to upload.");
      return;
    }
    if (!alt.trim() && !decorative) {
      setError("Describe the image or explicitly mark it decorative.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("alt", decorative ? "" : alt);
      await adminApi("/api/admin/media", { method: "POST", body });
      if (upload.current) upload.current.value = "";
      setPage(1);
      setReload((n) => n + 1);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Upload failed; your file selection is preserved.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!target) return;
    setBusy(true);
    try {
      await adminApi(`/api/admin/media/${target.id}${unused ? "?cleanup=true" : ""}`, {
        method: "DELETE",
      });
      setTarget(null);
      setReload((n) => n + 1);
    } catch (reason) {
      setTarget(null);
      setError(
        reason instanceof Error ? reason.message : "Deletion failed; retry after checking storage.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function inspect(item: MediaItem) {
    try {
      const result = await adminApi<{ references: typeof references }>(
        `/api/admin/media/${item.id}`,
      );
      setReferences(result.references);
      setInspected(item.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load references.");
    }
  }
  if (source === "repository")
    return (
      <div className="space-y-5">
        <button className={buttonClass} onClick={() => setSource("uploads")}>
          Show uploaded images
        </button>
        <RepositoryLibrary onSelect={onSelect} />
      </div>
    );
  return (
    <section className="min-w-0 space-y-6" aria-label="Media library">
      <div>
        <h1 className="font-display text-4xl">Media library</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Images are public, including those used in private drafts. Unreferenced images remain
          available until you review and delete them. Cleanup has a seven-day grace period.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <button className={buttonClass} onClick={() => setSource("repository")}>
          Show repository images
        </button>
        <label className="min-w-0 text-sm">
          Filter image collection
          <select
            value={collection}
            className={"mt-2 " + fieldClass}
            onChange={(event) => {
              setCollection(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All uploaded collections</option>
            <option value="__uncollected">Uncollected</option>
            {data?.collections.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      {notice && (
        <p role="status" className="rounded-xl bg-brand/10 p-4 text-sm">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}
      <fieldset disabled={busy} className="space-y-3 rounded-2xl border border-line bg-white p-5">
        <legend className="px-2 text-sm font-medium">Add an image</legend>
        <label className="block text-sm">
          Image file
          <input
            ref={upload}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-2 block w-full min-w-0 text-xs"
          />
        </label>
        <label className="block text-sm">
          Alternative text
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            maxLength={240}
            className={`mt-2 ${fieldClass}`}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={decorative}
            onChange={(e) => setDecorative(e.target.checked)}
          />
          Decorative image (empty alternative text)
        </label>
        <p className="text-xs text-muted">
          JPEG, PNG or WebP, at most 4 MiB. Covers always require a description.
        </p>
        <button onClick={add} className={buttonClass}>
          {busy ? "Working…" : "Upload image"}
        </button>
      </fieldset>
      <div className="flex flex-wrap items-end gap-4">
        <label className="min-w-0 flex-1 text-sm">
          Search images
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className={`mt-2 ${fieldClass}`}
          />
        </label>
        <label className="flex items-center gap-2 py-3 text-sm">
          <input
            type="checkbox"
            checked={unused}
            onChange={(e) => {
              setUnused(e.target.checked);
              setPage(1);
            }}
          />
          Unused images
        </label>
      </div>
      {!data ? (
        <p role="status">Loading media…</p>
      ) : (
        <>
          <p role="status" className="text-sm text-muted">
            {data.total} images · Page {page}
          </p>
          {!data.items.length && (
            <p className="rounded-xl bg-white p-5">
              No images match. Clear the search or upload an image.
            </p>
          )}
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.items.map((item) => (
              <article
                key={item.id}
                className="min-w-0 space-y-3 rounded-2xl border border-line bg-white p-4"
              >
                {item.state === "active" ? (
                  <Image
                    src={item.url}
                    alt={item.alt}
                    width={400}
                    height={260}
                    unoptimized
                    className="h-40 w-full rounded-xl object-cover"
                    style={{ objectPosition: item.focalX + "% " + item.focalY + "%" }}
                  />
                ) : (
                  <p className="rounded-xl bg-paper p-5 text-sm">
                    Interrupted {item.state === "uploading" ? "upload" : "deletion"}. Review
                    storage, then retry deletion.
                  </p>
                )}
                <p className="break-all text-xs text-muted">
                  {item.width} × {item.height} · {Math.ceil(item.bytes / 1024)} KiB ·{" "}
                  {item.references} protected uses
                </p>
                <p className="text-sm">
                  <span>{item.alt || "Decorative image"}</span> {"\u00b7"}{" "}
                  {item.collection || "Uncollected"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {onSelect && item.state === "active" && (
                    <button
                      disabled={!item.alt.trim() && !decorative}
                      onClick={() => onSelect(item, decorative)}
                      className={buttonClass}
                    >
                      Use image
                    </button>
                  )}
                  <button
                    onClick={() => inspect(item)}
                    className="rounded-full border border-line px-3 py-2 text-xs"
                  >
                    View references
                  </button>
                  <button
                    disabled={busy || item.references > 0 || (unused && !item.cleanupEligible)}
                    onClick={() => setTarget(item)}
                    className="rounded-full border border-line px-3 py-2 text-xs text-red-800 disabled:opacity-50"
                  >
                    {unused ? "Clean up" : "Delete image"}
                  </button>
                  {item.state === "active" && (
                    <button
                      onClick={() => setEditing(item)}
                      className="rounded-full border border-line px-3 py-2 text-xs"
                    >
                      Edit description
                    </button>
                  )}
                </div>
                {inspected === item.id && (
                  <div className="text-xs">
                    {references.length ? (
                      <ul className="space-y-2">
                        {references.map((ref) => (
                          <li key={`${ref.id}-${ref.kind}`}>
                            <Link href={ref.href || "/admin/posts/" + ref.id} className="underline">
                              {ref.title}
                            </Link>{" "}
                            ({ref.kind})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No article, property, revision or recovery references.</p>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((n) => n - 1)}
              className={buttonClass}
            >
              Previous
            </button>
            <button
              disabled={page * data.limit >= data.total}
              onClick={() => setPage((n) => n + 1)}
              className={buttonClass}
            >
              Next
            </button>
          </div>
        </>
      )}
      {editing && (
        <MediaDetails
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setNotice("Image details saved. Existing placements retain their saved metadata.");
            setReload((value) => value + 1);
          }}
        />
      )}
      {target && (
        <ConfirmationDialog
          title="Delete this image?"
          description="This permanently removes the owned storage object. Article, property, revision and recovery references are checked again before deletion."
          confirmLabel="Delete permanently"
          cancelLabel="Keep image"
          destructive
          busy={busy}
          onCancel={() => setTarget(null)}
          onConfirm={remove}
        />
      )}
    </section>
  );
}
export function MediaPicker({
  onSelect,
  onClose,
}: {
  onSelect: (item: MediaItem, decorative: boolean) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = ref.current,
      trigger = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      requestAnimationFrame(() => {
        if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
      });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label="Choose an image"
      onCancel={onClose}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-5xl overflow-y-auto rounded-2xl bg-paper p-5 text-ink backdrop:bg-ink/50"
    >
      <button onClick={onClose} className="mb-5 rounded-full border border-line px-5 py-2">
        Close image picker
      </button>
      <MediaLibrary onSelect={onSelect} />
    </dialog>
  );
}
