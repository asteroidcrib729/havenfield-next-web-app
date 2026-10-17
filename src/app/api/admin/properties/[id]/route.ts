import { requireAdminSession, checkMutationOrigin } from "@/server/auth";
import { getManagedProperty, saveProperty, deleteProperty } from "@/server/properties";
import { propertyUpdateSchema, propertyVersionSchema } from "@/lib/property-schema";
import { json, apiError, readJson } from "@/server/http";
import { AppError } from "@/server/errors";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    await requireAdminSession();
    const property = await getManagedProperty((await context.params).id);
    if (!property) throw new AppError(404, "not_found", "Property not found");
    return json({ property });
  } catch (error) {
    return apiError(error);
  }
}
export async function PATCH(request: Request, context: Context) {
  try {
    const session = await requireAdminSession();
    checkMutationOrigin(request);
    const input = propertyUpdateSchema.parse(await readJson(request));
    return json({
      property: await saveProperty(
        input.property,
        session.email,
        (await context.params).id,
        input.version,
      ),
    });
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const session = await requireAdminSession();
    checkMutationOrigin(request);
    const { version } = propertyVersionSchema.parse(await readJson(request, 4096));
    await deleteProperty((await context.params).id, version, session.email);
    return json({ deleted: true });
  } catch (error) {
    return apiError(error);
  }
}
