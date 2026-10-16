import { z } from "zod";
import { NextResponse } from "next/server";
import { AppError } from "./errors";
import { randomUUID } from "node:crypto";

export async function readJson(request: Request, maximum = 128_000): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new AppError(415, "content_type", "Send JSON content");
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maximum) throw new AppError(413, "payload_too_large", "The request is too large");
  if (!request.body) throw new AppError(400, "invalid_json", "The JSON body is required");
  const reader = request.body.getReader();
  let length = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > maximum) {
        await reader.cancel();
        throw new AppError(413, "payload_too_large", "The request is too large");
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(400, "invalid_json", "The JSON body is invalid");
  }
}
export function apiError(error: unknown): NextResponse {
  if (error instanceof z.ZodError)
    return json(
      { error: "Check the submitted fields", code: "validation", details: error.flatten() },
      400,
    );
  if (error instanceof AppError) {
    const response = json({ error: error.message, code: error.code }, error.status);
    if (error.status === 429) response.headers.set("Retry-After", String(error.retryAfter || 60));
    return response;
  }
  const response = json(
    { error: "The service is temporarily unavailable", code: "service_unavailable" },
    503,
  );
  console.error(
    JSON.stringify({
      event: "request_failed",
      requestId: response.headers.get("X-Request-ID"),
      type: error instanceof Error ? error.name : "UnknownError",
    }),
  );
  return response;
}
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Request-ID": randomUUID(),
    },
  });
}
