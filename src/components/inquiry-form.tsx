"use client";

import { useState, useRef, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { properties } from "@/content/properties";

export function InquiryForm({ propertyId = "" }: { propertyId?: string }) {
  const [pending, setPending] = useState(false);
  const submission = useRef("");
  const submitting = useRef(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ id: string; message: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    submission.current ||= crypto.randomUUID();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "Havenfield" },
        body: JSON.stringify({
          idempotencyKey: submission.current,
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone") || "",
          message: data.get("message"),
          propertyId: data.get("propertyId") || undefined,
          consent: data.get("consent") === "on",
          website: data.get("website") || "",
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Your message could not be saved. Please try again.");
      setReceipt(result);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Unable to connect. Please try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  if (receipt)
    return (
      <div role="status" className="rounded-2xl border border-line bg-white/60 p-8">
        <CheckCircle2 className="text-brand" size={32} aria-hidden="true" />
        <h2 className="mt-5 font-display text-3xl">Your inquiry was recorded.</h2>
        <p className="mt-4 leading-relaxed text-muted">{receipt.message}</p>
        <p className="mt-4 break-all text-xs text-muted">Reference: {receipt.id}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          This is a portfolio demonstration. Recording an inquiry does not send an email, arrange a
          viewing, or guarantee a response.
        </p>
        <button
          onClick={() => {
            submission.current = "";
            setReceipt(null);
          }}
          className="mt-6 text-sm text-ink underline underline-offset-4"
        >
          Send another demo inquiry
        </button>
      </div>
    );
  const field =
    "mt-2 w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand";
  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-white/40 p-6 sm:p-8">
      <fieldset disabled={pending} className="space-y-5 disabled:opacity-70">
        <legend className="font-display text-3xl">Start a conversation</legend>
        <p className="pt-2 text-sm leading-relaxed text-muted">
          Try this workflow with fictional details. Fields marked * are required.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm">
            Your name *
            <input
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              className={field}
              placeholder="Alex Taylor"
            />
          </label>
          <label className="block text-sm">
            Email *
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              className={field}
              placeholder="alex@example.com"
            />
          </label>
        </div>
        <label className="block text-sm">
          Phone <span className="text-muted">(optional)</span>
          <input name="phone" type="tel" autoComplete="tel" maxLength={40} className={field} />
        </label>
        <label className="block text-sm">
          A home you have in mind
          <select
            name="propertyId"
            defaultValue={
              properties.some((property) => property.id === propertyId) ? propertyId : ""
            }
            className={field}
          >
            <option value="">A general inquiry</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Your message *
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={3000}
            rows={5}
            className={`${field} resize-y`}
            placeholder="Tell us which details caught your eye…"
          />
        </label>
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className="flex items-start gap-3 text-xs leading-relaxed text-muted">
          <input
            name="consent"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 shrink-0 accent-brand"
          />
          <span>
            I agree to store this demonstration inquiry and have read the{" "}
            <Link href="/privacy" className="text-ink underline underline-offset-4">
              privacy information
            </Link>
            . I will use fictional details and will not include sensitive information. *
          </span>
        </label>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          className="inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-sm text-paper hover:bg-brand disabled:cursor-wait"
        >
          {pending ? (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              Saving inquiry…
            </>
          ) : (
            <>
              Send demo inquiry
              <ArrowUpRight size={17} />
            </>
          )}
        </button>
      </fieldset>
    </form>
  );
}
