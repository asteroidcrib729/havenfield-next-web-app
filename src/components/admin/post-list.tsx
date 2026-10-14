"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { adminApi, ApiError, type BlogPost, buttonClass, fieldClass, formatDate } from "./api";
import { ConfirmationDialog } from "./confirmation-dialog";
export function PostList() {
  const [query, setQuery] = useState(""); const [status, setStatus] = useState(""); const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<BlogPost[]>([]); const [total, setTotal] = useState(0);
  const [observedAt, setObservedAt] = useState(0);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [removing, setRemoving] = useState<BlogPost | null>(null); const [busy, setBusy] = useState(false); const [reload, setReload] = useState(0);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true); setError("");
      adminApi<{ posts: BlogPost[]; total: number }>(`/api/admin/posts?${new URLSearchParams({ query, status, page: String(page), limit: "10" })}`)
        .then((data) => { if (active) { setPosts(data.posts); setTotal(data.total); setObservedAt(Date.now()); } })
        .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load articles."); })
        .finally(() => { if (active) setLoading(false); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [query, status, page, reload]);
  async function remove() {
    if (!removing) return; setBusy(true); setError("");
    try { await adminApi(`/api/admin/posts/${removing.id}`, { method: "DELETE", body: JSON.stringify({ version: removing.version }) }); setNotice(`“${removing.title}” was deleted.`); setRemoving(null); if (posts.length === 1 && page > 1) setPage(page - 1); else setReload(reload + 1); }
    catch (reason) { setError(reason instanceof ApiError && reason.status === 409 ? "This article changed since the list loaded. Refresh the list before deleting." : reason instanceof Error ? reason.message : "Deletion failed."); setRemoving(null); }
    finally { setBusy(false); }
  }
  const pages = Math.max(1, Math.ceil(total / 10));
  return <>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs uppercase tracking-[.2em] text-brand">The journal</p><h1 className="font-display text-4xl">Your stories, in one place.</h1><p className="mt-3 text-sm text-muted">Write, review, and publish the Havenfield perspective.</p></div><Link href="/admin/posts/new" className={buttonClass}><Plus className="size-4"/>New article</Link></div>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted"/><label htmlFor="article-search" className="sr-only">Search articles</label><input id="article-search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search title or introduction" className={`${fieldClass} pl-10`}/></div><label htmlFor="article-status" className="sr-only">Filter by status</label><select id="article-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={`${fieldClass} sm:w-44`}><option value="">All statuses</option><option value="draft">Drafts</option><option value="published">Published</option><option value="scheduled">Scheduled</option></select></div>
    {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error} <button onClick={() => setReload(reload + 1)} className="underline">Refresh list</button></div>}
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      {loading ? <p role="status" className="p-10 text-center text-muted">Loading articles…</p> : posts.length === 0 ? <div className="p-10 text-center"><h2 className="font-display text-2xl">{query || status ? "No matching stories." : "A new chapter starts here."}</h2><p className="mt-3 text-sm text-muted">{query || status ? "Try a different search or status." : "Create your first journal article to get started."}</p></div> : <ul className="divide-y divide-line">{posts.map((post) => <li key={post.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs capitalize ${post.status === "published" ? "bg-green-50 text-green-800" : post.status === "scheduled" ? "bg-blue-50 text-blue-800" : "bg-paper text-muted"}`}>{post.status === "scheduled" && post.publishedAt && Date.parse(post.publishedAt) <= observedAt ? "Published (scheduled)" : post.status}</span><span className="text-xs text-muted">{post.category}</span></div><Link href={`/admin/posts/${post.id}`} className="font-display text-xl hover:text-brand">{post.title}</Link><p className="mt-2 text-xs text-muted">By {post.author} · Updated {formatDate(post.updatedAt)}{post.status === "scheduled" ? ` · Scheduled ${formatDate(post.publishedAt)}` : ""}</p></div><div className="flex shrink-0 gap-2"><Link href={`/admin/posts/${post.id}`} aria-label={`Edit ${post.title}`} className="rounded-full border border-line p-3 hover:bg-paper"><Pencil className="size-4"/></Link><button onClick={() => { setError(""); setRemoving(post); }} aria-label={`Delete ${post.title}`} className="rounded-full border border-line p-3 text-red-700 hover:bg-red-50"><Trash2 className="size-4"/></button></div></li>)}</ul>}
    </div>
    <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted"><p>{total} article{total === 1 ? "" : "s"} · Page {page} of {pages}</p><div className="flex gap-2"><button disabled={loading || page <= 1} onClick={() => setPage(page - 1)} className="rounded-full border border-line p-2 disabled:opacity-40" aria-label="Previous page"><ArrowLeft className="size-4"/></button><button disabled={loading || page >= pages} onClick={() => setPage(page + 1)} className="rounded-full border border-line p-2 disabled:opacity-40" aria-label="Next page"><ArrowRight className="size-4"/></button></div></div>
    {removing && <ConfirmationDialog title="Delete this article?" description={`“${removing.title}” and its revision history will be removed. This action cannot be undone.`} cancelLabel="Keep article" confirmLabel="Delete article" destructive busy={busy} onCancel={() => setRemoving(null)} onConfirm={remove}/>}
  </>;
}
