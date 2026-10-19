// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Explore from "../src/discover/Explore";
import type { FeedResult } from "../src/discover/model";
const story = {
  id: "12345",
  title: "Build a tiny robot",
  url: "https://example.com/robot",
  commentsUrl: "https://news.ycombinator.com/item?id=12345",
  author: "maker",
  points: 88,
  comments: 14,
  publishedAt: 1792400000,
};
const data: FeedResult = {
  version: 1,
  feed: "trending",
  query: "",
  page: 0,
  pages: 1,
  total: 1,
  fetchedAt: "2026-10-19T18:00:00Z",
  stories: [story],
};
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("PulsePlay", () => {
  it("loads real stories, saves locally and shows the saved collection", async () => {
    let resolve!: (value: Response) => void;
    vi.stubGlobal(
      "fetch",
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    );
    render(<Explore />);
    expect(screen.getByRole("status").textContent).toContain("curiosity");
    resolve(Response.json(data));
    await screen.findByRole("link", { name: story.title });
    await userEvent.click(
      screen.getByRole("button", { name: `Save ${story.title}` }),
    );
    expect(
      JSON.parse(localStorage.getItem("pulseplay-saved") ?? "[]"),
    ).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: /Saved/ }));
    expect(screen.getByRole("link", { name: story.title })).toBeTruthy();
    await userEvent.click(
      screen.getByRole("button", { name: `Unsave ${story.title}` }),
    );
    await screen.findByRole("heading", {
      name: "Your next rabbit hole is waiting",
    });
  });
  it("searches only on submit and renders empty results", async () => {
    const urls: string[] = [];
    vi.stubGlobal("fetch", async (url: string) => {
      urls.push(url);
      return Response.json(
        url.includes("q=robot")
          ? { ...data, query: "robot", stories: [], total: 0, pages: 0 }
          : data,
      );
    });
    render(<Explore />);
    await screen.findByRole("link", { name: story.title });
    await userEvent.type(screen.getByRole("searchbox"), "robot");
    expect(urls).toHaveLength(1);
    await userEvent.click(
      screen.getByRole("button", { name: "Search stories" }),
    );
    await screen.findByRole("heading", {
      name: "Nothing in this corner of the internet",
    });
    expect(urls).toHaveLength(2);
  });
  it("handles provider failures without raw errors and supports retry", async () => {
    let fail = true;
    vi.stubGlobal("fetch", async () => {
      if (fail) throw new Error("private detail");
      return Response.json(data);
    });
    render(<Explore />);
    await screen.findByRole("alert");
    expect(screen.queryByText("private detail")).toBeNull();
    fail = false;
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByRole("link", { name: story.title });
  });
  it("ignores malformed bookmarks and can change theme", async () => {
    localStorage.setItem("pulseplay-saved", '[{"url":"javascript:evil"}]');
    vi.stubGlobal("fetch", async () => Response.json(data));
    render(<Explore />);
    await screen.findByRole("link", { name: story.title });
    await userEvent.click(
      screen.getByRole("button", { name: "Switch to light theme" }),
    );
    await waitFor(() =>
      expect(localStorage.getItem("pulsewatch-theme")).toBe("light"),
    );
  });
});
