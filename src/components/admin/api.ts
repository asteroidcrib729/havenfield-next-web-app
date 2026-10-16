export type { BlogPost, PostStatus } from "@/lib/blog-types";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}
export async function adminApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const multipart = init.body instanceof FormData;
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      ...(!multipart ? { "Content-Type": "application/json" } : {}),
      "x-requested-with": "Havenfield",
      ...init.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      typeof data.error === "string"
        ? data.error
        : (data.error?.message ??
            data.message ??
            "The request could not be completed. Please try again."),
      response.status,
      data.code,
    );
  return data as T;
}
export function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(
        new Date(value),
      )
    : "—";
}
export const fieldClass =
  "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60";
export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50";
