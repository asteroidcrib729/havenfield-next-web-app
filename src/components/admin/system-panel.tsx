"use client";
import { useEffect, useState } from "react";
import { adminApi, buttonClass } from "./api";
type Summary = {
  configuration: Record<string, string | number | boolean>;
  databaseReady: boolean;
  actions: { actor: string; action: string; target: string; created_at: string }[];
  migrations: { version: number; name: string; applied_at: string }[];
};
export function SystemPanel() {
  const [data, setData] = useState<Summary | null>(null),
    [error, setError] = useState(""),
    [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    adminApi<Summary>("/api/admin/system")
      .then((result) => {
        if (active) setData(result);
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      });
    return () => {
      active = false;
    };
  }, [reload]);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">Operations</h1>
      <p className="text-sm leading-6 text-muted">
        Configuration and recent publisher actions. Checks run on opening or refreshing this screen.
        Provider quotas, independent backups and hosted verification require the operator’s
        accounts.
      </p>
      <button onClick={() => setReload((n) => n + 1)} className={buttonClass}>
        Refresh health
      </button>
      {error && <p role="alert">{error}</p>}
      {data && (
        <>
          <h2 className="font-display text-2xl">Configuration</h2>
          <dl className="grid gap-4 rounded-2xl bg-white p-5 sm:grid-cols-2">
            {Object.entries({ ...data.configuration, databaseReady: data.databaseReady }).map(
              ([key, value]) => (
                <div key={key}>
                  <dt className="text-sm text-muted">{key}</dt>
                  <dd className="mt-1 font-medium">
                    {typeof value === "boolean"
                      ? value
                        ? "Ready"
                        : "Not configured / unavailable"
                      : String(value)}
                  </dd>
                </div>
              ),
            )}
          </dl>
          <h2 className="font-display text-2xl">Applied migrations</h2>
          <ul className="space-y-2 text-sm">
            {data.migrations.map((m) => (
              <li key={m.version}>
                {m.version} · {m.name}
              </li>
            ))}
          </ul>
          <h2 className="font-display text-2xl">Recent actions</h2>
          <div className="min-w-0 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full text-left text-xs">
              <thead>
                <tr>
                  {["UTC time", "Publisher", "Action", "Target"].map((label) => (
                    <th key={label} className="p-3">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.actions.map((action, i) => (
                  <tr key={i} className="border-t border-line">
                    {[action.created_at, action.actor, action.action, action.target].map(
                      (value, j) => (
                        <td key={j} className="max-w-64 wrap-anywhere p-3">
                          {value}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
