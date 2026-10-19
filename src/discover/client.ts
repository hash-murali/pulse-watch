import { FEED_RESPONSE_BYTES } from "./model";
import { isFeedResult } from "./model";
import type { Feed, FeedResult } from "./model";
import { readJson } from "./transport";
export async function loadFeed(
  feed: Feed,
  query: string,
  page: number,
  signal: AbortSignal,
): Promise<FeedResult> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal.aborted) controller.abort();
  else signal.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 12000);
  try {
    const params = new URLSearchParams({ feed, q: query, page: String(page) });
    const response = await fetch(`/api/discover?${params}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      void response.body?.cancel().catch(() => {});
      throw new Error(
        response.status === 429 ? "RATE_LIMIT" : "FEED_UNAVAILABLE",
      );
    }
    const data = await readJson(response, FEED_RESPONSE_BYTES);
    if (
      !isFeedResult(data) ||
      data.feed !== feed ||
      data.query !== query ||
      data.page !== page
    )
      throw new Error("INVALID_FEED");
    return data;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}
