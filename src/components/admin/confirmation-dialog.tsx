"use client";
import { useEffect, useRef } from "react";
import { buttonClass } from "./api";
export function ConfirmationDialog({ title, description, cancelLabel, confirmLabel, busy, destructive, onCancel, onConfirm }: { title: string; description: string; cancelLabel: string; confirmLabel: string; busy: boolean; destructive?: boolean; onCancel: () => void; onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; const trigger=document.activeElement; element?.showModal(); return () => { element?.close(); requestAnimationFrame(()=>{const target=trigger instanceof HTMLElement&&trigger.isConnected?trigger:document.querySelector("main h1");if(target instanceof HTMLElement){if(target.tagName==="H1")target.tabIndex=-1;target.focus();}}); }; }, []);
  return <dialog ref={dialog} aria-labelledby="confirmation-title" aria-describedby="confirmation-description" onCancel={(event) => { event.preventDefault(); if (!busy) onCancel(); }} className="fixed inset-0 m-auto w-[calc(100%_-_2.5rem)] max-w-md rounded-2xl bg-white p-7 text-ink shadow-xl backdrop:bg-ink/50">
    <h2 id="confirmation-title" className="font-display text-2xl">{title}</h2><p id="confirmation-description" className="my-4 text-sm leading-6 text-muted">{description}</p><div className="flex justify-end gap-3"><button disabled={busy} onClick={onCancel} className="rounded-full border border-line px-4 py-2.5 text-sm disabled:opacity-50">{cancelLabel}</button><button disabled={busy} onClick={onConfirm} className={destructive ? "rounded-full bg-red-700 px-5 py-2.5 text-sm text-white disabled:opacity-50" : buttonClass}>{busy ? "Working…" : confirmLabel}</button></div>
  </dialog>;
}
