import { requireAdminSession, checkMutationOrigin } from "@/server/auth";
import { getManagedProperties, saveProperty } from "@/server/properties";
import { propertyInputSchema } from "@/lib/property-schema";
import { json, apiError, readJson } from "@/server/http";
export const runtime = "nodejs";
export async function GET() {
  try {
    await requireAdminSession();
    return json({ properties: await getManagedProperties() });
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();
    checkMutationOrigin(request);
    return json(
      {
        property: await saveProperty(
          propertyInputSchema.parse(await readJson(request)),
          session.email,
        ),
      },
      201,
    );
  } catch (error) {
    return apiError(error);
  }
}
