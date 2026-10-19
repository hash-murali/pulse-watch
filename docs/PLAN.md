# PulseWatch v1.0.0 implementation plan

Goal: operate a useful public point-in-time status dashboard at strictly $0.
Architecture: preserve React/Vite and add a same-origin Worker API, a fixed HTTPS allowlist, bounded HEAD checks, and a 60-second best-effort cache. No polling, storage, cron, authentication, or paid resources. Execute inline, milestone by milestone, as authorized by the project brief.

## Progress

- [x] A: Audit Git, source, public production and deployment setup; establish baseline tests/build; create operational docs; commit.
- [x] B: Write failing tests for classification, timeout, unsafe destinations, concurrency, partial failures and API routing/cache; implement Worker and shared contract; verify; commit.
- [x] C: Write failing integration tests for live loading/error/partial states; connect and validate API data; retain UI/theme; isolate local demo; verify; commit.
- [x] D: Add lint/format/type checks, security/limits tests and docs; review dependencies and diffs; verify; commit.
- [ ] E: Audit existing Git deployment, add validation-only Actions, dry-run Worker packaging, publish through existing connection, verify production; commit.
- [ ] F: Final documentation and API guide; clean-install/full checks; desktop/mobile production verification; tag v1.0.0 only after all acceptance gates pass.

## Files and interfaces

- `worker/targets.ts`: fixed reviewed public HTTPS endpoints.
- `worker/monitor.ts`: `checkService(target, fetcher)` and `checkServices()` with 5-second deadline, concurrency 2, no redirects/body reads.
- `worker/index.ts`: GET `/api/status`, query/method rejection, safe JSON errors, cache 60 seconds, static asset fallback.
- `src/types.ts`: shared Service/StatusResponse contract (operational/degraded/down/unknown).
- `src/data/statusApi.ts`: bounded same-origin JSON fetch with runtime validation.
- `src/hooks/useStatus.ts`: abortable live loading/refresh/error state; no polling.
- `tests/`: baseline, Worker and browser component tests with fake fetch/time only.
- `wrangler.jsonc`: Worker name pulse-watch, static dist, API-first routing; no paid bindings.
- `.github/workflows/ci.yml`: validation only; Cloudflare remains deployment owner.

## Audit evidence (2026-10-19)

- Clean `master`, tracks origin/master. Initial commit ff7d3a7, no later remote commits on fetch.
- Public production GET / is HTTP 200 with v0.1.0 assets matching local build.
- No tracked Wrangler config, Worker source, CI or tests. README incorrectly describes Pages.
- No Cloudflare CLI or GitHub CLI on PATH; no Cloudflare environment credential available. Dashboard session inspection pending.
- No paid dependencies; React/React DOM are the only runtime dependencies.
- No existing automated release tag. Production acceptance and account free-plan verification remain required.

## Review focus

Prevent URL/query/header injection and redirects; treat blocked checks as unknown, never falsely healthy; bound fetch time/body/multiplicity; reject malformed or oversized API data; avoid stale request races and false uptime claims; verify actual deploy rather than equating push with deployment. Account settings must be inspected before overwriting production configuration.

A verification: baseline build passed; baseline component tests added. Cloudflare dashboard requires sign-in; external authorization requested while implementation continues. Work isolated on feat/live-monitoring-v1.

B verification: 27 tests pass (including classification, five-second abort, exact allowlist, two-request concurrency, partial failures, cache TTL/coalescing and route validation). Frontend and Worker TypeScript checks and production build pass. Cloudflare sign-in completed; existing build commands and zero bindings inspected.

C verification: 40 tests pass; strict frontend/Worker types and build pass. Live same-origin client validates shape, sizes and values. API timeout 15 seconds; UI cooldown 60 seconds and no network polling. Demo flag is development-only; dark/light/search/filter UI preserved. Cloudflare Workers Free plan confirmed in authenticated dashboard.

D verification: 42 tests pass; lint/type checks/build/format pass. Removed unused jest-dom package; aligned Node types to Node 24. Full-stack local Worker smoke check and local Wrangler dry run pass. Production Free plan verified, repository is public (standard GitHub Linux CI remains free). Reviewed Wikipedia canonical homepage to avoid a permanent robots.txt redirect; no redirect-following enabled.

E preparation: independent reviewer found no material issues. Clean install and all 42 tests/gates passed under Node v24.22.0. Validation-only GitHub Actions uses SHA-pinned official checkout/setup-node v6; public standard Linux runner, 10-minute timeout, no secrets/deployment. Cloudflare previews were already enabled with npx wrangler preview; existing production/preview settings remain unchanged so far.

E diagnosis: candidate 4a79e74 passed Cloudflare build but preview deploy failed because the pre-existing `npx wrangler preview` command requires an explicit `previews` config block. Confirmed the exact error in build 608bfdab and current official Preview configuration documentation. Minimal fix: empty previews object; no resource bindings, secrets, or production routes added. Production v0.1 remained serving. Preview support exists on Workers Free.
