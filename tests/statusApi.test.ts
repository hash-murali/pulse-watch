import { afterEach, describe, expect, it, vi } from "vitest";
import { loadStatus } from "../src/data/statusApi";
import { snapshot } from "./fixtures";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("status API client", () => {
  it("loads the same-origin endpoint and validates the snapshot", async () => {
    let requested = "";
    vi.stubGlobal("fetch", async (url: string) => {
      requested = url;
      return Response.json(snapshot());
    });
    expect((await loadStatus()).services[0]?.status).toBe("operational");
    expect(requested).toBe("/api/status");
  });
  it.each([
    {},
    { services: [] },
    { ...snapshot(), schemaVersion: 2 },
    {
      ...snapshot(),
      services: [{ ...snapshot().services[0], status: "fake" }],
    },
    {
      ...snapshot(),
      services: [{ ...snapshot().services[0], responseTime: -1 }],
    },
    {
      ...snapshot(),
      services: [{ ...snapshot().services[0], lastChecked: "bad" }],
    },
    {
      ...snapshot(),
      services: [{ ...snapshot().services[0], url: "http://localhost" }],
    },
  ])("rejects malformed data without treating it as healthy", async (data) => {
    vi.stubGlobal("fetch", async () => Response.json(data));
    await expect(loadStatus()).rejects.toThrow("Invalid status response");
  });
  it("rejects HTML fallback and oversized bodies", async () => {
    vi.stubGlobal("fetch", async () => new Response("<html>oops</html>"));
    await expect(loadStatus()).rejects.toThrow("Invalid status response");
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response(" ".repeat(17000), {
          headers: { "Content-Type": "application/json" },
        }),
    );
    await expect(loadStatus()).rejects.toThrow("Status response too large");
  });
  it("bounds a stalled API request to fifteen seconds", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) =>
          init.signal?.addEventListener("abort", () =>
            reject(new Error("aborted")),
          ),
        ),
    );
    const result = loadStatus().catch((error: Error) => error.message);
    await vi.advanceTimersByTimeAsync(15000);
    expect(await result).toBe("Status request timed out");
  });
});
