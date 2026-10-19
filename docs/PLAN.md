# PulseWatch v1.0.0 implementation plan

Goal: operate a useful public point-in-time status dashboard at strictly $0.
Architecture: preserve React/Vite and add a same-origin Worker API, a fixed HTTPS allowlist, bounded HEAD checks, and a 60-second best-effort cache. No polling, storage, cron, authentication, or paid resources. Execute inline, milestone by milestone, as authorized by the project brief.

## Progress

- [x] A: Audit Git, source, public production and deployment setup; establish baseline tests/build; create operational docs; commit.
- [x] B: Write failing tests for classification, timeout, unsafe destinations, concurrency, partial failures and API routing/cache; implement Worker and shared contract; verify; commit.
- [x] C: Write failing integration tests for live loading/error/partial states; connect and validate API data; retain UI/theme; isolate local demo; verify; commit.
- [x] D: Add lint/format/type checks, security/limits tests and docs; review dependencies and diffs; verify; commit.
- [x] E: Audit existing Git deployment, add validation-only Actions, dry-run Worker packaging, publish through existing connection, verify production; commit.
- [x] F: Final documentation and API guide; clean-install/full checks; desktop/mobile production acceptance. Publish the annotated v1.0.0 tag only after this final release record passes CI and deployment verification.

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

## Release acceptance — 2026-10-19

- Candidate source `01bc734` passed [GitHub validation](https://github.com/hash-murali/pulse-watch/actions/runs/39281862609); all 42 tests, format/lint/strict type checks/build and Wrangler dry run passed again after resume.
- Fast-forwarded master without rewriting history. The existing Cloudflare Git integration deployed the same candidate through `npm run check` and `npx wrangler deploy`.
- Production build `328529cd-d8ff-42a4-bb86-d9194a2703b7` succeeded. Worker version `da7523a9-cbc4-4013-84d5-68179d562f1e`, deployed at 12:33 EDT. Only ASSETS is bound; Workers Free plan unchanged.
- Production smoke checks passed: HTML and built JS, fresh JSON with three observations, JSON 404 for missing API routes and 400 for URL queries. CSP and nosniff verified. All three endpoints returned HTTP 200 during acceptance (point-in-time only).
- Public browser QA passed at 1440×1000 desktop and 390×844 mobile: no page overflow, live table/status/timestamps, search, empty filter, persistent light/dark theme, keyboard skip link, and no console errors or warnings.
- Final docs-only release record and changelog retain identical application source/assets. Its CI/build must pass before tagging; Git's annotated tag and remote ref are the authoritative publication record. No further paid infrastructure or scheduled jobs were enabled.

# v1.1 — PulsePlay discovery

Goal: add a fun, useful discovery app on the existing infrastructure at strictly $0, preserving monitoring at `/` and adding PulsePlay at `/explore`.

- [x] Add tested GET `/api/discover` against the fixed public HN Search endpoint: Trending/front page, newest, Show HN, Ask HN, submitted search and bounded pagination. Validate inputs, sanitize data/links, bound JSON to 128KiB and fetch time to 6s. Cache for 5 minutes, coalesce duplicate work, cap warm cache and uncached bursts; no polling or arbitrary fetch destinations.
- [x] Add shared strict contracts and runtime-validated frontend requests. Build playful responsive `/explore` UI, skeleton/loading animation, accessible search/tabs/topic chips, safe external links, saved stories in local storage, and random spotlight. Preserve dark/light preference and reduced motion.
- [x] Add automated tests for API input rejection, URLs, malformed/oversized/slow upstream responses, cache reuse and burst control; frontend loading/error/empty/search/saved states and local persistence.
- [ ] Update engineering/security/architecture/API/readme docs, run all gates and local full-stack QA, independent review, commit and publish via the existing Git connection only; verify production routes and desktop/mobile behavior.

Files: `worker/discovery.ts` owns external JSON fetching and caching; `src/discover/model.ts` owns validated feed/story contracts; `src/discover/client.ts` owns bounded requests; `src/discover/Explore.tsx`, `StoryCard.tsx`, `explore.css` own the UI; `src/Root.tsx` selects app by pathname. Existing `/api/status`, monitor modules and routes remain intact. No new runtime dependencies, Worker, database, scheduled jobs or paid accounts.

Provider: https://hn.algolia.com/api (public HN Search service, no API key/account required for these requests). Verified an actual front_page query before implementation. This service can rate-limit or change availability independently; show safe retry states rather than falling back to paid products. Search phrases are sent to that public search provider; saved stories remain only in the user's browser. The provider's archived source repository is not a service SLA.

Local verification: 61 tests and all format/lint/type/build gates pass; Wrangler dry run binds only ASSETS. Full-stack smoke checks return three live monitor observations and 24 discovery stories. Desktop 1440×1000 and mobile 390×844 browser checks cover live search, persistent saved stories, random spotlight, light/dark themes and no horizontal overflow. Independent review found one normalized-response size mismatch; shared 128KiB limits and a large multilingual-feed regression fix it. Publication and production verification remain pending.
