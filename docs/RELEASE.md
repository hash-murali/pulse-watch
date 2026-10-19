# v1.0.0 release checklist

Do not create the v1.0.0 tag until every required gate is complete.

- [x] Preserve existing React/Vite UI and existing named Worker; no history rewrite.
- [x] Authenticate and inspect existing Git build integration, static Worker settings and Workers Free plan.
- [x] Implement fixed-allowlist HTTPS HEAD API, safe status classification, timeouts, concurrency and cache bounds.
- [x] Replace production mock mode with validated live API data; preserve local demo only.
- [x] Test frontend loading/error/partial results, filtering and theme; monitor classification, timeouts, invalid/unsafe targets and responses; API method/query boundaries, caching and partial failures.
- [x] Pass formatting, zero-warning lint, strict frontend/Worker/test type checks and production build.
- [x] Verify local workerd full-stack routing, API/asset smoke checks and Wrangler packaging dry run.
- [x] Complete independent code review and resolve material findings.
- [x] Verify clean npm install and all gates on Node 24.
- [x] Validate GitHub Actions on the application release source.
- [x] Deploy via existing Cloudflare Git integration only; verify production HTML/assets and JSON API.
- [x] Verify production desktop/mobile themes, service states and keyboard controls.
- [x] Synchronize final docs/progress with verified deployment and rollback record.

Release notes: Live observations for three fixed public HTTPS endpoints, four-state service health, bounded server checks and cached snapshots, responsive accessible UI, development-only mock mode, automated QA and validation-only CI. No authentication, database, scheduled monitoring, historical uptime, paid services or custom-domain purchases.

Publication action: after the final documentation commit passes CI and production verification, create and push the annotated `v1.0.0` tag. The remote tag is the publication record; do not move or overwrite it.

Pre-deploy evidence: independent read-only review found no material issues; clean install on Node v24.22.0 passed all 42 tests, formatting, zero-warning lint, all TypeScript projects, Vite production build and Wrangler dry run. Public GitHub repository visibility verified.

## Production acceptance evidence

Application candidate: `01bc734a26bb9214f9a512d27144734d9a632f1b`. [Passing CI](https://github.com/hash-murali/pulse-watch/actions/runs/39281862609). Successful Cloudflare Git build: `328529cd-d8ff-42a4-bb86-d9194a2703b7`; Worker version `da7523a9-cbc4-4013-84d5-68179d562f1e`. Full validation and deployment completed on 2026-10-19 at 12:33 EDT.

Production HTML/JS and status JSON are publicly reachable. All three services returned operational HTTP 200 during acceptance. Rejected arbitrary URL queries, API JSON 404s, CSP and nosniff headers verified. Browser QA at 1440×1000 and 390×844 verified layout, service rendering, search/filter/empty results, theme persistence and keyboard skip link; no console errors/warnings. Error, timeout and partial failure states are verified by the automated suite, without disrupting providers.

The final release-record commit changes documentation only and is validated again before tag publication. Source and deployment rollback instructions are in [DEPLOYMENT.md](DEPLOYMENT.md). Future service availability is not guaranteed by these observations.

## v1.1.0 PulsePlay acceptance

- [x] Preserve monitor and existing Worker; add discovery at `/explore`.
- [x] Live fixed-provider search/feed, safe links, bounded JSON/time/concurrency/cache and burst handling.
- [x] Local saved stories, topic shortcuts, random spotlight, responsive themes and reduced-motion loading.
- [x] Clean Node24 install, 61 tests, formatting/lint/strict types/build and packaging dry run.
- [x] Independent review resolved; large multilingual response regression added.
- [x] Preview and production Git builds/CI succeeded; smoke and public desktop/mobile browser checks passed.
- [x] Privacy, API, limitations, architecture, deployment and troubleshooting docs updated.

Application source `00f51d9`; detailed evidence is in [PLAN.md](PLAN.md). The existing v1.0.0 tag remains unchanged. No v1.1 tag is required for this feature delivery.
