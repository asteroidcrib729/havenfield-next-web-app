import { requireAdminSession, checkMutationOrigin } from "@/server/auth";
import { getAutosave, discardAutosave, saveAutosave } from "@/server/autosaves";
import { apiError, json, readJson } from "@/server/http";
import { AppError } from "@/server/errors";
export const runtime = "nodejs";
type Context = { params: Promise<{ key: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    const session = await requireAdminSession();
    return json({ recovery: await getAutosave((await context.params).key, session.email) });
  } catch (error) {
    return apiError(error);
  }
}
export async function PUT(request: Request, context: Context) {
  try {
    const session = await requireAdminSession();
    checkMutationOrigin(request);
    const input = await readJson(request);
    if (
      !input ||
      typeof input !== "object" ||
      !("key" in input) ||
      input.key !== (await context.params).key
    )
      throw new AppError(400, "validation", "Recovery reference does not match");
    await saveAutosave(input, session.email);
    return json({ saved: true });
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const session = await requireAdminSession();
    checkMutationOrigin(request);
    await discardAutosave((await context.params).key, session.email);
    return json({ deleted: true });
  } catch (error) {
    return apiError(error);
  }
}
