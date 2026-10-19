export const FEED_RESPONSE_BYTES = 131072;
export const FEEDS = ["trending", "new", "show", "ask"] as const;
export type Feed = (typeof FEEDS)[number];
export interface Story {
  id: string;
  title: string;
  url: string;
  commentsUrl: string;
  author: string;
  points: number;
  comments: number;
  publishedAt: number;
}
export interface FeedResult {
  version: 1;
  feed: Feed;
  query: string;
  page: number;
  pages: number;
  total: number;
  fetchedAt: string;
  stories: Story[];
}
export function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}
export function safeArticleUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 1500) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host.endsWith(".local") ||
      !host.includes(".") ||
      /^(\d{1,3}\.){3}\d{1,3}$/.test(host) ||
      host.includes(":")
    )
      return null;
    return url.href.length <= 1500 ? url.href : null;
  } catch {
    return null;
  }
}
function integer(value: unknown, max: number): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= max
  );
}
export function isStory(value: unknown): value is Story {
  if (
    !record(value) ||
    typeof value.id !== "string" ||
    !/^\d{1,12}$/.test(value.id)
  )
    return false;
  return (
    typeof value.title === "string" &&
    value.title.length > 0 &&
    value.title.length <= 400 &&
    typeof value.author === "string" &&
    value.author.length <= 60 &&
    safeArticleUrl(value.url) === value.url &&
    value.commentsUrl === `https://news.ycombinator.com/item?id=${value.id}` &&
    integer(value.points, 10000000) &&
    integer(value.comments, 10000000) &&
    integer(value.publishedAt, 4102444800)
  );
}
export function isFeedResult(value: unknown): value is FeedResult {
  if (
    !record(value) ||
    value.version !== 1 ||
    !FEEDS.includes(value.feed as Feed) ||
    typeof value.query !== "string" ||
    value.query.length > 80 ||
    !integer(value.page, 4) ||
    !integer(value.pages, 5) ||
    !integer(value.total, 1000000000) ||
    typeof value.fetchedAt !== "string" ||
    !Number.isFinite(Date.parse(value.fetchedAt)) ||
    !Array.isArray(value.stories) ||
    value.stories.length > 24 ||
    !value.stories.every(isStory)
  )
    return false;
  return new Set(value.stories.map((s) => s.id)).size === value.stories.length;
}
export function normalizeHit(value: unknown): Story | null {
  if (
    !record(value) ||
    typeof value.objectID !== "string" ||
    !/^\d{1,12}$/.test(value.objectID) ||
    typeof value.title !== "string" ||
    !value.title.trim()
  )
    return null;
  const commentsUrl = `https://news.ycombinator.com/item?id=${value.objectID}`;
  const story: Story = {
    id: value.objectID,
    title: value.title.trim().slice(0, 400),
    url: safeArticleUrl(value.url) ?? commentsUrl,
    commentsUrl,
    author:
      typeof value.author === "string"
        ? value.author.slice(0, 60)
        : "anonymous",
    points: integer(value.points, 10000000) ? value.points : 0,
    comments: integer(value.num_comments, 10000000) ? value.num_comments : 0,
    publishedAt: integer(value.created_at_i, 4102444800)
      ? value.created_at_i
      : 0,
  };
  return story;
}
