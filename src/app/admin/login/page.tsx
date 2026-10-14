"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { adminApi, ApiError, buttonClass, fieldClass } from "@/components/admin/api";
export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    try { await adminApi("/api/auth/login", { method: "POST", body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) }); router.replace("/admin"); router.refresh(); }
    catch (reason) { setError(reason instanceof ApiError && reason.code === "auth_configuration" ? "The editorial account has not been configured on this deployment. Ask the site owner to set up administrator credentials and the session secret." : reason instanceof Error ? reason.message : "Sign in failed."); }
    finally { setBusy(false); }
  }
  return <div className="flex min-h-screen items-center justify-center bg-paper px-5 py-12 text-ink"><div className="w-full max-w-md">
    <div className="mb-10 flex justify-center"><Logo/></div>
    <div className="rounded-3xl border border-line bg-white p-7 sm:p-10"><p className="mb-3 text-xs uppercase tracking-[.2em] text-brand">Editorial desk</p><h1 className="font-display text-3xl">A place for your stories.</h1><p className="mb-7 mt-3 text-sm leading-6 text-muted">Sign in with your configured administrator account to manage the journal.</p>
      <form onSubmit={submit} className="space-y-5"><div><label htmlFor="email" className="mb-2 block text-sm font-medium">Email address</label><input id="email" name="email" type="email" required autoComplete="username" className={fieldClass}/></div><div><label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className={fieldClass}/></div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <button disabled={busy} className={`${buttonClass} w-full`}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div><p className="mt-6 text-center text-xs leading-5 text-muted">Access is restricted to the configured editor. This portfolio does not offer public registration.</p>
  </div></div>;
}
