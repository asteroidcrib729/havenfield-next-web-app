import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { cookies } from "next/headers";
import { AppError } from "./errors";
import { getDatabase } from "./database";
import { serverEnvironment } from "./environment";

export const SESSION_COOKIE = "havenfield_admin";
const SESSION_SECONDS = 8 * 60 * 60;
function sessionSecret(): string {
  const secret = serverEnvironment().secret;
  if (!secret || secret.length < 32)
    throw new AppError(503, "auth_configuration", "Admin authentication is not configured");
  return secret;
}
export function verifyPassword(password: string, encoded: string): boolean {
  const [scheme, salt, hash, extra] = encoded.split(":");
  if (
    scheme !== "scrypt" ||
    extra ||
    !/^[a-f0-9]{64}$/.test(salt || "") ||
    !/^[a-f0-9]{128}$/.test(hash || "")
  )
    return false;
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}
function fingerprint(): string {
  return createHmac("sha256", sessionSecret())
    .update(process.env.ADMIN_PASSWORD_HASH || "")
    .digest("hex")
    .slice(0, 24);
}
export function createSession(email: string, now = Date.now()): string {
  const data = Buffer.from(
    JSON.stringify({
      email,
      expires: now + SESSION_SECONDS * 1000,
      nonce: randomBytes(16).toString("hex"),
      fingerprint: fingerprint(),
    }),
  ).toString("base64url");
  return `${data}.${createHmac("sha256", sessionSecret()).update(data).digest("base64url")}`;
}
export function verifySession(token: string, now = Date.now()): { email: string } | null {
  try {
    const [data, signature, extra] = token.split(".");
    if (!data || !signature || extra || token.length > 2048) return null;
    const expected = createHmac("sha256", sessionSecret()).update(data).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (
      payload.email !== process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
      typeof payload.expires !== "number" ||
      payload.expires <= now ||
      payload.fingerprint !== fingerprint()
    )
      return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}
export async function getAdminSession(): Promise<{ email: string } | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySession(token) : null;
}
export async function requireAdminSession(): Promise<{ email: string }> {
  const session = await getAdminSession();
  if (!session) throw new AppError(401, "unauthorized", "Sign in to continue");
  return session;
}
export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}
export async function clearSessionCookie() {
  (await cookies()).set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
export function checkMutationOrigin(request: Request): void {
  if (request.headers.get("x-requested-with") !== "Havenfield")
    throw new AppError(403, "csrf", "The request could not be verified");
  const origin = request.headers.get("origin");
  const expected = serverEnvironment().mutationOrigin || new URL(request.url).origin;
  if (!origin || origin !== expected)
    throw new AppError(403, "origin", "The request origin is not allowed");
  if (request.headers.get("sec-fetch-site") === "cross-site")
    throw new AppError(403, "csrf", "The request could not be verified");
}
export async function rateLimit(key: string, maximum: number, windowMs: number, now = Date.now()) {
  const db = await getDatabase();
  const digest = createHmac("sha256", serverEnvironment().secret || "local-development-rate-limit")
    .update(key)
    .digest("hex");
  await db.transaction(async (tx) => {
    // Atomic upsert prevents bypass through simultaneous requests in multiple functions.
    const rows = await tx.query<{ count: number; expires_at: number }>(
      "INSERT INTO rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires_at<=? THEN 1 ELSE rate_limits.count+1 END, expires_at=CASE WHEN rate_limits.expires_at<=? THEN ? ELSE rate_limits.expires_at END RETURNING count,expires_at",
      [digest, now + windowMs, now, now, now + windowMs],
    );
    if (Number(rows[0].count) > maximum)
      throw new AppError(
        429,
        "rate_limited",
        "Too many requests. Try again later.",
        Math.max(1, Math.ceil((Number(rows[0].expires_at) - now) / 1000)),
      );
    await tx.execute("DELETE FROM rate_limits WHERE expires_at<?", [now - windowMs]);
  });
}
export function clientAddress(request: Request): string {
  // Only the Vercel ingress is trusted. Locally, forwarded headers are user input.
  if (!process.env.VERCEL) return "local-client";
  const address = (
    request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for")
  )?.trim();
  // Reject chains and malformed values rather than selecting an attacker-controlled hop.
  return address && isIP(address) ? address : "unknown";
}
export async function login(request: Request, email: string, password: string): Promise<string> {
  sessionSecret();
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const encoded = process.env.ADMIN_PASSWORD_HASH;
  if (!configuredEmail || !encoded || !/^scrypt:[a-f0-9]{64}:[a-f0-9]{128}$/.test(encoded))
    throw new AppError(503, "auth_configuration", "Admin authentication is not configured");
  await rateLimit(`login:ip:${clientAddress(request)}`, 10, 15 * 60_000);
  await rateLimit(`login:email:${email.toLowerCase()}`, 5, 15 * 60_000);
  const match = verifyPassword(password, encoded);
  const candidate = createHmac("sha256", sessionSecret())
    .update(email.trim().toLowerCase())
    .digest();
  const expected = createHmac("sha256", sessionSecret()).update(configuredEmail).digest();
  if (!timingSafeEqual(candidate, expected) || !match)
    throw new AppError(401, "invalid_credentials", "Email or password is incorrect");
  return createSession(configuredEmail);
}
