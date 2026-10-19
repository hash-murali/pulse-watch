import type { StatusResponse } from "../src/types";
import { checkServices } from "./monitor";
import type { HealthFetcher } from "./monitor";
interface Env { ASSETS: { fetch(request: Request): Promise<Response> } }
type SnapshotCache = Pick<Cache, "match" | "put">;
const TTL = 60000;
function json(data: unknown, status = 200, extra: Record<string,string> = {}) {
  return Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});
}
export function createHandler(fetcher: HealthFetcher = fetch, cache?: SnapshotCache) {
  let snapshot: StatusResponse | undefined;
  let inFlight: Promise<StatusResponse> | undefined;
  async function getSnapshot(request: Request): Promise<StatusResponse> {
    if (snapshot && Date.now() - Date.parse(snapshot.checkedAt) < TTL) return snapshot;
    if (inFlight) return inFlight;
    inFlight = (async () => {
      const key = new Request(new URL("/api/status?schema=1",request.url));
      if (cache) {
        try {
          const cached = await cache.match(key);
          if (cached) {
            const data = await cached.json() as StatusResponse;
            if (data.schemaVersion===1 && Date.now()-Date.parse(data.checkedAt)<TTL) {snapshot=data;return data;}
          }
        } catch { /* Cache failure must never prevent a live check. */ }
      }
      const services=await checkServices(fetcher);
      const data: StatusResponse={schemaVersion:1,checkedAt:new Date().toISOString(),cacheTtlSeconds:60,services};
      snapshot=data;
      if (cache) {try {await cache.put(key,Response.json(data,{headers:{"Cache-Control":"public, max-age=60"}}));} catch { /* Best effort only. */ }}
      return data;
    })();
    try {return await inFlight;} finally {inFlight=undefined;}
  }
  return async (request: Request, env: Env): Promise<Response> => {
    const url=new URL(request.url);
    if(url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      if(url.pathname!=="/api/status") return json({error:"API route not found"},404);
      if(request.method!=="GET") return json({error:"Method not allowed"},405,{Allow:"GET"});
      if(url.search) return json({error:"Query parameters are not supported"},400);
      try {return json(await getSnapshot(request));} catch {return json({error:"Status temporarily unavailable"},503);}
    }
    return env.ASSETS.fetch(request);
  };
}
let handle: ReturnType<typeof createHandler> | undefined;
export default {
  fetch(request:Request,env:Env):Promise<Response> {
    // Cache API is available in Workers, while tests use an explicit cache double.
    handle ??= createHandler(fetch,(caches as CacheStorage & {default:Cache}).default);
    return handle(request,env);
  }
};
