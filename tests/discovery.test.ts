import { afterEach, describe, expect, it, vi } from "vitest";
import { loadFeed } from "../src/discover/client";
import { createDiscoveryHandler } from "../worker/discovery";
const hit = {
  objectID: "12345",
  title: "A tiny useful project",
  url: "https://example.com/project",
  author: "builder",
  points: 42,
  num_comments: 12,
  created_at_i: 1792400000,
};
const upstream = () => Response.json({ hits: [hit], nbHits: 1, nbPages: 1 });
const request = (query = "") =>
  new Request(`https://pulse.test/api/discover${query}`);
afterEach(() => vi.useRealTimers());
describe("discovery API", () => {
  it("normalizes stories from the fixed provider and never follows redirects", async () => {
    let destination = "";
    let redirect = "";
    const handle = createDiscoveryHandler(async (url, init) => {
      destination = url;
      redirect = String(init?.redirect);
      return upstream();
    });
    const response = await handle(request());
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.stories[0].title).toBe("A tiny useful project");
    expect(data.stories[0].commentsUrl).toBe(
      "https://news.ycombinator.com/item?id=12345",
    );
    expect(new URL(destination).origin).toBe("https://hn.algolia.com");
    expect(new URL(destination).searchParams.get("tags")).toBe("front_page");
    expect(redirect).toBe("manual");
  });
  it.each([
    "?url=http://localhost",
    "?page=99",
    "?page=-1",
    "?page=1.5",
    "?feed=evil",
    "?q=" + "a".repeat(81),
    "?feed=trending&feed=new",
  ])("rejects invalid inputs %s without fetching", async (query) => {
    let calls = 0;
    const handle = createDiscoveryHandler(async () => {
      calls++;
      return upstream();
    });
    expect((await handle(request(query))).status).toBe(400);
    expect(calls).toBe(0);
  });
  it("encodes search text as a value instead of a fetch destination", async () => {
    let destination = "";
    const handle = createDiscoveryHandler(async (url) => {
      destination = url;
      return upstream();
    });
    await handle(request("?q=https%3A%2F%2Flocalhost%2F%3Ftags%3Devil"));
    expect(new URL(destination).origin).toBe("https://hn.algolia.com");
    expect(new URL(destination).searchParams.get("tags")).toBe("story");
    expect(new URL(destination).searchParams.get("query")).toBe(
      "https://localhost/?tags=evil",
    );
  });
  it("falls back to the discussion for dangerous article links", async () => {
    const handle = createDiscoveryHandler(async () =>
      Response.json({
        hits: [{ ...hit, url: "javascript:alert(1)" }],
        nbHits: 1,
        nbPages: 1,
      }),
    );
    const data = await (await handle(request())).json();
    expect(data.stories[0].url).toBe(
      "https://news.ycombinator.com/item?id=12345",
    );
  });
  it("caches identical queries and bounds burst misses", async () => {
    let calls = 0;
    const handle = createDiscoveryHandler(async () => {
      calls++;
      return upstream();
    });
    await handle(request());
    await handle(request());
    expect(calls).toBe(1);
    for (let n = 0; n < 5; n++)
      expect((await handle(request(`?q=query${n}`))).status).toBe(200);
    expect((await handle(request("?q=another"))).status).toBe(429);
    expect(calls).toBe(6);
  });
  it("uses safe errors for malformed, oversized and failed provider responses", async () => {
    for (const response of [
      Response.json({ bad: true }),
      new Response("secret", { status: 503 }),
      new Response("x".repeat(131073), {
        headers: { "Content-Type": "application/json" },
      }),
    ]) {
      const result = await createDiscoveryHandler(async () => response)(
        request(),
      );
      expect(result.status).toBe(502);
      expect(await result.text()).not.toContain("secret");
    }
  });
  it("times out stalled requests after six seconds", async () => {
    vi.useFakeTimers();
    const handle = createDiscoveryHandler(() => new Promise(() => {}));
    const pending = handle(request());
    await vi.advanceTimersByTimeAsync(6000);
    expect((await pending).status).toBe(502);
  });
});

it("falls back when URL normalization would exceed the link size limit", async () => {
  const handle = createDiscoveryHandler(async () =>
    Response.json({
      hits: [{ ...hit, url: "https://example.com/" + "é".repeat(1000) }],
      nbHits: 1,
      nbPages: 1,
    }),
  );
  const data = await (await handle(request())).json();
  expect(data.stories[0].url).toBe(
    "https://news.ycombinator.com/item?id=12345",
  );
});

it("accepts large valid normalized feeds in the client", async () => {
  const hits = Array.from({ length: 24 }, (_, i) => ({
    ...hit,
    objectID: String(20000 + i),
    title: "界".repeat(400),
    author: "界".repeat(60),
    url: "https://example.com/" + "x".repeat(1480),
  }));
  const handle = createDiscoveryHandler(async () =>
    Response.json({ hits, nbHits: 24, nbPages: 1 }),
  );
  const response = await handle(request());
  expect(
    new TextEncoder().encode(await response.clone().text()).length,
  ).toBeGreaterThan(65536);
  vi.stubGlobal("fetch", async () => response);
  try {
    const result = await loadFeed(
      "trending",
      "",
      0,
      new AbortController().signal,
    );
    expect(result.stories).toHaveLength(24);
  } finally {
    vi.unstubAllGlobals();
  }
});
