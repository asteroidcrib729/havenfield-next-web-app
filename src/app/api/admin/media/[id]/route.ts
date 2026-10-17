import { mediaDetailsSchema } from "@/lib/property-schema";
import { requireAdminSession, checkMutationOrigin } from "@/server/auth";
import { deleteMedia, mediaReferences, updateMediaDetails } from "@/server/media-registry";
import { apiError, json, readJson } from "@/server/http";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    await requireAdminSession();
    return json({ references: await mediaReferences((await context.params).id) });
  } catch (error) {
    return apiError(error);
  }
}
export async function PATCH(request: Request, context: Context) {
  try {
    const session = await requireAdminSession();
    checkMutationOrigin(request);
    const input = mediaDetailsSchema.parse(await readJson(request, 4096));
    await updateMediaDetails((await context.params).id, input, session.email);
    return json({ updated: true });
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const session = await requireAdminSession();
    checkMutationOrigin(request);
    await deleteMedia(
      (await context.params).id,
      session.email,
      new URL(request.url).searchParams.get("cleanup") === "true",
    );
    return json({ deleted: true });
  } catch (error) {
    return apiError(error);
  }
}
