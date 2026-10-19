import { FEED_RESPONSE_BYTES } from "../src/discover/model";
import {
  FEEDS,
  isFeedResult,
  normalizeHit,
  record,
} from "../src/discover/model";
import type { Feed, FeedResult, Story } from "../src/discover/model";
import { readJson } from "../src/discover/transport";
import type { HealthFetcher } from "./monitor";
const TTL = 300000;
function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": status === 200 ? "public, max-age=60" : "no-store",
      "X-Content-Type-Options": "nosniff",
      ...(status === 429 ? { "Retry-After": "60" } : {}),
    },
  });
}
export function createDiscoveryHandler(
  fetcher: HealthFetcher = fetch,
  cache?: Pick<Cache, "match" | "put">,
) {
  const memory = new Map<string, FeedResult>();
  const pending = new Map<string, Promise<Response>>();
  let allowance = 6;
  let resetAt = 0;
  return async (request: Request): Promise<Response> => {
    if (request.method !== "GET")
      return new Response(null, { status: 405, headers: { Allow: "GET" } });
    const input = new URL(request.url);
    const params = input.searchParams;
    let unsupported = false;
    params.forEach((_value, key) => {
      if (
        !["feed", "q", "page"].includes(key) ||
        params.getAll(key).length !== 1
      )
        unsupported = true;
    });
    if (unsupported)
      return json({ error: "Unsupported query parameters" }, 400);
    const feed = params.get("feed") ?? "trending";
    const query = (params.get("q") ?? "").trim().replace(/\s+/g, " ");
    const pageText = params.get("page") ?? "0";
    if (
      !FEEDS.includes(feed as Feed) ||
      query.length > 80 ||
      (query.length > 0 && query.length < 2) ||
      !/^[0-4]$/.test(pageText)
    )
      return json(
        { error: "Use a valid feed, search of 2–80 characters, and page 0–4" },
        400,
      );
    const page = Number(pageText);
    const canonical = new URL("/api/discover", input.origin);
    canonical.search = new URLSearchParams({
      feed,
      q: query,
      page: pageText,
    }).toString();
    const key = canonical.href;
    const stored = memory.get(key);
    if (stored && Date.now() - Date.parse(stored.fetchedAt) < TTL)
      return json(stored);
    const existing = pending.get(key);
    if (existing) return (await existing).clone();
    if (pending.size >= 2)
      return json({ error: "Taking a breather. Try again in a minute." }, 429);
    const work = (async () => {
      const cacheKey = new Request(canonical);
      if (cache)
        try {
          const response = await cache.match(cacheKey);
          if (response) {
            const data = await readJson(response, FEED_RESPONSE_BYTES);
            if (
              isFeedResult(data) &&
              Date.now() - Date.parse(data.fetchedAt) < TTL
            ) {
              remember(key, data);
              return json(data);
            }
          }
        } catch {
          /* Cache is optional. */
        }
      if (Date.now() >= resetAt) {
        allowance = 6;
        resetAt = Date.now() + 60000;
      }
      if (allowance <= 0)
        return json(
          { error: "Taking a breather. Try again in a minute." },
          429,
        );
      allowance--;
      const provider = new URL(
        feed === "new"
          ? "https://hn.algolia.com/api/v1/search_by_date"
          : "https://hn.algolia.com/api/v1/search",
      );
      const tags =
        feed === "show"
          ? "show_hn"
          : feed === "ask"
            ? "ask_hn"
            : feed === "trending" && !query
              ? "front_page"
              : "story";
      provider.search = new URLSearchParams({
        tags,
        query,
        page: pageText,
        hitsPerPage: "24",
        attributesToRetrieve:
          "objectID,title,url,author,points,num_comments,created_at_i",
      }).toString();
      const controller = new AbortController();
      let timer: ReturnType<typeof setTimeout> | undefined;
      const deadline = new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error("timeout"));
        }, 6000);
      });
      try {
        const load = async () => {
          const response = await fetcher(provider.href, {
            method: "GET",
            redirect: "manual",
            signal: controller.signal,
            headers: { Accept: "application/json" },
          });
          if (!response.ok) {
            void response.body?.cancel().catch(() => {});
            throw new Error("Provider unavailable");
          }
          return readJson(response, 131072);
        };
        const body = await Promise.race([load(), deadline]);
        if (
          !record(body) ||
          !Array.isArray(body.hits) ||
          typeof body.nbHits !== "number" ||
          !Number.isFinite(body.nbHits) ||
          typeof body.nbPages !== "number" ||
          !Number.isFinite(body.nbPages)
        )
          throw new Error("Invalid provider data");
        const unique = new Map<string, Story>();
        for (const hit of body.hits.slice(0, 24)) {
          const story = normalizeHit(hit);
          if (story) unique.set(story.id, story);
        }
        if (body.hits.length > 0 && unique.size === 0)
          throw new Error("Invalid stories");
        const data: FeedResult = {
          version: 1,
          feed: feed as Feed,
          query,
          page,
          pages: Math.max(0, Math.min(5, Math.floor(body.nbPages))),
          total: Math.max(0, Math.min(1000000000, Math.floor(body.nbHits))),
          fetchedAt: new Date().toISOString(),
          stories: [...unique.values()],
        };
        remember(key, data);
        if (cache)
          try {
            await cache.put(
              cacheKey,
              Response.json(data, {
                headers: { "Cache-Control": "public, max-age=300" },
              }),
            );
          } catch {
            /* Best effort. */
          }
        return json(data);
      } catch {
        return json(
          {
            error:
              "The story feed is taking a break. Please try again shortly.",
          },
          502,
        );
      } finally {
        if (timer !== undefined) clearTimeout(timer);
      }
    })();
    pending.set(key, work);
    try {
      return (await work).clone();
    } finally {
      pending.delete(key);
    }
  };
  function remember(key: string, data: FeedResult) {
    if (memory.size >= 40) memory.delete(memory.keys().next().value!);
    memory.set(key, data);
  }
}
