# $0 operating envelope and security

Verified 2026-10-19 in the authenticated Cloudflare dashboard: Workers **Free** is the current plan ($0). Published limits are 100,000 Worker requests/day and 10ms CPU/invocation. Network waiting does not consume CPU time. Static asset delivery is free; API calls invoke Worker code. Workers Builds Free includes 3,000 build minutes/month. No upgrade or paid binding was enabled.

Sources: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [runtime limits](https://developers.cloudflare.com/workers/platform/limits/), [Build limits](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/), [Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/). Limits can change; verify these pages and account plan before operational changes.

## Deliberate bounds

- Three static HTTPS endpoints; at most three outbound HEAD requests per uncached snapshot, with two concurrent requests, five seconds per target, and about ten seconds worst-case total network waiting.
- No redirects, URL parameters, arbitrary hosts/ports, request-header forwarding, response-body parsing, or automatic retries against providers. Unexpected response bodies are cancelled.
- Only exact URL/id allowlist entries reach fetch. Private/internal IPs, localhost, credential URLs and alternate ports cannot match. DNS is managed by the reviewed public providers; adding an untrusted/rebinding hostname would break this trust assumption. Never turn this into an arbitrary URL checker.
- 60-second cache per warm isolate plus best-effort Cache API sharing within a location. Requests in the same isolate coalesce. Cold isolates/locations can still check independently: this is **not a global request budget or strict rate limiter**.
- No network polling. Browser refresh cooldown reduces casual duplicate requests; clients can bypass it. Public abuse may exhaust the Free request allowance and make the API unavailable until reset. The frontend handles API failures; asset delivery stays independent. Do not solve quota exhaustion by upgrading or enabling billing.
- No KV, D1, R2, Durable Objects, queues, paid monitoring, background jobs, cron, or auth. Logs use the existing Cloudflare observability feature with sampling; application code logs no visitor identifiers or raw errors. No third-party fonts or analytics.
- GitHub Actions uses one short Linux validation job, read-only repository permission, timeout, cancellation and no deployment step. Public standard runners are free for public repositories; never switch to larger/paid runners or paid private-repo overages. Cloudflare remains the sole publisher.

## Future options (not enabled)

Historical uptime needs persisted observations and a defined measurement policy. Evaluate a low-frequency scheduled Worker plus Free KV/D1 quotas and retention before proposing it; do not silently enable these resources. Alerting, custom domains and higher-frequency checks are outside v1 scope. Maintain the $0 constraint even if that means accepting limited availability.
