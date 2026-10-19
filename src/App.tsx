import { useEffect, useState } from "react";
import { getMockServices } from "./data/mockServices";
import { Icon } from "./components/Icon";
import { OverviewCard } from "./components/OverviewCard";
import { ServiceList } from "./components/ServiceList";
import { StatePanel } from "./components/StatePanel";
import type { DashboardState, DemoState } from "./types";
function initialTheme(): "dark" | "light" {
  try {
    const saved = localStorage.getItem("pulsewatch-theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* Storage may be disabled. */
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}
export default function App() {
  const [theme, setTheme] = useState(initialTheme);
  const [demo, setDemo] = useState<DemoState>("ready");
  const [state, setState] = useState<DashboardState>({ kind: "loading" });
  const [revision, setRevision] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("pulsewatch-theme", theme);
    } catch {
      /* Theme still works in memory. */
    }
  }, [theme]);
  useEffect(() => {
    setState({ kind: "loading" });
    if (demo === "loading") return;
    const timer = window.setTimeout(
      () =>
        setState(
          demo === "error"
            ? {
                kind: "error",
                message:
                  "This is a simulated connection error. Retry to reload the mock services.",
              }
            : {
                kind: "ready",
                services: demo === "empty" ? [] : getMockServices(),
              },
        ),
      650,
    );
    return () => window.clearTimeout(timer);
  }, [demo, revision]);
  const services = state.kind === "ready" ? state.services : [];
  const operational = services.filter((s) => s.status === "operational").length;
  const unavailable = services.length - operational;
  const visible = services.filter(
    (s) =>
      `${s.name} ${s.url}`.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "all" || s.status === filter),
  );
  const retry = () => {
    setDemo("ready");
    setRevision((r) => r + 1);
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <span className="brand-mark">
            <Icon name="pulse" />
          </span>
          PulseWatch<span className="version">v0.1</span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <a className="nav-item active" href="#overview">
          <Icon name="grid" />
          Overview
          <span className="nav-dot" />
        </a>
        <div className="sidebar-bottom">
          <div className="demo-note">
            <span className="small-dot" />
            Demo workspace
            <p>
              A little peace of mind.
              <br />
              One service at a time.
            </p>
          </div>
          <span className="sidebar-caption">PulseWatch / v0.1.0</span>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>Overview</strong>
          </div>
          <button
            className="theme-button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} />
          </button>
        </header>
        <main id="overview">
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR SYSTEMS, AT A GLANCE</div>
              <h1>
                Service overview<span>.</span>
              </h1>
              <p>A clear view of what’s up. And what needs your attention.</p>
            </div>
            <button
              className="button refresh-button"
              onClick={() => setRevision((r) => r + 1)}
              disabled={state.kind === "loading"}
            >
              <Icon
                name="refresh"
                className={state.kind === "loading" ? "spin" : ""}
              />
              Refresh status
            </button>
          </div>
          <div className="mock-banner">
            <span>
              <span className="mock-tag">MOCK DATA</span> You’re exploring a
              preview. No live endpoints are being monitored.
            </span>
            <span className="preview-label">
              v0.1.0 preview <Icon name="arrow" />
            </span>
          </div>
          <section className="overview-grid" aria-label="Service summary">
            <OverviewCard
              label="Total services"
              value={state.kind === "ready" ? services.length : null}
              detail="In your workspace"
              icon="globe"
            />
            <OverviewCard
              label="Operational"
              value={state.kind === "ready" ? operational : null}
              detail="Running as expected"
              icon="check"
              tone="healthy"
            />
            <OverviewCard
              label="Unavailable"
              value={state.kind === "ready" ? unavailable : null}
              detail={
                unavailable ? "Needs your attention" : "No unavailable services"
              }
              icon="alert"
              tone="unhealthy"
            />
          </section>
          <div
            className={`health-banner ${unavailable ? "attention" : ""}`}
            role="status"
          >
            <Icon name={unavailable ? "alert" : "pulse"} />
            <div>
              <strong>
                {state.kind !== "ready"
                  ? "Service status pending"
                  : !services.length
                    ? "No services configured"
                    : unavailable
                      ? `${unavailable} service needs attention`
                      : "All services are operational"}
              </strong>
              <span>
                {state.kind !== "ready"
                  ? "Waiting for the simulated service data."
                  : "Status reflects mock data from the latest simulated check."}
              </span>
            </div>
            <span className="health-label">
              {state.kind === "ready" && services.length > 0
                ? `${operational} of ${services.length} operational`
                : "DEMO"}
            </span>
          </div>
          <section className="services-panel" aria-labelledby="services-title">
            <div className="panel-heading">
              <div>
                <h2 id="services-title">
                  Services{" "}
                  <span className="count">
                    {state.kind === "ready" ? services.length : "—"}
                  </span>
                </h2>
                <p>Your monitored endpoints, all in one place.</p>
              </div>
              <span className="check-note">
                <span className="small-dot" />
                Manual mock checks
              </span>
            </div>
            <div className="toolbar">
              <label className="search">
                <Icon name="search" />
                <input
                  aria-label="Search services"
                  placeholder="Search services…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label="Filter by status"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="operational">Operational</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            {state.kind === "loading" ? (
              <StatePanel kind="loading" />
            ) : state.kind === "error" ? (
              <StatePanel
                kind="error"
                message={state.message}
                onRetry={retry}
              />
            ) : visible.length ? (
              <ServiceList services={visible} />
            ) : (
              <StatePanel
                kind="empty"
                message={
                  services.length
                    ? "No services match your search or status filter."
                    : undefined
                }
              />
            )}
            <div className="panel-footer">
              <span>
                {state.kind === "ready"
                  ? `Showing ${visible.length} of ${services.length} services`
                  : "Service data pending"}
              </span>
              <span>All times in your local timezone</span>
            </div>
          </section>
          <div className="demo-controls">
            <label htmlFor="demo-state">Preview state</label>
            <select
              id="demo-state"
              value={demo}
              onChange={(e) => setDemo(e.target.value as DemoState)}
            >
              <option value="ready">Populated dashboard</option>
              <option value="loading">Loading</option>
              <option value="empty">Empty workspace</option>
              <option value="error">Connection error</option>
            </select>
            <span>Explore the UI with simulated states.</span>
          </div>
          <footer>
            <span>
              <Icon name="pulse" />
              Built for a little more peace of mind.
            </span>
            <span>
              PulseWatch <span className="footer-dot">·</span> v0.1.0
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
