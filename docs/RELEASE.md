# v1.0.0 release checklist

Do not create the v1.0.0 tag until every required gate is complete.

- [x] Preserve existing React/Vite UI and existing named Worker; no history rewrite.
- [x] Authenticate and inspect existing Git build integration, static Worker settings and Workers Free plan.
- [x] Implement fixed-allowlist HTTPS HEAD API, safe status classification, timeouts, concurrency and cache bounds.
- [x] Replace production mock mode with validated live API data; preserve local demo only.
- [x] Test frontend loading/error/partial results, filtering and theme; monitor classification, timeouts, invalid/unsafe targets and responses; API method/query boundaries, caching and partial failures.
- [x] Pass formatting, zero-warning lint, strict frontend/Worker/test type checks and production build.
- [x] Verify local workerd full-stack routing, API/asset smoke checks and Wrangler packaging dry run.
- [ ] Complete independent code review and resolve material findings.
- [ ] Verify clean npm install and all gates on Node 24.
- [ ] Validate GitHub Actions on the exact release source.
- [ ] Deploy via existing Cloudflare Git integration only; verify production HTML/assets and JSON API.
- [ ] Verify production desktop/mobile themes, service states and keyboard controls.
- [ ] Synchronize final docs/progress with verified deployment and rollback record.
- [ ] Create annotated v1.0.0 tag on the accepted release commit and push the tag.

Release notes: Live observations for three fixed public HTTPS endpoints, four-state service health, bounded server checks and cached snapshots, responsive accessible UI, development-only mock mode, automated QA and validation-only CI. No authentication, database, scheduled monitoring, historical uptime, paid services or custom-domain purchases.

Verification evidence will be recorded below when the production gates complete. A public app does not become a stable release merely because the build passes.
