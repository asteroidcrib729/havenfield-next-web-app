import { requireAdminSession } from "@/server/auth";
import { repositoryAssets } from "@/content/asset-library";
import { repositoryAssetReferences } from "@/server/repository-assets";
import { json, apiError } from "@/server/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const url = new URL(request.url).searchParams.get("url");
    return json(
      url
        ? {
            references: await repositoryAssetReferences(url),
            source: "repository",
            deletable: false,
          }
        : { items: repositoryAssets, source: "repository", deletable: false },
    );
  } catch (error) {
    return apiError(error);
  }
}
