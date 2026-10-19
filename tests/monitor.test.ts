import { afterEach, describe, expect, it, vi } from "vitest";
import { checkService, checkServices, classifyStatus } from "../worker/monitor";
import { TARGETS } from "../worker/targets";
afterEach(() => vi.useRealTimers());
describe("point-in-time observations", () => {
  it.each([[200, 20, "operational"], [204, 1500, "degraded"], [301, 20, "degraded"], [403, 20, "unknown"], [429, 20, "unknown"], [503, 20, "down"], [0, 20, "unknown"]] as const)("classifies HTTP %s at %sms as %s", (code, ms, expected) => {
    expect(classifyStatus(code, ms)).toBe(expected);
  });
  it("does not follow redirects or forward visitor cookies and never reads bodies", async () => {
    let observed: RequestInit | undefined;
    const result = await checkService(TARGETS[0]!, async (_url, init) => { observed = init; return new Response("untrusted body", {status:302,headers:{Location:"http://127.0.0.1/secret"}}); });
    expect(result.status).toBe("degraded");
    expect(result.error).toBe("REDIRECT_NOT_FOLLOWED");
    expect(observed?.method).toBe("HEAD");
    expect(observed?.redirect).toBe("manual");
    expect(new Headers(observed?.headers).has("cookie")).toBe(false);
  });
  it.each(["http://127.0.0.1", "https://127.0.0.1", "https://localhost", "https://10.0.0.1", "https://[::1]", "https://169.254.169.254/latest/meta-data/", "https://attacker.example", "https://www.cloudflare.com:8443/robots.txt", "https://user:pass@www.cloudflare.com/robots.txt"])("never fetches unapproved target %s", async url => {
    let calls = 0;
    const result = await checkService({...TARGETS[0]!,url},async () => {calls++;return new Response();});
    expect(calls).toBe(0);
    expect(result.status).toBe("unknown");
    expect(result.error).toBe("INVALID_TARGET");
  });
  it("aborts a hanging request after the deadline without exposing errors", async () => {
    vi.useFakeTimers(); let signal: AbortSignal | null | undefined;
    const pending = checkService(TARGETS[0]!, (_url, init) => {signal=init?.signal;return new Promise(() => {});});
    await vi.advanceTimersByTimeAsync(5000);
    const result = await pending;
    expect(result.status).toBe("down"); expect(result.error).toBe("TIMEOUT"); expect(signal?.aborted).toBe(true);
  });
  it("contains network failures per service and bounds concurrent work to two", async () => {
    let active=0; let peak=0;
    const results = await checkServices(async url => { active++;peak=Math.max(peak,active);await new Promise(resolve=>setTimeout(resolve,5));active--;if(String(url).includes("wikipedia")) throw new Error("secret-token");return new Response(null,{status:200}); });
    expect(results).toHaveLength(3);expect(peak).toBe(2);
    expect(results.filter(s=>s.status==="operational")).toHaveLength(2);
    expect(results.find(s=>s.status==="down")?.error).toBe("UNREACHABLE");
    expect(JSON.stringify(results)).not.toContain("secret-token");
  });
  it("returns safe unknown for an invalid fetch response", async () => {
    const result = await checkService(TARGETS[0]!, async () => ({status:0}) as Response);
    expect(result.status).toBe("unknown");expect(result.error).toBe("INVALID_RESPONSE");
  });
});
