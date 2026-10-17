"use client";
import Link from "next/link";
import { useState } from "react";
import { Heart, Columns3 } from "lucide-react";
import { useHomeChoices } from "./use-home-choices";
export function HomeActions({ id, name }: { id: string; name: string }) {
  const choices = useHomeChoices();
  const [notice, setNotice] = useState("");
  const button =
    "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-paper/95 px-3 py-2 text-xs text-ink transition-colors hover:border-brand hover:text-brand";
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-label={"Save " + name}
          aria-pressed={choices.saved.includes(id)}
          className={button}
          onClick={() => {
            choices.toggle("saved", id);
            setNotice("");
          }}
        >
          <Heart
            size={15}
            aria-hidden="true"
            fill={choices.saved.includes(id) ? "currentColor" : "none"}
          />
          {choices.saved.includes(id) ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          aria-label={"Compare " + name}
          aria-pressed={choices.compare.includes(id)}
          className={button}
          onClick={() =>
            setNotice(
              choices.toggle("compare", id)
                ? ""
                : "Compare up to three homes. Remove one before adding another.",
            )
          }
        >
          <Columns3 size={15} aria-hidden="true" />
          {choices.compare.includes(id) ? "Selected" : "Compare"}
        </button>
      </div>
      {notice ? (
        <p role="status" className="mt-3 max-w-xs text-xs leading-5 text-brand">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
export function HomeChoiceLinks() {
  const choices = useHomeChoices();
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-soft/50 px-5 py-4 text-sm">
      <p>Keep a few possibilities in mind.</p>
      <div className="flex flex-wrap gap-5">
        <Link href="/saved" className="underline underline-offset-4">
          Saved homes ({choices.saved.length})
        </Link>
        <Link href="/compare" className="underline underline-offset-4">
          Compare homes ({choices.compare.length}/3)
        </Link>
      </div>
      {choices.temporary ? (
        <p role="status" className="basis-full text-xs text-muted">
          Your browser blocked storage. Your choices will last only until this page is reloaded.
        </p>
      ) : null}
    </div>
  );
}
