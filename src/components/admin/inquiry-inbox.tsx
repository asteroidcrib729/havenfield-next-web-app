"use client";
import { useEffect, useState } from "react";
import { inquiryStages, inquiryStates, stageLabel } from "@/lib/inquiry-workflow";
import { adminApi, buttonClass, fieldClass, formatDate } from "./api";
import { ConfirmationDialog } from "./confirmation-dialog";
type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  property_id: string;
  property_name: string;
  status: (typeof inquiryStates)[number];
  stage: (typeof inquiryStages)[number];
  notes: string;
  version: number;
  created_at: string;
  expires_at: string | null;
};
type InboxData = {
  items: Inquiry[];
  total: number;
  limit: number;
  propertyOptions: { id: string; name: string }[];
};
function Conversation({
  item,
  onSaved,
  onError,
}: {
  item: Inquiry;
  onSaved: () => void;
  onError: (message: string) => void;
}) {
  const [status, setStatus] = useState(item.status),
    [stage, setStage] = useState(item.stage),
    [notes, setNotes] = useState(item.notes),
    [busy, setBusy] = useState(false);
  const dirty = status !== item.status || stage !== item.stage || notes !== item.notes;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  return (
    <form
      className="space-y-4 border-t border-line pt-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        try {
          await adminApi("/api/admin/inquiries/" + item.id, {
            method: "PATCH",
            body: JSON.stringify({ status, stage, notes, version: item.version }),
          });
          onSaved();
        } catch (reason) {
          onError(reason instanceof Error ? reason.message : "Could not save the conversation.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="flex flex-wrap gap-4">
        <label className="text-sm">
          State for {item.name}
          <select
            value={status}
            disabled={busy}
            onChange={(event) => setStatus(event.target.value as Inquiry["status"])}
            className={`mt-2 ${fieldClass}`}
          >
            {inquiryStates.map((value) => (
              <option key={value} value={value}>
                {stageLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Conversation stage for {item.name}
          <select
            value={stage}
            disabled={busy}
            onChange={(event) => setStage(event.target.value as Inquiry["stage"])}
            className={`mt-2 ${fieldClass}`}
          >
            {inquiryStages.map((value) => (
              <option key={value} value={value}>
                {stageLabel(value)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm">
        Internal notes for {item.name}
        <textarea
          value={notes}
          disabled={busy}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={4000}
          rows={3}
          className={`mt-2 ${fieldClass}`}
        />
      </label>
      <p className="text-xs text-muted">
        Private to the publisher. Notes expire with this inquiry. Save before changing filters or
        leaving the page.
      </p>
      <button type="submit" disabled={!dirty || busy} className={buttonClass}>
        {busy ? "Saving conversation…" : "Save conversation"}
      </button>
    </form>
  );
}
export function InquiryInbox() {
  const [data, setData] = useState<InboxData | null>(null),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [stage, setStage] = useState(""),
    [propertyId, setPropertyId] = useState(""),
    [page, setPage] = useState(1),
    [reload, setReload] = useState(0),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [target, setTarget] = useState<Inquiry | "expiry" | null>(null),
    [busy, setBusy] = useState(false);
  const filters = new URLSearchParams({ query, status, stage, propertyId }).toString();
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      adminApi<InboxData>("/api/admin/inquiries?" + filters + "&page=" + page)
        .then((result) => {
          if (active) {
            setData(result);
            setError("");
          }
        })
        .catch((reason) => {
          if (active) setError(reason.message);
        });
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [filters, page, reload]);
  async function remove() {
    if (!target) return;
    setBusy(true);
    try {
      const result = await adminApi<{ deleted?: number }>(
        target === "expiry" ? "/api/admin/inquiries" : "/api/admin/inquiries/" + target.id,
        { method: "DELETE" },
      );
      setNotice(
        target === "expiry"
          ? `${result.deleted ?? 0} expired inquiries removed.`
          : "Inquiry deleted.",
      );
      setTarget(null);
      setReload((n) => n + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Deletion failed.");
      setTarget(null);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">Inquiry inbox</h1>
      <p className="text-sm leading-6 text-muted">
        Portfolio demonstration records, retained for 30 days. Conversation stages and notes are
        internal; no email is sent and a viewing request does not book an appointment.
      </p>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      <div className="flex flex-wrap items-end gap-4">
        <label className="min-w-0 flex-1 text-sm">
          Search inquiries
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className={`mt-2 ${fieldClass}`}
          />
        </label>
        <label className="text-sm">
          Inquiry status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className={`mt-2 ${fieldClass}`}
          >
            <option value="">All states</option>
            {inquiryStates.map((v) => (
              <option key={v} value={v}>
                {stageLabel(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Conversation stage
          <select
            value={stage}
            onChange={(e) => {
              setStage(e.target.value);
              setPage(1);
            }}
            className={`mt-2 ${fieldClass}`}
          >
            <option value="">All stages</option>
            {inquiryStages.map((v) => (
              <option key={v} value={v}>
                {stageLabel(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Property
          <select
            value={propertyId}
            onChange={(e) => {
              setPropertyId(e.target.value);
              setPage(1);
            }}
            className={`mt-2 ${fieldClass}`}
          >
            <option value="">All homes</option>
            <option value="general">General inquiry</option>
            {data?.propertyOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <a href={"/api/admin/inquiries/export?" + filters} download className={buttonClass}>
          Export filtered CSV
        </a>
        <button onClick={() => setTarget("expiry")} className={buttonClass}>
          Remove expired records
        </button>
      </div>
      <p className="text-xs leading-6 text-muted">
        CSV exports include private notes and contact details, with at most 1,000 records. Keep
        downloads private. Narrow the filters for larger inboxes.
      </p>
      {!data ? (
        <p role="status">Loading inquiries…</p>
      ) : (
        <>
          <p role="status">
            {data.total} inquiries · Page {page}
          </p>
          {!data.items.length && (
            <p className="rounded-xl bg-white p-5">No inquiries match these filters.</p>
          )}
          <div className="space-y-4">
            {data.items.map((item) => (
              <article
                key={item.id}
                className="min-w-0 space-y-3 rounded-2xl border border-line bg-white p-5"
              >
                <h2 className="font-display text-2xl">{item.name}</h2>
                <p className="text-sm wrap-anywhere">
                  {item.email}
                  {item.phone && " · " + item.phone}
                </p>
                <p className="text-xs text-muted">
                  {item.property_name} · {formatDate(item.created_at)} · Expires{" "}
                  {formatDate(item.expires_at)}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-6 wrap-anywhere">
                  {item.message}
                </p>
                <Conversation
                  key={item.id + "-" + item.version}
                  item={item}
                  onError={setError}
                  onSaved={() => {
                    setNotice("Conversation saved.");
                    setReload((n) => n + 1);
                  }}
                />
                <button
                  onClick={() => setTarget(item)}
                  disabled={busy}
                  className="rounded-full border border-line px-4 py-2 text-sm text-red-800"
                >
                  Delete inquiry
                </button>
              </article>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((n) => n - 1)}
              className={buttonClass}
            >
              Previous
            </button>
            <button
              disabled={page * data.limit >= data.total}
              onClick={() => setPage((n) => n + 1)}
              className={buttonClass}
            >
              Next
            </button>
          </div>
        </>
      )}
      {target && (
        <ConfirmationDialog
          title={target === "expiry" ? "Remove expired records?" : "Delete this inquiry?"}
          description="Deletion permanently removes contact details and internal notes. Expiry also removes old retry receipts and recovery drafts. Backup copies follow the operator's separate retention policy."
          confirmLabel="Confirm deletion"
          cancelLabel="Keep records"
          destructive
          busy={busy}
          onCancel={() => setTarget(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}
