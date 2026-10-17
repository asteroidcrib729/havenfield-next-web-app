import { requireAdminSession, checkMutationOrigin } from "@/server/auth";
import { restorePropertyRevision } from "@/server/properties";
import { propertyVersionSchema } from "@/lib/property-schema";
import { json, apiError, readJson } from "@/server/http";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; revision: string }> },
) {
  try {
    const session = await requireAdminSession();
    checkMutationOrigin(request);
    const params = await context.params,
      { version } = propertyVersionSchema.parse(await readJson(request, 4096));
    return json({
      property: await restorePropertyRevision(params.id, params.revision, version, session.email),
    });
  } catch (error) {
    return apiError(error);
  }
}
