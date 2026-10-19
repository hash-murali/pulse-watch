import { useEffect, useState } from "react";
import type { Feed, FeedResult, Story } from "./model";
import { isStory } from "./model";
import { loadFeed } from "./client";
import { Glyph } from "./Glyph";
import { StoryCard } from "./StoryCard";
import "./explore.css";
type View = Feed | "saved";
type FeedState =
  | { kind: "loading" }
  | { kind: "ready"; data: FeedResult }
  | { kind: "error"; limited: boolean };
const tabs: { id: View; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "new", label: "Fresh finds" },
  { id: "show", label: "Show HN" },
  { id: "ask", label: "Ask HN" },
  { id: "saved", label: "Saved" },
];
const topics = [
  { label: "Artificial intelligence", query: "AI" },
  { label: "Cloud & DevOps", query: "AWS" },
  { label: "Side projects", query: "side project" },
  { label: "Open source", query: "open source" },
  { label: "Science", query: "science" },
  { label: "Design", query: "design" },
];
function readSaved(): Story[] {
  try {
    const raw = localStorage.getItem("pulseplay-saved");
    if (!raw || raw.length > 200000) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return [
      ...new Map(
        value
          .slice(0, 50)
          .filter(isStory)
          .map((story) => [story.id, story]),
      ).values(),
    ];
  } catch {
    return [];
  }
}
function initialTheme(): "dark" | "light" {
  try {
    const value = localStorage.getItem("pulsewatch-theme");
    if (value === "light" || value === "dark") return value;
  } catch {
    /* In-memory theme still works. */
  }
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}
export default function Explore() {
  const [theme, setTheme] = useState(initialTheme);
  const [view, setView] = useState<View>("trending");
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<FeedState>({ kind: "loading" });
  const [saved, setSaved] = useState(readSaved);
  const [storageIssue, setStorageIssue] = useState(false);
  const [notice, setNotice] = useState("");
  const [surprise, setSurprise] = useState<Story | null>(null);
  const [validation, setValidation] = useState("");
  useEffect(() => {
    document.title = "PulsePlay · Follow your curiosity";
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("pulsewatch-theme", theme);
    } catch {
      /* In-memory theme remains available. */
    }
  }, [theme]);
  useEffect(() => {
    try {
      localStorage.setItem("pulseplay-saved", JSON.stringify(saved));
    } catch {
      setStorageIssue(true);
    }
  }, [saved]);
  useEffect(() => {
    if (view === "saved") return;
    const controller = new AbortController();
    setState({ kind: "loading" });
    void loadFeed(view, query, page, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ kind: "ready", data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setState({
            kind: "error",
            limited: error instanceof Error && error.message === "RATE_LIMIT",
          });
      });
    return () => controller.abort();
  }, [view, query, page, revision]);
  const visible =
    view === "saved"
      ? saved.filter((story) =>
          `${story.title} ${story.author} ${new URL(story.url).hostname}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
      : state.kind === "ready"
        ? state.data.stories
        : [];
  const loading = view !== "saved" && state.kind === "loading";
  const choose = (next: View) => {
    setView(next);
    setPage(0);
    setSurprise(null);
    setNotice("");
  };
  const search = (term: string) => {
    const clean = term.trim().replace(/\s+/g, " ");
    if (clean.length === 1) {
      setValidation("Type at least two characters to search.");
      return;
    }
    setValidation("");
    setDraft(clean);
    setQuery(clean);
    setPage(0);
    setSurprise(null);
  };
  const toggleSaved = (story: Story) => {
    if (saved.some((item) => item.id === story.id)) {
      setSaved(saved.filter((item) => item.id !== story.id));
      setNotice("Removed from your saved finds.");
    } else if (saved.length >= 50) {
      setNotice("Your collection holds 50 stories. Unsave one to make room.");
    } else {
      setSaved([story, ...saved]);
      setNotice("A good find. Saved in this browser.");
    }
  };
  const feedName = tabs.find((tab) => tab.id === view)?.label ?? "Trending";
  return (
    <div className="play-shell">
      <a className="skip-link" href="#play-content">
        Skip to stories
      </a>
      <aside className="play-sidebar">
        <a className="play-brand" href="/explore">
          <span className="play-brand-mark">
            <Glyph name="spark" />
          </span>
          pulse<span>play</span>
          <span className="play-beta">1.1</span>
        </a>
        <p className="play-nav-label">YOUR LITTLE INTERNET CORNER</p>
        <nav aria-label="Applications">
          <a className="play-nav active" href="/explore" aria-current="page">
            <Glyph name="spark" />
            Discover
            <span className="play-nav-dot" />
          </a>
          <a className="play-nav" href="/">
            <Glyph name="pulse" />
            Service monitor
            <Glyph name="external" />
          </a>
        </nav>
        <div className="play-sidebar-note">
          <div className="play-mini-orbit" aria-hidden="true">
            ✳
          </div>
          <strong>Stay curious.</strong>
          <p>
            Small footprint.
            <br />
            Big rabbit holes.
          </p>
          <span>NO SIGN-UP. JUST GOOD FINDS.</span>
        </div>
        <div className="play-sidebar-footer">
          <span className="play-live-dot" />
          Powered by curiosity.
        </div>
      </aside>
      <div className="play-content-shell">
        <header className="play-topbar">
          <span>
            Discover{" "}
            <span className="play-breadcrumb">/ Your daily rabbit hole</span>
          </span>
          <div>
            <a
              href="https://news.ycombinator.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="play-hn-link"
            >
              <span>Y</span>Hacker News edition
            </a>
            <button
              className="play-theme"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Glyph name={theme === "dark" ? "sun" : "moon"} />
            </button>
          </div>
        </header>
        <main className="play-main" id="play-content" tabIndex={-1}>
          <section className="play-hero">
            <div className="play-hero-copy">
              <div className="play-eyebrow">
                <span className="play-live-dot" />
                LESS SCROLLING. MORE DISCOVERING.
              </div>
              <h1>
                Follow your
                <br />
                <span>curiosity.</span>
                <span className="play-hero-star" aria-hidden="true">
                  ✳
                </span>
              </h1>
              <p>
                Interesting stories. Clever side projects. Unexpected ideas.
                <br className="play-desktop-break" /> A little corner of the
                internet worth getting lost in.
              </p>
              <button
                className="play-surprise"
                disabled={!visible.length || loading}
                onClick={() =>
                  setSurprise(
                    visible[Math.floor(Math.random() * visible.length)] ?? null,
                  )
                }
              >
                <Glyph name="shuffle" />
                Surprise me<span>↗</span>
              </button>
            </div>
            <div className="play-orbit" aria-hidden="true">
              <div className="play-orbit-ring ring-one" />
              <div className="play-orbit-ring ring-two" />
              <div className="play-planet">
                <Glyph name="spark" />
              </div>
              <span className="play-orbit-dot dot-one" />
              <span className="play-orbit-dot dot-two" />
              <div className="play-floating-card float-one">
                <span className="play-floating-icon">↗</span>
                <span>
                  Today's mood<strong>Curious, obviously.</strong>
                </span>
              </div>
              <div className="play-floating-card float-two">
                <span>✦</span>Something good is out there.
              </div>
              <span className="play-orbit-star">✧</span>
            </div>
          </section>
          <form
            className="play-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              search(draft);
            }}
          >
            <Glyph name="search" />
            <label className="sr-only" htmlFor="play-search">
              Search Hacker News stories
            </label>
            <input
              id="play-search"
              type="search"
              maxLength={80}
              placeholder="What are you curious about?"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-describedby="play-search-help"
            />
            <button type="submit" aria-label="Search stories">
              Explore
              <Glyph name="arrow" />
            </button>
          </form>
          <div
            className="play-search-help"
            id="play-search-help"
            role={validation ? "alert" : undefined}
          >
            {validation ||
              "Search is sent to HN Search only when you submit. No account needed."}
          </div>
          <div className="play-topics" aria-label="Suggested topics">
            <span>Pick a rabbit hole</span>
            {topics.map((topic) => (
              <button
                key={topic.query}
                className={query === topic.query ? "selected" : ""}
                onClick={() => {
                  choose("trending");
                  search(topic.query);
                }}
              >
                {topic.label}
              </button>
            ))}
          </div>
          {surprise && (
            <section
              className="play-spotlight"
              aria-label="Your random rabbit hole"
            >
              <Glyph name="spark" />
              <div>
                <span>YOUR RANDOM RABBIT HOLE</span>
                <a
                  href={surprise.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {surprise.title}
                  <Glyph name="external" />
                </a>
              </div>
              <button
                aria-label="Close surprise"
                onClick={() => setSurprise(null)}
              >
                <Glyph name="close" />
              </button>
            </section>
          )}
          <section aria-labelledby="play-feed-title">
            <div className="play-feed-heading">
              <div>
                <div className="play-section-eyebrow">
                  THE INTERNET IS A BIG PLACE
                </div>
                <h2 id="play-feed-title">
                  {view === "saved"
                    ? "Your collection of good finds"
                    : query
                      ? `A rabbit hole called “${query}”`
                      : "A fresh dose of interesting"}
                  <span aria-hidden="true">✦</span>
                </h2>
                <p>
                  {view === "saved"
                    ? "Saved in this browser, just for you. No cloud sync."
                    : query
                      ? "Stories from the Hacker News search index. Results can include older posts."
                      : view === "trending"
                        ? "On the Hacker News front page. Community interest, not a global trend ranking."
                        : view === "show"
                          ? "Things people made, shipped, and put out into the world."
                          : view === "ask"
                            ? "Good questions and conversations from the community."
                            : "The newest stories. A little less polished, a little more surprising."}
                </p>
              </div>
              <span className="play-feed-count">
                {loading
                  ? "Finding good things…"
                  : `${visible.length} ${view === "saved" ? "saved " : ""}finds`}
              </span>
            </div>
            <div className="play-tabs" role="group" aria-label="Story feeds">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={view === tab.id ? "active" : ""}
                  aria-pressed={view === tab.id}
                  onClick={() => choose(tab.id)}
                >
                  {tab.id === "trending" && <Glyph name="flame" />}
                  {tab.id === "saved" && <Glyph name="bookmark" />}
                  {tab.label}
                  {tab.id === "saved" && <span>{saved.length}</span>}
                </button>
              ))}
              {query && (
                <button className="play-clear" onClick={() => search("")}>
                  <Glyph name="close" />
                  Clear search
                </button>
              )}
            </div>
            {notice && (
              <p className="play-notice" role="status">
                {notice}
              </p>
            )}
            {storageIssue && (
              <p className="play-storage-warning">
                Browser storage is unavailable. Your saves will last for this
                visit only.
              </p>
            )}
            {loading ? (
              <div className="play-loading" role="status">
                <div className="play-loading-note">
                  <span className="play-loading-spark">✳</span>Gathering little
                  sparks of curiosity…
                </div>
                <div className="play-grid" aria-hidden="true">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div className="play-skeleton" key={index}>
                      <i />
                      <b />
                      <b />
                      <span />
                      <span />
                    </div>
                  ))}
                </div>
              </div>
            ) : view !== "saved" && state.kind === "error" ? (
              <div className="play-empty" role="alert">
                <span className="play-empty-symbol">☁</span>
                <h3>
                  {state.limited
                    ? "A tiny breather for a tiny server"
                    : "The internet is taking a little detour"}
                </h3>
                <p>
                  {state.limited
                    ? "A few too many uncached searches at once. Give it a minute, then try again."
                    : "We couldn’t reach the story feed. Your saved finds are still here."}
                </p>
                <button
                  className="play-action"
                  onClick={() => setRevision((value) => value + 1)}
                >
                  Try again
                  <Glyph name="arrow" />
                </button>
              </div>
            ) : visible.length ? (
              <div className="play-grid">
                {visible.map((story, index) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    index={page * 24 + index}
                    saved={saved.some((item) => item.id === story.id)}
                    onSave={toggleSaved}
                  />
                ))}
              </div>
            ) : (
              <div className="play-empty">
                <span className="play-empty-symbol">✧</span>
                <h3>
                  {view === "saved" && !query
                    ? "Your next rabbit hole is waiting"
                    : "Nothing in this corner of the internet"}
                </h3>
                <p>
                  {view === "saved" && !query
                    ? "Tap the bookmark on a story to keep it here. Up to 50 good finds, saved in your browser."
                    : "Try a broader search, a different topic, or clear your search to start fresh."}
                </p>
                <button
                  className="play-action"
                  onClick={() => {
                    choose("trending");
                    search("");
                  }}
                >
                  Back to discovering
                  <Glyph name="arrow" />
                </button>
              </div>
            )}
            {view !== "saved" &&
              state.kind === "ready" &&
              state.data.pages > 1 && (
                <div className="play-pagination">
                  <button
                    disabled={page === 0}
                    onClick={() => {
                      setPage(page - 1);
                      setSurprise(null);
                    }}
                  >
                    ← Previous
                  </button>
                  <span>
                    Page {page + 1} of {state.data.pages} · {feedName}
                  </span>
                  <button
                    disabled={page + 1 >= state.data.pages}
                    onClick={() => {
                      setPage(page + 1);
                      setSurprise(null);
                    }}
                  >
                    More good finds →
                  </button>
                </div>
              )}
          </section>
          <footer className="play-footer">
            <span>
              <Glyph name="spark" />
              Made for curious humans, with a small cloud footprint.
            </span>
            <span>
              Stories via{" "}
              <a
                href="https://hn.algolia.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                HN Search
              </a>{" "}
              · Cached up to 5 min · <a href="/">PulseWatch monitor</a>
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
