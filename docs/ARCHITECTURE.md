# Architecture

Baseline audit: v0.1.0 is a client-only React/Vite dashboard using fixtures. Production serves its static assets through Cloudflare Workers, not Pages. There is no tracked Wrangler config yet.

Planned v1: browser → same-origin GET /api/status → Worker cache → three fixed public HTTPS HEAD checks. Static assets stay asset-first and /api/* runs through Worker code. Two checks at once, five seconds per target, no redirects or body consumption. Each target produces an independent result; failures do not erase healthy services.

The API describes a point-in-time HTTP observation from a Cloudflare location, not authoritative provider health, historical uptime, a synthetic transaction, or continuous monitoring. Rate limiting/caching is best effort per location/isolate, not a global quota. Public abuse can exhaust the Free request allowance and reduce availability; never enable automatic paid fallback.

Detailed contract and operational constraints will be documented with the implementation.
