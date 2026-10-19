const base = new URL(
  process.env.PULSEWATCH_URL ??
    "https://pulse-watch.mail2murali-ks.workers.dev",
);
if (!["https:", "http:"].includes(base.protocol))
  throw new Error("Unsupported URL");
const get = (path) =>
  fetch(new URL(path, base), {
    signal: AbortSignal.timeout(20000),
    redirect: "error",
  });
const home = await get("/");
if (!home.ok) throw new Error(`Homepage returned ${home.status}`);
const html = await home.text();
const script = html.match(/src="(\/assets\/[^"<>]+\.js)"/);
if (!script || !(await get(script[1])).ok)
  throw new Error("Built JavaScript is unavailable");
const api = await get("/api/status");
if (!api.ok || !api.headers.get("content-type")?.includes("application/json"))
  throw new Error(`Status API returned ${api.status} or non-JSON`);
const data = await api.json();
if (
  data.schemaVersion !== 1 ||
  !Array.isArray(data.services) ||
  data.services.length !== 3 ||
  !Number.isFinite(Date.parse(data.checkedAt))
)
  throw new Error("Invalid status snapshot");
if (Date.now() - Date.parse(data.checkedAt) > 90000)
  throw new Error("Status snapshot is unexpectedly stale");
for (const service of data.services) {
  if (!["operational", "degraded", "down", "unknown"].includes(service.status))
    throw new Error("Invalid service state");
  console.log(
    `${service.name}: ${service.status} (HTTP ${service.httpCode ?? "—"})`,
  );
}
const invalid = await get("/api/missing");
if (
  invalid.status !== 404 ||
  !invalid.headers.get("content-type")?.includes("application/json")
)
  throw new Error("Missing API route did not return JSON 404");
const rejected = await get("/api/status?url=http://127.0.0.1");
if (rejected.status !== 400)
  throw new Error("API did not reject query parameters");
const explore = await get("/explore");
if (!explore.ok || !explore.headers.get("content-type")?.includes("text/html"))
  throw new Error("Discovery page unavailable");
const feed = await get("/api/discover");
const discovery = await feed.json();
if (
  !feed.ok ||
  discovery.version !== 1 ||
  !Array.isArray(discovery.stories) ||
  discovery.stories.length > 24
)
  throw new Error("Invalid discovery feed");
if ((await get("/api/discover?url=http://127.0.0.1")).status !== 400)
  throw new Error("Discovery accepted arbitrary URL input");
console.log(`Discovery: ${discovery.stories.length} stories`);
console.log(`Smoke checks passed: ${base.origin}`);
