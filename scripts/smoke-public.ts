import { z } from "zod";

// A one-shot public check. It never loads operator credentials or writes data.
async function main() {
  const base = new URL(process.argv[2] || "https://havenfieldre.vercel.app");
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
  if (
    (base.protocol !== "https:" && !(base.protocol === "http:" && loopback)) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    base.pathname !== "/"
  )
    throw new Error(
      "Use an HTTPS origin, or an HTTP loopback origin, without credentials or a path",
    );
  const checks: { path: string; status: number }[] = [];
  async function request(path: string) {
    const response = await fetch(new URL(path, base), {
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    checks.push({ path, status: response.status });
    if (response.status !== 200) throw new Error("Public route failed");
    return response;
  }
  try {
    for (const path of ["/", "/properties", "/journal"]) {
      const response = await request(path);
      if (!response.headers.get("content-type")?.includes("text/html"))
        throw new Error("Expected a public HTML page");
      await response.body?.cancel();
    }
    const health = await request("/api/health");
    z.object({ status: z.literal("ok") }).parse(await health.json());
    const response = await request("/api/posts");
    const data = z
      .object({
        posts: z
          .array(
            z.object({
              slug: z
                .string()
                .min(1)
                .max(120)
                .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
            }),
          )
          .min(1),
      })
      .parse(await response.json());
    const article = await request("/journal/" + encodeURIComponent(data.posts[0].slug));
    if (!article.headers.get("content-type")?.includes("text/html"))
      throw new Error("Expected an article page");
    await article.body?.cancel();
    console.log(
      JSON.stringify(
        { ready: true, origin: base.origin, checks, publicArticles: data.posts.length },
        null,
        2,
      ),
    );
  } catch {
    console.error(
      JSON.stringify(
        {
          ready: false,
          checks,
          message:
            "Public smoke check failed. Review the route statuses, connectivity and application health.",
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  }
}
main().catch(() => {
  console.error("Use: npm run smoke:public -- https://your-public-origin.example");
  process.exitCode = 1;
});
