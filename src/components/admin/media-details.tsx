"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/lib/media-types";
import { adminApi, fieldClass, buttonClass } from "./api";
export function MediaDetails({
  item,
  onClose,
  onSaved,
}: {
  item: MediaItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    [alt, setAlt] = useState(item.alt),
    [collection, setCollection] = useState(item.collection),
    [x, setX] = useState(item.focalX),
    [y, setY] = useState(item.focalY),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const node = dialog.current,
      trigger = document.activeElement;
    node?.showModal();
    return () => {
      node?.close();
      requestAnimationFrame(() => {
        if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
      });
    };
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminApi("/api/admin/media/" + item.id, {
        method: "PATCH",
        body: JSON.stringify({ version: item.version, alt, collection, focalX: x, focalY: y }),
      });
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Image details could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      aria-labelledby="media-detail-title"
      onCancel={(event) => {
        if (busy) event.preventDefault();
        else onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto rounded-2xl bg-paper p-5 text-ink backdrop:bg-ink/50 sm:p-8"
    >
      <h2 id="media-detail-title" className="font-display text-3xl">
        Image details and crops
      </h2>
      <p className="mt-4 text-sm leading-6 text-muted">
        Descriptions and collections help organize uploads. Focal defaults apply when adding a
        property photograph. Existing article descriptions and gallery placements retain their saved
        values.
      </p>
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <form className="mt-6 space-y-5" onSubmit={submit}>
        <fieldset disabled={busy} className="space-y-5">
          <legend className="sr-only">Image metadata</legend>
          <label className="block text-sm">
            Image alternative text
            <input
              value={alt}
              maxLength={240}
              onChange={(event) => setAlt(event.target.value)}
              className={"mt-2 " + fieldClass}
            />
          </label>
          <label className="block text-sm">
            Image collection
            <input
              value={collection}
              maxLength={60}
              onChange={(event) => setCollection(event.target.value)}
              placeholder="For example: Garden stories"
              className={"mt-2 " + fieldClass}
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm">
              Horizontal focal point ({x}%)
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={x}
                onChange={(event) => setX(Number(event.target.value))}
                className="mt-3 block w-full accent-brand"
              />
            </label>
            <label className="text-sm">
              Vertical focal point ({y}%)
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={y}
                onChange={(event) => setY(Number(event.target.value))}
                className="mt-3 block w-full accent-brand"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: "Wide hero", ratio: "aspect-[16/9]" },
              { name: "Collection card", ratio: "aspect-[4/3]" },
              { name: "Portrait", ratio: "aspect-[4/5]" },
            ].map((crop) => (
              <figure key={crop.name}>
                <div className={"relative overflow-hidden rounded-xl bg-soft " + crop.ratio}>
                  <Image
                    src={item.url}
                    alt=""
                    fill
                    unoptimized
                    sizes="(max-width:640px) 100vw, 220px"
                    style={{ objectPosition: x + "% " + y + "%" }}
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-2 text-xs text-muted">{crop.name} preview</figcaption>
              </figure>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setX(50);
              setY(50);
            }}
            className="min-h-11 text-sm underline"
          >
            Reset focal point to center
          </button>
          <div className="flex flex-wrap gap-3">
            <button className={buttonClass} type="submit">
              {busy ? "Saving image details..." : "Save image details"}
            </button>
            <button
              type="button"
              className="min-h-11 rounded-full border border-line px-5 text-sm"
              onClick={onClose}
            >
              Cancel image editing
            </button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}
