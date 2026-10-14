"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArticleBody } from "@/components/article-body";
import { ArrowLeft, Check, ExternalLink, History, Save, Upload } from "lucide-react";
import type { BlogPost, BlogPostInput, BlogRevision, PostStatus } from "@/lib/blog-types";
import { blogPostSchema } from "@/lib/blog-schema";
import { adminApi, ApiError, buttonClass, fieldClass, formatDate } from "./api";
import { MediaPicker } from "./media-library";
import { useDraftRecovery } from "./use-draft-recovery";
import { ConfirmationDialog } from "./confirmation-dialog";

const emptyPost: BlogPostInput = { title: "", slug: "", excerpt: "", body: "", author: "Havenfield editorial", category: "Living well", tags: [], coverImage: "", coverAlt: "", status: "draft", publishedAt: null, seoTitle: "", seoDescription: "", canonicalUrl: "", noindex: false };
function postInput(post: BlogPost): BlogPostInput {
  const status = post.status === "scheduled" && post.publishedAt && Date.parse(post.publishedAt) <= Date.now() ? "published" : post.status;
  return { title: post.title, slug: post.slug, excerpt: post.excerpt, body: post.body, author: post.author, category: post.category, tags: post.tags, coverImage: post.coverImage, coverAlt: post.coverAlt, status, publishedAt: post.publishedAt, seoTitle: post.seoTitle, seoDescription: post.seoDescription, canonicalUrl: post.canonicalUrl, noindex: post.noindex };
}
function localDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
function slugify(value: string) { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120); }

export function PostEditor({ id }: { id?: string }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPostInput>({ ...emptyPost });
  const [saved, setSaved] = useState(JSON.stringify(emptyPost));
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(!!id); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({}); const [conflict, setConflict] = useState(false);
  const [authExpired, setAuthExpired] = useState(false);
  const [uploading, setUploading] = useState(false); const [uploadError, setUploadError] = useState("");
  const [preview, setPreview] = useState(false); const [revisions, setRevisions] = useState<BlogRevision[] | null>(null);
  const [selectedRevision, setSelectedRevision] = useState<BlogRevision | null>(null); const [restoreTarget, setRestoreTarget] = useState<BlogRevision | null>(null);
  const [slugEdited, setSlugEdited] = useState(!!id); const [reload, setReload] = useState(0);
  const dirty = JSON.stringify(post) !== saved;
  const recovery = useDraftRecovery({id,post,version,dirty,loading,busy});
  const [picker,setPicker]=useState<"cover"|"inline"|null>(null);
  const [taxonomy,setTaxonomy]=useState<{categories:string[];tags:string[]}>({categories:[],tags:[]});
  useEffect(()=>{adminApi<typeof taxonomy>("/api/admin/taxonomy").then(setTaxonomy).catch(()=>undefined);},[]);
  useEffect(() => {
    if (!id) return;
    let active = true;
    Promise.resolve().then(() => { if (!active) return null; setLoading(true); setError(""); return adminApi<{ post: BlogPost }>(`/api/admin/posts/${id}`); })
      .then((data) => { if (active && data) { const input = postInput(data.post); setPost(input); setSaved(JSON.stringify(input)); setVersion(data.post.version); setConflict(false); } })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load this article."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, reload]);
  useEffect(() => {
    function preventLoss(event: BeforeUnloadEvent) { if (dirty) { event.preventDefault(); event.returnValue = ""; } }
    function protectNavigation(event: MouseEvent) {
      if (!dirty || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor || anchor.target === "_blank" || anchor.href === window.location.href) return;
      if (!window.confirm("Leave this article? Your unsaved changes will be lost.")) { event.preventDefault(); event.stopPropagation(); }
    }
    function protectSignOut(event: Event) { if (dirty && !window.confirm("Sign out? Your unsaved changes will be lost.")) event.preventDefault(); }
    window.addEventListener("beforeunload", preventLoss);
    window.addEventListener("havenfield:before-signout", protectSignOut);
    document.addEventListener("click", protectNavigation, true);
    return () => { window.removeEventListener("beforeunload", preventLoss); window.removeEventListener("havenfield:before-signout", protectSignOut); document.removeEventListener("click", protectNavigation, true); };
  }, [dirty]);
  function update<K extends keyof BlogPostInput>(key: K, value: BlogPostInput[K]) {
    setPost((current) => ({ ...current, [key]: value })); setNotice(""); setErrors((current) => ({ ...current, [key]: "" }));
  }
  async function save(status?: PostStatus) {
    const candidate = { ...post, tags: post.tags.map((tag) => tag.trim()).filter(Boolean), ...(status ? { status } : {}), publishedAt: (status ?? post.status) === "draft" ? null : post.publishedAt };
    if (candidate.status === "published" && candidate.publishedAt && Date.parse(candidate.publishedAt) > Date.now()) candidate.publishedAt = null;
    const result = blogPostSchema.safeParse(candidate);
    if (!result.success) {
      const issues: Record<string, string> = {};
      result.error.issues.forEach((issue) => { issues[String(issue.path[0])] = issue.message; });
      setErrors(issues); setError("Review the highlighted fields before saving.");
      if (issues.body) setPreview(false);
      requestAnimationFrame(() => document.getElementById(Object.keys(issues)[0] === "publishedAt" ? "publication-date" : Object.keys(issues)[0])?.focus());
      return;
    }
    setBusy(true); setError(""); setNotice(""); setErrors({}); setAuthExpired(false);
    try {
      const { post: updated } = await adminApi<{ post: BlogPost }>(id ? `/api/admin/posts/${id}` : "/api/admin/posts", { method: id ? "PATCH" : "POST", body: JSON.stringify(id ? { version, post: result.data } : result.data) });
      const input = postInput(updated); setPost(input); setSaved(JSON.stringify(input)); setVersion(updated.version); setRevisions(null); setConflict(false);
      setNotice(updated.status === "published" ? "Article published. The journal now reflects this version." : updated.status === "scheduled" ? "Article scheduled. It will become visible at its publication time." : "Draft saved.");
      await recovery.discard().catch(()=>setNotice("Article saved; recovery cleanup failed. Discard the stale recovery after reload."));
      if (!id) router.replace(`/admin/posts/${updated.id}`);
    } catch (reason) {
      setConflict(reason instanceof ApiError && reason.code === "version_conflict");
      setAuthExpired(reason instanceof ApiError && reason.status === 401);
      setError(reason instanceof ApiError && reason.code === "version_conflict" ? "This article changed in another session. Your edits are still here. Copy any writing you need to keep, then reload the current version before saving." : reason instanceof Error ? reason.message : "Could not save this article.");
      if (reason instanceof ApiError && reason.code === "duplicate_slug") setErrors({ slug: "This URL slug is already used. Choose a different slug." });
    } finally { setBusy(false); }
  }
  async function loadRevisions() {
    if (!id) return; setBusy(true); setError("");
    try { const data = await adminApi<{ revisions: BlogRevision[] }>(`/api/admin/posts/${id}/revisions`); setRevisions(data.revisions); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load revisions."); setAuthExpired(reason instanceof ApiError && reason.status === 401); }
    finally { setBusy(false); }
  }
  async function restore() {
    if (!id || !restoreTarget) return; setBusy(true); setError("");
    try {
      const { post: restored } = await adminApi<{ post: BlogPost }>(`/api/admin/posts/${id}/revisions/${restoreTarget.id}/restore`, { method: "POST", body: JSON.stringify({ version }) });
      const input = postInput(restored); setPost(input); setSaved(JSON.stringify(input)); setVersion(restored.version); setRestoreTarget(null); setRevisions(null); setSelectedRevision(null); setNotice("Revision restored as a draft. Review it before publishing.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Restoration failed."); setAuthExpired(reason instanceof ApiError && reason.status === 401); setRestoreTarget(null); }
    finally { setBusy(false); }
  }
  async function uploadCover(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    setUploadError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setUploadError("Choose a JPEG, PNG, or WebP image."); return; }
    if (file.size > 4 * 1024 * 1024) { setUploadError("The image must be 4 MiB or smaller. Compress it and try again."); return; }
    setBusy(true); setUploading(true); setNotice("");
    try {
      const data = new FormData(); data.set("file", file);
      const { url } = await adminApi<{ url: string; alt: string }>("/api/admin/media", { method: "POST", body: data });
      setPost((current) => ({ ...current, coverImage: url, coverAlt: "" }));
      setErrors((current) => ({ ...current, coverImage: "", coverAlt: "" }));
      setNotice("Cover image uploaded. Add its description, then save your article.");
    } catch (reason) { setUploadError(reason instanceof Error ? reason.message : "The image could not be uploaded."); setAuthExpired(reason instanceof ApiError && reason.status === 401); }
    finally { setBusy(false); setUploading(false); }
  }
  const readiness = [ { label: "Clear title", ready: post.title.trim().length >= 3 }, { label: "Search description", ready: (post.seoDescription || post.excerpt).length >= 50 && (post.seoDescription || post.excerpt).length <= 180 }, { label: "Descriptive cover alternative", ready: !post.coverImage || !!post.coverAlt.trim() }, { label: "Readable article body", ready: post.body.trim().length >= 30 }, { label: "Search indexing enabled", ready: !post.noindex } ];
  function field(label: string, key: "title" | "slug" | "author" | "category" | "coverImage" | "coverAlt" | "seoTitle" | "seoDescription" | "canonicalUrl", hint?: string) {
    return <div><label htmlFor={key} className="mb-2 block text-sm font-medium">{label}</label><input id={key} list={key==="category"?"category-suggestions":undefined} value={post[key]} aria-invalid={!!errors[key]} aria-describedby={errors[key] || hint ? `${key}-help` : undefined} onChange={(event) => {
      if (key === "title" && !slugEdited) { const title = event.target.value; setPost((current) => ({ ...current, title, slug: slugify(title) })); setErrors((current) => ({ ...current, title: "", slug: "" })); setNotice(""); }
      else { if (key === "slug") setSlugEdited(true); update(key, event.target.value); }
    }} maxLength={key === "title" ? 180 : key === "seoTitle" ? 70 : key === "seoDescription" ? 180 : key === "slug" ? 120 : undefined} className={fieldClass}/>{(errors[key] || hint) && <p id={`${key}-help`} className={`mt-1.5 text-xs ${errors[key] ? "text-red-700" : "text-muted"}`}>{errors[key] || hint}</p>}</div>;
  }
  if (loading) return <p role="status" className="p-12 text-center text-muted">Opening your article…</p>;
  if (id && !version) return <div role="alert" className="rounded-2xl bg-white p-8"><h1 className="font-display text-3xl">Unable to open article</h1><p className="my-4 text-muted">{error}</p><Link href="/admin" className={buttonClass}>Back to articles</Link></div>;
  return <>
    <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-brand"><ArrowLeft className="size-4"/>All articles</Link>
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 text-xs uppercase tracking-[.2em] text-brand">{id ? "Shape your story" : "Begin a new story"}</p><h1 className="font-display text-4xl">{id ? "Edit article" : "New article"}</h1><p role="status" className="mt-3 text-xs text-muted">{busy ? "Working…" : dirty ? "Unsaved changes" : id ? `All changes saved · Version ${version}` : "Not yet saved"}</p></div><div className="flex flex-wrap gap-2">{id && <><Link href={`/admin/preview/${id}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm"><ExternalLink className="size-4"/>Saved preview</Link><button disabled={busy} onClick={loadRevisions} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm disabled:opacity-50"><History className="size-4"/>Revisions</button></>}<button disabled={busy} onClick={() => save()} className={buttonClass}><Save className="size-4"/>{busy ? "Saving…" : "Save article"}</button></div></div>
    <datalist id="category-suggestions">{taxonomy.categories.map(value=><option key={value} value={value}/>)}</datalist>
    <p role="status" className="mb-4 text-xs text-muted">{post.status==="draft"?recovery.status:"Published and scheduled edits require explicit saves."}</p>
    {recovery.candidate&&<section className="mb-5 space-y-3 rounded-xl border border-line bg-white p-5" aria-label="Interrupted draft recovery"><h2 className="font-display text-2xl">Interrupted writing found</h2><p className="text-sm">Saved {new Date(recovery.candidate.updatedAt).toLocaleString()}. {recovery.candidate.baseVersion!==version?"The article has changed. Copy and merge this writing before discarding recovery.":"Recover it into this editor or keep the stored article."}</p><div className="flex flex-wrap gap-3"><button disabled={recovery.candidate.baseVersion!==version} onClick={()=>{const value=recovery.recover();if(value)setPost(value);}} className={buttonClass}>Recover writing</button><button onClick={()=>recovery.discard().catch(()=>setError("Could not discard recovery."))} className="rounded-full border border-line px-4 py-2 text-sm">Discard recovery</button></div><details><summary className="cursor-pointer text-sm">Read recovery text</summary><pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap wrap-anywhere text-xs">{recovery.candidate.post.body}</pre></details></section>}
    {picker&&<MediaPicker onClose={()=>setPicker(null)} onSelect={(item,decorative)=>{if(picker==="cover"){if(!item.alt.trim()){setError("Covers require a description. Edit the image description in the library first.");return;}setPost(current=>({...current,coverImage:item.url,coverAlt:item.alt}));}else{if(!item.alt.trim()&&!decorative){setError("Describe this image or mark it decorative in the picker.");return;}const description=decorative?"":item.alt.replace(/[[\]\\]/g," ");update("body",post.body+`\n\n![${description}](${item.url})\n`);setPreview(false);}setPicker(null);}}/>}
    {error && <div role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}{conflict && id && <button onClick={() => { if (!dirty || window.confirm("Reload the current article? This discards your unsaved edits.")) setReload(reload + 1); }} className="ml-2 underline">Reload current version</button>}{authExpired && <p className="mt-2"><Link href="/admin/login" target="_blank" rel="noopener" className="underline">Sign in again in a new tab</Link>, then retry here. Your writing stays in this tab.</p>}</div>}
    {notice && <p role="status" className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</p>}
    <fieldset disabled={busy} className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-6"><section className="space-y-5 rounded-2xl border border-line bg-white p-5 sm:p-7" aria-labelledby="story-heading"><h2 id="story-heading" className="font-display text-2xl">The story</h2>{field("Article title", "title")}{field("URL slug", "slug", "Use lowercase words separated by hyphens. Changing a published slug changes its public URL.")}
        <div><label htmlFor="excerpt" className="mb-2 block text-sm font-medium">Short introduction</label><textarea id="excerpt" value={post.excerpt} onChange={(event) => update("excerpt", event.target.value)} maxLength={400} rows={3} aria-invalid={!!errors.excerpt} aria-describedby="excerpt-help" className={fieldClass}/><p id="excerpt-help" className={`mt-1.5 text-xs ${errors.excerpt ? "text-red-700" : "text-muted"}`}>{errors.excerpt || `${post.excerpt.length}/400 characters · Shown on journal cards`}</p></div>
        <div className="grid gap-5 sm:grid-cols-2">{field("Author", "author")}{field("Category", "category")}</div>
        <div><label htmlFor="tags" className="mb-2 block text-sm font-medium">Tags</label><input id="tags" value={post.tags.join(", ")} onChange={(event) => update("tags", event.target.value.split(",").map((tag) => tag.trimStart()))} onBlur={() => update("tags", post.tags.map((tag) => tag.trim()).filter(Boolean))} aria-invalid={!!errors.tags} aria-describedby="tags-help" placeholder="architecture, neighbourhoods, interiors" className={fieldClass}/><p id="tags-help" className={`mt-1.5 text-xs ${errors.tags ? "text-red-700" : "text-muted"}`}>{errors.tags || `Comma-separated; up to 12 tags, 40 characters each. Existing tags: ${taxonomy.tags.join(", ") || "none yet"}`}</p></div>
        <div><div className="mb-3 flex items-center justify-between gap-3"><label htmlFor="body" className="text-sm font-medium">Article body</label><div className="flex rounded-full border border-line p-1"><button type="button" onClick={() => setPreview(false)} aria-pressed={!preview} className={`rounded-full px-3 py-1 text-xs ${!preview ? "bg-ink text-white" : "text-muted"}`}>Write</button><button type="button" onClick={() => setPreview(true)} aria-pressed={preview} className={`rounded-full px-3 py-1 text-xs ${preview ? "bg-ink text-white" : "text-muted"}`}>Preview</button></div></div>
          {!preview&&<div className="mb-3 flex flex-wrap gap-2" aria-label="Markdown formatting">{[{label:"Heading",text:"## Heading"},{label:"Bold",text:"**Emphasised text**"},{label:"List",text:"- List item"},{label:"Link",text:"[Link text](https://example.com)"},{label:"Table",text:"| Heading | Heading |\n| --- | --- |\n| Value | Value |"}].map(tool=><button key={tool.label} type="button" onClick={()=>{update("body",post.body+"\n\n"+tool.text+"\n");requestAnimationFrame(()=>document.getElementById("body")?.focus());}} className="rounded-full border border-line px-3 py-2 text-xs">{tool.label}</button>)}<button type="button" onClick={()=>setPicker("inline")} className="rounded-full border border-line px-3 py-2 text-xs">Insert image</button></div>}
          {preview ? <div className="min-h-96 rounded-xl border border-line p-5"><ArticleBody body={post.body || "Your formatted story will appear here."}/></div> : <textarea id="body" value={post.body} onChange={(event) => update("body", event.target.value)} rows={18} maxLength={100000} aria-invalid={!!errors.body} aria-describedby="body-help" className={`${fieldClass} min-h-96 font-mono leading-6`} placeholder="## A thoughtful beginning\n\nWrite your story in Markdown…"/>}
          <p id="body-help" className={`mt-2 text-xs ${errors.body ? "text-red-700" : "text-muted"}`}>{errors.body || "Markdown supports headings, lists, links, images, and tables. Raw HTML is disabled."}</p>
        </div>
      </section>
      <section className="space-y-5 rounded-2xl border border-line bg-white p-5 sm:p-7" aria-labelledby="cover-heading"><h2 id="cover-heading" className="font-display text-2xl">Cover image</h2><div className="rounded-xl border border-dashed border-line bg-paper p-4"><label htmlFor="cover-file" className="mb-3 flex items-center gap-2 text-sm font-medium"><Upload className="size-4 text-brand"/>Upload a cover image</label><input id="cover-file" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={uploadCover} aria-describedby="upload-help" className="block w-full min-w-0 text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:text-white"/><p id="upload-help" className="mt-3 text-xs leading-5 text-muted">JPEG, PNG, or WebP · Up to 4 MiB. Uploaded images are public, including draft covers. Use only images you have permission to share.</p>{uploading && <p role="status" className="mt-3 text-sm text-brand">Uploading and processing your image…</p>}{uploadError && <p role="alert" className="mt-3 text-sm text-red-700">{uploadError}{authExpired && <span className="mt-1 block"><Link href="/admin/login" target="_blank" rel="noopener" className="underline">Sign in again in a new tab</Link>, then retry the upload.</span>}</p>}</div><button type="button" onClick={()=>setPicker("cover")} className={buttonClass}>Reuse library image</button>{field("Image URL", "coverImage", "Upload an image above, use an approved /media/ image, or enter an HTTPS image URL.")}{field("Image description", "coverAlt", "Required when using a cover. Describe what is shown for readers who cannot see the image.")}</section>
      <section className="space-y-5 rounded-2xl border border-line bg-white p-5 sm:p-7" aria-labelledby="search-heading"><h2 id="search-heading" className="font-display text-2xl">Search appearance</h2><p className="text-sm leading-6 text-muted">These fields guide search engines. They do not guarantee rankings or the exact search result shown.</p>{field("SEO title", "seoTitle", `${post.seoTitle.length}/70 characters · Leave empty to use the article title`)}{field("Meta description", "seoDescription", `${post.seoDescription.length}/180 characters · Leave empty to use the introduction`)}{field("Canonical URL", "canonicalUrl", "Optional HTTPS URL of the preferred original article; leave empty for this site's article URL.")}<label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={post.noindex} onChange={(event) => update("noindex", event.target.checked)} className="mt-1 size-4 accent-brand"/><span>Exclude this article from search indexing<span className="mt-1 block text-xs text-muted">This is a search-engine instruction, not access control.</span></span></label><div className="overflow-hidden rounded-xl border border-line p-4"><p className="text-xs text-muted">Search result preview</p><p className="mt-2 truncate text-lg text-blue-800">{post.seoTitle || post.title || "Your article title"}</p><p className="my-1 break-all text-xs text-green-800">/journal/{post.slug || "your-article"}</p><p className="text-sm leading-6 text-muted">{post.seoDescription || post.excerpt || "Your article introduction will appear here."}</p></div></section></div>
      <aside className="space-y-5"><section className="rounded-2xl border border-line bg-white p-5"><h2 className="font-display text-xl">Publication</h2><label htmlFor="status" className="mb-2 mt-5 block text-sm">Status</label><select id="status" value={post.status} onChange={(event) => update("status", event.target.value as PostStatus)} className={fieldClass}><option value="draft">Draft</option><option value="published">Published</option><option value="scheduled">Scheduled</option></select>{post.status === "scheduled" && <div className="mt-4"><label htmlFor="publication-date" className="mb-2 block text-sm">Publication time</label><input id="publication-date" type="datetime-local" value={localDate(post.publishedAt)} onChange={(event) => update("publishedAt", event.target.value ? new Date(event.target.value).toISOString() : null)} className={fieldClass} aria-invalid={!!errors.publishedAt}/><p className={`mt-2 text-xs ${errors.publishedAt ? "text-red-700" : "text-muted"}`}>{errors.publishedAt || "Your browser's local time. Must be in the future. Scheduling is applied when readers visit the journal."}</p></div>}<div className="mt-5 flex flex-col gap-2"><button disabled={busy} onClick={() => save(post.status === "scheduled" ? "scheduled" : "published")} className={`${buttonClass} w-full`}>{post.status === "scheduled" ? "Save schedule" : "Publish now"}</button><button disabled={busy} onClick={() => save("draft")} className="rounded-full border border-line px-4 py-2.5 text-sm disabled:opacity-50">{post.status === "published" ? "Unpublish to draft" : "Save as draft"}</button></div></section><section className="rounded-2xl border border-line bg-white p-5"><h2 className="font-display text-xl">Editorial readiness</h2><p className="mb-4 mt-2 text-xs leading-5 text-muted">Practical checks to review before publishing.</p><ul className="space-y-3">{readiness.map((item) => <li key={item.label} className="flex items-center gap-2 text-xs"><span className={`flex size-5 shrink-0 items-center justify-center rounded-full ${item.ready ? "bg-green-50 text-green-700" : "bg-paper text-muted"}`}>{item.ready ? <Check className="size-3"/> : "·"}</span>{item.label}<span className="sr-only">{item.ready ? ": ready" : ": needs review"}</span></li>)}</ul></section><p className="text-xs leading-6 text-muted">Preview shows your current writing. Saved preview opens the last stored version and requires an editorial session.</p></aside>
    </fieldset>
    {revisions && <section className="mt-7 rounded-2xl border border-line bg-white p-5 sm:p-7" aria-labelledby="revisions-heading"><div className="flex items-center justify-between"><h2 id="revisions-heading" className="font-display text-2xl">Revision history</h2><button onClick={() => { setRevisions(null); setSelectedRevision(null); }} className="text-sm text-muted underline">Close</button></div><p className="my-3 text-xs text-muted">Restoring creates a new draft revision. Existing publication is withdrawn until you publish again.</p>{revisions.length === 0 ? <p className="text-sm text-muted">No previous revisions yet.</p> : <ul className="divide-y divide-line">{revisions.map((revision) => <li key={revision.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="text-sm">Version {revision.version} · {revision.snapshot.title}</p><p className="mt-1 text-xs text-muted">{formatDate(revision.createdAt)} · {revision.snapshot.status}</p></div><div className="flex gap-3"><button onClick={() => setSelectedRevision(revision)} className="text-sm text-brand underline">View</button><button disabled={busy} onClick={() => setRestoreTarget(revision)} className="text-sm text-brand underline disabled:opacity-50">Restore as draft</button></div></li>)}</ul>}{selectedRevision && <div className="mt-5 rounded-xl bg-paper p-5"><h3 className="font-display text-xl">Version {selectedRevision.version}: {selectedRevision.snapshot.title}</h3><p className="my-3 text-sm text-muted">{selectedRevision.snapshot.excerpt}</p><pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-6">{selectedRevision.snapshot.body}</pre></div>}</section>}
    {restoreTarget && <ConfirmationDialog title={`Restore version ${restoreTarget.version}?`} description="The article will become a draft. Your unsaved edits will be replaced with this revision. A new revision keeps the current saved version in the history." cancelLabel="Keep editing" confirmLabel="Restore draft" busy={busy} onCancel={() => setRestoreTarget(null)} onConfirm={restore}/>}
  </>;
}
