import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { ArticleBody } from "@/components/article-body";
import { getAdminSession } from "@/server/auth";
import { getAdminPost } from "@/server/blog";
export const dynamic = "force-dynamic";
export default async function ArticlePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) redirect("/admin/login");
  const { id } = await params;
  const post = await getAdminPost(id);
  if (!post) notFound();
  return <article className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-6 sm:p-10"><div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5"><p className="text-xs uppercase tracking-[.15em] text-brand">Private saved preview · {post.status}</p><Link href={`/admin/posts/${post.id}`} className="text-sm text-muted underline">Back to editor</Link></div><p className="mb-4 text-sm text-brand">{post.category}</p><h1 className="font-display text-4xl leading-tight sm:text-5xl">{post.title}</h1><p className="my-5 text-lg leading-8 text-muted">{post.excerpt}</p><p className="mb-8 text-xs text-muted">By {post.author} · Version {post.version}</p>{post.coverImage && <Image src={post.coverImage} alt={post.coverAlt} width={1200} height={800} unoptimized={post.coverImage.startsWith("https://")} referrerPolicy="no-referrer" className="mb-8 h-auto w-full rounded-xl"/>}<ArticleBody body={post.body}/><ul className="mt-8 flex flex-wrap gap-2">{post.tags.map((tag) => <li key={tag} className="rounded-full bg-paper px-3 py-1.5 text-xs text-muted">{tag}</li>)}</ul></article>;
}
