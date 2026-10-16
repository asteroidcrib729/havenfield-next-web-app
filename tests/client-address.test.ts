import { afterEach, describe, expect, it, vi } from "vitest";
import { clientAddress } from "../src/server/auth";

afterEach(() => vi.unstubAllEnvs());
const request = (headers: Record<string, string>) =>
  new Request("https://havenfield.test", { headers });
describe("rate-limit ingress trust", () => {
  it("ignores every client-supplied forwarding header outside Vercel", () => {
    vi.stubEnv("VERCEL", "");
    expect(
      clientAddress(
        request({ "x-vercel-forwarded-for": "203.0.113.8", "x-forwarded-for": "203.0.113.9" }),
      ),
    ).toBe("local-client");
  });
  it("uses the platform header before a proxy-overridden generic header", () => {
    vi.stubEnv("VERCEL", "1");
    expect(
      clientAddress(
        request({ "x-vercel-forwarded-for": "203.0.113.8", "x-forwarded-for": "203.0.113.9" }),
      ),
    ).toBe("203.0.113.8");
    expect(clientAddress(request({ "x-forwarded-for": "2001:db8::1" }))).toBe("2001:db8::1");
  });
  it("fails closed for missing, malformed or multiple addresses", () => {
    vi.stubEnv("VERCEL", "1");
    for (const value of ["", "attacker", "203.0.113.8, 203.0.113.9", "203.0.113.8:1234"])
      expect(clientAddress(request({ "x-vercel-forwarded-for": value }))).toBe("unknown");
  });
});
