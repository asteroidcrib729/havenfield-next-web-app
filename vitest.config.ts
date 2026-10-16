import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/server-only.ts", import.meta.url)),
    },
  },
  test: {
    env: {
      APP_ENV: "development",
      LOCAL_PREVIEW: "0",
      DATABASE_URL: "",
      DIRECT_DATABASE_URL: "",
      BLOB_READ_WRITE_TOKEN: "",
      VERCEL: "",
      VERCEL_ENV: "",
    },
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/postgres/**"],
    fileParallelism: false,
  },
});
