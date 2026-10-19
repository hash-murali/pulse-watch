import { afterEach, describe, expect, it, vi } from "vitest";
import { createHandler } from "../worker/index";
const env = {ASSETS:{fetch:async () => new Response("asset")}};
afterEach(() => vi.useRealTimers());
describe("Worker API boundary", () => {
  it("returns a versioned snapshot and independent service results", async () => {
    const handle = createHandler(async url => new Response(null,{status:url.includes("wikipedia")?503:200}));
    const response=await handle(new Request("https://pulse.test/api/status"),env);
    const data=await response.json();
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(data.schemaVersion).toBe(1);expect(data.services).toHaveLength(3);
    expect(data.services.filter((s:{status:string})=>s.status==="operational")).toHaveLength(2);
    expect(data.services[2].status).toBe("down");
  });
  it("reuses a snapshot for 60 seconds, then performs new checks", async () => {
    vi.useFakeTimers(); let checks=0;
    const handle = createHandler(async () => {checks++;return new Response(null,{status:200});});
    const request=new Request("https://pulse.test/api/status");
    const first=await handle(request,env); const firstData=await first.json();
    await vi.advanceTimersByTimeAsync(59000);
    const second=await handle(request,env);
    expect(await second.json()).toEqual(firstData);expect(checks).toBe(3);
    await vi.advanceTimersByTimeAsync(1001);
    await handle(request,env);expect(checks).toBe(6);
  });
  it("coalesces simultaneous requests instead of multiplying checks", async () => {
    let checks=0;
    const handle=createHandler(async () => {checks++;await new Promise(resolve=>setTimeout(resolve,5));return new Response(null,{status:200});});
    await Promise.all(Array.from({length:10},()=>handle(new Request("https://pulse.test/api/status"),env)));
    expect(checks).toBe(3);
  });
  it("rejects query URLs and non-GET requests without fetching", async () => {
    let checks=0;const handle=createHandler(async () => {checks++;return new Response();});
    expect((await handle(new Request("https://pulse.test/api/status?url=http://localhost"),env)).status).toBe(400);
    expect((await handle(new Request("https://pulse.test/api/status",{method:"POST"}),env)).status).toBe(405);
    expect((await handle(new Request("https://pulse.test/api/anything"),env)).status).toBe(404);
    expect(checks).toBe(0);
  });
  it("does not return HTML for missing API paths but preserves static assets",async()=>{
    const handle=createHandler();
    expect((await handle(new Request("https://pulse.test/api/missing"),env)).headers.get("content-type")).toContain("application/json");
    expect(await (await handle(new Request("https://pulse.test/"),env)).text()).toBe("asset");
  });
});
