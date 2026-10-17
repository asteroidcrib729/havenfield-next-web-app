"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, FileText, LogOut, Plus } from "lucide-react";
import { Logo } from "@/components/logo";
import { adminApi, ApiError } from "./api";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const isLogin = path === "/admin/login";
  useEffect(() => {
    if (isLogin) return;
    let active = true;
    adminApi<{ authenticated: boolean; email?: string }>("/api/auth/session")
      .then((session) => {
        if (!active) return;
        if (!session.authenticated) {
          router.replace("/admin/login");
          return;
        }
        setEmail(session.email ?? "Editorial administrator");
        setChecking(false);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        if (reason instanceof ApiError && reason.status === 401) router.replace("/admin/login");
        else {
          setError(reason instanceof Error ? reason.message : "Could not verify your session.");
          setChecking(false);
        }
      });
    return () => {
      active = false;
    };
  }, [isLogin, router]);
  if (isLogin) return <>{children}</>;
  if (checking)
    return (
      <div className="grid min-h-screen place-items-center bg-paper">
        <p role="status" className="text-muted">
          Checking your editorial session…
        </p>
      </div>
    );
  if (error)
    return (
      <div className="grid min-h-screen place-items-center bg-paper p-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl">Editorial desk unavailable</h1>
          <p role="alert" className="my-4 text-muted">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-ink px-5 py-3 text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  async function logout() {
    if (!window.dispatchEvent(new Event("havenfield:before-signout", { cancelable: true }))) return;
    try {
      await adminApi("/api/auth/logout", { method: "POST", body: "{}" });
      setEmail(null);
      setChecking(true);
      router.replace("/admin/login");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign out failed.");
    }
  }
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white px-5 py-5 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Logo />
            <Link
              href="/admin"
              className="hidden text-xs uppercase tracking-[.18em] text-muted sm:block"
            >
              Editorial desk
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1 text-sm text-muted hover:text-brand">
              View site <ArrowUpRight className="size-4" />
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:bg-paper"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-7 lg:grid-cols-[200px_minmax(0,1fr)] lg:px-10 lg:py-10">
        <aside className="min-w-0">
          <p className="mb-5 truncate text-xs text-muted" title={email ?? ""}>
            {email}
          </p>
          <nav aria-label="Editorial navigation" className="flex flex-wrap gap-2 lg:flex-col">
            <Link
              href="/admin"
              aria-current={
                path === "/admin"
                  ? "page"
                  : path.startsWith("/admin/posts/") && path !== "/admin/posts/new"
                    ? "location"
                    : undefined
              }
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${path === "/admin" || (path.startsWith("/admin/posts/") && path !== "/admin/posts/new") ? "bg-ink text-white" : "hover:bg-white"}`}
            >
              <FileText className="size-4" />
              All articles
            </Link>
            <Link
              href="/admin/posts/new"
              aria-current={path === "/admin/posts/new" ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${path === "/admin/posts/new" ? "bg-ink text-white" : "hover:bg-white"}`}
            >
              <Plus className="size-4" />
              New article
            </Link>
            {[
              { href: "/admin/properties", label: "Properties" },
              { href: "/admin/media", label: "Media library" },
              { href: "/admin/inquiries", label: "Inquiry inbox" },
              { href: "/admin/system", label: "Operations" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  path === item.href
                    ? "page"
                    : path.startsWith(item.href + "/")
                      ? "location"
                      : undefined
                }
                className={`rounded-xl px-4 py-3 text-sm ${path === item.href ? "bg-ink text-white" : "hover:bg-white"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="mt-8 hidden text-xs leading-6 text-muted lg:block">
            Thoughtful stories about the spaces we call home. Publish with care.
          </p>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
