import { z } from "zod";
import { checkMutationOrigin, requireAdminSession } from "../../../../../../../../server/auth";
import { restoreRevision } from "../../../../../../../../server/blog";
import { apiError, json, readJson } from "../../../../../../../../server/http";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; revisionId: string }> },
) {
  try {
    const session = await requireAdminSession();
    checkMutationOrigin(request);
    const { version } = z
      .object({ version: z.number().int().positive() })
      .strict()
      .parse(await readJson(request, 4096));
    const { id, revisionId } = await context.params;
    return json({ post: await restoreRevision(id, revisionId, version, session.email) });
  } catch (error) {
    return apiError(error);
  }
}
