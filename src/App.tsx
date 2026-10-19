import { useEffect, useState } from "react";
import { useStatus } from "./hooks/useStatus";
import { Icon } from "./components/Icon";
import { OverviewCard } from "./components/OverviewCard";
import { ServiceList } from "./components/ServiceList";
import { StatePanel } from "./components/StatePanel";
import type { DemoState } from "./types";
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
  const { state, isDemo, remaining, refresh } = useStatus(demo);
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
  const services = state.kind === "ready" ? state.services : [];
  const operational = services.filter((s) => s.status === "operational").length;
  const unavailable = services.filter((s) => s.status === "down").length;
  const uncertain = services.filter((s) => s.status === "unknown").length;
  const degraded = services.filter((s) => s.status === "degraded").length;
  const needsAttention = unavailable + uncertain + degraded;
  const visible = services.filter(
    (s) =>
      `${s.name} ${s.url}`.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "all" || s.status === filter),
  );
  const retry = () => {
    setDemo("ready");
    refresh();
  };
  return (
    <div className="app-shell">
      <a className="skip-link" href="#overview">
        Skip to dashboard
      </a>
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <span className="brand-mark">
            <Icon name="pulse" />
          </span>
          PulseWatch<span className="version">v1</span>
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
            {isDemo ? "Demo workspace" : "Public dashboard"}
            <p>
              A little peace of mind.
              <br />
              One service at a time.
            </p>
          </div>
          <span className="sidebar-caption">PulseWatch / v1.0.0</span>
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
        <main id="overview" tabIndex={-1}>
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
              onClick={refresh}
              disabled={state.kind === "loading" || remaining > 0}
            >
              <Icon
                name="refresh"
                className={state.kind === "loading" ? "spin" : ""}
              />
              {remaining > 0 ? `Refresh in ${remaining}s` : "Refresh status"}
            </button>
          </div>
          <div className="mock-banner">
            <span>
              <span className="mock-tag">
                {isDemo ? "MOCK DATA" : "LIVE CHECKS"}
              </span>
              {isDemo
                ? " Local development fixtures. No live endpoints are being checked."
                : " Point-in-time HTTPS observations. Not historical uptime monitoring."}
            </span>
            <span className="preview-label">
              {isDemo ? "Development demo" : "Cached for up to 60s"}
            </span>
          </div>
          <section className="overview-grid" aria-label="Service summary">
            <OverviewCard
              label="Total services"
              value={state.kind === "ready" ? services.length : null}
              detail="Fixed public HTTPS endpoints"
              icon="globe"
            />
            <OverviewCard
              label="Operational"
              value={state.kind === "ready" ? operational : null}
              detail="Successful, timely responses"
              icon="check"
              tone="healthy"
            />
            <OverviewCard
              label="Unavailable"
              value={state.kind === "ready" ? unavailable : null}
              detail={
                unavailable
                  ? "Needs your attention"
                  : "No services observed down"
              }
              icon="alert"
              tone="unhealthy"
            />
          </section>
          <div
            className={`health-banner ${needsAttention ? "attention" : ""}`}
            role="status"
          >
            <Icon name={needsAttention ? "alert" : "pulse"} />
            <div>
              <strong>
                {state.kind !== "ready"
                  ? "Service status pending"
                  : !services.length
                    ? "No services configured"
                    : needsAttention
                      ? `${needsAttention} service${needsAttention === 1 ? "" : "s"} need${needsAttention === 1 ? "s" : ""} attention`
                      : "All services are operational"}
              </strong>
              <span>
                {state.kind !== "ready"
                  ? state.kind === "error"
                    ? "Unable to obtain a valid observation."
                    : "Waiting for service observations."
                  : `${unavailable} down · ${degraded} degraded · ${uncertain} unknown${isDemo ? " · simulated" : ""}`}
              </span>
            </div>
            <span className="health-label">
              {state.kind === "ready" && services.length > 0
                ? `${operational} of ${services.length} operational`
                : isDemo
                  ? "DEMO"
                  : "LIVE"}
            </span>
          </div>
          <section
            className="services-panel"
            aria-labelledby="services-title"
            aria-busy={state.kind === "loading"}
          >
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
                {isDemo ? "Manual mock checks" : "Manual refresh · no polling"}
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
                <option value="down">Down</option>
                <option value="degraded">Degraded</option>
                <option value="unknown">Unknown</option>
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
              <span>
                {state.kind === "ready" && state.checkedAt ? (
                  <>
                    Snapshot:{" "}
                    <time dateTime={state.checkedAt}>
                      {new Date(state.checkedAt).toLocaleString()}
                    </time>{" "}
                    · local time
                  </>
                ) : (
                  "All times in your local timezone"
                )}
              </span>
            </div>
          </section>
          {isDemo && (
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
          )}
          <footer>
            <span>
              <Icon name="pulse" />
              Built for a little more peace of mind.
            </span>
            <span>
              PulseWatch <span className="footer-dot">·</span> v1.0.0
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
