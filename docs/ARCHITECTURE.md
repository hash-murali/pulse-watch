# Architecture

Baseline audit: v0.1.0 is a client-only React/Vite dashboard using fixtures. Production serves its static assets through Cloudflare Workers, not Pages. The baseline had no tracked Wrangler config. v1 adds it for the same Worker identity.

v1: browser → same-origin GET /api/status → Worker cache → three fixed public HTTPS HEAD checks. Static assets stay asset-first and /api/* runs through Worker code. Two checks at once, five seconds per target, no redirects or body consumption. Each target produces an independent result; failures do not erase healthy services.

The API describes a point-in-time HTTP observation from a Cloudflare location, not authoritative provider health, historical uptime, a synthetic transaction, or continuous monitoring. Rate limiting/caching is best effort per location/isolate, not a global quota. Public abuse can exhaust the Free request allowance and reduce availability; never enable automatic paid fallback.

Detailed contract and operational constraints will be documented with the implementation.

## Worker implementation

`worker/targets.ts` fixes three operator-reviewed destinations (Cloudflare robots.txt, GitHub status page, Wikipedia homepage). HEAD only, no redirects, no visitor headers, no body parsing. Exact URL/id membership prevents private-IP, alternate-port, credential, and arbitrary-host injection. Public hostnames are trusted provider-managed DNS; this is not a general-purpose SSRF-safe fetch proxy. Never add user-controlled DNS or URL configuration.

2xx under 1500ms is operational; slower 2xx and all 3xx are degraded; 4xx is unknown (including blocked/rate-limited requests); 5xx, transport failures and timeouts are down. A service can fail while the API itself succeeds. Raw exception messages, response bodies and upstream headers are never returned.

A warm isolate coalesces requests and retains snapshots for 60 seconds; the Cloudflare Cache API shares them within a location where available. Neither mechanism is a global rate limit. No paid rate-limit binding or storage is used. API browser caching is disabled so timestamps are explicit; manual refresh can receive an existing snapshot. HEAD observes headers only, not page rendering or application correctness.
