import { inquiryFilters, inquiryPatch, csvCell, type InquiryStage } from "../lib/inquiry-workflow";
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
  options: {
    query?: string;
    status?: "new" | "reviewed" | "archived";
    stage?: InquiryStage;
    propertyId?: string;
    page?: number;
  } = {},
  limit = 20,
) {
  const input = inquiryFilters.parse(options),
    db = await getDatabase();
  const query = "%" + input.query.toLowerCase().replace(/[\\%_]/g, "\\$&") + "%";
  let clause =
    "(LOWER(i.name) LIKE ? ESCAPE '\\' OR LOWER(i.email) LIKE ? ESCAPE '\\' OR LOWER(i.message) LIKE ? ESCAPE '\\')";
  const params: unknown[] = [query, query, query];
  for (const [field, value] of [
    ["status", input.status],
    ["stage", input.stage],
    ["property_id", input.propertyId],
  ]) {
    if (value) {
      clause += " AND i." + field + "=?";
      params.push(value === "general" && field === "property_id" ? "" : value);
    }
  }
  const total = Number(
    (await db.query("SELECT COUNT(*) AS total FROM inquiries i WHERE " + clause, params))[0].total,
  );
  const rows = await db.query(
    "SELECT i.*,p.content AS property_content FROM inquiries i LEFT JOIN properties p ON p.id=i.property_id WHERE " +
      clause +
      " ORDER BY i.created_at DESC,i.id DESC LIMIT ? OFFSET ?",
    [...params, limit, (input.page - 1) * limit],
  );
  const items = rows.map(({ property_content, ...row }) => ({
    ...row,
    id: String(row.id),
    property_name: property_content
      ? String(JSON.parse(String(property_content)).name)
      : row.property_id
        ? "Unavailable home (" + row.property_id + ")"
        : "General inquiry",
  }));
  const propertyOptions = (await db.query("SELECT id,content FROM properties ORDER BY id")).map(
    (row) => ({ id: String(row.id), name: String(JSON.parse(String(row.content)).name) }),
  );
  return { items, total, page: input.page, limit, propertyOptions };
}
export async function exportInquiries(options: Parameters<typeof listInquiries>[0]) {
  const data = await listInquiries({ ...options, page: 1 }, 1001);
  if (data.total > 1000)
    throw new AppError(413, "export_limit", "Narrow the filters to export at most 1,000 inquiries");
  const columns = [
    "id",
    "name",
    "email",
    "phone",
    "message",
    "property_name",
    "status",
    "stage",
    "notes",
    "created_at",
    "updated_at",
    "expires_at",
  ];
  return (
    "\uFEFF" +
    [
      columns.map(csvCell).join(","),
      ...data.items.map((row) =>
        columns.map((key) => csvCell((row as Record<string, unknown>)[key])).join(","),
      ),
    ].join("\r\n") +
    "\r\n"
  );
}
export async function changeInquiry(
  id: string,
  status: "new" | "reviewed" | "archived" | undefined,
  actor: string,
  details: { stage?: InquiryStage; notes?: string; version?: number } = {},
) {
  const input = inquiryPatch.parse({ status, ...details }),
    db = await getDatabase();
  await db.transaction(async (tx) => {
    const changed = await tx.execute(
      "UPDATE inquiries SET status=COALESCE(?,status),stage=COALESCE(?,stage),notes=COALESCE(?,notes),version=version+1,updated_at=? WHERE id=?" +
        (input.version !== undefined ? " AND version=?" : ""),
      [
        input.status ?? null,
        input.stage ?? null,
        input.notes ?? null,
        new Date().toISOString(),
        id,
        ...(input.version !== undefined ? [input.version] : []),
      ],
    );
    if (!changed) {
      const exists = await tx.query("SELECT id FROM inquiries WHERE id=?", [id]);
      throw new AppError(
        exists.length ? 409 : 404,
        exists.length ? "version_conflict" : "not_found",
        exists.length
          ? "This inquiry changed. Reload before saving your notes again."
          : "Inquiry not found",
      );
    }
    await recordAction(
      tx,
      input.stage !== undefined || input.notes !== undefined
        ? "inquiry.conversation"
        : "inquiry." + input.status,
      id,
      actor,
    );
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
