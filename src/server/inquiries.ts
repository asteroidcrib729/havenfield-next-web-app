import { randomUUID, createHash } from "node:crypto";
import { inquirySchema } from "../lib/blog-schema";
import { clientAddress, rateLimit } from "./auth";
import { getDatabase } from "./database";
import { AppError } from "./errors";
import { inquiryPropertyExists } from "./properties";
import { lockMediaWrites } from "./media-registry";
import { recordAction } from "./audit";
export async function createInquiry(
  request: Request,
  body: unknown,
): Promise<{ id: string; message: string }> {
  const input = inquirySchema.parse(body);
  const db = await getDatabase();
  const key = input.idempotencyKey || randomUUID();
  const nowMs = Date.now();
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify([
        input.name,
        input.email.toLowerCase(),
        input.phone,
        input.message,
        input.propertyId,
      ]),
    )
    .digest("hex");
  const [previous] = await db.query(
    "SELECT fingerprint,inquiry_id FROM inquiry_receipts WHERE key=? AND expires_at>?",
    [key, nowMs],
  );
  const receipt = (id: string) => ({
    id,
    message:
      "Your inquiry is saved. This portfolio demo does not send email or contact a real estate agency.",
  });
  if (previous) {
    if (previous.fingerprint !== fingerprint)
      throw new AppError(
        409,
        "idempotency_conflict",
        "This submission reference was already used for different details",
      );
    return receipt(String(previous.inquiry_id));
  }
  await rateLimit(`inquiry:${clientAddress(request)}`, 5, 60 * 60_000);
  if (input.website) return { id: randomUUID(), message: "Your inquiry has been received." };
  await rateLimit(`inquiry-email:${input.email.toLowerCase()}`, 3, 60 * 60_000);
  const id = randomUUID();
  const now = new Date().toISOString();
  return db.transaction(async (tx) => {
    await tx.execute("DELETE FROM inquiry_receipts WHERE key=? AND expires_at<=?", [key, nowMs]);
    const claimed = await tx.execute(
      "INSERT INTO inquiry_receipts(key,fingerprint,inquiry_id,expires_at) VALUES(?,?,?,?) ON CONFLICT(key) DO NOTHING",
      [key, fingerprint, id, nowMs + 86400_000],
    );
    if (!claimed) {
      const [winner] = await tx.query(
        "SELECT fingerprint,inquiry_id FROM inquiry_receipts WHERE key=?",
        [key],
      );
      if (winner.fingerprint !== fingerprint)
        throw new AppError(
          409,
          "idempotency_conflict",
          "This submission reference was already used for different details",
        );
      return receipt(String(winner.inquiry_id));
    }
    if (input.propertyId) {
      await lockMediaWrites(tx);
      if (!(await inquiryPropertyExists(tx, input.propertyId)))
        throw new AppError(
          400,
          "property_reference",
          "Choose a published home from the collection or a general inquiry",
        );
    }
    await tx.execute(
      "INSERT INTO inquiries(id,name,email,phone,message,property_id,consent_at,created_at,status,updated_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
      [
        id,
        input.name,
        input.email.toLowerCase(),
        input.phone,
        input.message,
        input.propertyId,
        now,
        now,
        "new",
        now,
        new Date(nowMs + 30 * 86400_000).toISOString(),
      ],
    );
    return receipt(id);
  });
}
export async function listInquiries(
  options: { query?: string; status?: "new" | "reviewed" | "archived"; page?: number } = {},
) {
  const db = await getDatabase();
  const page = Math.max(1, Math.floor(options.page || 1));
  const limit = 20;
  const query = `%${(options.query || "")
    .toLowerCase()
    .slice(0, 200)
    .replace(/[\\%_]/g, "\\$&")}%`;
  const clause =
    "(LOWER(name) LIKE ? ESCAPE '\\' OR LOWER(email) LIKE ? ESCAPE '\\' OR LOWER(message) LIKE ? ESCAPE '\\')" +
    (options.status ? " AND status=?" : "");
  const params: unknown[] = [query, query, query];
  if (options.status) params.push(options.status);
  const total = Number(
    (await db.query(`SELECT COUNT(*) AS total FROM inquiries WHERE ${clause}`, params))[0].total,
  );
  const items = await db.query(
    `SELECT * FROM inquiries WHERE ${clause} ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit],
  );
  return { items, total, page, limit };
}
export async function changeInquiry(
  id: string,
  status: "new" | "reviewed" | "archived",
  actor: string,
) {
  await (
    await getDatabase()
  ).transaction(async (tx) => {
    if (
      !(await tx.execute("UPDATE inquiries SET status=?,updated_at=? WHERE id=?", [
        status,
        new Date().toISOString(),
        id,
      ]))
    )
      throw new AppError(404, "not_found", "Inquiry not found");
    await recordAction(tx, `inquiry.${status}`, id, actor);
  });
}
export async function deleteInquiry(id: string, actor: string) {
  await (
    await getDatabase()
  ).transaction(async (tx) => {
    if (!(await tx.execute("DELETE FROM inquiries WHERE id=?", [id])))
      throw new AppError(404, "not_found", "Inquiry not found");
    await recordAction(tx, "inquiry.delete", id, actor);
  });
}
export async function purgeExpiredInquiries(actor: string) {
  const now = new Date().toISOString();
  const cutoff = new Date(Date.now() - 30 * 86400_000).toISOString();
  return (await getDatabase()).transaction(async (tx) => {
    const count = await tx.execute(
      "DELETE FROM inquiries WHERE expires_at<=? OR (expires_at IS NULL AND created_at<=?)",
      [now, cutoff],
    );
    await tx.execute("DELETE FROM inquiry_receipts WHERE expires_at<=?", [Date.now()]);
    await tx.execute("DELETE FROM article_autosaves WHERE updated_at<=?", [cutoff]);
    await tx.execute("DELETE FROM publisher_actions WHERE created_at<=?", [
      new Date(Date.now() - 365 * 86400_000).toISOString(),
    ]);
    await recordAction(tx, "inquiry.expiry", String(count), actor);
    return count;
  });
}
