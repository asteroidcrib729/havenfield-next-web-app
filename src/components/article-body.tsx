import {articleHeadings} from "@/lib/article-headings";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function safeUrl(value: string, key: string): string {
  if ((value.startsWith("/") && !value.startsWith("//")) || value.startsWith("#")) return value;
  try { const url = new URL(value); if (url.protocol === "https:" || (key === "href" && url.protocol === "http:")) return url.username || url.password ? "" : value; } catch { /* Omit malformed and executable URLs. */ }
  return "";
}

export function ArticleBody({ body }: { body: string }) {
  const headings=articleHeadings(body);
  return <div className="min-w-0 space-y-6 wrap-anywhere text-lg leading-[1.85] text-muted">
    {headings.length>=3&&<nav aria-label="In this article" className="rounded-xl border border-line bg-paper p-5 text-sm"><p className="mb-3 font-medium text-ink">In this article</p><ul className="space-y-2">{headings.map(heading=><li key={heading.id}><a href={`#${heading.id}`} className="underline underline-offset-4">{heading.label}</a></li>)}</ul></nav>}
    <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml urlTransform={safeUrl} components={{
      h1: ({ children,node }) => <h2 id={headings.find(heading=>heading.line===node?.position?.start.line)?.id} className="pt-5 font-display text-3xl leading-tight text-ink sm:text-4xl">{children}</h2>,
      h2: ({ children,node }) => <h2 id={headings.find(heading=>heading.line===node?.position?.start.line)?.id} className="pt-5 font-display text-3xl leading-tight text-ink sm:text-4xl">{children}</h2>,
      h3: ({ children,node }) => <h3 id={headings.find(heading=>heading.line===node?.position?.start.line)?.id} className="pt-3 font-display text-2xl text-ink">{children}</h3>,
      h4: ({ children }) => <h4 className="pt-2 font-display text-xl text-ink">{children}</h4>,
      strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
      a: ({ href, children }) => href ? <Link href={href} className="text-ink underline decoration-brand underline-offset-4" {...(href.startsWith("http") ? { rel: "noopener noreferrer" } : {})}>{children}</Link> : <span>{children}</span>,
      ul: ({ children }) => <ul className="list-disc space-y-2 pl-6 marker:text-brand">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal space-y-2 pl-6 marker:text-brand">{children}</ol>,
      blockquote: ({ children }) => <blockquote className="border-l-2 border-brand pl-6 font-display text-2xl italic text-ink">{children}</blockquote>,
      pre: ({ children }) => <pre className="overflow-x-auto rounded-xl bg-ink p-5 text-sm text-paper">{children}</pre>,
      code: ({ children, className }) => <code className={className || "rounded bg-line/40 px-1 py-0.5 text-sm"}>{children}</code>,
      table: ({ children }) => <div className="overflow-x-auto rounded-xl border border-line"><table className="w-full border-collapse text-left text-sm">{children}</table></div>,
      th: ({ children }) => <th className="border-b border-line bg-line/30 px-4 py-3 font-semibold text-ink">{children}</th>,
      td: ({ children }) => <td className="border-b border-line px-4 py-3">{children}</td>,
      img: ({ src, alt }) => typeof src === "string" && src ? <Image src={src} alt={alt || ""} width={1200} height={800} unoptimized={src.startsWith("https://")} referrerPolicy="no-referrer" sizes="(max-width: 768px) 100vw, 768px" className="h-auto w-full rounded-xl" /> : null,
    }}>{body}</ReactMarkdown>
  </div>;
}
