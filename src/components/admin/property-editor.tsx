"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { adminApi, buttonClass, fieldClass } from "./api";
import { ConfirmationDialog } from "./confirmation-dialog";
import { MediaPicker } from "./media-library";
import { propertyInputSchema } from "@/lib/property-schema";
import type { PropertyInput, ManagedProperty, PropertyImage } from "@/lib/property-types";
const blank: PropertyInput = {
  slug: "",
  name: "",
  location: "",
  region: "",
  type: "Villa",
  price: 500000,
  bedrooms: 2,
  bathrooms: 2,
  area: 150,
  description: "",
  features: [],
  galleryItems: [],
  stories: [],
  relatedStories: [],
  status: "draft",
};
function inputOf(record: ManagedProperty): PropertyInput {
  const { id, version, createdAt, updatedAt, ...input } = record;
  void id;
  void version;
  void createdAt;
  void updatedAt;
  return input;
}
type Revision = { id: string; version: number; createdAt: string };
export function PropertyEditor({ id }: { id?: string }) {
  const router = useRouter(),
    [form, setForm] = useState<PropertyInput | null>(id ? null : structuredClone(blank)),
    [record, setRecord] = useState<ManagedProperty | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [picker, setPicker] = useState(false),
    [preview, setPreview] = useState(false),
    [revisions, setRevisions] = useState<Revision[]>([]),
    [confirm, setConfirm] = useState<"delete" | "reload" | Revision | null>(null),
    [navigation, setNavigation] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(blank));
  const allowLeave = useRef(false);
  const dirty = !!form && JSON.stringify(form) !== savedSnapshot;
  const accept = (next: ManagedProperty) => {
    setRecord(next);
    const input = inputOf(next);
    setSavedSnapshot(JSON.stringify(input));
    setForm(input);
    setError("");
  };
  useEffect(() => {
    if (!id) return;
    let active = true;
    adminApi<{ property: ManagedProperty }>("/api/admin/properties/" + id)
      .then((data) => {
        if (active) {
          const next = data.property;
          setRecord(next);
          const input = inputOf(next);
          setSavedSnapshot(JSON.stringify(input));
          setForm(input);
        }
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      });
    return () => {
      active = false;
    };
  }, [id]);
  useEffect(() => {
    if (!dirty) return;
    const before = (event: BeforeUnloadEvent) => {
      if (!allowLeave.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const signout = (event: Event) => {
      event.preventDefault();
      setError("Save this property or reload its saved version before signing out.");
    };
    const link = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a");
      if (
        anchor &&
        anchor.getAttribute("href")?.startsWith("/") &&
        !anchor.target &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey
      ) {
        event.preventDefault();
        setNavigation(anchor.getAttribute("href"));
      }
    };
    window.addEventListener("beforeunload", before);
    window.addEventListener("havenfield:before-signout", signout);
    document.addEventListener("click", link, true);
    return () => {
      window.removeEventListener("beforeunload", before);
      window.removeEventListener("havenfield:before-signout", signout);
      document.removeEventListener("click", link, true);
    };
  }, [dirty]);
  function update<K extends keyof PropertyInput>(key: K, value: PropertyInput[K]) {
    setNotice("");
    setForm((previous) => (previous ? { ...previous, [key]: value } : previous));
  }
  function image(index: number, changes: Partial<PropertyImage>) {
    if (form)
      update(
        "galleryItems",
        form.galleryItems.map((item, i) => (i === index ? { ...item, ...changes } : item)),
      );
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    const checked = propertyInputSchema.safeParse({
      ...form,
      features: form.features.map((value) => value.trim()).filter(Boolean),
      relatedStories: form.relatedStories.map((value) => value.trim()).filter(Boolean),
    });
    if (!checked.success) {
      setError(
        checked.error.issues
          .slice(0, 4)
          .map((issue) => issue.path.join(".") + ": " + issue.message)
          .join("; "),
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await adminApi<{ property: ManagedProperty }>(
        "/api/admin/properties" + (record ? "/" + record.id : ""),
        {
          method: record ? "PATCH" : "POST",
          body: JSON.stringify(
            record ? { version: record.version, property: checked.data } : checked.data,
          ),
        },
      );
      accept(data.property);
      setNotice("Property saved as " + data.property.status + ".");
      setRevisions([]);
      if (!record) router.replace("/admin/properties/" + data.property.id);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Property could not be saved. Your edits are preserved.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function confirmed() {
    if (!record || !confirm) return;
    setBusy(true);
    setError("");
    try {
      if (confirm === "delete") {
        await adminApi("/api/admin/properties/" + record.id, {
          method: "DELETE",
          body: JSON.stringify({ version: record.version }),
        });
        setSavedSnapshot(JSON.stringify(form));
        setForm(null);
        router.replace("/admin/properties");
      } else if (confirm === "reload") {
        const data = await adminApi<{ property: ManagedProperty }>(
          "/api/admin/properties/" + record.id,
        );
        accept(data.property);
        setNotice("Saved property loaded.");
      } else {
        const data = await adminApi<{ property: ManagedProperty }>(
          "/api/admin/properties/" + record.id + "/revisions/" + confirm.id,
          { method: "POST", body: JSON.stringify({ version: record.version }) },
        );
        accept(data.property);
        setRevisions([]);
        setNotice("Revision restored as a new saved version.");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The action could not be completed.");
    } finally {
      setConfirm(null);
      setBusy(false);
    }
  }
  if (!form)
    return (
      <section>
        <h1 className="font-display text-3xl">{id ? "Edit property" : "New property"}</h1>
        {error ? (
          <p role="alert" className="mt-5 text-red-800">
            {error}
          </p>
        ) : (
          <p role="status" className="mt-5">
            Loading property...
          </p>
        )}
        <Link href="/admin/properties" className="mt-5 inline-block underline">
          Back to properties
        </Link>
      </section>
    );
  return (
    <section className="min-w-0 space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <Link href="/admin/properties" className="text-sm underline underline-offset-4">
            Back to properties
          </Link>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl">
            {record ? "Edit property" : "New property"}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {record
              ? "Version " + record.version + " · " + record.status
              : "A new home begins as a private draft."}
            {dirty ? " · Unsaved changes" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <button
            type="button"
            className={buttonClass}
            onClick={() => setPreview((value) => !value)}
          >
            {preview ? "Close concept preview" : "Preview concept"}
          </button>
          {record && (
            <button
              type="button"
              disabled={busy}
              className="min-h-11 rounded-full border border-line px-4 text-sm"
              onClick={() => setConfirm("reload")}
            >
              Reload saved property
            </button>
          )}
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="break-words rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-800"
        >
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-xl bg-brand/10 p-4 text-sm text-ink">
          {notice}
        </p>
      )}
      {preview && (
        <section
          aria-label="Private property preview"
          className="rounded-2xl border border-line bg-white p-6"
        >
          <p className="text-xs text-brand">Private concept preview · {form.status}</p>
          <h2 className="mt-4 font-display text-3xl">{form.name || "Untitled home"}</h2>
          <p className="mt-4 leading-7 text-muted">
            {form.description || "Add a description to preview the story."}
          </p>
          {form.galleryItems[0] && (
            <Image
              src={form.galleryItems[0].url}
              alt={form.galleryItems[0].alt}
              width={900}
              height={600}
              unoptimized={form.galleryItems[0].url.startsWith("https://")}
              className="mt-6 aspect-[3/2] w-full rounded-xl object-cover"
              style={{
                objectPosition:
                  form.galleryItems[0].focalX + "% " + form.galleryItems[0].focalY + "%",
              }}
            />
          )}
          {form.stories.map((story, index) => (
            <section key={index} className="mt-6">
              <h3 className="font-display text-2xl">{story.title}</h3>
              <p className="mt-3 whitespace-pre-line leading-7 text-muted">{story.text}</p>
            </section>
          ))}
        </section>
      )}
      <form onSubmit={save} className="min-w-0 space-y-7">
        <fieldset
          disabled={busy}
          className="grid min-w-0 gap-5 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2"
        >
          <legend className="px-2 text-sm font-medium">Home details</legend>
          {(["name", "slug", "location", "region"] as const).map((key) => (
            <label key={key} className="min-w-0 text-sm">
              {
                {
                  name: "Property name",
                  slug: "Property URL slug",
                  location: "Fictional locality",
                  region: "Setting",
                }[key]
              }
              <input
                required
                value={form[key]}
                readOnly={key === "slug" && !!record}
                maxLength={key === "slug" ? 120 : key === "region" ? 60 : 100}
                className={"mt-2 " + fieldClass}
                onChange={(event) => update(key, event.target.value)}
              />
              {key === "slug" && (
                <span className="mt-2 block text-xs leading-5 text-muted">
                  Fixed after creation to keep saved links and inquiries consistent.
                </span>
              )}
            </label>
          ))}
          <label className="text-sm">
            Home type
            <select
              className={"mt-2 " + fieldClass}
              value={form.type}
              onChange={(event) => update("type", event.target.value as PropertyInput["type"])}
            >
              <option>Villa</option>
              <option>Residence</option>
              <option>Loft</option>
            </select>
          </label>
          <label className="text-sm">
            Publication status
            <select
              className={"mt-2 " + fieldClass}
              value={form.status}
              onChange={(event) => update("status", event.target.value as PropertyInput["status"])}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          {(["price", "bedrooms", "bathrooms", "area"] as const).map((key) => (
            <label key={key} className="text-sm">
              {
                {
                  price: "Illustrative USD guide price",
                  bedrooms: "Bedrooms",
                  bathrooms: "Bathrooms",
                  area: "Floor area (square metres)",
                }[key]
              }
              <input
                type="number"
                required
                step="1"
                min={key === "bedrooms" ? 0 : 1}
                value={form[key]}
                className={"mt-2 " + fieldClass}
                onChange={(event) => update(key, Number(event.target.value))}
              />
            </label>
          ))}
          <label className="min-w-0 text-sm sm:col-span-2">
            Property introduction
            <textarea
              required
              minLength={30}
              maxLength={1500}
              rows={4}
              value={form.description}
              className={"mt-2 " + fieldClass}
              onChange={(event) => update("description", event.target.value)}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            Features (one per line)
            <textarea
              rows={4}
              maxLength={4000}
              value={form.features.join("\n")}
              className={"mt-2 " + fieldClass}
              onChange={(event) => update("features", event.target.value.split("\n"))}
            />
          </label>
        </fieldset>
        <fieldset
          disabled={busy}
          className="min-w-0 space-y-5 rounded-2xl border border-line bg-white p-5"
        >
          <legend className="px-2 text-sm font-medium">Ordered gallery</legend>
          <p className="text-sm leading-6 text-muted">
            The first image becomes the collection cover. Each photograph needs its own description.
            Focal settings belong to this placement; changing library defaults does not overwrite an
            existing gallery.
          </p>
          {form.galleryItems.map((item, index) => (
            <div
              key={item.url}
              className="grid min-w-0 gap-4 rounded-xl border border-line p-4 md:grid-cols-[180px_minmax(0,1fr)]"
            >
              <Image
                src={item.url}
                alt=""
                width={360}
                height={240}
                unoptimized={item.url.startsWith("https://")}
                className="aspect-[3/2] w-full rounded-lg object-cover"
                style={{ objectPosition: item.focalX + "% " + item.focalY + "%" }}
              />
              <div className="min-w-0 space-y-3">
                <label className="block text-sm">
                  Photograph {index + 1} alternative text
                  <input
                    required
                    maxLength={240}
                    value={item.alt}
                    className={"mt-2 " + fieldClass}
                    onChange={(event) => image(index, { alt: event.target.value })}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(["focalX", "focalY"] as const).map((key) => (
                    <label key={key} className="text-xs">
                      Photograph {index + 1} {key === "focalX" ? "horizontal" : "vertical"} focal
                      point ({item[key]}%)
                      <input
                        className="mt-2 block w-full accent-brand"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={item[key]}
                        onChange={(event) => image(index, { [key]: Number(event.target.value) })}
                      />
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {[-1, 1].map((direction) => (
                    <button
                      key={direction}
                      type="button"
                      disabled={
                        index + direction < 0 || index + direction >= form.galleryItems.length
                      }
                      className="min-h-11 rounded-full border border-line px-3 text-xs disabled:opacity-40"
                      aria-label={
                        "Move photograph " +
                        (index + 1) +
                        (direction === -1 ? " earlier" : " later")
                      }
                      onClick={() => {
                        const next = [...form.galleryItems];
                        [next[index], next[index + direction]] = [
                          next[index + direction],
                          next[index],
                        ];
                        update("galleryItems", next);
                      }}
                    >
                      {direction === -1 ? "Move earlier" : "Move later"}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="min-h-11 px-2 text-xs text-red-800 underline"
                    aria-label={"Remove photograph " + (index + 1)}
                    onClick={() =>
                      update(
                        "galleryItems",
                        form.galleryItems.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            className={buttonClass}
            disabled={form.galleryItems.length >= 12}
            onClick={() => setPicker(true)}
          >
            Add gallery image
          </button>
        </fieldset>
        <fieldset disabled={busy} className="space-y-5 rounded-2xl border border-line bg-white p-5">
          <legend className="px-2 text-sm font-medium">Property story</legend>
          {form.stories.map((story, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-line p-4">
              <label className="block text-sm">
                Story {index + 1} heading
                <input
                  value={story.title}
                  maxLength={80}
                  className={"mt-2 " + fieldClass}
                  onChange={(event) =>
                    update(
                      "stories",
                      form.stories.map((value, i) =>
                        i === index ? { ...value, title: event.target.value } : value,
                      ),
                    )
                  }
                />
              </label>
              <label className="block text-sm">
                Story {index + 1} text
                <textarea
                  value={story.text}
                  maxLength={5000}
                  rows={4}
                  className={"mt-2 " + fieldClass}
                  onChange={(event) =>
                    update(
                      "stories",
                      form.stories.map((value, i) =>
                        i === index ? { ...value, text: event.target.value } : value,
                      ),
                    )
                  }
                />
              </label>
              <button
                type="button"
                className="min-h-11 text-xs text-red-800 underline"
                onClick={() =>
                  update(
                    "stories",
                    form.stories.filter((_, i) => i !== index),
                  )
                }
              >
                Remove story {index + 1}
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={form.stories.length >= 8}
            className={buttonClass}
            onClick={() => update("stories", [...form.stories, { title: "", text: "" }])}
          >
            Add story section
          </button>
          <label className="block text-sm">
            Related journal slugs (one per line)
            <textarea
              value={form.relatedStories.join("\n")}
              rows={3}
              className={"mt-2 " + fieldClass}
              onChange={(event) => update("relatedStories", event.target.value.split("\n"))}
            />
            <span className="block text-xs text-muted">
              Only published stories appear publicly. Leave blank for the journal fallback.
            </span>
          </label>
        </fieldset>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={busy} className={buttonClass}>
            {busy && (
              <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
            )}
            {busy ? "Saving property..." : "Save property"}
          </button>
          {record && (
            <>
              <button
                type="button"
                disabled={busy}
                className="min-h-11 rounded-full border border-line px-4 text-sm"
                onClick={async () => {
                  try {
                    const data = await adminApi<{ revisions: Revision[] }>(
                      "/api/admin/properties/" + record.id + "/revisions",
                    );
                    setRevisions(data.revisions);
                  } catch (reason) {
                    setError(reason instanceof Error ? reason.message : "Could not load history.");
                  }
                }}
              >
                Property revisions
              </button>
              <button
                type="button"
                disabled={busy}
                className="min-h-11 px-4 text-sm text-red-800 underline"
                onClick={() => setConfirm("delete")}
              >
                Delete property
              </button>
              {record.status === "published" && (
                <Link
                  target="_blank"
                  href={"/properties/" + record.slug}
                  className="min-h-11 py-3 text-sm underline"
                >
                  View public home
                </Link>
              )}
            </>
          )}
        </div>
      </form>
      {revisions.length > 0 && (
        <section className="rounded-2xl border border-line p-5">
          <h2 className="font-display text-2xl">Property revision history</h2>
          <ul className="mt-4 space-y-3">
            {revisions.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 text-sm"
              >
                <span>
                  Version {item.version} ·{" "}
                  {new Date(item.createdAt).toLocaleDateString("en-GB", { timeZone: "UTC" })}
                </span>
                {item.version !== record?.version && (
                  <button
                    type="button"
                    disabled={dirty || busy}
                    className="min-h-11 underline disabled:opacity-40"
                    onClick={() => setConfirm(item)}
                  >
                    Restore property version {item.version}
                  </button>
                )}
              </li>
            ))}
          </ul>
          {dirty && (
            <p className="mt-4 text-xs text-muted">
              Save or reload your current edits before restoring a revision.
            </p>
          )}
        </section>
      )}
      {picker && (
        <MediaPicker
          onClose={() => setPicker(false)}
          onSelect={(item) => {
            if (form.galleryItems.some((image) => image.url === item.url)) {
              setError("This image is already in the gallery.");
            } else
              update("galleryItems", [
                ...form.galleryItems,
                {
                  url: item.url,
                  alt: item.alt,
                  focalX: item.focalX ?? 50,
                  focalY: item.focalY ?? 50,
                },
              ]);
            setPicker(false);
          }}
        />
      )}
      {confirm && (
        <ConfirmationDialog
          cancelLabel="Keep editing"
          title={
            confirm === "delete"
              ? "Delete this property?"
              : confirm === "reload"
                ? "Reload saved property?"
                : "Restore property revision?"
          }
          description={
            confirm === "delete"
              ? "Homes with inquiry history cannot be deleted. Save a home as Draft to hide it while retaining its history."
              : confirm === "reload"
                ? "This discards unsaved edits and loads the latest saved version."
                : "This restores the publication status and fields as a new version. A published version makes the home public again. The address and history stay fixed."
          }
          confirmLabel={
            confirm === "delete"
              ? "Delete property permanently"
              : confirm === "reload"
                ? "Discard edits and reload"
                : "Restore property revision"
          }
          destructive={confirm === "delete"}
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={confirmed}
        />
      )}
      {navigation && (
        <ConfirmationDialog
          cancelLabel="Keep editing"
          title="Leave unsaved property changes?"
          description="Your saved property is unchanged. Leaving discards the edits on this page."
          confirmLabel="Discard edits and leave"
          busy={false}
          onCancel={() => setNavigation(null)}
          onConfirm={() => {
            allowLeave.current = true;
            window.location.assign(navigation);
          }}
        />
      )}
    </section>
  );
}
